import type { Category, LogoEntry } from '@/types/logo';
import { logos as staticLogos } from '@/data/logos';

export const R2_BASE = 'https://pub-d229fba914d542a8a972e89662bc916c.r2.dev';

// ─── Schema detection ────────────────────────────────────────────────────────
// Discovers the actual table + column names in D1 so we work with any schema,
// not just the one documented in src/db/schema.sql.

interface SchemaMap {
  table: string;
  ticker: string;
  nameKo: string;
  nameEn: string | null;
  category: string | null;
  brandColor: string | null;
  initial: string | null;
  initialColor: string | null;
  imageExt: string | null;
  founded: string | null;
}

// Cached per Worker isolate (reset on cold start)
let _schema: SchemaMap | null | 'pending' = 'pending';

function findCol(cols: string[], ...candidates: string[]): string | null {
  const lower = cols.map(c => c.toLowerCase());
  for (const c of candidates) {
    const idx = lower.indexOf(c.toLowerCase());
    if (idx >= 0) return cols[idx];
  }
  return null;
}

async function detectSchema(db: D1Database): Promise<SchemaMap> {
  if (_schema !== 'pending') {
    if (!_schema) throw new Error('D1: no suitable table found');
    return _schema;
  }

  // List user-created tables (skip SQLite/CF internals)
  const { results: tables } = await db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table'" +
      " AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'd1_%'"
    )
    .all<{ name: string }>();

  if (!tables.length) {
    _schema = null;
    throw new Error('D1: database is empty (no tables)');
  }

  const PREFERRED = ['logos', 'logo', 'companies', 'stocks', 'corp', 'company'];
  const tableName =
    tables.find(t => PREFERRED.includes(t.name.toLowerCase()))?.name ??
    tables[0].name;

  const { results: cols } = await db
    .prepare(`PRAGMA table_info("${tableName}")`)
    .all<{ name: string }>();

  const colNames = cols.map(c => c.name);

  _schema = {
    table: tableName,
    ticker:
      findCol(colNames, 'ticker', 'stock_code', 'code', 'symbol', '종목코드', 'id') ??
      colNames[0],
    nameKo:
      findCol(colNames, 'name_ko', 'company_name', 'name', 'corp_name', '종목명', '회사명', 'title') ??
      colNames[1] ?? colNames[0],
    nameEn: findCol(colNames, 'name_en', 'english_name', 'corp_name_eng', 'name_english'),
    category: findCol(colNames, 'category', 'sector', 'industry', '업종', '섹터'),
    brandColor: findCol(colNames, 'brand_color', 'color', 'primary_color', 'brand_colour', 'hex_color'),
    initial: findCol(colNames, 'initial', 'abbreviation', 'short_name'),
    initialColor: findCol(colNames, 'initial_color', 'text_color', 'foreground_color'),
    imageExt: findCol(colNames, 'image_ext', 'ext', 'extension', 'img_ext', 'logo_ext', 'file_ext'),
    founded: findCol(colNames, 'founded', 'established', 'year', 'listing_year', 'founded_year', 'ipo_year'),
  };

  return _schema;
}

// ─── Helpers for missing fields ───────────────────────────────────────────────

function tickerToColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  const hue = (((h >>> 0) * 137) % 360);
  return `hsl(${hue}, 58%, 38%)`;
}

function nameToInitial(nameKo: string, nameEn?: string | null): string {
  if (nameEn?.trim()) {
    const words = nameEn.trim().split(/\s+/);
    return words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : words[0].slice(0, 2).toUpperCase();
  }
  return nameKo.trim().slice(0, 1);
}

// ─── Row → LogoEntry ─────────────────────────────────────────────────────────

