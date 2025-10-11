// ============================================================================
// Edge Function: evaluate-and-match
// Purpose: 案件評価とマッチング実行
// ============================================================================

// ----------------------------------------------------------------------------
// Section 1: Imports and Type Definitions
// ----------------------------------------------------------------------------
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// AWS SDK v3 のインポートを削除（Deno環境で動作しないため）
// 代わりにfetch APIで直接Bedrock APIを呼び出す

interface ProjectData {
  title?: string;
  description?: string;
  project_type?: string;
  duration_months?: number;
  industry?: string;
}

interface ChatMessage {
  role: string;
  message: string;
}

interface SkillRequirement {
  name: string;
  level: string;
  required: boolean;
}

interface Requirements {
  skills: SkillRequirement[];
  start_date: string;
}

interface Evaluation {
  ready: boolean;
  question?: string;
  requirements?: Requirements;
}

// ----------------------------------------------------------------------------
// Section 2: CORS Configuration
// ----------------------------------------------------------------------------
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ----------------------------------------------------------------------------
// Section 3: Main Request Handler
// ----------------------------------------------------------------------------
serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { project, chatHistory, message } = await req.json();

    // Build prompts
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(project, chatHistory || [], message);

    // Call Claude via Bedrock (using fetch API)
    const evaluation = await callClaudeForEvaluation(systemPrompt, userPrompt);

    // Handle response
    if (evaluation.ready) {
      // Ready to match - execute matching
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      );
      
      const matches = await matchDevelopers(supabaseClient, evaluation.requirements!);
      
      return new Response(
        JSON.stringify({ 
          type: 'matches', 
          data: matches,
          requirements: evaluation.requirements
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Need more information - return question
      return new Response(
        JSON.stringify({ 
          type: 'question', 
          message: evaluation.question,
          chatHistory: [...(chatHistory || []), 
            { role: 'assistant', message: evaluation.question }
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ----------------------------------------------------------------------------
// Section 4: System Prompt Builder
// ----------------------------------------------------------------------------
function buildSystemPrompt(): string {
  return `あなたは技術者マッチングの専門家です。

【役割】
クライアントの案件情報から、適切な技術者をマッチングするために必要な情報を収集します。

【マッチングに必要な情報】
1. 必要な技術スタック（プログラミング言語、フレームワーク等）
2. 各技術の経験レベル（beginner, intermediate, advanced, expert）
3. 開始時期（now, または具体的な日付 yyyy-mm-dd）

【原則】
- 最小限の質問で情報を収集してください
- 技術者選定に直接関係ない質問はしないでください
- 十分な情報が揃ったら、マッチングを実行してください

【出力形式】
以下のJSON形式で返してください：
\`\`\`json
{
  "ready": true/false,
  "question": "質問文（readyがfalseの場合）",
  "requirements": {
    "skills": [
      {"name": "Python", "level": "intermediate", "required": true},
      {"name": "Django", "level": "beginner", "required": false}
    ],
    "start_date": "now" または "2025-12-01"
  }
}
\`\`\``;
}

// ----------------------------------------------------------------------------
// Section 5: User Prompt Builder
// ----------------------------------------------------------------------------
function buildUserPrompt(project: ProjectData, chatHistory: ChatMessage[], message: string): string {
  let prompt = `【案件情報】
タイトル: ${project.title || '未設定'}
概要: ${project.description || '未設定'}
案件タイプ: ${project.project_type || '未設定'}
期間: ${project.duration_months ? project.duration_months + 'ヶ月' : '未設定'}
業界: ${project.industry || '未設定'}

`;

  if (chatHistory.length > 0) {
    prompt += `【これまでの会話】\n`;
    chatHistory.forEach((chat) => {
      prompt += `${chat.role}: ${chat.message}\n`;
    });
  }

  if (message) {
    prompt += `\n【クライアントの最新メッセージ】\n${message}\n`;
  }

  prompt += `\n上記の情報から、マッチングに必要な情報が揃っているか判断してください。`;

  return prompt;
}

// ----------------------------------------------------------------------------
// Section 6: Bedrock API Call (AWS Signature V4)
// ----------------------------------------------------------------------------
async function callClaudeForEvaluation(
  systemPrompt: string,
  userPrompt: string
): Promise<Evaluation> {
  const region = Deno.env.get('AWS_REGION') || 'ap-northeast-1';
  const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')!;
  const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')!;

  const endpoint = `https://bedrock-runtime.${region}.amazonaws.com`;
  const modelId = 'anthropic.claude-3-haiku-20240307-v1:0';
  const host = `bedrock-runtime.${region}.amazonaws.com`;
  const canonicalUri = `/model/${modelId.replace(/:/g, '%3A')}/invoke`;
  const actualPath = `/model/${modelId}/invoke`;
  const method = 'POST';
  const service = 'bedrock';

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  const dateNow = new Date();
  const amzDate = dateNow.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);

  const headers = {
    'Content-Type': 'application/json',
    'X-Amz-Date': amzDate,
    'Host': host,
  };

  async function sign(key: Uint8Array, msg: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const keyData = await crypto.subtle.importKey(
      'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', keyData, encoder.encode(msg));
    return new Uint8Array(signature);
  }

  async function getSignatureKey(
    key: string, dateStamp: string, regionName: string, serviceName: string
  ): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const kDate = await sign(encoder.encode('AWS4' + key), dateStamp);
    const kRegion = await sign(kDate, regionName);
    const kService = await sign(kRegion, serviceName);
    const kSigning = await sign(kService, 'aws4_request');
    return kSigning;
  }

  const payloadHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  const payloadHashHex = Array.from(new Uint8Array(payloadHash))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  const canonicalHeaders = `host:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-date';
  const canonicalRequest = `${method}\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHashHex}`;

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const canonicalRequestHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest));
  const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHashHex}`;

  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = await sign(signingKey, stringToSign);
  const signatureHex = Array.from(signature).map(b => b.toString(16).padStart(2, '0')).join('');

  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;

  const response = await fetch(`${endpoint}${actualPath}`, {
    method: 'POST',
    headers: { ...headers, 'Authorization': authorizationHeader },
    body: body,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Bedrock API error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  const assistantMessage = result.content[0].text;

  return parseEvaluation(assistantMessage);
}

// ----------------------------------------------------------------------------
// Section 7: Evaluation Response Parser
// ----------------------------------------------------------------------------
function parseEvaluation(response: string): Evaluation {
  try {
    // Extract JSON block
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      return parsed;
    }
    // Not JSON format - treat as question
    return {
      ready: false,
      question: response,
    };
  } catch (e) {
    console.error('JSON parse error:', e);
    return {
      ready: false,
      question: response,
    };
  }
}

// ----------------------------------------------------------------------------
// Section 8: Developer Matching Logic
// ----------------------------------------------------------------------------
async function matchDevelopers(supabase: any, requirements: Requirements): Promise<any[]> {
  // Fetch all active developers with skills
  const { data: developers, error } = await supabase
    .from('developers')
    .select(`
      *,
      developer_skills (*)
    `)
    .eq('status', 'active')
    .eq('is_public', true);

  if (error) throw error;

  // Score each developer
  const matches = developers.map((dev: any) => {
    const score = calculateMatchScore(dev, requirements);
    return {
      developer_id: dev.id,
      developer_name: dev.name,
      developer_email: dev.email,
      match_score: score.total,
      match_reason: score.reason,
      skills_matched: score.skillsMatched,
      skills_not_matched: score.skillsNotMatched,
    };
  });

  // Sort by score (descending)
  matches.sort((a, b) => b.match_score - a.match_score);

  // Return top 5
  return matches.slice(0, 5);
}

// ----------------------------------------------------------------------------
// Section 9: Match Score Calculation
// ----------------------------------------------------------------------------
function calculateMatchScore(developer: any, requirements: Requirements): any {
  const requiredSkills = requirements.skills.filter((s: SkillRequirement) => s.required);
  const optionalSkills = requirements.skills.filter((s: SkillRequirement) => !s.required);
  
  let totalScore = 0;
  const skillsMatched: any[] = [];
  const skillsNotMatched: any[] = [];

  // Skill level mapping
  const levelMap: any = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };

  // Check required skills (20 points each)
  requiredSkills.forEach((reqSkill: SkillRequirement) => {
    const devSkill = developer.developer_skills.find(
      (s: any) => s.skill_name === reqSkill.name
    );

    if (devSkill) {
      const reqLevel = levelMap[reqSkill.level];
      const devLevel = levelMap[devSkill.skill_level];

      if (devLevel >= reqLevel) {
        totalScore += 20;
        skillsMatched.push({
          name: reqSkill.name,
          required_level: reqSkill.level,
          developer_level: devSkill.skill_level,
          years: devSkill.years,
          met: true,
        });
      } else {
        skillsNotMatched.push({
          name: reqSkill.name,
          required_level: reqSkill.level,
          developer_level: devSkill.skill_level,
          met: false,
        });
      }
    } else {
      skillsNotMatched.push({
        name: reqSkill.name,
        required_level: reqSkill.level,
        developer_level: null,
        met: false,
      });
    }
  });

  // Check optional skills (10 points each)
  optionalSkills.forEach((reqSkill: SkillRequirement) => {
    const devSkill = developer.developer_skills.find(
      (s: any) => s.skill_name === reqSkill.name
    );

    if (devSkill) {
      const reqLevel = levelMap[reqSkill.level];
      const devLevel = levelMap[devSkill.skill_level];

      if (devLevel >= reqLevel) {
        totalScore += 10;
        skillsMatched.push({
          name: reqSkill.name,
          required_level: reqSkill.level,
          developer_level: devSkill.skill_level,
          years: devSkill.years,
          met: true,
        });
      }
    }
  });

  // Check start date (20 points)
  if (requirements.start_date === 'now' && developer.start_date === 'now') {
    totalScore += 20;
  } else if (requirements.start_date !== 'now') {
    // Date comparison (simplified)
    if (developer.start_date === 'now' || developer.start_date <= requirements.start_date) {
      totalScore += 20;
    } else {
      totalScore += 10;
    }
  }

  // Generate match reason
  let reason = '';
  if (skillsNotMatched.length === 0) {
    reason = `全ての必須スキルを満たしています。${skillsMatched.map(s => `${s.name}(${s.developer_level})`).join(', ')}の経験があります。`;
  } else {
    reason = `必須スキル不足: ${skillsNotMatched.map(s => s.name).join(', ')}`;
  }

  return {
    total: totalScore,
    reason: reason,
    skillsMatched: skillsMatched,
    skillsNotMatched: skillsNotMatched,
  };
}

// ============================================================================
// End of Edge Function
// ============================================================================
