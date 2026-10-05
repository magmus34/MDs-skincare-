import fs from 'fs';
import path from 'path';
import { Product, Category, Order, StoreSettings, OFFICIAL_CATEGORIES } from './types';

function getKnownDbPaths(): string[] {
  return Array.from(
    new Set([
      '/app/applet/data/store.json',
      path.join(process.cwd(), 'data', 'store.json'),
      '/data/store.json',
      '/tmp/md_store.json',
    ])
  );
}

function getPrimaryDbPath(): string {
  if (fs.existsSync('/app/applet/data/store.json')) {
    return '/app/applet/data/store.json';
  }
  return path.join(process.cwd(), 'data', 'store.json');
}

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  settings: StoreSettings;
  adminPasswordHash: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  brandName: 'MD SKINCARE HAVEN',
  ownerWhatsApp: '+2349070938624',
  bankDetails: {
    bankName: 'OPay Digital Services',
    accountName: 'Emmanuel Owolabi',
    accountNumber: '9070938624',
    instructions: 'Kindly use your Order Reference (e.g. MD-...) as the transaction narration or remark for fast automatic matching.',
  },
  banner: {
    brandName: 'MD SKINCARE HAVEN',
    announcementText: '🌿 Pure & Natural Botanical Skincare • Direct Bank Transfer Payment',
    heading: 'Healthy, Radiant Melanin Glow',
    subheading: 'Premium clinical-grade skincare products formulated for healthy, clear, and glowing skin.',
    imageUrl: '/images/banner.jpg',
  },
};