function rowToEntry(row: Record<string, unknown>, map: SchemaMap): LogoEntry {
  const ticker = String(row[map.ticker] ?? '').trim();
  const nameKo = String(row[map.nameKo] ?? '').trim();
  const nameEn = map.nameEn ? String(row[map.nameEn] ?? '').trim() : '';
  const category = map.category ? String(row[map.category] ?? '') : '';
  const brandColor = map.brandColor ? String(row[map.brandColor] ?? '').trim() : '';
  const initial = map.initial ? String(row[map.initial] ?? '').trim() : '';
  const initialColor = map.initialColor ? (row[map.initialColor] as string | null) : null;
  const imageExt = map.imageExt ? (row[map.imageExt] as string | null) : null;
  const founded = map.founded ? Number(row[map.founded] ?? 0) : 0;

  return {
    id: ticker || nameKo,
    nameKo: nameKo || ticker,
    nameEn: nameEn || nameKo || ticker,
    category: (category || '기타') as Category,
    brandColor: brandColor || tickerToColor(ticker || nameKo),
    initial: initial || nameToInitial(nameKo, nameEn),
    initialColor: initialColor ?? undefined,
    founded: founded || 0,
    ticker: ticker || undefined,
    imageUrl: imageExt && ticker ? `${R2_BASE}/logos/${ticker}.${imageExt}` : undefined,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

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
  const map = await detectSchema(db);
  const { q = '', category = '', sort = 'default', page = 1, limit = 48 } = opts;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const baseParams: (string | number)[] = [];

  if (q) {
    const like = `%${q}%`;
    const parts = [`"${map.ticker}" LIKE ?`, `"${map.nameKo}" LIKE ?`];
    baseParams.push(like, like);
    if (map.nameEn) {
      parts.push(`"${map.nameEn}" LIKE ?`);
      baseParams.push(like);
    }
    conditions.push(`(${parts.join(' OR ')})`);
  }

  if (category && category !== '전체' && map.category) {
    conditions.push(`"${map.category}" = ?`);
    baseParams.push(category);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy =
    sort === 'founded' && map.founded
      ? `ORDER BY "${map.founded}" ASC`
      : `ORDER BY "${map.nameKo}" ASC`;

  const [countRes, dataRes] = await Promise.all([
    db
      .prepare(`SELECT COUNT(*) as total FROM "${map.table}" ${where}`)
      .bind(...baseParams)
      .all<{ total: number }>(),
    db
      .prepare(`SELECT * FROM "${map.table}" ${where} ${orderBy} LIMIT ? OFFSET ?`)
      .bind(...baseParams, limit, offset)
      .all<Record<string, unknown>>(),
  ]);

  const total = countRes.results[0]?.total ?? 0;
  const logos = dataRes.results.map(row => rowToEntry(row, map));
  return { logos, total, hasMore: offset + logos.length < total };
}

export async function queryLogoByTicker(
  db: D1Database,
  ticker: string
): Promise<LogoEntry | null> {
  const map = await detectSchema(db);
  const { results } = await db
    .prepare(`SELECT * FROM "${map.table}" WHERE "${map.ticker}" = ? LIMIT 1`)
    .bind(ticker)
    .all<Record<string, unknown>>();
  if (!results.length) return null;
  return rowToEntry(results[0], map);
}

// Client-side filter for static fallback (local dev without D1)
export function filterStatic(
  logos: LogoEntry[],
  q: string,
  category: string,
  sort: string
): LogoEntry[] {
  const ql = q.toLowerCase();
  let result = logos.filter(l => {
    const mQ =
      !q ||
      l.nameKo.toLowerCase().includes(ql) ||
      l.nameEn.toLowerCase().includes(ql) ||
      (l.ticker?.toLowerCase().includes(ql) ?? false);
    const mC = !category || category === '전체' || l.category === category;
    return mQ && mC;
  });
  if (sort === 'founded') result = [...result].sort((a, b) => a.founded - b.founded);
  else result = [...result].sort((a, b) => a.nameKo.localeCompare(b.nameKo, 'ko'));
  return result;
}

export { staticLogos };
