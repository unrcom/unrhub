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
  project_type?: string | string[];  // 単一または配列
  project_type_other?: string;       // 「その他」の詳細
  required_skills?: string[];        // 必須スキル
  required_skills_other?: string;    // 必須スキル「その他」の詳細
  preferred_skills?: string[];       // あると望ましいスキル
  preferred_skills_other?: string;   // あると望ましいスキル「その他」の詳細
  start_date?: string;               // 希望開始日
  end_date?: string;                 // 終了日
  additional_requirements?: string;  // その他のご要望
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