const DEFAULT_CATEGORIES: Category[] = OFFICIAL_CATEGORIES;

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-vit-c',
    name: 'Advanced 15% Vitamin C Glow Serum',
    slug: 'advanced-15-vitamin-c-glow-serum',
    price: 14500,
    originalPrice: 18000,
    description: 'Potent brightening drops with ethyl-ascorbic acid and alpha-arbutin. Fades stubborn dark spots and gives an undeniable glow.',
    category: 'Serums & Eye Care',
    categorySlug: 'serums-eye-care',
    stockQuantity: 30,
    inStock: true,
    featured: true,
    isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    badge: 'BESTSELLER',
    volume: '30ml Dropper',
    skinType: 'All Skin Types',
    createdAt: '2026-09-10T10:00:00.000Z',
  },
  {
    id: 'prod-niacinamide',
    name: '10% Niacinamide + 2% Zinc Blemish Solution',
    slug: '10-niacinamide-2-zinc-blemish-solution',
    price: 12500,
    originalPrice: 15000,
    description: 'High-strength vitamin serum to clarify enlarged pores, regulate oil, and soothe active breakouts.',
    category: 'Serums & Eye Care',
    categorySlug: 'serums-eye-care',
    stockQuantity: 40,
    inStock: true,
    featured: true,
    isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    badge: 'ACNE CLEAR',
    volume: '30ml',
    skinType: 'Oily & Acne-Prone',
    createdAt: '2026-09-12T12:00:00.000Z',
  },
  {
    id: 'prod-sunscreen-spf50',
    name: 'Invisible Melanin Shield SPF 50+',
    slug: 'invisible-melanin-shield-spf-50',
    price: 16000,
    originalPrice: 19500,
    description: 'Lightweight broad-spectrum daily sunscreen that leaves zero white cast or greasy finish on brown and black skin.',
    category: 'Sunscreens',
    categorySlug: 'sunscreens',
    stockQuantity: 35,
    inStock: true,
    featured: true,
    isPopular: true,
    isNewArrival: true,
    imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    badge: 'ZERO WHITE CAST',
    volume: '50ml',
    skinType: 'All Melanin Skin',
    createdAt: '2026-09-15T14:30:00.000Z',
  },
  {
    id: 'prod-barrier-cream',
    name: 'Ceramide Barrier Recovery Cloud Cream',
    slug: 'ceramide-barrier-recovery-cloud-cream',
    price: 15500,
    originalPrice: 18500,
    description: 'Deep hydration restoration cream packed with 3 essential skin ceramides and squalane to heal the skin barrier.',
    category: 'Face Moisturisers',
    categorySlug: 'face-moisturisers',
    stockQuantity: 25,
    inStock: true,
    featured: true,
    isPopular: false,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    badge: 'HYDRATION',
    volume: '50g',
    skinType: 'Dry & Sensitive',
    createdAt: '2026-09-18T16:00:00.000Z',
  },
  {
    id: 'prod-botanical-cleanser',
    name: 'Purifying Botanical Gel Cleanser (pH 5.5)',
    slug: 'purifying-botanical-gel-cleanser',
    price: 11000,
    originalPrice: 13500,
    description: 'Gentle, refreshing foaming cleanser with chamomile and green tea that cleanses deeply without tight, dry feelings.',
    category: 'Cleansers & Face Washes',
    categorySlug: 'cleansers-face-washes',
    stockQuantity: 45,
    inStock: true,
    featured: false,
    isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80',
    badge: 'GENTLE',
    volume: '150ml',
    skinType: 'All Skin Types',
    createdAt: '2026-09-20T09:00:00.000Z',
  },
  {
    id: 'prod-shea-body-butter',
    name: 'Whipped Shea & Turmeric Body Glow Soufflé',
    slug: 'whipped-shea-turmeric-body-glow-souffle',
    price: 13000,
    originalPrice: 16000,
    description: 'Luxurious whipped raw Nigerian shea butter with golden turmeric extract to soften rough skin and boost body glow.',
    category: 'Body Care, Scrubs & Soaps',
    categorySlug: 'body-care-scrubs-soaps',
    stockQuantity: 30,
    inStock: true,
    featured: true,
    isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    badge: 'BODY GLOW',
    volume: '250g',
    skinType: 'All Body Skin',
    createdAt: '2026-09-22T08:00:00.000Z',
  },
  {
    id: 'prod-glass-skin-bundle',
    name: 'The Complete Glass Skin 4-Piece Daily Routine',
    slug: 'the-complete-glass-skin-4-piece-routine',
    price: 48000,
    originalPrice: 59000,
    description: 'Our most celebrated routine bundle! Includes our Purifying Gel Cleanser, Vitamin C Glow Serum, Melanin Shield SPF 50, and Cloud Cream.',
    category: 'Bundles & Sets',
    categorySlug: 'bundles-sets',
    stockQuantity: 15,
    inStock: true,
    featured: true,
    isPopular: true,
    isNewArrival: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    badge: 'SAVE ₦11,000 BUNDLE',
    volume: 'Complete 4-Piece Set',
    skinType: 'All Skin Types',
    createdAt: '2026-09-22T10:00:00.000Z',
  },
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'MD-202610-8421',
    customer: {
      name: 'Chioma Adebayo',
      location: 'Lekki Phase 1, Lagos',
      whatsappNumber: '08023456789',
    },
    items: [
      {
        productId: 'prod-vit-c',
        name: 'Advanced 15% Vitamin C Glow Serum',
        price: 14500,
        quantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
        subtotal: 29000,
      },
    ],
    subtotal: 29000,
    totalAmount: 29000,
    status: 'Payment Confirmed',
    paymentMethod: 'Bank Transfer',
    bankDetails: {
      bankName: 'Guaranty Trust Bank (GTBank)',
      accountName: 'MD SKINCARE HAVEN NIGERIA',
      accountNumber: '0812948210',
    },
    paymentProof: {
      bankReference: 'GTB-TRX-9821847120',
      senderName: 'Chioma Adebayo',
      paidAt: '2026-10-01T14:22:00.000Z',
    },
    createdAt: '2026-10-01T14:15:00.000Z',
    updatedAt: '2026-10-01T15:00:00.000Z',
    adminNotes: 'Payment verified in GTBank app.',
  },
  {
    id: 'MD-202610-9104',
    customer: {
      name: 'Dr. Amina Bello',
      location: 'Gwarinpa Estate, Abuja',
      whatsappNumber: '08139876543',
    },
    items: [
      {
        productId: 'prod-sunscreen-spf50',
        name: 'Invisible Melanin Shield SPF 50+',
        price: 16000,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
        subtotal: 16000,
      },
    ],
    subtotal: 16000,
    totalAmount: 16000,
    status: 'Pending Payment',
    paymentMethod: 'Bank Transfer',
    bankDetails: {
      bankName: 'Guaranty Trust Bank (GTBank)',
      accountName: 'MD SKINCARE HAVEN NIGERIA',
      accountNumber: '0812948210',
    },
    createdAt: '2026-10-02T08:10:00.000Z',
    updatedAt: '2026-10-02T08:10:00.000Z',
  },
];

