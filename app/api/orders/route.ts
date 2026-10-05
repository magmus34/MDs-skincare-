import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Order, OrderStatus } from '@/lib/types';
import { getOrderWhatsAppUrl } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET() {
  try {
    const orders = await db.getOrders();
    return NextResponse.json(
      { success: true, orders },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items } = body;

    if (!customer || !customer.name || !customer.whatsappNumber) {
      return NextResponse.json(
        { success: false, error: 'Customer name and WhatsApp number are required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const settings = await db.getSettings();
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `MD-${yearMonth}-${randomSuffix}`;

    const computedItems = items.map((item: any) => ({
      productId: item.productId,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity) || 1,
      imageUrl: item.imageUrl || '',
      volume: item.volume || '',
      subtotal: Number(item.price) * (Number(item.quantity) || 1),
    }));

    const subtotal = computedItems.reduce((s: number, i: any) => s + i.subtotal, 0);
    const totalAmount = subtotal;

    const newOrder: Order = {
      id: orderId,
      customer: {
        name: customer.name.trim(),
        location: customer.location?.trim() || 'Nigeria',
        whatsappNumber: customer.whatsappNumber.trim(),
        email: customer.email?.trim() || '',
        address: customer.address?.trim() || customer.location?.trim() || '',
        deliveryNotes: customer.deliveryNotes?.trim() || '',
      },
      items: computedItems,
      subtotal,
      totalAmount,
      status: 'Pending Payment',
      paymentMethod: 'Bank Transfer',
      bankDetails: settings.bankDetails || {
        bankName: 'OPay Digital Services',
        accountName: 'Emmanuel Owolabi',
        accountNumber: '9070938624',
        instructions: 'Kindly use your Order Reference as payment narration.',
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const savedOrder = await db.createOrder(newOrder);

    const whatsAppUrl = getOrderWhatsAppUrl(
      savedOrder,
      settings.ownerWhatsApp || '+2349070938624',
      settings.brandName || 'MD Skincare Haven'
    );

    return NextResponse.json(
      {
        success: true,
        order: savedOrder,
        whatsAppUrl,
        message: 'Order created successfully and saved in database.',
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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, paymentProof, adminNotes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const updated = await db.updateOrderStatus(id, status as OrderStatus, paymentProof, adminNotes);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, order: updated },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const reset = searchParams.get('reset');
    const status = searchParams.get('status');

    if (reset === 'true') {
      const result = await db.resetOrders(status || undefined);
      return NextResponse.json(
        {
          success: true,
          message: `Orders reset completed. Deleted ${result.deletedCount} orders.`,
          ...result,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const deleted = await db.deleteOrder(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Order not found for deletion' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Order deleted successfully' },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
