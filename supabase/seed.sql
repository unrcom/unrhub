-- =============================================
-- サンプルデータ（Seed Data）- 技術者のみ
-- Created: 2025-10-11
-- Purpose: マッチング機能のテスト用技術者データ
-- =============================================

-- =============================================
-- 技術者（8名）- 多様なスキルセットでマッチングテスト用
-- =============================================

-- 技術者1: フロントエンド特化（React/TypeScript）
INSERT INTO developers (id, email, name, bio, github_url, portfolio_url, hours_per_week, start_date, work_style, preferred_locations, contract_type, hourly_rate, currency, rate_negotiable, preferences, status, is_public, created_at, updated_at) VALUES
(
  '11111111-1111-4111-8111-111111111111',
  'frontend.expert@example.com',
  '田中健太',
  'React/TypeScriptを中心にフロントエンド開発を6年間行ってきました。モダンなUIライブラリやデザインシステムの構築経験が豊富です。',
  'https://github.com/tanaka-kenta',
  'https://tanaka-portfolio.dev',
  30,
  'now',
  'remote_only',
  ARRAY[]::text[],
  'hourly',
  6000,
  'JPY',
  true,
  '{"project_types": ["frontend_development", "web_app"], "industries": ["ecommerce", "fintech"], "team_size_preference": "small"}'::jsonb,
  'active',
  true,
  '2025-01-20 09:00:00+09',
  '2025-10-11 08:00:00+09'
);

-- 技術者2: フルスタック（React + Node.js）
INSERT INTO developers (id, email, name, bio, github_url, hours_per_week, start_date, work_style, contract_type, hourly_rate, currency, rate_negotiable, preferences, status, is_public, created_at, updated_at) VALUES
(
  '22222222-2222-4222-8222-222222222222',
  'fullstack.dev@example.com',
  '佐々木美咲',
  'フロントエンドからバックエンドまで幅広く対応できます。スタートアップでの開発経験が豊富で、素早くMVPを構築できます。',
  'https://github.com/sasaki-misaki',
  25,
  '2025-11-15',
  'remote_mainly',
  'hourly',
  5500,
  'JPY',
  true,
  '{"project_types": ["web_app", "poc"], "industries": ["education", "hr"], "team_size_preference": "small"}'::jsonb,
  'active',
  true,
  '2025-02-01 10:00:00+09',
  '2025-10-10 12:00:00+09'
);

-- 技術者3: バックエンド特化（Python/Django）
INSERT INTO developers (id, email, name, bio, github_url, hours_per_week, start_date, work_style, preferred_locations, contract_type, daily_rate, currency, rate_negotiable, preferences, status, is_public, created_at, updated_at) VALUES
(
  '33333333-3333-4333-8333-333333333333',
  'backend.specialist@example.com',
  '高橋誠',
  'Python/Djangoを使ったバックエンド開発が得意です。API設計やデータベース最適化の経験が豊富です。',
  'https://github.com/takahashi-makoto',
  40,
  'now',
  'hybrid',
  ARRAY['東京都', '神奈川県'],
  'daily',
  45000,
  'JPY',
  false,
  '{"project_types": ["backend_development", "api_development"], "industries": ["fintech", "healthcare"], "team_size_preference": "medium"}'::jsonb,
  'active',
  true,
  '2025-02-15 11:00:00+09',
  '2025-10-09 15:30:00+09'
);

-- 技術者4: モバイル開発（Flutter）
INSERT INTO developers (id, email, name, bio, github_url, portfolio_url, hours_per_week, start_date, work_style, contract_type, hourly_rate, currency, rate_negotiable, preferences, status, is_public, created_at, updated_at) VALUES
(
  '44444444-4444-4444-8444-444444444444',
  'mobile.engineer@example.com',
  '小林真理',
  'Flutterを使ったクロスプラットフォーム開発が専門です。iOS/Android両方に対応した高品質なアプリを開発できます。',
  'https://github.com/kobayashi-mari',
  'https://kobayashi-apps.com',
  20,
  '2025-12-01',
  'remote_only',
  'hourly',
  5000,
  'JPY',
  true,
  '{"project_types": ["mobile_app"], "industries": ["entertainment", "education"], "team_size_preference": "any"}'::jsonb,
  'active',
  true,
  '2025-03-01 09:30:00+09',
  '2025-10-11 09:00:00+09'
);

