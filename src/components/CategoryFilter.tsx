import type { Category } from '@/types/logo';

interface CategoryFilterProps {
  categories: Category[];
  selected: Category | '전체';
  onChange: (category: Category | '전체') => void;
}

export default function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  const all: Array<Category | '전체'> = ['전체', ...categories];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {all.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === cat
              ? 'bg-blue-600 text-white'
              : 'bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:bg-blue-50 dark:hover:bg-blue-950'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
