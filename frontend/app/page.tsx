import Header from '@/components/Header';
import ProjectForm from '@/components/ProjectForm';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">
              技術者マッチング
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg">
              案件情報を入力してください。AIが最適な技術者をマッチングします。
            </p>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold mb-6">
              案件情報の入力
            </h2>
            <ProjectForm />
          </div>

          <div className="mt-8 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <p>
              入力された情報を基に、AIが必要なスキルや条件を確認し、
              最適な技術者をマッチングします。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
