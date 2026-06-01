export type Category =
  | '전자'
  | '자동차'
  | 'IT/테크'
  | '유통/식품'
  | '금융'
  | '에너지/화학'
  | '건설/중공업'
  | '통신';

export interface LogoEntry {
  id: string;
  nameKo: string;
  nameEn: string;
  category: Category | string;  // D1 may use different category values
  brandColor: string;
  initial: string;
  initialColor?: string;
  founded: number;
  ticker?: string;
  imageUrl?: string;
}

export function getCategoryColor(category: string): string {
  return (
    CATEGORY_COLORS[category as Category] ??
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  );
}

export const CATEGORIES: Category[] = [
  '전자',
  '자동차',
  'IT/테크',
  '유통/식품',
  '금융',
  '에너지/화학',
  '건설/중공업',
  '통신',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  '전자': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  '자동차': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  'IT/테크': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  '유통/식품': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  '금융': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  '에너지/화학': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  '건설/중공업': 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-200',
  '통신': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};
