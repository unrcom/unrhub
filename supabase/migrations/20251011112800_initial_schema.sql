-- =============================================
-- マッチングサイト 初期スキーマ（修正版 v2）
-- Created: 2025-10-11
-- Updated: 2025-10-13 - 新しいAPIインターフェースに対応
-- Database: Supabase (PostgreSQL)
-- =============================================

-- =============================================
-- ENUM型定義
-- =============================================

-- スキルレベル
CREATE TYPE skill_level AS ENUM (
  'beginner',
  'intermediate',
  'advanced',
  'expert'
);

-- 勤務形態
CREATE TYPE work_style AS ENUM (
  'remote_only',
  'remote_mainly',
  'hybrid',
  'onsite_ok'
);

-- 契約形態
CREATE TYPE contract_type AS ENUM (
  'hourly',
  'daily',
  'monthly',
  'project',
  'negotiable'
);

-- 技術者ステータス
CREATE TYPE developer_status AS ENUM (
  'active',
  'inactive',
  'busy'
);

-- 案件ステータス
CREATE TYPE project_status AS ENUM (
  'draft',
  'searching',
  'interviewing',
  'matched',
  'in_progress',
  'completed',
  'cancelled'
);

-- 緊急度
CREATE TYPE urgency_level AS ENUM (
  'low',
  'medium',
  'high',
  'immediate'
);

-- マッチングステータス
CREATE TYPE match_status AS ENUM (
  'suggested',
  'contacted',
  'interviewing',
  'accepted',
  'rejected'
);

-- チャットロール
CREATE TYPE chat_role AS ENUM (
  'user',
  'assistant',
  'system'
);

-- =============================================
-- テーブル: clients（クライアント）
-- =============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  company_name VARCHAR(200),
  contact_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_clients_email ON clients(email);

COMMENT ON COLUMN clients.is_verified IS 'メール認証済みかどうか';

-- =============================================
-- テーブル: developers（技術者）
-- =============================================
CREATE TABLE developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  name VARCHAR(100) NOT NULL,

  -- プロフィール
  bio TEXT,
  github_url VARCHAR(500),
  portfolio_url VARCHAR(500),
  linkedin_url VARCHAR(500),

  -- 稼働条件
  hours_per_week INTEGER NOT NULL CHECK (hours_per_week >= 1 AND hours_per_week <= 60),
  start_date VARCHAR(20) NOT NULL,
  work_style work_style NOT NULL,
  preferred_locations TEXT[],

  -- 料金設定
  contract_type contract_type NOT NULL,
  hourly_rate INTEGER CHECK (hourly_rate >= 0),
  daily_rate INTEGER CHECK (daily_rate >= 0),
  monthly_rate INTEGER CHECK (monthly_rate >= 0),
  currency VARCHAR(3) DEFAULT 'JPY',
  rate_negotiable BOOLEAN DEFAULT false,

  -- 希望条件（JSONB）
  preferences JSONB DEFAULT '{}'::jsonb,

  -- ステータス
  status developer_status DEFAULT 'active' NOT NULL,
  is_public BOOLEAN DEFAULT true,

  -- メタ情報
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_developers_email ON developers(email);
CREATE INDEX idx_developers_status ON developers(status);
CREATE INDEX idx_developers_work_style ON developers(work_style);
CREATE INDEX idx_developers_start_date ON developers(start_date);
CREATE INDEX idx_developers_preferences ON developers USING GIN(preferences);

-- =============================================
-- テーブル: developer_skills（技術者スキル）
-- =============================================
CREATE TABLE developer_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,

  category VARCHAR(50) NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  skill_level skill_level NOT NULL,
  years NUMERIC(4,2) CHECK (years IS NULL OR (years >= 0 AND years <= 50)),
  last_used VARCHAR(7),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(developer_id, category, skill_name)
);

CREATE INDEX idx_developer_skills_developer_id ON developer_skills(developer_id);
CREATE INDEX idx_developer_skills_category ON developer_skills(category);
CREATE INDEX idx_developer_skills_skill_name ON developer_skills(skill_name);
CREATE INDEX idx_developer_skills_level ON developer_skills(skill_level);

