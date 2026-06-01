import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

const EXTS = ['svg', 'png', 'jpg', 'jpeg', 'webp'] as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;

  if (!/^[A-Za-z0-9_-]+$/.test(ticker)) {
    return new NextResponse('Invalid ticker', { status: 400 });
  }

  try {
    const { env } = await getCloudflareContext({ async: true });

    for (const ext of EXTS) {
      const object = await env.LOGOS_BUCKET.get(`logos/${ticker}.${ext}`);
      if (object) {
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('Content-Disposition', `attachment; filename="${ticker}.${ext}"`);
        headers.set('Cache-Control', 'public, max-age=86400');
        return new NextResponse(object.body as ReadableStream, { headers });
      }
    }

    return new NextResponse('Not found', { status: 404 });
  } catch {
    return new NextResponse('Internal error', { status: 500 });
  }
}
