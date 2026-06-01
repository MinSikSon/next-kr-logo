import { logos } from '@/data/logos';
import LogoGrid from '@/components/LogoGrid';

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--card-border)] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-2xl font-bold tracking-tight">한국 기업 로고 갤러리</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            대한민국 주요 기업 브랜드 모음 · {logos.length}개 기업
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <LogoGrid logos={logos} />
      </div>
    </main>
  );
}