-- =============================================
-- テーブル: projects（案件） - 修正版
-- =============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE, -- NULL許可に変更

  -- 基本情報（全てNULL許可）
  title VARCHAR(200),
  description TEXT,
  project_type TEXT[], -- 配列型に変更
  project_type_other VARCHAR(200),
  industry VARCHAR(50),

  -- 予算（全てNULL許可）
  budget_contract_type contract_type,
  max_hourly_rate INTEGER,
  max_daily_rate INTEGER,
  max_monthly_rate INTEGER,
  total_budget INTEGER,
  currency VARCHAR(3) DEFAULT 'JPY',

  -- 期間・スケジュール（start_date, end_date に統一）
  start_date VARCHAR(20), -- 'now' or 'yyyy-mm-dd' 形式
  end_date VARCHAR(20), -- 'yyyy-mm-dd' 形式
  duration_months NUMERIC(5,2),
  urgency urgency_level,

  -- 稼働条件
  min_hours_per_week INTEGER CHECK (min_hours_per_week IS NULL OR min_hours_per_week >= 1),
  max_hours_per_week INTEGER CHECK (max_hours_per_week IS NULL OR max_hours_per_week >= 1),
  work_style work_style,
  location VARCHAR(200),
  timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',

  -- 追加要件
  additional_requirements TEXT,
  additional_preferences JSONB DEFAULT '{}'::jsonb,

  -- ステータス
  status project_status DEFAULT 'draft' NOT NULL,
  is_public BOOLEAN DEFAULT true,

  -- メタ情報
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_project_type ON projects USING GIN(project_type);
CREATE INDEX idx_projects_industry ON projects(industry);
CREATE INDEX idx_projects_start_date ON projects(start_date);
CREATE INDEX idx_projects_additional_preferences ON projects USING GIN(additional_preferences);

COMMENT ON COLUMN projects.client_id IS 'クライアントID（初回リクエスト時はNULL可）';
COMMENT ON COLUMN projects.project_type IS '案件タイプ（複数選択可能）';
COMMENT ON COLUMN projects.start_date IS '開始日（YYYY-MM-DD形式 or "now"）';
COMMENT ON COLUMN projects.end_date IS '終了日（YYYY-MM-DD形式）';

-- =============================================
-- テーブル: project_required_skills（案件必須スキル） - 修正版
-- =============================================
CREATE TABLE project_required_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  skill_name VARCHAR(100) NOT NULL,
  minimum_level skill_level NOT NULL,
  is_required BOOLEAN DEFAULT true,
  minimum_years NUMERIC(4,2),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(project_id, skill_name)
);

CREATE INDEX idx_project_skills_project_id ON project_required_skills(project_id);
CREATE INDEX idx_project_skills_skill_name ON project_required_skills(skill_name);
CREATE INDEX idx_project_skills_is_required ON project_required_skills(is_required);

COMMENT ON TABLE project_required_skills IS '案件で必要なスキル（categoryカラムを削除）';

-- =============================================
-- テーブル: project_chat_history（チャット履歴）
-- =============================================
CREATE TABLE project_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  session_id VARCHAR(100), -- NULL許可

  role chat_role NOT NULL,
  message TEXT NOT NULL,
  action JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_chat_history_project_id ON project_chat_history(project_id);
CREATE INDEX idx_chat_history_session_id ON project_chat_history(session_id);
CREATE INDEX idx_chat_history_created_at ON project_chat_history(created_at);

COMMENT ON COLUMN project_chat_history.session_id IS 'チャットセッションの識別子';

-- =============================================
-- テーブル: matches（マッチング結果） - テーブル名変更
-- =============================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,

  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  match_reason TEXT,
  status match_status DEFAULT 'suggested' NOT NULL,

  -- メタ情報
  matched_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(project_id, developer_id)
);

CREATE INDEX idx_matches_project_id ON matches(project_id);
CREATE INDEX idx_matches_developer_id ON matches(developer_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_score ON matches(match_score DESC);

-- =============================================
-- 関数: updated_at自動更新トリガー
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー適用
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_developers_updated_at BEFORE UPDATE ON developers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_developer_skills_updated_at BEFORE UPDATE ON developer_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_skills_updated_at BEFORE UPDATE ON project_required_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Row Level Security (RLS) の有効化
-- =============================================

-- クライアント
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select_own"
  ON clients FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "clients_update_own"
  ON clients FOR UPDATE
  USING (auth.uid()::text = id::text);

-- 技術者
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "developers_select_public"
  ON developers FOR SELECT
  USING (is_public = true OR auth.uid()::text = id::text);

CREATE POLICY "developers_update_own"
  ON developers FOR UPDATE
  USING (auth.uid()::text = id::text);

-- 技術者スキル
ALTER TABLE developer_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "developer_skills_select"
  ON developer_skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM developers
      WHERE developers.id = developer_skills.developer_id
      AND (developers.is_public = true OR auth.uid()::text = developers.id::text)
    )
  );

