import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { firestore, handleFirestoreError, OperationType } from './firebase';
import { Product, Category, Order, StoreSettings, OFFICIAL_CATEGORIES } from './types';

// Default initial data for fresh databases
export const DEFAULT_SETTINGS: StoreSettings = {
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

export const DEFAULT_CATEGORIES: Category[] = OFFICIAL_CATEGORIES;

export const DEFAULT_PRODUCTS: Product[] = [
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
];

/**
 * Removes undefined fields from objects before saving to Firestore,
 * preventing 'Function setDoc() called with invalid data. Unsupported field value: undefined' errors.
 */
function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = cleanForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export const db = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    try {
      const snap = await getDocs(collection(firestore, 'products'));
      if (snap.empty) {
        // Fallback: Seed with default products if collection is completely fresh
        const list: Product[] = [];
        for (const p of DEFAULT_PRODUCTS) {
          const cleaned = cleanForFirestore(p);
          await setDoc(doc(firestore, 'products', p.id), cleaned);
          list.push(p);
        }
        return list;
      }

      const products: Product[] = [];
      snap.forEach((d) => {
        products.push(d.data() as Product);
      });

      // Sort by createdAt descending
      return products.sort((a, b) => {
        const tA = new Date(a.createdAt || 0).getTime();
        const tB = new Date(b.createdAt || 0).getTime();
        return tB - tA;
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'products');
    }
  },

  async getProductById(id: string): Promise<Product | undefined> {
    try {
      const snap = await getDoc(doc(firestore, 'products', id));
      if (snap.exists()) {
        return snap.data() as Product;
      }
      return undefined;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `products/${id}`);
    }
  },

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    try {
      const q = query(collection(firestore, 'products'), where('slug', '==', slug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as Product;
      }
      return undefined;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'products');
    }
  },

  async saveProduct(product: Product): Promise<Product> {
    try {
      const cleaned = cleanForFirestore({
        ...product,
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(firestore, 'products', product.id), cleaned);

      // Confirm write directly from Firestore
      const verifiedSnap = await getDoc(doc(firestore, 'products', product.id));
      if (!verifiedSnap.exists()) {
        throw new Error(`Product ${product.id} could not be confirmed in Firestore after save`);
      }
      return verifiedSnap.data() as Product;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const existingSnap = await getDoc(doc(firestore, 'products', id));
      if (!existingSnap.exists()) {
        return null;
      }
      const existing = existingSnap.data() as Product;
      const merged: Product = cleanForFirestore({
        ...existing,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      });

      await setDoc(doc(firestore, 'products', id), merged);

      const verified = await getDoc(doc(firestore, 'products', id));
      if (!verified.exists()) {
        throw new Error(`Updated product ${id} could not be confirmed in Firestore`);
      }
      return verified.data() as Product;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const snap = await getDoc(doc(firestore, 'products', id));
      if (!snap.exists()) {
        return false;
      }
      await deleteDoc(doc(firestore, 'products', id));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    try {
      const snap = await getDocs(collection(firestore, 'categories'));
      if (snap.empty) {
        // Seed official categories
        for (const c of OFFICIAL_CATEGORIES) {
          await setDoc(doc(firestore, 'categories', c.id || c.slug), cleanForFirestore(c));
        }
        return [...OFFICIAL_CATEGORIES];
      }

      const list: Category[] = [];
      snap.forEach((d) => list.push(d.data() as Category));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'categories');
    }
  },

  async saveCategory(cat: Category): Promise<Category> {
    try {
      const cleaned = cleanForFirestore(cat);
      const catId = cat.id || cat.slug;
      await setDoc(doc(firestore, 'categories', catId), cleaned);
      return cat;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${cat.id}`);
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(firestore, 'categories', id));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  },

  async resetOfficialCategories(): Promise<Category[]> {
    try {
      const current = await getDocs(collection(firestore, 'categories'));
      for (const d of current.docs) {
        await deleteDoc(d.ref);
      }
      for (const c of OFFICIAL_CATEGORIES) {
        await setDoc(doc(firestore, 'categories', c.id || c.slug), cleanForFirestore(c));
      }
      return [...OFFICIAL_CATEGORIES];
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'categories');
    }
  },

  // ORDERS
  async getOrders(): Promise<Order[]> {
    try {
      const snap = await getDocs(collection(firestore, 'orders'));
      const orders: Order[] = [];
      snap.forEach((d) => orders.push(d.data() as Order));
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'orders');
    }
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    try {
      const snap = await getDoc(doc(firestore, 'orders', id));
      if (snap.exists()) {
        return snap.data() as Order;
      }
      return undefined;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `orders/${id}`);
    }
  },

  async createOrder(order: Order): Promise<Order> {
    try {
      // Reduce stock for ordered items
      for (const item of order.items) {
        try {
          const prodDoc = await getDoc(doc(firestore, 'products', item.productId));
          if (prodDoc.exists()) {
            const prod = prodDoc.data() as Product;
            const newQty = Math.max(0, (prod.stockQuantity || 0) - item.quantity);
            await setDoc(
              doc(firestore, 'products', item.productId),
              cleanForFirestore({
                ...prod,
                stockQuantity: newQty,
                inStock: newQty > 0,
                updatedAt: new Date().toISOString(),
              })
            );
          }
        } catch (itemErr) {
          console.warn('Stock update note:', itemErr);
        }
      }

      const cleaned = cleanForFirestore(order);
      await setDoc(doc(firestore, 'orders', order.id), cleaned);
      return order;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
    }
  },

  async updateOrderStatus(
    id: string,
    status: Order['status'],
    paymentProof?: any,
    adminNotes?: string
  ): Promise<Order | null> {
    try {
      const snap = await getDoc(doc(firestore, 'orders', id));
      if (!snap.exists()) return null;

      const order = snap.data() as Order;
      const updated: Order = cleanForFirestore({
        ...order,
        status,
        updatedAt: new Date().toISOString(),
        paymentProof: paymentProof || order.paymentProof,
        adminNotes: adminNotes !== undefined ? adminNotes : order.adminNotes,
      });

      await setDoc(doc(firestore, 'orders', id), updated);
      return updated;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`);
    }
  },

  async updateOrderPaymentProof(id: string, proof: Order['paymentProof']): Promise<Order | null> {
    try {
      const snap = await getDoc(doc(firestore, 'orders', id));
      if (!snap.exists()) return null;

      const order = snap.data() as Order;
      const updated: Order = cleanForFirestore({
        ...order,
        paymentProof: {
          ...order.paymentProof,
          ...proof,
          paidAt: proof?.paidAt || new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      });

      await setDoc(doc(firestore, 'orders', id), updated);
      return updated;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`);
    }
  },

  async deleteOrder(id: string): Promise<boolean> {
    try {
      const snap = await getDoc(doc(firestore, 'orders', id));
      if (!snap.exists()) return false;
      await deleteDoc(doc(firestore, 'orders', id));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${id}`);
    }
  },

  async resetOrders(statusFilter?: string): Promise<{ deletedCount: number; remainingCount: number }> {
    try {
      const snap = await getDocs(collection(firestore, 'orders'));
      let deleted = 0;
      let remaining = 0;

      for (const d of snap.docs) {
        const order = d.data() as Order;
        if (!statusFilter || statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase()) {
          await deleteDoc(d.ref);
          deleted++;
        } else {
          remaining++;
        }
      }

      return { deletedCount: deleted, remainingCount: remaining };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'orders');
    }
  },

  async resetSalesSummary(): Promise<{ resetAt: string }> {
    try {
      const resetAt = new Date().toISOString();
      const settingsSnap = await getDoc(doc(firestore, 'settings', 'store'));
      const current = settingsSnap.exists() ? (settingsSnap.data() as StoreSettings) : DEFAULT_SETTINGS;
      const updated = cleanForFirestore({
        ...current,
        salesSummaryResetAt: resetAt,
      });
      await setDoc(doc(firestore, 'settings', 'store'), updated);
      return { resetAt };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/store');
    }
  },

  async restoreSalesSummary(): Promise<void> {
    try {
      const settingsSnap = await getDoc(doc(firestore, 'settings', 'store'));
      if (settingsSnap.exists()) {
        const current = settingsSnap.data() as StoreSettings;
        delete current.salesSummaryResetAt;
        await setDoc(doc(firestore, 'settings', 'store'), cleanForFirestore(current));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/store');
    }
  },

  // STORE SETTINGS
  async getSettings(): Promise<StoreSettings> {
    try {
      const snap = await getDoc(doc(firestore, 'settings', 'store'));
      if (snap.exists()) {
        const data = snap.data() as StoreSettings;
        return {
          brandName: data.brandName || DEFAULT_SETTINGS.brandName,
          ownerWhatsApp: data.ownerWhatsApp || DEFAULT_SETTINGS.ownerWhatsApp,
          bankDetails: data.bankDetails || DEFAULT_SETTINGS.bankDetails,
          banner: data.banner || DEFAULT_SETTINGS.banner,
          salesSummaryResetAt: data.salesSummaryResetAt,
        };
      }

      // Initialize default settings in Firestore
      await setDoc(doc(firestore, 'settings', 'store'), cleanForFirestore(DEFAULT_SETTINGS));
      return { ...DEFAULT_SETTINGS };
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'settings/store');
    }
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    try {
      const current = await db.getSettings();
      const brandName = (
        settings.brandName ||
        settings.banner?.brandName ||
        current.brandName ||
        'MD SKINCARE HAVEN'
      ).trim();

      const ownerWhatsApp = (
        settings.ownerWhatsApp ||
        current.ownerWhatsApp ||
        DEFAULT_SETTINGS.ownerWhatsApp
      ).trim();

      const merged: StoreSettings = cleanForFirestore({
        ...current,
        ...settings,
        brandName,
        ownerWhatsApp,
        bankDetails: {
          ...current.bankDetails,
          ...(settings.bankDetails || {}),
        },
        banner: {
          ...current.banner,
          ...(settings.banner || {}),
          brandName,
          imageUrl:
            settings.banner?.imageUrl ||
            current.banner?.imageUrl ||
            '/images/banner.jpg',
        },
      });

      await setDoc(doc(firestore, 'settings', 'store'), merged);
      return merged;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/store');
    }
  },

  // ADMIN AUTHENTICATION
  async verifyAdminPassword(password: string): Promise<boolean> {
    try {
      const snap = await getDoc(doc(firestore, 'settings', 'adminAuth'));
      if (snap.exists()) {
        const storedHash = snap.data().passwordHash;
        return storedHash === password;
      }
      return password === 'admin2026';
    } catch {
      return password === 'admin2026';
    }
  },

  async updateAdminPassword(oldPass: string, newPass: string): Promise<boolean> {
    try {
      const isValid = await db.verifyAdminPassword(oldPass);
      if (!isValid) return false;

      await setDoc(doc(firestore, 'settings', 'adminAuth'), {
        passwordHash: newPass,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/adminAuth');
    }
  },
};
