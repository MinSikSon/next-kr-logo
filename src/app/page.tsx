import { getCloudflareContext } from '@opennextjs/cloudflare';
import { CATEGORIES } from '@/types/logo';
import { queryLogos, staticLogos } from '@/lib/logos';
import LogoGrid from '@/components/LogoGrid';

export default async function Home() {
  let logos = staticLogos;
  let total = staticLogos.length;
  let hasMore = false;

  try {
    const { env } = await getCloudflareContext({ async: true });
    if (env.DB) {
      const result = await queryLogos(env.DB, { page: 1, limit: 48 });
      if (result.logos.length > 0) {
        logos = result.logos;
        total = result.total;
        hasMore = result.hasMore;
      }
    }
  } catch {
    // local dev — use static data
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[var(--card-border)]">
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.12), transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-9 sm:pt-14 sm:pb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
            Brand Archive
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] leading-tight">
            한국 기업{' '}
            <span className="text-blue-600 dark:text-blue-400">로고 갤러리</span>
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted)] mt-2.5 max-w-sm">
            대한민국 상장 기업의 브랜드 아이덴티티를 한눈에
          </p>
          <div className="flex items-center gap-6 mt-6">
            <div>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                {total.toLocaleString()}
              </span>
              <span className="text-xs text-[var(--muted)] ml-1.5">기업</span>
            </div>
            <div className="w-px h-8 bg-[var(--card-border)]" />
            <div>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                {CATEGORIES.length}
              </span>
              <span className="text-xs text-[var(--muted)] ml-1.5">업종</span>
            </div>
          </div>
        </div>
      </div>

      <LogoGrid logos={logos} total={total} hasMore={hasMore} />
    </div>
  );
}
