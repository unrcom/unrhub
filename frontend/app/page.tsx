import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">
            Welcome to Unrhub
          </h1>
          <p className="text-center text-light-text-secondary dark:text-dark-text-secondary mb-8">
            生成AIとカスタムSaaSでソリューションを提供しています
          </p>

          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">セットアップ完了 ✅</h2>
            <ul className="space-y-2 text-light-text-secondary dark:text-dark-text-secondary">
              <li>✓ Next.js 15 + TypeScript</li>
              <li>✓ Tailwind CSS (ダーク/ライトモード)</li>
              <li>✓ Zustand + Redux DevTools</li>
              <li>✓ Supabase接続</li>
              <li>✓ テーマ切り替え機能</li>
            </ul>
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            <button className="btn-primary">お問い合わせ</button>
            <button className="btn-secondary">詳細を見る</button>
          </div>
        </div>
      </main>
    </div>
  );
}
