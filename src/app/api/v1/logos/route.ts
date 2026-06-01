import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { queryLogos, filterStatic, staticLogos } from '@/lib/logos';

const DEFAULT_LIMIT = 48;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get('q')?.trim() ?? '';
  const category = searchParams.get('category') ?? '';
  const sort = searchParams.get('sort') ?? 'default';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10)));

  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!env.DB) throw new Error('DB not available');

    const result = await queryLogos(env.DB, { q, category, sort, page, limit });

    return NextResponse.json(
      { data: result.logos, meta: { total: result.total, page, limit, hasMore: result.hasMore } },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    );
  } catch {
    // fallback to static data (local dev)
    const filtered = filterStatic(staticLogos, q, category, sort);
    const offset = (page - 1) * limit;
    const slice = filtered.slice(offset, offset + limit);
    return NextResponse.json({
      data: slice,
      meta: { total: filtered.length, page, limit, hasMore: offset + slice.length < filtered.length },
    });
  }
}
