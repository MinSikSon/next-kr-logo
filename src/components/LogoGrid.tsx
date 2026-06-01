'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { Category, LogoEntry } from '@/types/logo';
import { CATEGORIES } from '@/types/logo';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import LogoCard from './LogoCard';

type SortOption = 'default' | 'nameAsc' | 'founded';

interface LogoGridProps {
  logos: LogoEntry[];
}

export default function LogoGrid({ logos }: LogoGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | '전체'>('전체');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchFilteredLogos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return logos;
    return logos.filter(
      (logo) =>
        logo.nameKo.toLowerCase().includes(q) ||
        logo.nameEn.toLowerCase().includes(q) ||
        (logo.ticker?.toLowerCase().includes(q) ?? false)
    );
  }, [logos, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { '전체': searchFilteredLogos.length };
    for (const logo of searchFilteredLogos) {
      counts[logo.category] = (counts[logo.category] ?? 0) + 1;
    }
    return counts;
  }, [searchFilteredLogos]);

  const filteredLogos = useMemo(() => {
    if (selectedCategory === '전체') return searchFilteredLogos;
    return searchFilteredLogos.filter((logo) => logo.category === selectedCategory);
  }, [searchFilteredLogos, selectedCategory]);

  const displayLogos = useMemo(() => {
    switch (sortOption) {
      case 'nameAsc':
        return [...filteredLogos].sort((a, b) => a.nameKo.localeCompare(b.nameKo, 'ko'));
      case 'founded':
        return [...filteredLogos].sort((a, b) => a.founded - b.founded);
      default:
        return filteredLogos;
    }
  }, [filteredLogos, sortOption]);

  const isFiltered = !!searchQuery.trim() || selectedCategory !== '전체';

  return (
    <div>
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-20 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--card-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                inputRef={searchInputRef}
              />
            </div>
            {/* Sort — desktop only */}
            <div className="hidden sm:block relative shrink-0">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="h-10 pl-3 pr-8 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                aria-label="정렬 기준"
              >
                <option value="default">기본순</option>
                <option value="nameAsc">이름순</option>
                <option value="founded">설립연도순</option>
              </select>
              <svg
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
          <CategoryFilter
            categories={CATEGORIES}
            selected={selectedCategory}
            onChange={setSelectedCategory}
            counts={categoryCounts}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-16">
        {/* Active filter summary */}
        {isFiltered && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[var(--muted)]">
              <span className="font-semibold text-[var(--foreground)]">
                {displayLogos.length}
              </span>
              개 결과
              {selectedCategory !== '전체' && (
                <>
                  {' '}·{' '}
                  <span className="font-medium text-[var(--foreground)]">
                    {selectedCategory}
                  </span>
                </>
              )}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('전체');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
            >
              필터 초기화
            </button>
          </div>
        )}

        {/* Empty state */}
        {displayLogos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[var(--muted)]">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-4 opacity-40"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-base font-semibold">검색 결과가 없습니다</p>
            <p className="text-sm mt-1 opacity-70">다른 검색어를 입력해 보세요</p>
            {isFiltered && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('전체');
                }}
                className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
              >
                전체 보기
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {displayLogos.map((logo, index) => (
                <LogoCard key={logo.id} entry={logo} index={index} />
              ))}
            </div>
            <p className="text-center text-xs text-[var(--muted)] opacity-50 mt-10">
              {displayLogos.length}개 기업 표시 중
            </p>
          </>
        )}
      </div>
    </div>
  );
}
