import type { RefObject } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export default function SearchBar({ value, onChange, inputRef }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        placeholder="기업명으로 검색..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 pl-10 pr-20 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] placeholder:text-[var(--muted)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {value ? (
          <button
            onClick={() => onChange('')}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--muted)]/30 hover:bg-[var(--muted)]/50 transition-colors"
            aria-label="검색어 지우기"
          >
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="text-[var(--foreground)]"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-[var(--muted)] bg-[var(--background)] border border-[var(--card-border)] rounded px-1.5 py-0.5 font-mono select-none pointer-events-none">
            <span className="text-xs leading-none">⌘</span>K
          </kbd>
        )}
      </div>
    </div>
  );
}
