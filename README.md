# 技術者マッチングサイト

技術者とクライアントをつなぐマッチングプラットフォーム。LLM による要件評価と対話的なマッチング機能を提供します。

## 🎯 プロジェクト概要

このプロジェクトは、アプリ開発を行う技術者と、技術者を探しているクライアントをマッチングする Web サービスです。

### 主な機能

- **技術者登録**: 技術者が自身のスキル、経験、稼働条件を登録
- **案件投稿**: クライアントがフォームで案件情報を入力
- **LLM 評価**: AI（Claude）が入力内容の過不足を評価
- **対話的補完**: 情報不足時はチャットで追加質問
- **自動マッチング**: 条件に合う技術者を自動で提案

## 🏗️ システム構成

### バックエンド

- **Database**: Supabase (PostgreSQL)
- **Edge Functions**: Deno (TypeScript)
- **LLM**: Claude 3 Haiku (AWS Bedrock)
- **API**: RESTful API

### フロントエンド

- （未実装）Next.js / React を予定

## 📋 前提条件

- [Supabase CLI](https://supabase.com/docs/guides/cli) インストール済み
- [Deno](https://deno.land/) 2.0 以上
- AWS Bedrock アカウント（Claude API アクセス権限）
- Node.js 18 以上（フロントエンド開発時）

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Supabase プロジェクトの作成

```bash
# Supabase CLIでログイン
supabase login

# プロジェクトをリンク
supabase link --project-ref your-project-ref
```

### 3. 環境変数の設定

`.env.local` ファイルを作成：

```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

### 4. データベースマイグレーション

```bash
# マイグレーション実行
supabase db push

# シードデータ投入（開発環境のみ）
supabase db seed
```

### 5. Edge Function のデプロイ

```bash
# ローカルでテスト
supabase functions serve evaluate-and-match

# 本番環境にデプロイ
supabase functions deploy evaluate-and-match --no-verify-jwt
```

### 6. Edge Function に環境変数を設定

```bash
supabase secrets set AWS_REGION=ap-northeast-1
supabase secrets set AWS_ACCESS_KEY_ID=your-key
supabase secrets set AWS_SECRET_ACCESS_KEY=your-secret
```

## 📁 ディレクトリ構造

```
.
├── supabase/
│   ├── config.toml                          # Supabase設定
│   ├── migrations/
│   │   └── 20251011112800_initial_schema.sql  # 初期スキーマ
│   ├── seed.sql                             # サンプルデータ
│   └── functions/
│       └── evaluate-and-match/              # Edge Function
│           ├── index.ts                     # メイン処理
│           ├── deno.json                    # Deno設定
│           └── .npmrc                       # npm設定
├── .gitignore
└── README.md
```

## 🗄️ データモデル

### 主要テーブル

- `developers`: 技術者情報
- `developer_skills`: 技術者のスキル詳細
- `clients`: クライアント情報
- `projects`: 案件情報
- `project_required_skills`: 案件に必要なスキル
- `project_chat_history`: 対話履歴
- `matches`: マッチング結果

詳細は `supabase/migrations/20251011112800_initial_schema.sql` を参照

## 🔌 API エンドポイント

### POST /functions/v1/evaluate-and-match

案件情報を評価し、マッチングまたは追加質問を返す

**リクエスト例:**

```json
{
  "project_id": "uuid",
  "title": "ECサイトのフロントエンド開発",
  "description": "Next.jsでECサイトを構築したい",
  "project_type": "frontend",
  "industry": "ecommerce",
  "budget": {
    "min": 500000,
    "max": 1000000,
    "currency": "JPY"
  },
  "duration_months": 3,
  "hours_per_week": 20,
  "required_skills": [
    {
      "skill_name": "Next.js",
      "minimum_level": "intermediate"
    }
  ]
}
```

**レスポンス（情報十分な場合）:**

```json
{
  "status": "sufficient",
  "matches": [
    {
      "developer_id": "uuid",
      "name": "山田太郎",
      "match_score": 85,
      "matched_skills": ["Next.js", "TypeScript", "React"],
      "reasoning": "Next.jsの実務経験3年..."
    }
  ]
}
```

**レスポンス（情報不足の場合）:**

```json
{
  "status": "insufficient",
  "questions": [
    "デザインは既に完成していますか？",
    "決済機能の実装も必要ですか？"
  ],
  "missing_info": ["design_status", "payment_integration"]
}
```

## 🧪 テスト

### Edge Function のローカルテスト

```bash
# ローカルで起動
supabase functions serve

# curlでテスト
curl -X POST http://localhost:54321/functions/v1/evaluate-and-match \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d @test_data.json
```

### データベーステスト

```bash
# Supabase Studio で確認
supabase start
# ブラウザで http://localhost:54323 を開く
```

## 📝 開発ステータス

### ✅ 完了

- [x] データモデル設計
- [x] データベーススキーマ実装
- [x] Edge Function (evaluate-and-match)
- [x] LLM 評価ロジック
- [x] マッチングアルゴリズム基礎

### 🚧 進行中

- [ ] フロントエンド実装
  - [ ] 案件入力フォーム
  - [ ] チャット UI
  - [ ] マッチング結果表示

### 📅 今後の予定

- [ ] 技術者登録フォーム
- [ ] 認証機能（Supabase Auth）
- [ ] 通知機能
- [ ] マッチング履歴
- [ ] レビュー・評価機能

## 🤝 コントリビューション

現在は個人開発中です。

## 📄 ライセンス

未定

## 📞 お問い合わせ

プロジェクトに関する質問は Issue を作成してください。

---

**開発開始日**: 2025-10-11  
**最終更新**: 2025-10-11
