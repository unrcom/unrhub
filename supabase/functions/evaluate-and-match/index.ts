// ============================================================================
// Edge Function: evaluate-and-match
// Purpose: Evaluate project requirements and match with developers
// ============================================================================

// ----------------------------------------------------------------------------
// Section 1: Imports and Type Definitions
// ----------------------------------------------------------------------------

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "https://esm.sh/@aws-sdk/client-bedrock-runtime@3.451.0";

interface SkillRequirement {
  skill_name: string;
  minimum_level: "beginner" | "intermediate" | "advanced" | "expert";
}

interface ProjectInput {
  title: string;
  project_type: string[];
  project_type_other?: string;
  required_skills: SkillRequirement[];
  required_skills_other?: string;
  preferred_skills?: SkillRequirement[];
  preferred_skills_other?: string;
  start_date: string;
  end_date: string;
  additional_requirements?: string;
}

interface InitialRequest {
  project: ProjectInput;
}

interface ChatRequest {
  project_id: string;
  message: string;
}

type RequestPayload = InitialRequest | ChatRequest;

interface QuestionResponse {
  project_id: string;
  type: "question";
  message: string;
}

interface MatchResponse {
  project_id: string;
  type: "matches";
  matches: Array<{
    developer_id: string;
    name: string;
    match_score: number;
    matched_skills: string[];
    reasoning: string;
  }>;
}

type ResponsePayload = QuestionResponse | MatchResponse;

interface LLMEvaluationResult {
  is_sufficient: boolean;
  missing_info?: string[];
  questions?: string[];
  next_question?: string;
}

// ----------------------------------------------------------------------------
// Section 2: CORS Configuration
// ----------------------------------------------------------------------------

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function handleCORS(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  return null;
}

// ----------------------------------------------------------------------------
// Section 3: Main Request Handler
// ----------------------------------------------------------------------------

serve(async (req) => {
  try {
    // Handle CORS preflight
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    // Parse request
    const payload: RequestPayload = await req.json();

    // Initialize clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const bedrockClient = new BedrockRuntimeClient({
      region: Deno.env.get("AWS_REGION") || "ap-northeast-1",
      credentials: {
        accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID")!,
        secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
      },
    });

    let response: ResponsePayload;

    // Route to appropriate handler
    if (isInitialRequest(payload)) {
      response = await handleInitialRequest(payload, supabase, bedrockClient);
    } else if (isChatRequest(payload)) {
      response = await handleChatRequest(payload, supabase, bedrockClient);
    } else {
      throw new Error("Invalid request format");
    }

    return new Response(JSON.stringify(response), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});

function isInitialRequest(payload: any): payload is InitialRequest {
  return payload.project && !payload.project_id;
}

function isChatRequest(payload: any): payload is ChatRequest {
  return payload.project_id && payload.message;
}

async function handleInitialRequest(
  payload: InitialRequest,
  supabase: any,
  bedrockClient: BedrockRuntimeClient
): Promise<ResponsePayload> {
  console.log("Processing initial request");
  const { project } = payload;

  // Save project to database
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .insert({
      title: project.title,
      description: `${project.title}\n${project.additional_requirements || ""}`,
      project_type: project.project_type,
      start_date: project.start_date,
      end_date: project.end_date,
      status: "draft",
    })
    .select()
    .single();

  if (projectError) {
    throw new Error(`Failed to create project: ${projectError.message}`);
  }

  const projectId = projectData.id;

  // Save required skills
  if (project.required_skills && project.required_skills.length > 0) {
    await saveSkills(supabase, projectId, project.required_skills, true);
  }

  // Save preferred skills
  if (project.preferred_skills && project.preferred_skills.length > 0) {
    await saveSkills(supabase, projectId, project.preferred_skills, false);
  }

  // Evaluate with LLM
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildInitialUserPrompt(project);

  const llmResponse = await callClaude(bedrockClient, [
    { role: "user", content: userPrompt },
  ], systemPrompt);

  console.log("LLM Response:", llmResponse);

  const evaluation = parseEvaluationResponse(llmResponse);

  // Save chat history
  await supabase.from("project_chat_history").insert({
    project_id: projectId,
    role: "system",
    message: userPrompt,
  });

  if (!evaluation.is_sufficient) {
    await supabase.from("project_chat_history").insert({
      project_id: projectId,
      role: "assistant",
      message: evaluation.next_question || "追加情報を教えてください。",
    });

    return {
      project_id: projectId,
      type: "question",
      message: evaluation.next_question || "追加情報を教えてください。",
    };
  } else {
    const matches = await performMatching(supabase, projectId, project);
    return {
      project_id: projectId,
      type: "matches",
      matches,
    };
  }
}

