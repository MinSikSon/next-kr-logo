import type { LogoEntry } from '@/types/logo';
import { CATEGORY_COLORS } from '@/types/logo';
import LogoMark from './LogoMark';

export default function LogoCard({ entry }: { entry: LogoEntry }) {
  return (
    <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      <LogoMark entry={entry} />
      <div className="text-center">
        <p className="font-semibold text-[var(--foreground)] text-sm leading-tight">{entry.nameKo}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{entry.nameEn}</p>
      </div>
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[entry.category]}`}>
        {entry.category}
      </span>
    </div>
  );
}
