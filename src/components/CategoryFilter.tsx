import type { Category } from '@/types/logo';

interface CategoryFilterProps {
  categories: Category[];
  selected: Category | '전체';
  onChange: (category: Category | '전체') => void;
  counts?: Record<string, number>;
}

export default function CategoryFilter({
  categories,
  selected,
  onChange,
  counts = {},
}: CategoryFilterProps) {
  const all: Array<Category | '전체'> = ['전체', ...categories];

  return (
    <div className="relative">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
        {all.map((cat) => {
          const count = counts[cat];
          const isActive = selected === cat;
          return (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className={`shrink-0 flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:border-blue-400 dark:hover:border-blue-600'
              }`}
            >
              {cat}
              {count !== undefined && (
                <span
                  className={`text-[10px] font-semibold tabular-nums ${
                    isActive ? 'text-blue-200' : 'text-[var(--muted)]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div
        className="absolute right-0 top-0 bottom-0.5 w-8 pointer-events-none"
        style={{ background: 'linear-gradient(to left, var(--background), transparent)' }}
        aria-hidden="true"
      />
    </div>
  );
}