-- 技術者5: インフラエンジニア（AWS/Docker）
INSERT INTO developers (id, email, name, bio, github_url, hours_per_week, start_date, work_style, contract_type, monthly_rate, currency, rate_negotiable, preferences, status, is_public, created_at, updated_at) VALUES
(
  '55555555-5555-4555-8555-555555555555',
  'infra.engineer@example.com',
  '渡辺大樹',
  'AWS/GCPを使ったインフラ構築・運用が得意です。CI/CDパイプラインの構築やKubernetesの経験も豊富です。',
  'https://github.com/watanabe-daiki',
  40,
  'now',
  'remote_only',
  'monthly',
  800000,
  'JPY',
  true,
  '{"project_types": ["infrastructure", "consulting"], "industries": ["fintech", "ecommerce"], "team_size_preference": "any"}'::jsonb,
  'active',
  true,
  '2025-03-15 10:00:00+09',
  '2025-10-10 14:00:00+09'
);

-- 技術者6: 要件定義・設計（アーキテクト）
INSERT INTO developers (id, email, name, bio, linkedin_url, hours_per_week, start_date, work_style, preferred_locations, contract_type, daily_rate, currency, rate_negotiable, preferences, status, is_public, created_at, updated_at) VALUES
(
  '66666666-6666-4666-8666-666666666666',
  'architect@example.com',
  '中村聡',
  '15年以上の開発経験を持つシステムアーキテクトです。要件定義からシステム設計まで、上流工程を得意としています。',
  'https://linkedin.com/in/nakamura-satoshi',
  20,
  '2025-11-01',
  'hybrid',
  ARRAY['東京都', '大阪府'],
  'daily',
  60000,
  'JPY',
  true,
  '{"project_types": ["requirements_definition", "system_design", "consulting"], "industries": ["fintech", "manufacturing"], "team_size_preference": "large"}'::jsonb,
  'active',
  true,
  '2025-04-01 11:00:00+09',
  '2025-10-08 16:30:00+09'
);

-- 技術者7: データ分析エンジニア（Python/R）
INSERT INTO developers (id, email, name, bio, github_url, hours_per_week, start_date, work_style, contract_type, hourly_rate, currency, rate_negotiable, preferences, status, is_public, created_at, updated_at) VALUES
(
  '77777777-7777-4777-8777-777777777777',
  'data.analyst@example.com',
  '伊藤優子',
  'Python/Rを使ったデータ分析が専門です。機械学習モデルの構築やBIツールの導入支援も行っています。',
  'https://github.com/ito-yuko',
  15,
  'now',
  'remote_only',
  'hourly',
  5500,
  'JPY',
  false,
  '{"project_types": ["data_analysis", "consulting"], "industries": ["ecommerce", "healthcare"], "team_size_preference": "small"}'::jsonb,
  'active',
  true,
  '2025-04-20 09:00:00+09',
  '2025-10-11 07:30:00+09'
);

-- 技術者8: ジュニアエンジニア（学習中）
INSERT INTO developers (id, email, name, bio, github_url, hours_per_week, start_date, work_style, contract_type, hourly_rate, currency, rate_negotiable, preferences, status, is_public, created_at, updated_at) VALUES
(
  '88888888-8888-4888-8888-888888888888',
  'junior.dev@example.com',
  '山本翔太',
  'プログラミングスクールを卒業したばかりのジュニアエンジニアです。実務経験を積みながら成長していきたいです。',
  'https://github.com/yamamoto-shota',
  40,
  'now',
  'remote_only',
  'hourly',
  2500,
  'JPY',
  true,
  '{"project_types": ["web_app", "maintenance"], "industries": ["any"], "team_size_preference": "small"}'::jsonb,
  'active',
  true,
  '2025-05-10 10:00:00+09',
  '2025-10-10 18:00:00+09'
);

-- =============================================
-- 技術者スキル
-- =============================================

