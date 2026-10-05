'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Order, StoreSettings, Category, OrderStatus, OFFICIAL_CATEGORIES } from '@/lib/types';
import { formatNaira, formatDate, sanitizePhoneForWhatsApp } from '@/lib/format';
import {
  getCustomerPaymentConfirmedWhatsAppUrl,
} from '@/lib/whatsapp';
import {
  Lock,
  TrendingUp,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  Landmark,
  Plus,
  Trash2,
  Edit,
  Eye,
  Save,
  MessageCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Sparkles,
  KeyRound,
  FileCheck,
  Check,
  Layers,
  ArrowLeft,
  UploadCloud,
  Download,
  RotateCcw,
  AlertOctagon,
  Info,
} from 'lucide-react';

const NIGERIAN_BANKS = [
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank',
  'Access Bank',
  'Kuda Microfinance Bank',
  'Moniepoint MFB',
  'OPay Digital Services',
  'United Bank for Africa (UBA)',
  'First Bank of Nigeria',
  'Stanbic IBTC Bank',
  'First City Monument Bank (FCMB)',
  'Wema Bank / ALAT',
  'Sterling Bank',
  'Fidelity Bank',
  'Union Bank',
  'Ecobank Nigeria',
  'Other Bank',
];

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(sessionStorage.getItem('md_admin_token'));
  });
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Tabs: orders, products, categories, settings, analytics
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'settings' | 'analytics'>('orders');

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Orders filter & search
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);

  // Product modal & device upload
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSaveError, setProductSaveError] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [productFormData, setProductFormData] = useState<Partial<Product>>({
    name: '',
    price: 12000,
    originalPrice: 15000,
    description: '',
    category: 'Sunscreens',
    categorySlug: 'sunscreens',
    stockQuantity: 25,
    imageUrl: '',
    badge: 'NEW',
    volume: 'Standard',
    skinType: 'All Skin Types',
    inStock: true,
  });

  // Category modal / input
  const [newCatName, setNewCatName] = useState('');

  // Settings form
  const [settingsForm, setSettingsForm] = useState<StoreSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // Orders & Sales Reset States
  const [isResetOrdersModalOpen, setIsResetOrdersModalOpen] = useState(false);
  const [resetOrdersScope, setResetOrdersScope] = useState<string>('all');
  const [resettingOrders, setResettingOrders] = useState(false);

  const [isResetSalesModalOpen, setIsResetSalesModalOpen] = useState(false);
  const [resettingSales, setResettingSales] = useState(false);

  // Global Admin Toast
  const [adminToast, setAdminToast] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setAdminToast({ text, isError });
    setTimeout(() => {
      setAdminToast(null);
    }, 4500);
  };

  // Password change
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState({ text: '', isError: false });

  // Load data on auth
  useEffect(() => {
    let active = true;
    if (isAuthenticated) {
      const loadAllData = async () => {
        try {
          const t = Date.now();
          const [ordRes, prodRes, catRes, setRes, statRes] = await Promise.all([
            fetch(`/api/orders?_t=${t}`, { cache: 'no-store' }).catch(() => null),
            fetch(`/api/products?_t=${t}`, { cache: 'no-store' }).catch(() => null),
            fetch(`/api/categories?_t=${t}`, { cache: 'no-store' }).catch(() => null),
            fetch(`/api/settings?_t=${t}`, { cache: 'no-store' }).catch(() => null),
            fetch(`/api/admin/stats?_t=${t}`, { cache: 'no-store' }).catch(() => null),
          ]);

          const ordData = ordRes && ordRes.ok ? await ordRes.json().catch(() => null) : null;
          const prodData = prodRes && prodRes.ok ? await prodRes.json().catch(() => null) : null;
          const catData = catRes && catRes.ok ? await catRes.json().catch(() => null) : null;
          const setData = setRes && setRes.ok ? await setRes.json().catch(() => null) : null;
          const statData = statRes && statRes.ok ? await statRes.json().catch(() => null) : null;

          if (!active) return;
          if (ordData?.success) setOrders(ordData.orders);
          if (prodData?.success) setProducts(prodData.products);
          if (catData?.success) setCategories(catData.categories);
          if (setData?.success) {
            const raw = setData.settings;
            const bannerUrl =
              raw?.banner?.imageUrl && !raw.banner.imageUrl.includes('unsplash.com')
                ? raw.banner.imageUrl
                : '/images/banner.jpg';

            const defBanner = {
              brandName: raw?.banner?.brandName || raw?.heroBanner?.brandName || raw?.brandName || 'MD SKINCARE HAVEN',
              announcementText: raw?.banner?.announcementText || raw?.heroBanner?.badge || raw?.announcementText || '🌿 Pure & Natural Botanical Skincare • Direct Bank Transfer Payment',
              heading: raw?.banner?.heading || raw?.heroBanner?.heading || 'Healthy, Radiant Melanin Glow',
              subheading: raw?.banner?.subheading || raw?.heroBanner?.subheading || 'Premium clinical-grade skincare products formulated for healthy, clear, and glowing skin.',
              imageUrl: bannerUrl,
            };
            const normalized: StoreSettings = {
              ...raw,
              banner: {
                ...defBanner,
                ...(raw?.banner || {}),
                heading: raw?.banner?.heading || defBanner.heading,
                subheading: raw?.banner?.subheading || defBanner.subheading,
                imageUrl: bannerUrl,
              },
            };
            setSettings(normalized);
            setSettingsForm(normalized);
          }
          if (statData?.success) setStats(statData.stats);
        } catch (e) {
          console.error('Failed to load admin data', e);
        }
      };
      loadAllData();

      const handleCatalogSync = () => {
        loadAllData();
      };
      window.addEventListener('focus', handleCatalogSync);
      window.addEventListener('storage', handleCatalogSync);
      window.addEventListener('md_catalog_updated', handleCatalogSync);

      return () => {
        active = false;
        window.removeEventListener('focus', handleCatalogSync);
        window.removeEventListener('storage', handleCatalogSync);
        window.removeEventListener('md_catalog_updated', handleCatalogSync);
      };
    }
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const refreshData = async () => {
    setLoadingData(true);
    try {
      const t = Date.now();
      const [ordRes, prodRes, catRes, setRes, statRes] = await Promise.all([
        fetch(`/api/orders?_t=${t}`, { cache: 'no-store' }).catch(() => null),
        fetch(`/api/products?_t=${t}`, { cache: 'no-store' }).catch(() => null),
        fetch(`/api/categories?_t=${t}`, { cache: 'no-store' }).catch(() => null),
        fetch(`/api/settings?_t=${t}`, { cache: 'no-store' }).catch(() => null),
        fetch(`/api/admin/stats?_t=${t}`, { cache: 'no-store' }).catch(() => null),
      ]);
      const ordData = ordRes && ordRes.ok ? await ordRes.json().catch(() => null) : null;
      const prodData = prodRes && prodRes.ok ? await prodRes.json().catch(() => null) : null;
      const catData = catRes && catRes.ok ? await catRes.json().catch(() => null) : null;
      const setData = setRes && setRes.ok ? await setRes.json().catch(() => null) : null;
      const statData = statRes && statRes.ok ? await statRes.json().catch(() => null) : null;

      if (ordData?.success) setOrders(ordData.orders);
      if (prodData?.success) setProducts(prodData.products);
      if (catData?.success) setCategories(catData.categories);
      if (setData?.success) {
        const raw = setData.settings;
        const bannerUrl =
          raw?.banner?.imageUrl && !raw.banner.imageUrl.includes('unsplash.com')
            ? raw.banner.imageUrl
            : '/images/banner.jpg';

        const defBanner = {
          brandName: raw?.banner?.brandName || raw?.heroBanner?.brandName || raw?.brandName || 'MD SKINCARE HAVEN',
          announcementText: raw?.banner?.announcementText || raw?.heroBanner?.badge || raw?.announcementText || '🌿 Pure & Natural Botanical Skincare • Direct Bank Transfer Payment',
          heading: raw?.banner?.heading || raw?.heroBanner?.heading || 'Healthy, Radiant Melanin Glow',
          subheading: raw?.banner?.subheading || raw?.heroBanner?.subheading || 'Premium clinical-grade skincare products formulated for healthy, clear, and glowing skin.',
          imageUrl: bannerUrl,
        };
        const normalized: StoreSettings = {
          ...raw,
          banner: {
            ...defBanner,
            ...(raw?.banner || {}),
            heading: raw?.banner?.heading || defBanner.heading,
            subheading: raw?.banner?.subheading || defBanner.subheading,
            imageUrl: bannerUrl,
          },
        };
        setSettings(normalized);
        setSettingsForm(normalized);
      }
      if (statData?.success) setStats(statData.stats);
    } catch (err) {
      console.warn('refreshData error caught:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Export Orders Backup before resetting
  const handleExportOrdersBackup = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(orders, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `md-skincare-orders-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Orders backup JSON downloaded successfully.');
    } catch {
      showToast('Failed to export orders backup', true);
    }
  };

  // Reset Orders Handler
  const handleResetOrders = async () => {
    setResettingOrders(true);
    try {
      const url = `/api/orders?reset=true&status=${encodeURIComponent(resetOrdersScope)}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset orders');
      }
      setIsResetOrdersModalOpen(false);
      await refreshData();
      showToast(data.message || 'Orders reset successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset orders', true);
    } finally {
      setResettingOrders(false);
    }
  };

  // Reset Sales Summary Handler
  const handleResetSalesSummary = async () => {
    setResettingSales(true);
    try {
      const res = await fetch('/api/admin/stats', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset sales summary');
      }
      setIsResetSalesModalOpen(false);
      await refreshData();
      showToast(data.message || 'Sales summary figures reset successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset sales summary', true);
    } finally {
      setResettingSales(false);
    }
  };

  // Restore Lifetime Sales Summary Handler
  const handleRestoreSalesSummary = async () => {
    try {
      const res = await fetch('/api/admin/stats', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to restore sales summary');
      }
      await refreshData();
      showToast(data.message || 'Full lifetime sales history restored.');
    } catch (err: any) {
      showToast(err.message || 'Failed to restore sales summary', true);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: authPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Incorrect password');
      sessionStorage.setItem('md_admin_token', data.token);
      setIsAuthenticated(true);
      setAuthPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Default password is: admin2026');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('md_admin_token');
    setIsAuthenticated(false);
  };

  // Update order status (e.g. Confirm payment)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        if (selectedOrderDetail?.id === orderId) {
          setSelectedOrderDetail(data.order);
        }
        fetch('/api/admin/stats')
          .then((r) => r.json())
          .then((st) => st.success && setStats(st.stats));
      }
    } catch {
      showToast('Failed to update status', true);
    }
  };

  // Helper to compress and upload image via client-side canvas fallback if needed
  const compressAndUploadViaCanvas = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') return resolve(null);
        const img = new window.Image();
        img.onload = async () => {
          try {
            const maxDim = 1000;
            let w = img.naturalWidth || img.width;
            let h = img.naturalHeight || img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(null);
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataUrl }),
            });
            const data = await uploadRes.json().catch(() => null);
            if (uploadRes.ok && data?.success && data?.url) {
              resolve(data.url);
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = reader.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  // Handle file selection from admin device with direct multipart upload and instant preview
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so selecting the same file again triggers onChange
    e.target.value = '';

    const isImage =
      (file.type && file.type.startsWith('image/')) ||
      /\.(jpe?g|png|webp|gif|heic|heif|bmp|svg|avif)$/i.test(file.name);

    if (!isImage) {
      showToast('Please select a valid image file (JPG, PNG, WEBP, etc.)', true);
      return;
    }

    setUploadingImage(true);
    setProductSaveError(null);

    // Provide instant local object URL preview so the user immediately sees the selected image
    try {
      const localPreview = URL.createObjectURL(file);
      setProductFormData((prev) => ({
        ...prev,
        imageUrl: localPreview,
      }));
    } catch {}

    try {
      // 1. Direct multipart/form-data upload to /api/upload
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data?.url) {
        setProductFormData((prev) => ({
          ...prev,
          imageUrl: data.url,
        }));
        showToast('Image uploaded and saved successfully.');
      } else {
        // 2. Client-side canvas fallback
        const fallbackUrl = await compressAndUploadViaCanvas(file);
        if (fallbackUrl) {
          setProductFormData((prev) => ({
            ...prev,
            imageUrl: fallbackUrl,
          }));
          showToast('Image optimized and saved successfully.');
        } else {
          showToast(data?.error || 'Failed to upload image. You can try another photo or save without image.', true);
        }
      }
    } catch (err: any) {
      console.warn('Direct upload warning, trying canvas fallback:', err);
      try {
        const fallbackUrl = await compressAndUploadViaCanvas(file);
        if (fallbackUrl) {
          setProductFormData((prev) => ({
            ...prev,
            imageUrl: fallbackUrl,
          }));
          showToast('Image optimized and saved successfully.');
        } else {
          showToast('Failed to upload image. You can try another photo or save without image.', true);
        }
      } catch {
        showToast('Failed to upload image. You can save without image or try another file.', true);
      }
    } finally {
      setUploadingImage(false);
    }
  };

  // Save product with full end-to-end database verification
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductSaveError(null);

    if (uploadingImage) {
      const waitMsg = 'Please wait for the image upload to complete before saving.';
      setProductSaveError(waitMsg);
      showToast(waitMsg, true);
      return;
    }

    // 1. Sanitize & validate required fields in JavaScript
    const trimmedName = (productFormData.name || '').trim();
    if (!trimmedName) {
      const err = 'Please enter a product name.';
      setProductSaveError(err);
      showToast(err, true);
      return;
    }

    // Clean price (remove any commas, currency symbols, spaces)
    const cleanPriceStr = String(productFormData.price ?? '').replace(/[^0-9.]/g, '');
    const numPrice = parseFloat(cleanPriceStr);
    if (isNaN(numPrice) || numPrice <= 0) {
      const err = 'Please enter a valid price in Naira (₦) greater than 0.';
      setProductSaveError(err);
      showToast(err, true);
      return;
    }

    // Clean optional original price
    const cleanOrigStr = String(productFormData.originalPrice ?? '').replace(/[^0-9.]/g, '');
    const numOrigPrice =
      cleanOrigStr && !isNaN(parseFloat(cleanOrigStr)) && parseFloat(cleanOrigStr) > 0
        ? parseFloat(cleanOrigStr)
        : undefined;

    // Clean stock quantity (defaults to 25 if blank)
    const cleanStockStr = String(productFormData.stockQuantity ?? '').replace(/[^0-9]/g, '');
    const numStock = cleanStockStr !== '' ? parseInt(cleanStockStr, 10) : 25;

    // Clean description (provides professional fallback if blank)
    const trimmedDesc = (productFormData.description || '').trim();
    const finalDescription =
      trimmedDesc ||
      `${trimmedName} - Premium botanical skincare formulation for healthy, radiant, and glowing melanin skin.`;

    const activeCategories = categories.length > 0 ? categories : OFFICIAL_CATEGORIES;
    const selectedCategoryName = productFormData.category || activeCategories[0]?.name || 'Sunscreens';
    const selectedCat = activeCategories.find((c) => c.name === selectedCategoryName) || activeCategories[0];

    // If imageUrl starts with blob:, the upload may not have finished or failed
    let finalImageUrl = productFormData.imageUrl?.trim() || '';
    if (finalImageUrl.startsWith('blob:')) {
      finalImageUrl = '';
    }

    const payload = {
      ...productFormData,
      imageUrl: finalImageUrl,
      name: trimmedName,
      price: numPrice,
      originalPrice: numOrigPrice,
      stockQuantity: numStock,
      inStock: numStock > 0,
      description: finalDescription,
      category: selectedCategoryName,
      categorySlug: selectedCat?.slug || selectedCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };

    setSavingProduct(true);
    try {
      const isEditing = Boolean(editingProduct?.id);
      const url = isEditing ? `/api/products/${editingProduct?.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      // Verify that database response was returned with success AND a confirmed product object with an ID
      if (!res.ok || !data?.success || !data?.product?.id) {
        throw new Error(data?.error || `Server responded with status ${res.status}: Failed to persist to database.`);
      }

      const confirmedProduct = data.product;

      // 1. Update admin state immediately with the confirmed product from database
      setProducts((prev) => {
        if (isEditing) {
          return prev.map((p) => (p.id === confirmedProduct.id ? confirmedProduct : p));
        } else {
          return [confirmedProduct, ...prev.filter((p) => p.id !== confirmedProduct.id)];
        }
      });

      // 2. Synchronize from server to guarantee full database alignment
      try {
        await refreshData();
      } catch (refreshErr) {
        console.warn('refreshData note:', refreshErr);
      }

      // 3. Broadcast synchronization event to shopping page and open tabs
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('md_catalog_sync', Date.now().toString());
          window.dispatchEvent(new Event('md_catalog_updated'));
        }
      } catch (syncErr) {
        console.warn('Sync broadcast warning:', syncErr);
      }

      // 4. ONLY AFTER DATABASE CONFIRMS: Close modal and reset form
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductSaveError(null);
      setProductFormData({
        name: '',
        price: '' as any,
        originalPrice: '' as any,
        description: '',
        category: activeCategories[0]?.name || 'Sunscreens',
        categorySlug: activeCategories[0]?.slug || 'sunscreens',
        stockQuantity: 25,
        imageUrl: '',
        badge: 'NEW',
        volume: 'Standard',
        skinType: 'All Skin Types',
        inStock: true,
      });

      // 5. Show verified success notification ONLY AFTER DATABASE CONFIRMS
      showToast(isEditing ? 'Product updated and verified in database.' : 'Product added and saved in database successfully.');
    } catch (err: any) {
      // KEEP FORM OPEN, DO NOT CLEAR DATA, DISPLAY ACTUAL ERROR
      const errorMsg = err?.message || 'Failed to save product to database';
      setProductSaveError(errorMsg);
      showToast(errorMsg, true);
    } finally {
      setSavingProduct(false);
    }
  };

  // Delete product - open confirmation modal
  const handleDeleteProduct = (productId: string, name: string) => {
    setProductToDelete({ id: productId, name });
  };

  // Perform confirmed product deletion
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeletingProduct(true);
    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete product');
      }
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      try {
        await refreshData();
      } catch (e) {
        console.warn('refreshData notice:', e);
      }
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('md_catalog_sync', Date.now().toString());
          window.dispatchEvent(new Event('md_catalog_updated'));
        }
      } catch {}
      showToast(`Product "${productToDelete.name}" deleted successfully.`);
      setProductToDelete(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', true);
    } finally {
      setDeletingProduct(false);
    }
  };

  // Add category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => [...prev, data.category]);
        setNewCatName('');
        showToast(`Category "${data.category.name}" added successfully.`);
      } else {
        showToast(data.error || 'Failed to add category', true);
      }
    } catch {
      showToast('Failed to add category', true);
    }
  };

  // Reset to 6 official categories
  const handleResetCategories = async () => {
    try {
      const res = await fetch('/api/categories', { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        showToast('Categories successfully reset to official list.');
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('md_catalog_sync', Date.now().toString());
            window.dispatchEvent(new Event('md_catalog_updated'));
          }
        } catch {}
      } else {
        showToast(data.error || 'Failed to reset categories', true);
      }
    } catch {
      showToast('Failed to reset categories', true);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        showToast(`Category "${name}" removed.`);
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('md_catalog_sync', Date.now().toString());
            window.dispatchEvent(new Event('md_catalog_updated'));
          }
        } catch {}
      } else {
        showToast(data.error || 'Failed to delete category', true);
      }
    } catch {
      showToast('Failed to delete category', true);
    }
  };

  // Save settings (Bank details + Banner + Brand Name)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setSavedToast(true);
        showToast('Store settings saved successfully!');
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('md_catalog_sync', Date.now().toString());
            window.dispatchEvent(new Event('md_catalog_updated'));
          }
        } catch {}
        setTimeout(() => setSavedToast(false), 3000);
      } else {
        showToast(data.error || 'Failed to save store settings', true);
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to connect and save settings', true);
    } finally {
      setSavingSettings(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg({ text: '', isError: false });
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          oldPassword: oldPass,
          newPassword: newPass,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPassMsg({ text: 'Password updated successfully!', isError: false });
        setOldPass('');
        setNewPass('');
      } else {
        setPassMsg({ text: data.error || 'Failed to update password', isError: true });
      }
    } catch {
      setPassMsg({ text: 'Error updating password', isError: true });
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      orderStatusFilter === 'all' || o.status.toLowerCase() === orderStatusFilter.toLowerCase();
    const q = orderSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.location.toLowerCase().includes(q) ||
      o.customer.whatsappNumber.includes(q);
    return matchesStatus && matchesSearch;
  });

  // 1. LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col justify-center items-center p-4 font-sans selection:bg-emerald-500">
        <div className="w-full max-w-sm bg-stone-950 p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-xl font-bold text-white">Owner Admin Login</h1>
            <p className="text-xs text-emerald-400">MD SKINCARE HAVEN</p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter password (default: admin2026)"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition active:scale-95 disabled:opacity-50"
            >
              {authLoading ? 'Checking...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-emerald-400 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD INTERFACE
  return (
    <div className="min-h-screen bg-stone-100 text-gray-900 font-sans pb-16 selection:bg-emerald-200">
      {/* Top Header */}
      <header className="bg-emerald-950 text-white sticky top-0 z-30 border-b border-emerald-900 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-serif font-black text-xs">
              MD
            </div>
            <div>
              <h1 className="font-serif font-bold text-sm sm:text-base leading-none">
                {settings?.brandName || 'MD SKINCARE HAVEN'}
              </h1>
              <span className="text-[10px] text-emerald-300 font-medium">Owner Admin Console</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-gray-200 text-xs font-bold"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex space-x-2 sm:space-x-4 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-emerald-700 text-white'
                : 'text-emerald-200 hover:bg-emerald-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders</span>
            {orders.filter((o) => o.status === 'Pending Payment').length > 0 && (
              <span className="bg-amber-400 text-emerald-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {orders.filter((o) => o.status === 'Pending Payment').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-emerald-700 text-white'
                : 'text-emerald-200 hover:bg-emerald-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Uploaded Products ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-emerald-700 text-white'
                : 'text-emerald-200 hover:bg-emerald-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-emerald-700 text-white'
                : 'text-emerald-200 hover:bg-emerald-900'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Bank & Store Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-emerald-700 text-white'
                : 'text-emerald-200 hover:bg-emerald-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sales Summaries</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {loadingData ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 text-emerald-700 animate-spin" />
            <p className="text-xs text-gray-500 font-semibold">Updating store data...</p>
          </div>
        ) : (
          <>
            {/* 1. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                      Customer Orders
                    </h2>
                    <p className="text-xs text-gray-500">
                      View customer details, ordered products, and confirm bank transfer payments.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={refreshData}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-stone-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResetOrdersScope(orderStatusFilter === 'all' ? 'all' : orderStatusFilter);
                        setIsResetOrdersModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 text-xs font-bold transition shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                      <span>Reset Orders</span>
                    </button>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    {['all', 'Pending Payment', 'Payment Confirmed', 'Delivered'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                          orderStatusFilter === st
                            ? 'bg-emerald-700 text-white'
                            : 'bg-stone-100 text-gray-700 hover:bg-stone-200'
                        }`}
                      >
                        {st === 'all' ? 'All Orders' : st}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search Ref, Name, Location..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                  {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 text-xs text-gray-500">
                      No orders found matching the filter criteria.
                    </div>
                  ) : (
                    filteredOrders.map((order) => {
                      const isPending = order.status === 'Pending Payment';
                      const confirmWhatsAppUrl = getCustomerPaymentConfirmedWhatsAppUrl(order);

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 space-y-3 shadow-xs"
                        >
                          {/* Top Row: Ref, Date, Status */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-xs text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                {order.id}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                {formatDate(order.createdAt)}
                              </span>
                            </div>

                            {/* Status dropdown */}
                            <div className="flex items-center gap-2">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                                }
                                className={`text-xs font-bold px-2.5 py-1 rounded-xl border focus:outline-none ${
                                  order.status === 'Payment Confirmed'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : order.status === 'Pending Payment'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : 'bg-stone-50 text-gray-800 border-gray-200'
                                }`}
                              >
                                <option value="Pending Payment">Pending Payment</option>
                                <option value="Payment Confirmed">Payment Confirmed</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>

                          {/* Customer & Product Information */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                            {/* Customer (Name, Location, WhatsApp) */}
                            <div className="md:col-span-4 space-y-1">
                              <p className="font-bold text-gray-900 text-sm">
                                {order.customer.name}
                              </p>
                              <p className="text-gray-600">
                                <strong>Location:</strong> {order.customer.location}
                              </p>
                              <p className="text-emerald-700 font-semibold flex items-center gap-1">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <a
                                  href={`https://wa.me/${sanitizePhoneForWhatsApp(order.customer.whatsappNumber)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {order.customer.whatsappNumber}
                                </a>
                              </p>
                            </div>

                            {/* Products Ordered & Quantities */}
                            <div className="md:col-span-5 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                Products Ordered ({order.items.length})
                              </span>
                              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                                {order.items.map((i, idx) => (
                                  <div key={idx} className="flex justify-between text-gray-800">
                                    <span className="truncate pr-2">
                                      <strong>{i.quantity}x</strong> {i.name}
                                    </span>
                                    <span className="font-sans font-medium shrink-0">
                                      {formatNaira(i.subtotal)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Total Product Price */}
                            <div className="md:col-span-3 flex flex-col justify-between items-start md:items-end">
                              <div className="text-left md:text-right">
                                <span className="text-[10px] text-gray-400 uppercase font-bold block">
                                  Total Product Price
                                </span>
                                <span className="text-lg font-black text-emerald-950 font-sans">
                                  {formatNaira(order.totalAmount)}
                                </span>
                              </div>

                              {order.paymentProof && (
                                <div className="mt-1 bg-emerald-50 border border-emerald-100 p-2 rounded-xl text-left md:text-right w-full">
                                  <span className="text-[10px] font-bold text-emerald-900 block flex items-center gap-1 md:justify-end">
                                    <FileCheck className="w-3 h-3 text-emerald-700" />
                                    Payment Reported
                                  </span>
                                  {order.paymentProof.senderName && (
                                    <p className="text-[10px] text-gray-600">
                                      Sender: {order.paymentProof.senderName}
                                    </p>
                                  )}
                                  {order.paymentProof.receiptUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedOrderDetail(order)}
                                      className="text-[10px] text-emerald-700 font-bold hover:underline"
                                    >
                                      View Screenshot
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick Confirmation Actions */}
                          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                            {isPending ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, 'Payment Confirmed')
                                }
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Confirm Bank Transfer Payment</span>
                              </button>
                            ) : (
                              <span className="text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Payment Confirmed</span>
                              </span>
                            )}

                            {/* WhatsApp Customer Notification */}
                            <a
                              href={confirmWhatsAppUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-200 flex items-center gap-1 transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Notify Customer on WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* 2. UPLOADED PRODUCTS (PRODUCT LIST) TAB */}
            {activeTab === 'products' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                        Uploaded Products (Product List)
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {products.length} {products.length === 1 ? 'Product' : 'Products'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Every product uploaded here is saved directly to your database and immediately displayed on the customer-facing homepage.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      const defaultCat = categories[0]?.name || 'Sunscreens';
                      const defaultSlug = categories[0]?.slug || 'sunscreens';
                      setProductFormData({
                        name: '',
                        price: '' as any,
                        originalPrice: '' as any,
                        description: '',
                        category: defaultCat,
                        categorySlug: defaultSlug,
                        stockQuantity: 25,
                        imageUrl: '',
                        badge: 'NEW',
                        volume: 'Standard',
                        skinType: 'All Skin Types',
                        inStock: true,
                      });
                      setIsProductModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs self-start"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Uploaded Products Table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 text-gray-500 uppercase font-semibold border-b border-gray-100">
                        <tr>
                          <th className="py-3 px-4">Product</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Price (₦)</th>
                          <th className="py-3 px-4">Date Added</th>
                          <th className="py-3 px-4">Stock</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-gray-400">
                              No uploaded products found. Click &quot;Add New Product&quot; to upload your first product.
                            </td>
                          </tr>
                        ) : (
                          products.map((product) => (
                            <tr key={product.id} className="hover:bg-stone-50/50 transition">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-gray-200 flex items-center justify-center">
                                    {product.imageUrl ? (
                                      /* eslint-disable-next-line @next/next/no-img-element */
                                      <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Package className="w-5 h-5 text-stone-400" />
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-bold text-gray-900 block">{product.name}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">{product.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-700 font-medium">
                                <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200/60 font-semibold text-[11px]">
                                  {product.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-sans font-bold text-gray-950">
                                {formatNaira(product.price)}
                              </td>
                              <td className="py-3 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                                {product.createdAt ? formatDate(product.createdAt) : 'Recently'}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                    product.stockQuantity <= 5
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {product.stockQuantity} units
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setProductFormData({
                                        ...product,
                                        category: product.category || categories[0]?.name || 'Sunscreens',
                                        categorySlug: product.categorySlug || categories[0]?.slug || 'sunscreens',
                                      });
                                      setIsProductModalOpen(true);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-600 hover:text-emerald-700 text-gray-600 transition flex items-center gap-1 shadow-2xs bg-white"
                                    title="Edit Product"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span className="font-semibold text-[11px]">Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(product.id, product.name)}
                                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-rose-600 hover:text-rose-600 text-gray-500 transition flex items-center gap-1 shadow-2xs bg-white"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="font-semibold text-[11px]">Delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CATEGORIES TAB */}
            {activeTab === 'categories' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                      Product Categories
                    </h2>
                    <p className="text-xs text-gray-500">
                      Manage the 6 official skincare categories. These appear in the product upload dropdown and storefront filter pills.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetCategories}
                      className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 hover:bg-stone-100 text-gray-700 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset to 6 Official Categories</span>
                    </button>
                  </div>
                </div>

                {/* Categories Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {categories.map((cat, idx) => {
                    const productCount = products.filter(
                      (p) =>
                        p.categorySlug === cat.slug ||
                        p.category.toLowerCase() === cat.name.toLowerCase()
                    ).length;

                    return (
                      <div
                        key={cat.id || cat.slug}
                        className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-gray-400">
                              #{idx + 1}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                              {productCount} {productCount === 1 ? 'product' : 'products'}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-gray-900">{cat.name}</h3>
                          {cat.description && (
                            <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">
                              {cat.description}
                            </p>
                          )}
                          <p className="text-[10px] font-mono text-gray-400">
                            Slug: {cat.slug}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-emerald-700 font-bold">Active in Catalog</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="text-gray-400 hover:text-rose-600 p-1"
                            title="Remove category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add New Custom Category Card */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs max-w-md space-y-3">
                  <h3 className="font-bold text-sm text-gray-900">Add New Category</h3>
                  <form onSubmit={handleAddCategory} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Category Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Body Lotions & Oils"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs font-semibold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Category</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 3. SETTINGS TAB (Bank Details + Banner + Brand Name) */}
            {activeTab === 'settings' && settingsForm && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                      Bank Transfer & Store Settings
                    </h2>
                    <p className="text-xs text-gray-500">
                      Update your bank details, store banner, brand name, and WhatsApp line.
                    </p>
                  </div>
                  {savedToast && (
                    <div className="bg-emerald-100 text-emerald-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
                      <CheckCircle className="w-4 h-4 text-emerald-700" />
                      <span>Saved successfully!</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Bank Account Settings */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-emerald-600 space-y-4 shadow-xs">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-emerald-900 font-bold">
                      <Landmark className="w-5 h-5 text-emerald-700" />
                      <span>Official Bank Transfer Account (Displayed to Customers)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Bank Name</label>
                        <select
                          value={settingsForm.bankDetails.bankName}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              bankDetails: { ...settingsForm.bankDetails, bankName: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-bold"
                        >
                          {NIGERIAN_BANKS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Account Name</label>
                        <input
                          type="text"
                          required
                          value={settingsForm.bankDetails.accountName}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              bankDetails: {
                                ...settingsForm.bankDetails,
                                accountName: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Account Number (NUBAN)</label>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          value={settingsForm.bankDetails.accountNumber}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              bankDetails: {
                                ...settingsForm.bankDetails,
                                accountNumber: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono font-bold text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Store Brand & Contact Information */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 space-y-4 shadow-xs text-xs">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-gray-900 font-bold">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span>Store Brand & Contact Information</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Store Brand Name</label>
                        <input
                          type="text"
                          required
                          value={settingsForm.brandName || ''}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              brandName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Owner WhatsApp (+234...)
                        </label>
                        <input
                          type="tel"
                          required
                          value={settingsForm.ownerWhatsApp || ''}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, ownerWhatsApp: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-bold"
                        />
                      </div>
                    </div>

                    {/* Permanent Store Banner Notice & Preview */}
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-gray-800 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Official Store Banner (Permanent)</span>
                        </label>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[9px] uppercase tracking-wider">
                          Locked Permanent Identity
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-stone-50 border border-gray-200 rounded-2xl">
                        <div className="w-48 sm:w-56 h-20 sm:h-24 bg-white rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center p-2 shadow-2xs shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/images/permanent-banner.svg"
                            alt="MD Skincare Haven Official Banner"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="space-y-1 text-center sm:text-left">
                          <h4 className="font-bold text-gray-900 text-xs">
                            MD Skincare Haven Official Identity
                          </h4>
                          <p className="text-[11px] text-gray-500 leading-relaxed">
                            Your official brand identity graphic is permanently locked as the hero banner across your storefront. It cannot be altered from this panel.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
                    </button>
                  </div>
                </form>

                {/* Admin Password Change Form */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 max-w-md space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <KeyRound className="w-4 h-4 text-emerald-700" />
                    <span>Change Admin Password</span>
                  </div>

                  {passMsg.text && (
                    <p
                      className={`font-semibold ${
                        passMsg.isError ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {passMsg.text}
                    </p>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-2">
                    <div>
                      <input
                        type="password"
                        required
                        placeholder="Current password"
                        value={oldPass}
                        onChange={(e) => setOldPass(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        required
                        placeholder="New password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-stone-800 text-white font-bold rounded-xl"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 4. ANALYTICS & SALES SUMMARIES TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                      Sales Summaries & Revenue
                    </h2>
                    <p className="text-xs text-gray-500">
                      Track confirmed bank transfer revenue, pending payments, and best-selling skincare items.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {stats?.salesSummaryResetAt && (
                      <button
                        type="button"
                        onClick={handleRestoreSalesSummary}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-stone-50 text-gray-700 text-xs font-bold transition shadow-2xs"
                        title="Restore calculation across all historical orders"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Restore Full History</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsResetSalesModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 text-xs font-bold transition shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                      <span>Reset Sales Summary</span>
                    </button>
                  </div>
                </div>

                {/* Sales Summary Reset Active Notice */}
                {stats?.salesSummaryResetAt && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2 text-amber-950">
                      <Info className="w-4 h-4 shrink-0 text-amber-700" />
                      <span>
                        <strong>Sales figures reset active:</strong> Displayed sales metrics and revenue summaries are calculated from orders placed after{' '}
                        <span className="font-semibold underline">{formatDate(stats.salesSummaryResetAt)}</span>.
                        All customer orders remain safely saved in the store database ({stats.totalHistoricalOrders || orders.length} total orders preserved).
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRestoreSalesSummary}
                      className="text-xs font-bold text-amber-900 hover:text-black underline shrink-0 cursor-pointer"
                    >
                      Restore Full History
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase">Confirmed Revenue</span>
                    <p className="font-sans text-xl font-black text-emerald-950 mt-1">
                      {formatNaira(stats?.confirmedRevenue || 0)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
                    <span className="text-[10px] text-amber-800 font-bold uppercase">Pending Payments</span>
                    <p className="font-sans text-xl font-black text-amber-900 mt-1">
                      {formatNaira(stats?.pendingRevenue || 0)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Total Orders</span>
                    <p className="font-sans text-xl font-black text-gray-900 mt-1">
                      {stats?.totalOrders || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Catalog Size</span>
                    <p className="font-sans text-xl font-black text-gray-900 mt-1">
                      {products.length} Products
                    </p>
                  </div>
                </div>

                {/* Best Selling Products */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
                  <h3 className="font-serif font-bold text-base text-gray-900">
                    Best-Selling Products
                  </h3>
                  <div className="divide-y divide-gray-100 text-xs">
                    {stats?.bestSellers && stats.bestSellers.length > 0 ? (
                      stats.bestSellers.map((item: any, idx: number) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between">
                          <span className="font-medium text-gray-800">
                            #{idx + 1} {item.name} ({item.quantity} sold)
                          </span>
                          <span className="font-bold text-emerald-950 font-sans">
                            {formatNaira(item.revenue)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 py-3">No sales yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ADD/EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-serif font-bold text-base text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400">
                ✕
              </button>
            </div>

            {productSaveError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Failed to Save Product</p>
                  <p className="text-[11px] mt-0.5">{productSaveError}</p>
                </div>
              </div>
            )}

            <form noValidate onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Brightening Vitamin C Serum"
                  value={productFormData.name || ''}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-bold text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Price (₦) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 14500"
                    value={
                      productFormData.price === undefined ||
                      productFormData.price === null ||
                      productFormData.price === ('' as any)
                        ? ''
                        : productFormData.price
                    }
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        price: e.target.value === '' ? ('' as any) : Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-bold text-emerald-950"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Stock Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 25"
                    value={
                      productFormData.stockQuantity === undefined ||
                      productFormData.stockQuantity === null ||
                      productFormData.stockQuantity === ('' as any)
                        ? ''
                        : productFormData.stockQuantity
                    }
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        stockQuantity: e.target.value === '' ? ('' as any) : Number(e.target.value),
                        inStock: Number(e.target.value) > 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-semibold text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={
                    productFormData.category ||
                    (categories.length > 0 ? categories[0].name : OFFICIAL_CATEGORIES[0].name)
                  }
                  onChange={(e) => {
                    const activeCats = categories.length > 0 ? categories : OFFICIAL_CATEGORIES;
                    const selCat = activeCats.find((c) => c.name === e.target.value);
                    setProductFormData({
                      ...productFormData,
                      category: e.target.value,
                      categorySlug:
                        selCat?.slug ||
                        e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-semibold text-gray-900"
                >
                  {(categories.length > 0 ? categories : OFFICIAL_CATEGORIES).map((c) => (
                    <option key={c.id || c.slug} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  Select the skincare category for this product.
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Product Image <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <input
                  type="file"
                  id="admin-product-image-file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="sr-only"
                />

                {productFormData.imageUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-stone-50 border border-gray-200 rounded-2xl">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={productFormData.imageUrl}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Image Attached
                      </span>
                      <p className="text-[10px] text-gray-500 truncate">
                        Selected directly from your device
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label
                        htmlFor="admin-product-image-file"
                        className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-stone-100 text-gray-800 font-bold text-xs shadow-2xs transition cursor-pointer"
                      >
                        Change
                      </label>
                      <button
                        type="button"
                        onClick={() => setProductFormData((prev) => ({ ...prev, imageUrl: '' }))}
                        className="p-1.5 text-gray-400 hover:text-rose-600 transition"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="admin-product-image-file"
                    className="w-full border-2 border-dashed border-stone-300 hover:border-emerald-500 bg-stone-50/80 hover:bg-emerald-50/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer text-center block"
                  >
                    <UploadCloud className="w-6 h-6 text-emerald-600 mx-auto" />
                    <span className="font-bold text-gray-800 text-xs sm:text-sm block">
                      {uploadingImage ? 'Attaching Image...' : 'Upload Image from Device (Optional)'}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      Tap or click to select a photo from your phone or computer, or leave blank to save without an image
                    </span>
                  </label>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Formulated with 15% pure ethyl-ascorbic acid and alpha-arbutin for clear, glowing melanin skin."
                  value={productFormData.description || ''}
                  onChange={(e) =>
                    setProductFormData({ ...productFormData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-stone-100 text-gray-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct || uploadingImage}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95 text-xs sm:text-sm"
                >
                  {savingProduct ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : uploadingImage ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Attaching Image...</span>
                    </>
                  ) : editingProduct ? (
                    'Save Changes'
                  ) : (
                    'Save Now'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PRODUCT CONFIRMATION MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => !deletingProduct && setProductToDelete(null)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl border border-rose-100 z-10 text-xs">
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-base text-gray-900">
                  Delete Product?
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Are you sure you want to permanently delete this product?
                </p>
              </div>
              <button
                type="button"
                disabled={deletingProduct}
                onClick={() => setProductToDelete(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-1.5">
              <p className="font-bold text-gray-900 text-sm">{productToDelete.name}</p>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                This will permanently remove this product from your inventory, database, and customer storefront immediately. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={deletingProduct}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-stone-50 font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingProduct}
                onClick={confirmDeleteProduct}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {deletingProduct ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT / SCREENSHOT MODAL */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="font-mono font-bold text-emerald-950">
                {selectedOrderDetail.id}
              </span>
              <button onClick={() => setSelectedOrderDetail(null)}>✕</button>
            </div>

            <p>
              <strong>Customer:</strong> {selectedOrderDetail.customer.name}
            </p>
            <p>
              <strong>Location:</strong> {selectedOrderDetail.customer.location}
            </p>
            <p>
              <strong>Total:</strong> {formatNaira(selectedOrderDetail.totalAmount)}
            </p>

            {selectedOrderDetail.paymentProof?.receiptUrl && (
              <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-200 p-1 flex justify-center bg-stone-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedOrderDetail.paymentProof.receiptUrl}
                  alt="Receipt"
                  className="max-w-full rounded-lg"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="px-4 py-2 bg-stone-100 text-gray-700 font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET ORDERS CONFIRMATION MODAL */}
      {isResetOrdersModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => !resettingOrders && setIsResetOrdersModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl border border-rose-100 z-10 text-xs">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-gray-900">
                    Reset Customer Orders
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Permanently clear order records from the order management system.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={resettingOrders}
                onClick={() => setIsResetOrdersModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Scope Selection */}
            <div className="space-y-2">
              <label className="block font-bold text-gray-800">
                Select which orders to delete:
              </label>
              <div className="space-y-1.5">
                {[
                  {
                    value: 'all',
                    label: 'All Orders',
                    desc: `Permanently delete all ${orders.length} order records`,
                    count: orders.length,
                  },
                  {
                    value: 'Pending Payment',
                    label: 'Pending Payment Orders Only',
                    desc: 'Delete unverified pending transfers',
                    count: orders.filter((o) => o.status === 'Pending Payment').length,
                  },
                  {
                    value: 'Payment Confirmed',
                    label: 'Payment Confirmed Orders Only',
                    desc: 'Delete completed orders with confirmed payments',
                    count: orders.filter((o) => o.status === 'Payment Confirmed').length,
                  },
                  {
                    value: 'Delivered',
                    label: 'Delivered Orders Only',
                    desc: 'Delete completed & delivered orders',
                    count: orders.filter((o) => o.status === 'Delivered').length,
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                      resetOrdersScope === opt.value
                        ? 'border-rose-300 bg-rose-50/60 text-gray-900 font-semibold'
                        : 'border-gray-200 bg-stone-50 hover:bg-white text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resetScope"
                      value={opt.value}
                      checked={resetOrdersScope === opt.value}
                      onChange={(e) => setResetOrdersScope(e.target.value)}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{opt.label}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white border border-gray-200 text-gray-600">
                          {opt.count} {opt.count === 1 ? 'order' : 'orders'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Permanent Warning Box */}
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-[11px] space-y-1.5 text-rose-950">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Permanent Deletion Warning</span>
              </div>
              <p>
                This action will <strong>permanently erase</strong> the selected order records from your database.
                This operation cannot be undone once confirmed.
              </p>
              <p className="text-gray-600 text-[10px] pt-1 border-t border-rose-200/60">
                ✓ Products, stock inventory, categories, store banners, and bank settings are completely safe and will <strong>not</strong> be touched.
              </p>
            </div>

            {/* Export / Backup Option */}
            <div className="flex items-center justify-between p-3 bg-stone-50 border border-gray-200 rounded-2xl">
              <div>
                <span className="font-bold text-gray-900 block">Download Backup First</span>
                <span className="text-[10px] text-gray-500">Save a copy of your orders to your device before deleting</span>
              </div>
              <button
                type="button"
                onClick={handleExportOrdersBackup}
                className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-stone-100 text-gray-800 font-bold text-xs flex items-center gap-1 shadow-2xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={resettingOrders}
                onClick={() => setIsResetOrdersModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-stone-100 text-gray-700 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resettingOrders}
                onClick={handleResetOrders}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{resettingOrders ? 'Resetting Orders...' : 'Confirm & Permanently Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET SALES SUMMARY MODAL */}
      {isResetSalesModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => !resettingSales && setIsResetSalesModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl border border-amber-100 z-10 text-xs">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-gray-900">
                    Reset Sales Summary
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Clear old revenue figures and reset sales summary statistics to start fresh.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={resettingSales}
                onClick={() => setIsResetSalesModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Explanation */}
            <p className="text-gray-600 leading-relaxed">
              Resetting the sales summary resets the displayed <strong>Confirmed Revenue (₦0)</strong>, <strong>Pending Revenue (₦0)</strong>, <strong>Total Orders count (0)</strong>, and <strong>Best-Selling Products</strong> figures to begin counting freshly from now.
            </p>

            {/* Safe Separation Guarantee */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-emerald-950">
              <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-900">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Safe Reset & Separation Guarantee
              </span>
              <ul className="space-y-1.5 text-[11px] text-emerald-900 list-disc list-inside">
                <li>
                  <strong>Customer Orders are NOT deleted:</strong> All existing customer order records and payment confirmations under the Orders tab remain 100% preserved.
                </li>
                <li>
                  <strong>Products & Settings are NOT affected:</strong> Product prices, descriptions, stock quantities, categories, banners, and bank details remain unchanged.
                </li>
                <li>
                  <strong>Reversible at any time:</strong> You can click &quot;Restore Full History&quot; on the sales summary page at any time to re-aggregate your entire lifetime order history.
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={resettingSales}
                onClick={() => setIsResetSalesModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-stone-100 text-gray-700 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resettingSales}
                onClick={handleResetSalesSummary}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{resettingSales ? 'Resetting Summary...' : 'Confirm Reset Sales Summary'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ADMIN TOAST NOTIFICATION */}
      {adminToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            adminToast.isError
              ? 'bg-rose-950 text-rose-100 border-rose-800'
              : 'bg-emerald-950 text-emerald-100 border-emerald-800'
          }`}
        >
          {adminToast.isError ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{adminToast.text}</span>
        </div>
      )}
    </div>
  );
}