CREATE POLICY "developer_skills_manage_own"
  ON developer_skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM developers
      WHERE developers.id = developer_skills.developer_id
      AND auth.uid()::text = developers.id::text
    )
  );

-- 案件
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_public"
  ON projects FOR SELECT
  USING (is_public = true OR auth.uid()::text = client_id::text);

-- client_id が NULL の場合も考慮
CREATE POLICY "projects_insert_anonymous"
  ON projects FOR INSERT
  WITH CHECK (true); -- Edge Functionからの挿入を許可

CREATE POLICY "projects_manage_own"
  ON projects FOR UPDATE
  USING (auth.uid()::text = client_id::text);

-- 案件必須スキル
ALTER TABLE project_required_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_skills_select"
  ON project_required_skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_required_skills.project_id
      AND (projects.is_public = true OR auth.uid()::text = projects.client_id::text)
    )
  );

CREATE POLICY "project_skills_insert_any"
  ON project_required_skills FOR INSERT
  WITH CHECK (true); -- Edge Functionからの挿入を許可

CREATE POLICY "project_skills_manage_own"
  ON project_required_skills FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_required_skills.project_id
      AND auth.uid()::text = projects.client_id::text
    )
  );

-- チャット履歴
ALTER TABLE project_chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_history_select_own"
  ON project_chat_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_chat_history.project_id
      AND (auth.uid()::text = projects.client_id::text OR projects.client_id IS NULL)
    )
  );

CREATE POLICY "chat_history_insert_any"
  ON project_chat_history FOR INSERT
  WITH CHECK (true); -- Edge Functionからの挿入を許可

-- マッチング結果
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_select_involved"
  ON matches FOR SELECT
  USING (
    auth.uid()::text = developer_id::text
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = matches.project_id
      AND auth.uid()::text = projects.client_id::text
    )
  );

CREATE POLICY "matches_insert_any"
  ON matches FOR INSERT
  WITH CHECK (true); -- Edge Functionからの挿入を許可

CREATE POLICY "matches_manage_own"
  ON matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = matches.project_id
      AND auth.uid()::text = projects.client_id::text
    )
  );

-- =============================================
-- コメント（テーブル説明）
-- =============================================
COMMENT ON TABLE clients IS 'クライアント（案件投稿者）';
COMMENT ON TABLE developers IS '技術者';
COMMENT ON TABLE developer_skills IS '技術者の保有スキル';
COMMENT ON TABLE projects IS '案件（新しいAPIインターフェース対応）';
COMMENT ON TABLE project_required_skills IS '案件で必要なスキル（categoryなし）';
COMMENT ON TABLE project_chat_history IS '案件作成時のチャット履歴';
COMMENT ON TABLE matches IS '案件と技術者のマッチング結果';

-- =============================================
-- 権限設定（GRANT）
-- =============================================

-- service_roleに全権限を付与
GRANT ALL ON TABLE clients TO service_role;
GRANT ALL ON TABLE developers TO service_role;
GRANT ALL ON TABLE developer_skills TO service_role;
GRANT ALL ON TABLE projects TO service_role;
GRANT ALL ON TABLE project_required_skills TO service_role;
GRANT ALL ON TABLE project_chat_history TO service_role;
GRANT ALL ON TABLE matches TO service_role;

-- authenticatedロールにも権限を付与
GRANT ALL ON TABLE clients TO authenticated;
GRANT ALL ON TABLE developers TO authenticated;
GRANT ALL ON TABLE developer_skills TO authenticated;
GRANT ALL ON TABLE projects TO authenticated;
GRANT ALL ON TABLE project_required_skills TO authenticated;
GRANT ALL ON TABLE project_chat_history TO authenticated;
GRANT ALL ON TABLE matches TO authenticated;

-- anonロールに基本権限を付与
GRANT SELECT, INSERT ON TABLE projects TO anon;
GRANT SELECT, INSERT ON TABLE project_required_skills TO anon;
GRANT SELECT, INSERT ON TABLE project_chat_history TO anon;
GRANT SELECT ON TABLE matches TO anon;
