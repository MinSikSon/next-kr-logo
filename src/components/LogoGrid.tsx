'use client';

import { useState, useMemo } from 'react';
import type { Category, LogoEntry } from '@/types/logo';
import { CATEGORIES } from '@/types/logo';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import LogoCard from './LogoCard';

interface LogoGridProps {
  logos: LogoEntry[];
}

export default function LogoGrid({ logos }: LogoGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | '전체'>('전체');

  const filteredLogos = useMemo(() => {
    return logos.filter((logo) => {
      const matchesCategory =
        selectedCategory === '전체' || logo.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        logo.nameKo.toLowerCase().includes(q) ||
        logo.nameEn.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [logos, searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <div className="flex-1 min-w-0">
          <CategoryFilter
            categories={CATEGORIES}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>
      </div>

      {filteredLogos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-4"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <p className="text-base font-medium">검색 결과가 없습니다</p>
          <p className="text-sm mt-1">다른 검색어를 입력해 보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLogos.map((logo) => (
            <LogoCard key={logo.id} entry={logo} />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
        총 {filteredLogos.length}개 기업
      </p>
    </div>
  );
}
