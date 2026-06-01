import type { Category, LogoEntry } from '@/types/logo';
import { logos as staticLogos } from '@/data/logos';

const R2_BASE_URL = 'https://pub-d229fba914d542a8a972e89662bc916c.r2.dev';

interface D1LogoRow {
  ticker: string;
  name_ko: string;
  name_en: string;
  category: string;
  brand_color: string;
  initial: string;
  initial_color: string | null;
  image_ext: string | null;
  founded: number;
}

function rowToEntry(row: D1LogoRow): LogoEntry {
  return {
    id: row.ticker,
    nameKo: row.name_ko,
    nameEn: row.name_en,
    category: row.category as Category,
    brandColor: row.brand_color,
    initial: row.initial,
    initialColor: row.initial_color ?? undefined,
    founded: row.founded,
    ticker: row.ticker,
    imageUrl: row.image_ext
      ? `${R2_BASE_URL}/logos/${row.ticker}.${row.image_ext}`
      : undefined,
  };
}

export async function fetchLogos(db: D1Database): Promise<LogoEntry[]> {
  const { results } = await db
    .prepare('SELECT * FROM logos ORDER BY founded ASC')
    .all<D1LogoRow>();
  return results.map(rowToEntry);
}

export { staticLogos };
