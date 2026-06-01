import { getCloudflareContext } from '@opennextjs/cloudflare';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { queryLogoByTicker, staticLogos, R2_BASE } from '@/lib/logos';
import { getCategoryColor } from '@/types/logo';
import type { LogoEntry } from '@/types/logo';
import LogoMark from '@/components/LogoMark';

interface Props {
  params: Promise<{ ticker: string }>;
}

async function getEntry(ticker: string): Promise<LogoEntry | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (env.DB) {
      const entry = await queryLogoByTicker(env.DB, ticker);
      if (entry) return entry;
    }
  } catch {
    // fall through to static
  }
  return staticLogos.find(l => l.ticker === ticker) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  const entry = await getEntry(ticker);
  if (!entry) return { title: '로고를 찾을 수 없습니다' };

  const ogImage = entry.imageUrl ?? `${R2_BASE}/logos/${ticker}.png`;

  return {
    title: `${entry.nameKo} 로고 | 한국 기업 로고 갤러리`,
    description: `${entry.nameKo}(${entry.nameEn}) 로고 이미지 다운로드 및 API`,
    openGraph: {
      title: `${entry.nameKo} 로고`,
      description: `${entry.nameEn} · ${entry.category} · est. ${entry.founded}`,
      images: [{ url: ogImage, width: 512, height: 512 }],
    },
    twitter: {
      card: 'summary',
      title: `${entry.nameKo} 로고`,
      images: [ogImage],
    },
  };
}

const SIZES = [64, 128, 256, 512] as const;

export default async function LogoPage({ params }: Props) {
  const { ticker } = await params;
  const entry = await getEntry(ticker);
  if (!entry) notFound();

  const downloadUrl = `/api/v1/logos/${ticker}/image`;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Back nav */}
      <div className="border-b border-[var(--card-border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
            갤러리로 돌아가기
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* Hero card */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden">
          <div className="h-1" style={{ backgroundColor: entry.brandColor }} />
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-8">
            <div className="shrink-0">
              <LogoMark entry={entry} size={120} />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">{entry.nameKo}</h1>
              <p className="text-[var(--muted)] mt-0.5">{entry.nameEn}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap justify-center sm:justify-start">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getCategoryColor(entry.category)}`}>
                  {entry.category}
                </span>
                {entry.ticker && (
                  <span className="text-xs font-mono bg-[var(--background)] border border-[var(--card-border)] px-2.5 py-1 rounded-full text-[var(--muted)]">
                    {entry.ticker}
                  </span>
                )}
                {entry.founded > 0 && (
                  <span className="text-xs text-[var(--muted)]">est. {entry.founded}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Size preview grid */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">사이즈별 미리보기</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SIZES.map(size => (
              <div key={size} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 flex flex-col items-center gap-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    backgroundImage: 'linear-gradient(45deg,#ccc 25%,transparent 25%),linear-gradient(-45deg,#ccc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ccc 75%),linear-gradient(-45deg,transparent 75%,#ccc 75%)',
                    backgroundSize: '10px 10px',
                    backgroundPosition: '0 0,0 5px,5px -5px,-5px 0',
                    borderRadius: 12,
                    padding: 8,
                  }}
                >
                  <LogoMark entry={entry} size={Math.min(size, 80)} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{size}px</p>
                  <p className="text-[11px] text-[var(--muted)]">{size}×{size}</p>
                </div>
                <a
                  href={`${downloadUrl}?size=${size}`}
                  className="w-full text-center text-xs font-medium py-1.5 rounded-lg border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30 transition-colors"
                >
                  다운로드
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Image URL + Download */}
        {entry.imageUrl && (
          <section>
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">이미지 URL</h2>
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 p-3 border-b border-[var(--card-border)]">
                <code className="flex-1 text-xs font-mono text-[var(--foreground)] truncate">{entry.imageUrl}</code>
              </div>
              <div className="flex">
                <a
                  href={entry.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-xs font-medium py-2.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors border-r border-[var(--card-border)]"
                >
                  원본 열기 ↗
                </a>
                <a
                  href={downloadUrl}
                  className="flex-1 text-center text-xs font-medium py-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                >
                  다운로드 ↓
                </a>
              </div>
            </div>
          </section>
        )}

        {/* API section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">API</h2>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 uppercase tracking-wide">Beta</span>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 space-y-2 font-mono text-xs">
            <div>
              <span className="text-green-500 font-bold">GET </span>
              <span className="text-[var(--muted)]">/api/v1/logos?q={entry.ticker ?? entry.nameKo}</span>
            </div>
            {entry.ticker && (
              <>
                <div>
                  <span className="text-blue-500 font-bold">GET </span>
                  <span className="text-[var(--muted)]">/api/v1/logos/{entry.ticker}/image</span>
                </div>
                <div>
                  <span className="text-blue-500 font-bold">GET </span>
                  <span className="text-[var(--muted)]">/api/v1/logos/{entry.ticker}/image?size=256</span>
                  <span className="text-amber-500 ml-2">// 리사이징 — 출시 예정</span>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-[var(--muted)] mt-2">
            API 키 인증 및 이미지 리사이징은 정식 버전에서 제공될 예정입니다.
          </p>
        </section>
      </div>
    </div>
  );
}