async function handleChatRequest(
  payload: ChatRequest,
  supabase: any,
  bedrockClient: BedrockRuntimeClient
): Promise<ResponsePayload> {
  console.log("Processing chat request");
  const { project_id, message } = payload;

  // Get project data
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("*, project_required_skills(*)")
    .eq("id", project_id)
    .single();

  if (projectError || !projectData) {
    throw new Error("Project not found");
  }

  // Get chat history
  const { data: chatHistory } = await supabase
    .from("project_chat_history")
    .select("*")
    .eq("project_id", project_id)
    .order("created_at", { ascending: true });

  // Save user message
  await supabase.from("project_chat_history").insert({
    project_id: project_id,
    role: "user",
    message: message,
  });

  // Evaluate with LLM
  const systemPrompt = buildSystemPrompt();
  const messages = (chatHistory || []).map((chat) => ({
    role: chat.role === "assistant" ? "assistant" : "user",
    content: chat.message,
  }));
  messages.push({ role: "user", content: message });

  const llmResponse = await callClaude(bedrockClient, messages, systemPrompt);
  console.log("LLM Response:", llmResponse);

  const evaluation = parseEvaluationResponse(llmResponse);

  if (!evaluation.is_sufficient) {
    await supabase.from("project_chat_history").insert({
      project_id: project_id,
      role: "assistant",
      message: evaluation.next_question || "追加情報を教えてください。",
    });

    return {
      project_id: project_id,
      type: "question",
      message: evaluation.next_question || "追加情報を教えてください。",
    };
  } else {
    const matches = await performMatching(supabase, project_id, projectData);
    return {
      project_id: project_id,
      type: "matches",
      matches,
    };
  }
}

async function saveSkills(
  supabase: any,
  projectId: string,
  skills: SkillRequirement[],
  isRequired: boolean
): Promise<void> {
  const skillsToInsert = skills.map((skill) => ({
    project_id: projectId,
    skill_name: skill.skill_name,
    minimum_level: skill.minimum_level,
    is_required: isRequired,
  }));

  const { error } = await supabase
    .from("project_required_skills")
    .insert(skillsToInsert);

  if (error) {
    console.error(`Failed to insert ${isRequired ? "required" : "preferred"} skills:`, error);
  }
}

// ----------------------------------------------------------------------------
// Section 4: System Prompt Builder
// ----------------------------------------------------------------------------

function buildSystemPrompt(): string {
  return `あなたは技術者マッチングの専門家です。
クライアントから提供された案件情報を評価し、技術者をマッチングするために十分な情報があるか判断してください。

以下の情報が揃っていれば「十分」と判断してください：
- 案件タイトル
- 案件タイプ
- 必須スキル
- 開始日・終了日
- 予算または稼働条件の目安

情報が不足している場合は、クライアントに追加で質問してください。
質問は1つずつ、自然な日本語で行ってください。

レスポンスは以下のJSON形式で返してください：
{
  "is_sufficient": true/false,
  "next_question": "質問文"（is_sufficientがfalseの場合のみ）
}`;
}

// ----------------------------------------------------------------------------
// Section 5: User Prompt Builder
// ----------------------------------------------------------------------------

function buildInitialUserPrompt(project: ProjectInput): string {
  return `以下の案件情報を評価してください：

案件タイトル: ${project.title}
案件タイプ: ${project.project_type.join(", ")}
必須スキル: ${project.required_skills.map((s) => `${s.skill_name}(${s.minimum_level})`).join(", ")}
優先スキル: ${project.preferred_skills?.map((s) => `${s.skill_name}(${s.minimum_level})`).join(", ") || "なし"}
期間: ${project.start_date} 〜 ${project.end_date}
追加要件: ${project.additional_requirements || "なし"}`;
}