let inMemoryDb: DatabaseSchema | null = null;
const TMP_FILE = path.join('/tmp', 'md_store.json');

function normalizeDatabase(parsed: any): DatabaseSchema {
  let needsWrite = false;

  const BROKEN_IMG = 'photo-1608248597359-2c0993cfa32e';
  const VALID_REPLACEMENT =
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80';

  if (parsed.products && Array.isArray(parsed.products)) {
    parsed.products.forEach((p: any) => {
      if (p.imageUrl && p.imageUrl.includes(BROKEN_IMG)) {
        p.imageUrl = VALID_REPLACEMENT;
        needsWrite = true;
      }
    });
  }

  if (parsed.orders && Array.isArray(parsed.orders)) {
    parsed.orders.forEach((o: any) => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          if (item.imageUrl && item.imageUrl.includes(BROKEN_IMG)) {
            item.imageUrl = VALID_REPLACEMENT;
            needsWrite = true;
          }
        });
      }
    });
  }

  // Normalize categories to the 6 official categories if needed
  if (
    !parsed.categories ||
    parsed.categories.length === 0 ||
    !parsed.categories.some((c: any) => c.slug === 'sunscreens')
  ) {
    parsed.categories = OFFICIAL_CATEGORIES;
    needsWrite = true;
  }

  // Clean up product sizes and map any legacy categories to official ones
  if (parsed.products && Array.isArray(parsed.products)) {
    parsed.products.forEach((p: any) => {
      if (p.sizes) {
        delete p.sizes;
        needsWrite = true;
      }
      if (p.category === 'Serums & Oils') {
        p.category = 'Serums & Eye Care';
        p.categorySlug = 'serums-eye-care';
        needsWrite = true;
      } else if (p.category === 'Sunscreen (Zero Cast)') {
        p.category = 'Sunscreens';
        p.categorySlug = 'sunscreens';
        needsWrite = true;
      } else if (p.category === 'Moisturizers & Creams') {
        p.category = 'Face Moisturisers';
        p.categorySlug = 'face-moisturisers';
        needsWrite = true;
      } else if (p.category === 'Cleansers & Toners') {
        p.category = 'Cleansers & Face Washes';
        p.categorySlug = 'cleansers-face-washes';
        needsWrite = true;
      } else if (p.category === 'Body Care') {
        p.category = 'Body Care, Scrubs & Soaps';
        p.categorySlug = 'body-care-scrubs-soaps';
        needsWrite = true;
      }
    });
  }

  if (!parsed.products || !Array.isArray(parsed.products)) {
    parsed.products = DEFAULT_PRODUCTS;
    needsWrite = true;
  }
  if (!parsed.orders) {
    parsed.orders = DEFAULT_ORDERS;
    needsWrite = true;
  }
  if (!parsed.settings) {
    parsed.settings = DEFAULT_SETTINGS;
    needsWrite = true;
  }

  const defaultB = DEFAULT_SETTINGS.banner;

  const currentBrand = (
    parsed.settings.brandName ||
    parsed.settings.banner?.brandName ||
    defaultB.brandName
  ).trim();

  parsed.settings.brandName = currentBrand;

  let bannerImg = parsed.settings.banner?.imageUrl;
  if (!bannerImg || bannerImg.includes('unsplash.com')) {
    bannerImg = '/images/banner.jpg';
    needsWrite = true;
  }

  parsed.settings.banner = {
    brandName: currentBrand,
    announcementText:
      parsed.settings.banner?.announcementText ||
      parsed.settings.announcementText ||
      defaultB.announcementText,
    heading: parsed.settings.banner?.heading || defaultB.heading,
    subheading: parsed.settings.banner?.subheading || defaultB.subheading,
    imageUrl: bannerImg,
  };

  if (!parsed.settings.ownerWhatsApp) {
    parsed.settings.ownerWhatsApp = DEFAULT_SETTINGS.ownerWhatsApp;
    needsWrite = true;
  }

  if (!parsed.adminPasswordHash) {
    parsed.adminPasswordHash = 'admin2026';
    needsWrite = true;
  }

  if (needsWrite) {
    writeDb(parsed);
  }

  return parsed as DatabaseSchema;
}

