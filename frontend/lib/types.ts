// チャットメッセージ
export interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
  timestamp?: string;
}

// プロジェクトデータ
export interface ProjectData {
  title?: string;
  description?: string;
  project_type?: string;
  duration_months?: number;
  industry?: string;
}

// スキル情報
export interface SkillMatch {
  name: string;
  required_level: string;
  developer_level: string;
  years?: number;
  met: boolean;
}

export interface SkillNotMatch {
  name: string;
  required_level: string;
  developer_level: string | null;
  met: false;
}

// マッチング結果
export interface MatchResult {
  developer_id: string;
  developer_name: string;
  developer_email: string;
  match_score: number;
  match_reason: string;
  skills_matched: SkillMatch[];
  skills_not_matched: SkillNotMatch[];
}

// APIリクエスト
export interface EvaluateAndMatchRequest {
  project: ProjectData;
  chatHistory?: ChatMessage[];
  message?: string;
}

// APIレスポンス
export interface QuestionResponse {
  type: 'question';
  message: string;
  chatHistory: ChatMessage[];
}

export interface MatchesResponse {
  type: 'matches';
  data: MatchResult[];
  requirements: {
    skills: Array<{
      name: string;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      required: boolean;
    }>;
    start_date: string;
  };
}

export type ApiResponse = QuestionResponse | MatchesResponse;