// ----------------------------------------------------------------------------
// Section 6: Bedrock API Call (AWS Signature V4)
// ----------------------------------------------------------------------------

async function callClaude(
  client: BedrockRuntimeClient,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
): Promise<string> {
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 2000,
    temperature: 0.7,
    system: systemPrompt,
    messages: messages,
  };

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    body: JSON.stringify(payload),
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  return responseBody.content[0].text;
}

// ----------------------------------------------------------------------------
// Section 7: Evaluation Response Parser
// ----------------------------------------------------------------------------

function parseEvaluationResponse(llmResponse: string): LLMEvaluationResult {
  const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Failed to parse LLM response:", e);
    }
  }
  
  // Fallback
  return {
    is_sufficient: false,
    next_question: "追加情報を教えていただけますか？",
  };
}

// ----------------------------------------------------------------------------
// Section 8: Developer Matching Logic
// ----------------------------------------------------------------------------

async function performMatching(
  supabase: any,
  projectId: string,
  projectData: any
): Promise<Array<{
  developer_id: string;
  name: string;
  match_score: number;
  matched_skills: string[];
  reasoning: string;
}>> {
  // Get required skills
  const { data: requiredSkills } = await supabase
    .from("project_required_skills")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_required", true);

  if (!requiredSkills || requiredSkills.length === 0) {
    return [];
  }

  const requiredSkillNames = requiredSkills.map((s: any) => s.skill_name);

  // Get active developers
  const { data: developers } = await supabase
    .from("developers")
    .select("*, developer_skills(*)")
    .eq("status", "active")
    .eq("is_public", true);

  if (!developers || developers.length === 0) {
    return [];
  }

  // Calculate match scores
  const matches = developers
    .map((dev: any) => calculateMatchScore(dev, requiredSkills, requiredSkillNames))
    .filter((m: any) => m !== null && m.match_score >= 50)
    .sort((a: any, b: any) => b.match_score - a.match_score)
    .slice(0, 10);

  // Save matches to database
  for (const match of matches) {
    await supabase.from("matches").insert({
      project_id: projectId,
      developer_id: match.developer_id,
      match_score: match.match_score,
      status: "suggested",
    });
  }

  return matches;
}

// ----------------------------------------------------------------------------
// Section 9: Match Score Calculation
// ----------------------------------------------------------------------------

function calculateMatchScore(
  developer: any,
  requiredSkills: any[],
  requiredSkillNames: string[]
): {
  developer_id: string;
  name: string;
  match_score: number;
  matched_skills: string[];
  reasoning: string;
} | null {
  const devSkills = developer.developer_skills || [];
  const devSkillNames = devSkills.map((s: any) => s.skill_name);

  // Find matched skills
  const matchedSkills = requiredSkillNames.filter((skill: string) =>
    devSkillNames.includes(skill)
  );

  // Calculate basic match score
  const matchScore = (matchedSkills.length / requiredSkillNames.length) * 100;

  // Check skill levels
  const levels = ["beginner", "intermediate", "advanced", "expert"];
  
  for (const reqSkill of requiredSkills) {
    const devSkill = devSkills.find(
      (ds: any) => ds.skill_name === reqSkill.skill_name
    );
    
    if (devSkill) {
      const reqLevel = levels.indexOf(reqSkill.minimum_level);
      const devLevel = levels.indexOf(devSkill.skill_level);
      
      if (devLevel < reqLevel) {
        return null; // Developer doesn't meet minimum level
      }
    }
  }

  return {
    developer_id: developer.id,
    name: developer.name,
    match_score: Math.round(matchScore),
    matched_skills: matchedSkills,
    reasoning: `必須スキル${requiredSkillNames.length}件中${matchedSkills.length}件マッチ`,
  };
}

// ============================================================================
// End of Edge Function
// ============================================================================
