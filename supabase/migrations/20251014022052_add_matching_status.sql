-- =============================================
-- プロジェクトマッチングステータス追加
-- Created: 2025-10-13
-- =============================================

-- プロジェクトマッチングステータスの定義
CREATE TYPE project_matching_status AS ENUM (
  'client_info_collecting',   -- 0: クライアント条件確認中
  'developers_matched',        -- 1: 技術者回答済み
  'awaiting_email',           -- 2: 技術者マッチングなし、メールアドレス確認中
  'email_received',           -- 3: 技術者マッチングなし、メールアドレス確認済
  'staff_handled'             -- 9: スタッフ対応済み
);

-- projectsテーブルにmatching_statusカラムを追加
ALTER TABLE projects 
ADD COLUMN matching_status project_matching_status 
DEFAULT 'client_info_collecting' NOT NULL;

-- clientsテーブルにemail_verified_atカラムを追加（オプション）
ALTER TABLE clients 
ADD COLUMN email_verified_at TIMESTAMPTZ;

-- インデックスを追加
CREATE INDEX idx_projects_matching_status ON projects(matching_status);

-- コメント追加
COMMENT ON COLUMN projects.matching_status IS 'プロジェクトのマッチングステータス管理';
