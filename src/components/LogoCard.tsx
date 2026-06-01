import type { LogoEntry } from '@/types/logo';
import { getCategoryColor } from '@/types/logo';
import LogoMark from './LogoMark';

interface LogoCardProps {
  entry: LogoEntry;
  index?: number;
  onClick?: () => void;
}

export default function LogoCard({ entry, index = 0, onClick }: LogoCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      className="group relative flex flex-col bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/50 hover:border-transparent animate-fade-up cursor-pointer"
      style={{ animationDelay: `${Math.min(index * 25, 400)}ms` }}
    >
      {/* Brand color accent bar */}
      <div
        className="absolute top-0 inset-x-0 h-0.5 transition-all duration-300 group-hover:h-[3px]"
        style={{ backgroundColor: entry.brandColor }}
        aria-hidden="true"
      />

      {/* Logo mark area */}
      <div className="flex items-center justify-center pt-7 pb-3 px-4">
        <div className="transition-transform duration-300 group-hover:scale-110">
          <LogoMark entry={entry} />
        </div>
      </div>

      {/* Company info */}
      <div className="px-3.5 pb-4 flex flex-col gap-2.5 mt-auto">
        <div>
          <p className="font-semibold text-[var(--foreground)] text-sm leading-snug truncate">
            {entry.nameKo}
          </p>
          <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{entry.nameEn}</p>
        </div>
        <div className="flex items-center justify-between gap-1">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full truncate ${getCategoryColor(entry.category)}`}>
            {entry.category}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {entry.ticker && (
              <span className="text-[10px] font-mono text-[var(--muted)] bg-[var(--background)] border border-[var(--card-border)] px-1.5 py-0.5 rounded tabular-nums">
                {entry.ticker}
              </span>
            )}
            <span className="text-xs text-[var(--muted)] tabular-nums">{entry.founded}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
