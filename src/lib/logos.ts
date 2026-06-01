import type { Category, LogoEntry } from '@/types/logo';
import { logos as staticLogos } from '@/data/logos';

export const R2_BASE = 'https://pub-d229fba914d542a8a972e89662bc916c.r2.dev';

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
      ? `${R2_BASE}/logos/${row.ticker}.${row.image_ext}`
      : undefined,
  };
}

export interface LogosQuery {
  q?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface LogosResult {
  logos: LogoEntry[];
  total: number;
  hasMore: boolean;
}

export async function queryLogos(
  db: D1Database,
  opts: LogosQuery = {}
): Promise<LogosResult> {
  const { q = '', category = '', sort = 'default', page = 1, limit = 48 } = opts;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const baseParams: (string | number)[] = [];

  if (q) {
    conditions.push('(name_ko LIKE ? OR name_en LIKE ? OR ticker LIKE ?)');
    const like = `%${q}%`;
    baseParams.push(like, like, like);
  }
  if (category && category !== '전체') {
    conditions.push('category = ?');
    baseParams.push(category);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy =
    sort === 'nameAsc' ? 'ORDER BY name_ko ASC' :
    sort === 'founded' ? 'ORDER BY founded ASC' :
    'ORDER BY name_ko ASC';

  const [countRes, dataRes] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as total FROM logos ${where}`)
      .bind(...baseParams)
      .all<{ total: number }>(),
    db.prepare(`SELECT * FROM logos ${where} ${orderBy} LIMIT ? OFFSET ?`)
      .bind(...baseParams, limit, offset)
      .all<D1LogoRow>(),
  ]);

  const total = countRes.results[0]?.total ?? 0;
  const logos = dataRes.results.map(rowToEntry);
  return { logos, total, hasMore: offset + logos.length < total };
}

// Client-side filter for static fallback
export function filterStatic(
  logos: LogoEntry[],
  q: string,
  category: string,
  sort: string
): LogoEntry[] {
  const q_lower = q.toLowerCase();
  let result = logos.filter((l) => {
    const matchQ =
      !q ||
      l.nameKo.toLowerCase().includes(q_lower) ||
      l.nameEn.toLowerCase().includes(q_lower) ||
      (l.ticker?.toLowerCase().includes(q_lower) ?? false);
    const matchCat = !category || category === '전체' || l.category === category;
    return matchQ && matchCat;
  });
  if (sort === 'founded') result = [...result].sort((a, b) => a.founded - b.founded);
  else result = [...result].sort((a, b) => a.nameKo.localeCompare(b.nameKo, 'ko'));
  return result;
}

export { staticLogos };
