import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const product = db.getProductById(id) || db.getProductBySlug(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, product },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    if (body.name !== undefined && !String(body.name).trim()) {
      return NextResponse.json(
        { success: false, error: 'Product name cannot be empty' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    if (body.price !== undefined) {
      const num = Number(body.price);
      if (isNaN(num) || num <= 0) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid product price in Naira (₦)' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }
      body.price = num;
    }

    if (body.imageUrl) {
      const { persistImageIfDataUrl } = await import('@/lib/imageStorage');
      body.imageUrl = persistImageIfDataUrl(body.imageUrl);
    }

    const updated = db.updateProduct(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Product not found for update' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, product: updated },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = db.deleteProduct(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Product not found for deletion' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Product deleted permanently' },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
