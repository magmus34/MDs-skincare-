import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET() {
  try {
    const settings = await db.getSettings();
    return NextResponse.json(
      { success: true, settings },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.banner?.imageUrl) {
      const { persistImageIfDataUrl } = await import('@/lib/imageStorage');
      body.banner.imageUrl = persistImageIfDataUrl(body.banner.imageUrl);
    }
    const updated = await db.updateSettings(body);
    return NextResponse.json(
      { success: true, settings: updated },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
