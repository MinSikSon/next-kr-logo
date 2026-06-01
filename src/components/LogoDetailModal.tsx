'use client';

import { useState, useEffect, useRef } from 'react';
import type { LogoEntry } from '@/types/logo';
import { getCategoryColor } from '@/types/logo';
import LogoMark from './LogoMark';

interface LogoDetailModalProps {
  entry: LogoEntry;
  onClose: () => void;
}

const SIZES = [64, 128, 256, 512] as const;
type PreviewSize = (typeof SIZES)[number];
type CopiedKey = 'share' | 'img' | 'api' | null;

export default function LogoDetailModal({ entry, onClose }: LogoDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<PreviewSize>(128);
  const [copied, setCopied] = useState<CopiedKey>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  // Share URL — the /logos/{ticker} page (what users paste and see the logo)
  const shareUrl = entry.ticker ? `${origin}/logos/${entry.ticker}` : null;
  // Raw R2 image URL
  const imageUrl = entry.imageUrl;
  const downloadUrl = entry.ticker ? `/api/v1/logos/${entry.ticker}/image` : null;

  async function copy(text: string, key: CopiedKey) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full sm:max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-y-auto max-h-[92vh] outline-none"
      >
        {/* Brand bar */}
        <div className="h-1 w-full rounded-t-3xl sm:rounded-t-2xl" style={{ backgroundColor: entry.brandColor }} />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors z-10"
          aria-label="닫기"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex flex-col items-center pt-7 pb-5 px-6 border-b border-[var(--card-border)]">
          <LogoMark entry={entry} size={88} />
          <h2 className="mt-4 text-lg font-bold text-[var(--foreground)] text-center">{entry.nameKo}</h2>
          <p className="text-sm text-[var(--muted)] mt-0.5 text-center">{entry.nameEn}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${getCategoryColor(entry.category)}`}>
              {entry.category}
            </span>
            {entry.ticker && (
              <span className="text-[11px] font-mono bg-[var(--background)] border border-[var(--card-border)] px-2.5 py-1 rounded-full text-[var(--muted)]">
                {entry.ticker}
              </span>
            )}
            {entry.founded > 0 && (
              <span className="text-[11px] text-[var(--muted)]">est. {entry.founded}</span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-5">

          {/* Share URL — main copy action */}
          {shareUrl && (
            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-2">
                공유 URL
              </h3>
              <div className="flex items-center gap-2 p-3 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
                <code className="flex-1 text-xs font-mono text-[var(--foreground)] truncate">{shareUrl}</code>
                <button
                  onClick={() => copy(shareUrl, 'share')}
                  className={`shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                    copied === 'share'
                      ? 'bg-green-500 text-white'
                      : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-bg)]/60'
                  }`}
                >
                  {copied === 'share' ? '복사됨!' : '복사'}
                </button>
              </div>
              <p className="text-[11px] text-[var(--muted)] mt-1.5">
                이 URL을 붙여넣으면 로고 페이지가 바로 표시됩니다.
              </p>
            </section>
          )}

          {/* Size preview */}
          <section>
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">
              사이즈 미리보기
            </h3>
            <div className="flex gap-2 mb-3">
              {SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedSize === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {s}px
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center py-6 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
              <div
                style={{
                  backgroundImage:
                    'linear-gradient(45deg,#ccc 25%,transparent 25%),linear-gradient(-45deg,#ccc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ccc 75%),linear-gradient(-45deg,transparent 75%,#ccc 75%)',
                  backgroundSize: '12px 12px',
                  backgroundPosition: '0 0,0 6px,6px -6px,-6px 0',
                  borderRadius: Math.round(Math.min(selectedSize, 256) * 0.22),
                }}
              >
                <LogoMark entry={entry} size={Math.min(selectedSize, 256)} />
              </div>
            </div>
            <p className="text-center text-[11px] text-[var(--muted)] mt-2">
              {selectedSize}×{selectedSize}px
              {selectedSize > 256 && ' (표시는 256px로 축소됨)'}
            </p>
          </section>

          {/* Raw image URL + download */}
          {(imageUrl || downloadUrl) && (
            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-2">
                이미지 파일
              </h3>
              {imageUrl && (
                <div className="flex items-center gap-2 p-3 bg-[var(--background)] rounded-xl border border-[var(--card-border)] mb-2">
                  <code className="flex-1 text-xs font-mono text-[var(--foreground)] truncate">{imageUrl}</code>
                  <button
                    onClick={() => copy(imageUrl, 'img')}
                    className={`shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                      copied === 'img'
                        ? 'bg-green-500 text-white'
                        : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-bg)]/60'
                    }`}
                  >
                    {copied === 'img' ? '복사됨!' : '복사'}
                  </button>
                </div>
              )}
              {downloadUrl && (
                <div className="flex gap-2">
                  {imageUrl && (
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center text-xs font-medium py-2 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                    >
                      원본 열기 ↗
                    </a>
                  )}
                  <a
                    href={downloadUrl}
                    className="flex-1 text-center text-xs font-medium py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    다운로드 ↓
                  </a>
                </div>
              )}
            </section>
          )}

          {/* API */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">API</h3>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 uppercase tracking-wide">Beta</span>
            </div>
            <div className="p-3 bg-[var(--background)] rounded-xl border border-[var(--card-border)] space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-green-500 font-bold shrink-0">GET</span>
                <span className="text-[var(--muted)] truncate">/api/v1/logos{entry.ticker ? `?q=${entry.ticker}` : ''}</span>
              </div>
              {entry.ticker && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-blue-500 font-bold shrink-0">GET</span>
                  <span className="text-[var(--muted)] truncate">
                    /api/v1/logos/{entry.ticker}/image?size={selectedSize}
                    <span className="text-amber-500"> ✦ soon</span>
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() =>
                copy(
                  `${origin}/api/v1/logos${entry.ticker ? `?q=${entry.ticker}` : ''}`,
                  'api'
                )
              }
              className={`mt-2 w-full text-xs font-medium py-2 rounded-lg border transition-colors ${
                copied === 'api'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {copied === 'api' ? 'API URL 복사됨!' : 'API URL 복사'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