let lastDbMtime = 0;

function ensureDb(): DatabaseSchema {
  const searchPaths = getKnownDbPaths();

  let bestFile: { path: string; mtime: number } | null = null;
  for (const p of searchPaths) {
    try {
      if (fs.existsSync(p)) {
        const stat = fs.statSync(p);
        if (!bestFile || stat.mtimeMs > bestFile.mtime) {
          bestFile = { path: p, mtime: stat.mtimeMs };
        }
      }
    } catch {
      // ignore check error
    }
  }

  if (bestFile) {
    if (inMemoryDb && bestFile.mtime <= lastDbMtime) {
      return inMemoryDb;
    }
    try {
      const raw = fs.readFileSync(bestFile.path, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products)) {
        lastDbMtime = bestFile.mtime;
        inMemoryDb = normalizeDatabase(parsed);
        return inMemoryDb;
      }
    } catch (err) {
      console.warn(`Failed reading database from ${bestFile.path}:`, err);
    }
  }

  if (inMemoryDb) {
    return inMemoryDb;
  }

  // Fallback to defaults only if no file could be read
  const initialData: DatabaseSchema = {
    products: DEFAULT_PRODUCTS,
    categories: DEFAULT_CATEGORIES,
    orders: DEFAULT_ORDERS,
    settings: DEFAULT_SETTINGS,
    adminPasswordHash: 'admin2026',
  };
  inMemoryDb = initialData;
  try {
    writeDb(initialData);
  } catch (err) {
    console.warn('Could not write fallback initial DB:', err);
  }
  return inMemoryDb;
}

function writeDb(data: DatabaseSchema): void {
  inMemoryDb = data;
  const jsonStr = JSON.stringify(data, null, 2);
  let writtenSuccessfully = false;
  let lastError: any = null;

  const targetPaths = getKnownDbPaths();

  for (const filePath of targetPaths) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tmpPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
      fs.writeFileSync(tmpPath, jsonStr, 'utf-8');
      fs.renameSync(tmpPath, filePath);
      writtenSuccessfully = true;
    } catch (err) {
      lastError = err;
      console.warn(`Could not write to ${filePath}:`, err);
    }
  }

  if (!writtenSuccessfully) {
    throw new Error(`Failed to persist database: ${lastError?.message || 'Write failed'}`);
  }

  try {
    const primary = getPrimaryDbPath();
    if (fs.existsSync(primary)) {
      lastDbMtime = fs.statSync(primary).mtimeMs;
    }
  } catch {
    lastDbMtime = Date.now();
  }
}

