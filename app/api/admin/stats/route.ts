import { NextResponse } from 'next/server';
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
    const orders = db.getOrders();
    const settings = db.getSettings();
    const resetAt = settings.salesSummaryResetAt;

    let relevantOrders = orders;
    if (resetAt) {
      const resetTime = new Date(resetAt).getTime();
      relevantOrders = orders.filter(
        (o) => new Date(o.createdAt).getTime() >= resetTime
      );
    }

    let confirmedRevenue = 0;
    let pendingRevenue = 0;
    const itemSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    relevantOrders.forEach((o) => {
      const isConfirmed = o.status === 'Payment Confirmed' || o.status === 'Delivered';
      const isPending = o.status === 'Pending Payment';

      if (isConfirmed) {
        confirmedRevenue += o.totalAmount || 0;
        if (o.items && Array.isArray(o.items)) {
          o.items.forEach((item) => {
            const existing = itemSalesMap.get(item.name) || {
              name: item.name,
              quantity: 0,
              revenue: 0,
            };
            existing.quantity += item.quantity || 1;
            existing.revenue += item.subtotal || item.price * (item.quantity || 1);
            itemSalesMap.set(item.name, existing);
          });
        }
      } else if (isPending) {
        pendingRevenue += o.totalAmount || 0;
      }
    });

    const bestSellers = Array.from(itemSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json(
      {
        success: true,
        stats: {
          confirmedRevenue,
          pendingRevenue,
          totalOrders: relevantOrders.length,
          totalHistoricalOrders: orders.length,
          salesSummaryResetAt: resetAt,
          bestSellers,
        },
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST() {
  try {
    const { resetAt } = db.resetSalesSummary();
    return NextResponse.json(
      {
        success: true,
        message: 'Sales summary figures reset successfully.',
        resetAt,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function DELETE() {
  try {
    db.restoreSalesSummary();
    return NextResponse.json(
      {
        success: true,
        message: 'Full lifetime sales history restored.',
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