-- 技術者1のスキル（フロントエンド特化）
INSERT INTO developer_skills (developer_id, category, skill_name, skill_level, years, last_used) VALUES
('11111111-1111-4111-8111-111111111111', 'programming_languages', 'JavaScript', 'expert', 6, '2025-10'),
('11111111-1111-4111-8111-111111111111', 'programming_languages', 'TypeScript', 'expert', 4, '2025-10'),
('11111111-1111-4111-8111-111111111111', 'frameworks', 'React', 'expert', 5, '2025-10'),
('11111111-1111-4111-8111-111111111111', 'frameworks', 'Next.js', 'advanced', 3, '2025-10'),
('11111111-1111-4111-8111-111111111111', 'frameworks', 'Vue.js', 'intermediate', 2, '2024-12'),
('11111111-1111-4111-8111-111111111111', 'other_technologies', 'Tailwind CSS', 'advanced', 3, '2025-10'),
('11111111-1111-4111-8111-111111111111', 'other_technologies', 'Figma', 'intermediate', 2, '2025-09'),
('11111111-1111-4111-8111-111111111111', 'other_technologies', 'Git', 'advanced', 5, '2025-10');

-- 技術者2のスキル（フルスタック）
INSERT INTO developer_skills (developer_id, category, skill_name, skill_level, years, last_used) VALUES
('22222222-2222-4222-8222-222222222222', 'programming_languages', 'JavaScript', 'advanced', 4, '2025-10'),
('22222222-2222-4222-8222-222222222222', 'programming_languages', 'TypeScript', 'advanced', 3, '2025-10'),
('22222222-2222-4222-8222-222222222222', 'frameworks', 'React', 'advanced', 3, '2025-10'),
('22222222-2222-4222-8222-222222222222', 'frameworks', 'Node.js', 'advanced', 4, '2025-10'),
('22222222-2222-4222-8222-222222222222', 'frameworks', 'Express', 'intermediate', 3, '2025-09'),
('22222222-2222-4222-8222-222222222222', 'databases', 'PostgreSQL', 'intermediate', 2, '2025-10'),
('22222222-2222-4222-8222-222222222222', 'databases', 'MongoDB', 'beginner', 1, '2025-08'),
('22222222-2222-4222-8222-222222222222', 'cloud_services', 'AWS', 'intermediate', 2, '2025-09'),
('22222222-2222-4222-8222-222222222222', 'other_technologies', 'Docker', 'beginner', 1, '2025-10');

-- 技術者3のスキル（バックエンド特化）
INSERT INTO developer_skills (developer_id, category, skill_name, skill_level, years, last_used) VALUES
('33333333-3333-4333-8333-333333333333', 'programming_languages', 'Python', 'expert', 7, '2025-10'),
('33333333-3333-4333-8333-333333333333', 'programming_languages', 'SQL', 'advanced', 6, '2025-10'),
('33333333-3333-4333-8333-333333333333', 'frameworks', 'Django', 'expert', 5, '2025-10'),
('33333333-3333-4333-8333-333333333333', 'frameworks', 'Flask', 'advanced', 3, '2025-09'),
('33333333-3333-4333-8333-333333333333', 'databases', 'PostgreSQL', 'expert', 6, '2025-10'),
('33333333-3333-4333-8333-333333333333', 'databases', 'Redis', 'intermediate', 3, '2025-10'),
('33333333-3333-4333-8333-333333333333', 'cloud_services', 'AWS', 'advanced', 4, '2025-10'),
('33333333-3333-4333-8333-333333333333', 'other_technologies', 'REST API', 'expert', 6, '2025-10'),
('33333333-3333-4333-8333-333333333333', 'other_technologies', 'Docker', 'advanced', 4, '2025-10');

-- 技術者4のスキル（モバイル）
INSERT INTO developer_skills (developer_id, category, skill_name, skill_level, years, last_used) VALUES
('44444444-4444-4444-8444-444444444444', 'programming_languages', 'Dart', 'expert', 4, '2025-10'),
('44444444-4444-4444-8444-444444444444', 'programming_languages', 'Swift', 'intermediate', 2, '2025-08'),
('44444444-4444-4444-8444-444444444444', 'frameworks', 'Flutter', 'expert', 4, '2025-10'),
('44444444-4444-4444-8444-444444444444', 'databases', 'Firebase Firestore', 'advanced', 3, '2025-10'),
('44444444-4444-4444-8444-444444444444', 'cloud_services', 'Firebase', 'advanced', 3, '2025-10'),
('44444444-4444-4444-8444-444444444444', 'other_technologies', 'REST API', 'advanced', 3, '2025-10'),
('44444444-4444-4444-8444-444444444444', 'other_technologies', 'Git', 'intermediate', 3, '2025-10');