export const db = {
  getProducts(): Product[] {
    const data = ensureDb();
    return data.products;
  },
  getProductById(id: string): Product | undefined {
    const data = ensureDb();
    return data.products.find((p) => p.id === id);
  },
  getProductBySlug(slug: string): Product | undefined {
    const data = ensureDb();
    return data.products.find((p) => p.slug === slug);
  },
  saveProduct(product: Product): Product {
    const data = ensureDb();
    const index = data.products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      data.products[index] = product;
    } else {
      data.products.unshift(product);
    }
    writeDb(data);
    return product;
  },
  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const data = ensureDb();
    const index = data.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const updated = {
      ...data.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    data.products[index] = updated;
    writeDb(data);
    return updated;
  },
  deleteProduct(id: string): boolean {
    const data = ensureDb();
    const initialLength = data.products.length;
    data.products = data.products.filter((p) => p.id !== id);
    if (data.products.length !== initialLength) {
      writeDb(data);
      return true;
    }
    return false;
  },

  getCategories(): Category[] {
    const data = ensureDb();
    return data.categories;
  },
  saveCategory(cat: Category): Category {
    const data = ensureDb();
    const index = data.categories.findIndex((c) => c.id === cat.id);
    if (index >= 0) {
      data.categories[index] = cat;
    } else {
      data.categories.push(cat);
    }
    writeDb(data);
    return cat;
  },
  deleteCategory(id: string): boolean {
    const data = ensureDb();
    const prev = data.categories.length;
    data.categories = data.categories.filter((c) => c.id !== id);
    if (data.categories.length !== prev) {
      writeDb(data);
      return true;
    }
    return false;
  },
  resetOfficialCategories(): Category[] {
    const data = ensureDb();
    data.categories = [...OFFICIAL_CATEGORIES];
    writeDb(data);
    return data.categories;
  },

  getOrders(): Order[] {
    const data = ensureDb();
    return data.orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  getOrderById(id: string): Order | undefined {
    const data = ensureDb();
    return data.orders.find((o) => o.id === id);
  },
  createOrder(order: Order): Order {
    const data = ensureDb();
    order.items.forEach((item) => {
      const prod = data.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
        prod.inStock = prod.stockQuantity > 0;
      }
    });

    data.orders.unshift(order);
    writeDb(data);
    return order;
  },
  updateOrderStatus(
    id: string,
    status: Order['status'],
    adminNotes?: string
  ): Order | null {
    const data = ensureDb();
    const order = data.orders.find((o) => o.id === id);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (adminNotes !== undefined) {
      order.adminNotes = adminNotes;
    }
    writeDb(data);
    return order;
  },
  updateOrderPaymentProof(
    id: string,
    proof: Order['paymentProof']
  ): Order | null {
    const data = ensureDb();
    const order = data.orders.find((o) => o.id === id);
    if (!order) return null;

    order.paymentProof = {
      ...order.paymentProof,
      ...proof,
      paidAt: proof?.paidAt || new Date().toISOString(),
    };
    order.updatedAt = new Date().toISOString();
    writeDb(data);
    return order;
  },

  deleteOrder(id: string): boolean {
    const data = ensureDb();
    const initLen = data.orders.length;
    data.orders = data.orders.filter((o) => o.id !== id);
    if (data.orders.length !== initLen) {
      writeDb(data);
      return true;
    }
    return false;
  },

  resetOrders(statusFilter?: string): { deletedCount: number; remainingCount: number } {
    const data = ensureDb();
    const initialCount = data.orders.length;
    if (!statusFilter || statusFilter === 'all') {
      data.orders = [];
    } else {
      data.orders = data.orders.filter(
        (o) => o.status.toLowerCase() !== statusFilter.toLowerCase()
      );
    }
    const deletedCount = initialCount - data.orders.length;
    writeDb(data);
    return { deletedCount, remainingCount: data.orders.length };
  },

  resetSalesSummary(): { resetAt: string } {
    const data = ensureDb();
    const resetAt = new Date().toISOString();
    data.settings.salesSummaryResetAt = resetAt;
    writeDb(data);
    return { resetAt };
  },

  restoreSalesSummary(): void {
    const data = ensureDb();
    delete data.settings.salesSummaryResetAt;
    writeDb(data);
  },

  getSettings(): StoreSettings {
    const data = ensureDb();
    return data.settings;
  },
  updateSettings(settings: Partial<StoreSettings>): StoreSettings {
    const data = ensureDb();

    const brandName = (
      settings.brandName ||
      settings.banner?.brandName ||
      data.settings.brandName ||
      'MD SKINCARE HAVEN'
    ).trim();

    const ownerWhatsApp = (
      settings.ownerWhatsApp ||
      data.settings.ownerWhatsApp ||
      DEFAULT_SETTINGS.ownerWhatsApp
    ).trim();

    data.settings = {
      ...data.settings,
      ...settings,
      brandName,
      ownerWhatsApp,
      bankDetails: {
        ...data.settings.bankDetails,
        ...(settings.bankDetails || {}),
      },
      banner: {
        ...data.settings.banner,
        ...(settings.banner || {}),
        brandName,
        imageUrl:
          settings.banner?.imageUrl ||
          data.settings.banner?.imageUrl ||
          '/images/banner.jpg',
      },
    };
    writeDb(data);
    return data.settings;
  },

  verifyAdminPassword(password: string): boolean {
    const data = ensureDb();
    return data.adminPasswordHash === password;
  },
  updateAdminPassword(oldPass: string, newPass: string): boolean {
    const data = ensureDb();
    if (data.adminPasswordHash === oldPass) {
      data.adminPasswordHash = newPass;
      writeDb(data);
      return true;
    }
    return false;
  },
};
