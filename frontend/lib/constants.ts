// 案件タイプ
export const PROJECT_TYPES = {
  requirements_definition: "要件定義",
  system_design: "システム設計",
  frontend_development: "フロントエンド開発",
  backend_development: "バックエンド開発",
  web_app: "Webアプリケーション開発",
  mobile_app: "モバイルアプリ開発",
  api_development: "API開発",
  infrastructure: "インフラ構築・運用",
  system_test: "システムテスト",
  data_analysis: "データ分析",
  poc: "PoC（概念実証）",
  consulting: "技術コンサルティング",
  maintenance: "保守・運用",
  migration: "システム移行",
  other: "その他",
} as const;

export type ProjectTypeKey = keyof typeof PROJECT_TYPES;

// プログラミング言語
export const PROGRAMMING_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "PHP",
  "Ruby",
  "Go",
  "C#",
  "Swift",
  "Kotlin",
  "Rust",
  "C++",
  "C",
  "Scala",
  "Dart",
  "SQL",
  "HTML/CSS",
  "ShellScript",
  "R",
] as const;

// フレームワーク
export const FRAMEWORKS = [
  "React",
  "Next.js",
  "Vue.js",
  "Nuxt.js",
  "Angular",
  "Svelte",
  "Node.js",
  "Express",
  "NestJS",
  "Django",
  "FastAPI",
  "Flask",
  "Spring Boot",
  "Laravel",
  "Ruby on Rails",
  "ASP.NET",
  "Flutter",
  "React Native",
] as const;

// データベース
export const DATABASES = [
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "DynamoDB",
  "Firestore",
  "Oracle",
  "SQL Server",
  "Elasticsearch",
  "Supabase",
] as const;

// クラウドサービス
export const CLOUD_SERVICES = [
  "AWS",
  "Google Cloud",
  "Azure",
  "Firebase",
  "Vercel",
  "Netlify",
  "Heroku",
  "DigitalOcean",
] as const;

// その他の技術
export const OTHER_TECHNOLOGIES = [
  "Docker",
  "Kubernetes",
  "Terraform",
  "GitHub Actions",
  "Jenkins",
  "GraphQL",
  "REST API",
  "Webpack",
  "Vite",
  "Git",
] as const;

// 全スキルを統合（「その他」を追加）
export const ALL_SKILLS = [
  ...PROGRAMMING_LANGUAGES,
  ...FRAMEWORKS,
  ...DATABASES,
  ...CLOUD_SERVICES,
  ...OTHER_TECHNOLOGIES,
  "その他",
] as const;
