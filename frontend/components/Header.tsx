'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
      <div className="container mx-auto px-4 py-4 flex items-center gap-4">
        {/* テーマ切り替えボタン（左上） */}
        <ThemeToggle />
        
        {/* ロゴ */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-light-text dark:text-dark-text">
            Unrhub
          </span>
          <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            技術者マッチング
          </span>
        </Link>
      </div>
    </header>
  );
}