-- 技術者5のスキル（インフラ）
INSERT INTO developer_skills (developer_id, category, skill_name, skill_level, years, last_used) VALUES
('55555555-5555-4555-8555-555555555555', 'programming_languages', 'Python', 'intermediate', 3, '2025-09'),
('55555555-5555-4555-8555-555555555555', 'programming_languages', 'ShellScript', 'advanced', 5, '2025-10'),
('55555555-5555-4555-8555-555555555555', 'cloud_services', 'AWS', 'expert', 6, '2025-10'),
('55555555-5555-4555-8555-555555555555', 'cloud_services', 'AWS EC2', 'expert', 6, '2025-10'),
('55555555-5555-4555-8555-555555555555', 'cloud_services', 'AWS Lambda', 'advanced', 4, '2025-10'),
('55555555-5555-4555-8555-555555555555', 'cloud_services', 'Google Cloud Platform (GCP)', 'intermediate', 2, '2025-09'),
('55555555-5555-4555-8555-555555555555', 'other_technologies', 'Docker', 'expert', 5, '2025-10'),
('55555555-5555-4555-8555-555555555555', 'other_technologies', 'Kubernetes', 'advanced', 3, '2025-10'),
('55555555-5555-4555-8555-555555555555', 'other_technologies', 'Terraform', 'advanced', 3, '2025-10'),
('55555555-5555-4555-8555-555555555555', 'other_technologies', 'GitHub Actions', 'advanced', 3, '2025-10');

-- 技術者6のスキル（アーキテクト）
INSERT INTO developer_skills (developer_id, category, skill_name, skill_level, years, last_used) VALUES
('66666666-6666-4666-8666-666666666666', 'programming_languages', 'Java', 'expert', 12, '2025-09'),
('66666666-6666-4666-8666-666666666666', 'programming_languages', 'Python', 'advanced', 5, '2025-10'),
('66666666-6666-4666-8666-666666666666', 'programming_languages', 'SQL', 'expert', 10, '2025-10'),
('66666666-6666-4666-8666-666666666666', 'frameworks', 'Spring Boot', 'expert', 8, '2025-09'),
('66666666-6666-4666-8666-666666666666', 'databases', 'PostgreSQL', 'expert', 10, '2025-10'),
('66666666-6666-4666-8666-666666666666', 'databases', 'Oracle Database', 'expert', 12, '2025-08'),
('66666666-6666-4666-8666-666666666666', 'cloud_services', 'AWS', 'expert', 7, '2025-10'),
('66666666-6666-4666-8666-666666666666', 'other_technologies', 'Agile/Scrum', 'expert', 10, '2025-10');

-- 技術者7のスキル（データ分析）
INSERT INTO developer_skills (developer_id, category, skill_name, skill_level, years, last_used) VALUES
('77777777-7777-4777-8777-777777777777', 'programming_languages', 'Python', 'expert', 5, '2025-10'),
('77777777-7777-4777-8777-777777777777', 'programming_languages', 'R', 'advanced', 4, '2025-10'),
('77777777-7777-4777-8777-777777777777', 'programming_languages', 'SQL', 'advanced', 5, '2025-10'),
('77777777-7777-4777-8777-777777777777', 'databases', 'PostgreSQL', 'intermediate', 3, '2025-10'),
('77777777-7777-4777-8777-777777777777', 'databases', 'MongoDB', 'beginner', 1, '2025-09'),
('77777777-7777-4777-8777-777777777777', 'cloud_services', 'AWS', 'intermediate', 2, '2025-10');

-- 技術者8のスキル（ジュニア）
INSERT INTO developer_skills (developer_id, category, skill_name, skill_level, years, last_used) VALUES
('88888888-8888-4888-8888-888888888888', 'programming_languages', 'JavaScript', 'beginner', 0.5, '2025-10'),
('88888888-8888-4888-8888-888888888888', 'programming_languages', 'HTML', 'intermediate', 1, '2025-10'),
('88888888-8888-4888-8888-888888888888', 'frameworks', 'React', 'beginner', 0.5, '2025-10'),
('88888888-8888-4888-8888-888888888888', 'databases', 'MySQL', 'beginner', 0.5, '2025-09'),
('88888888-8888-4888-8888-888888888888', 'other_technologies', 'Git', 'beginner', 0.5, '2025-10');

-- =============================================
-- コメント
-- =============================================
COMMENT ON TABLE developers IS 'サンプル技術者: 8名（様々なスキルセットでマッチングテスト用）';
COMMENT ON TABLE developer_skills IS 'サンプルスキル: 各技術者に5-10個のスキルを設定';
