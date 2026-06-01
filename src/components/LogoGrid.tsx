'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Category, LogoEntry } from '@/types/logo';

interface ApiResponse {
  data: LogoEntry[];
  meta: { total: number; page: number; limit: number; hasMore: boolean };
}
import { CATEGORIES } from '@/types/logo';
import { useDebounce } from '@/hooks/useDebounce';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import LogoCard from './LogoCard';
import LogoDetailModal from './LogoDetailModal';

type SortOption = 'default' | 'nameAsc' | 'founded';

interface LogoGridProps {
  logos: LogoEntry[];
  total: number;
  hasMore: boolean;
}

const PAGE_LIMIT = 48;

export default function LogoGrid({ logos: initialLogos, total: initialTotal, hasMore: initialHasMore }: LogoGridProps) {
  const [logos, setLogos] = useState<LogoEntry[]>(initialLogos);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | '전체'>('전체');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [selectedEntry, setSelectedEntry] = useState<LogoEntry | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);
  const debouncedQuery = useDebounce(searchQuery, 300);

  // ⌘K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const buildParams = useCallback(
    (targetPage: number) => {
      const p = new URLSearchParams({ page: String(targetPage), limit: String(PAGE_LIMIT) });
      if (debouncedQuery) p.set('q', debouncedQuery);
      if (selectedCategory !== '전체') p.set('category', selectedCategory);
      if (sortOption !== 'default') p.set('sort', sortOption);
      return p;
    },
    [debouncedQuery, selectedCategory, sortOption]
  );

  // Fetch when filters change (skip initial mount — use SSR data)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setIsLoading(true);
    setPage(1);

    fetch(`/api/v1/logos?${buildParams(1)}`)
      .then((r) => r.json() as Promise<ApiResponse>)
      .then((data) => {
        setLogos(data.data);
        setTotal(data.meta.total);
        setHasMore(data.meta.hasMore);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [debouncedQuery, selectedCategory, sortOption, buildParams]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/v1/logos?${buildParams(nextPage)}`);
      const data = await res.json() as ApiResponse;
      setLogos((prev) => [...prev, ...data.data]);
      setPage(nextPage);
      setHasMore(data.meta.hasMore);
    } catch {
      // ignore
    } finally {
      setIsLoadingMore(false);
    }
  };

  const isFiltered = !!searchQuery.trim() || selectedCategory !== '전체';

  return (
    <>
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-20 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--card-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} inputRef={searchInputRef} />
            </div>
            <div className="hidden sm:block relative shrink-0">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="h-10 pl-3 pr-8 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                aria-label="정렬 기준"
              >
                <option value="default">이름순</option>
                <option value="nameAsc">이름순 (가나다)</option>
                <option value="founded">설립연도순</option>
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
          <CategoryFilter categories={CATEGORIES} selected={selectedCategory} onChange={setSelectedCategory} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-16">
        {/* Summary */}
        <div className="flex items-center justify-between mb-4 min-h-[24px]">
          <p className="text-sm text-[var(--muted)]">
            <span className="font-semibold text-[var(--foreground)]">{total.toLocaleString()}</span>개 기업
            {selectedCategory !== '전체' && (
              <> · <span className="font-medium text-[var(--foreground)]">{selectedCategory}</span></>
            )}
          </p>
          {isFiltered && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('전체'); }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
            >
              필터 초기화
            </button>
          )}
        </div>

        {/* Loading overlay */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] animate-pulse" />
            ))}
          </div>
        ) : logos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[var(--muted)]">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-40" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-base font-semibold">검색 결과가 없습니다</p>
            <p className="text-sm mt-1 opacity-70">다른 검색어를 입력해 보세요</p>
            {isFiltered && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('전체'); }}
                className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
              >
                전체 보기
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {logos.map((logo, index) => (
                <LogoCard
                  key={`${logo.id}-${index}`}
                  entry={logo}
                  index={index}
                  onClick={() => setSelectedEntry(logo)}
                />
              ))}
            </div>

            {/* Load more */}
            <div className="flex flex-col items-center mt-10 gap-3">
              <p className="text-xs text-[var(--muted)] opacity-60">
                {logos.length.toLocaleString()} / {total.toLocaleString()}개 표시 중
              </p>
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-2.5 rounded-xl border border-[var(--card-border)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card-bg)] disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                      </svg>
                      불러오는 중...
                    </>
                  ) : (
                    '더 보기'
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Detail modal */}
      {selectedEntry && (
        <LogoDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </>
  );
}
