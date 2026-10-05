import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Product } from '@/lib/types';
import { persistImageIfDataUrl } from '@/lib/imageStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const popular = searchParams.get('popular');
    const newArrival = searchParams.get('new');

    let products = db.getProducts();

    if (category && category !== 'all') {
      products = products.filter(
        (p) =>
          p.categorySlug === category ||
          p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.skinType && p.skinType.toLowerCase().includes(q))
      );
    }

    if (featured === 'true') {
      products = products.filter((p) => p.featured);
    }

    if (popular === 'true') {
      products = products.filter((p) => p.isPopular);
    }

    if (newArrival === 'true') {
      products = products.filter((p) => p.isNewArrival);
    }

    return NextResponse.json(
      { success: true, products },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Failed to get products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve products' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      price,
      originalPrice,
      description,
      category,
      categorySlug,
      stockQuantity,
      imageUrl,
      badge,
      skinType,
      benefits,
      volume,
      howToUse,
      ingredients,
      featured,
      isPopular,
      isNewArrival,
    } = body;

    const numPrice = Number(price);

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product name is required',
        },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a valid product price in Naira (₦)',
        },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const finalCategory = category && String(category).trim() ? String(category).trim() : 'Sunscreens';
    const finalDescription = description && String(description).trim()
      ? String(description).trim()
      : 'Premium clinical-grade skincare formulation for healthy, clear, and glowing skin.';

    const id = 'prod-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const parsedStock =
      stockQuantity !== undefined && !isNaN(Number(stockQuantity))
        ? Math.max(0, Number(stockQuantity))
        : 25;

    const newProduct: Product = {
      id,
      name: name.trim(),
      slug: `${slug}-${id.slice(-4)}`,
      price: Math.max(0, numPrice),
      originalPrice:
        originalPrice !== undefined && !isNaN(Number(originalPrice)) && Number(originalPrice) > 0
          ? Math.max(0, Number(originalPrice))
          : undefined,
      description: finalDescription,
      category: finalCategory,
      categorySlug:
        categorySlug || finalCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      stockQuantity: parsedStock,
      inStock: parsedStock > 0,
      imageUrl: persistImageIfDataUrl(imageUrl ? String(imageUrl).trim() : ''),
      badge: badge && String(badge).trim() ? String(badge).trim() : undefined,
      skinType: skinType && String(skinType).trim() ? String(skinType).trim() : 'All Skin Types',
      benefits: Array.isArray(benefits) ? benefits : benefits ? [benefits] : [],
      volume: volume && String(volume).trim() ? String(volume).trim() : 'Standard',
      howToUse: howToUse && String(howToUse).trim() ? String(howToUse).trim() : undefined,
      ingredients: ingredients && String(ingredients).trim() ? String(ingredients).trim() : undefined,
      featured: Boolean(featured),
      isPopular: Boolean(isPopular),
      isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
      createdAt: new Date().toISOString(),
    };

    const saved = db.saveProduct(newProduct);

    return NextResponse.json(
      {
        success: true,
        product: saved,
        message: 'Product added successfully.',
      },
      { status: 201, headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create product' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
