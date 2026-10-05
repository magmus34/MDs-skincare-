export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  categorySlug: string;
  stockQuantity: number;
  inStock: boolean;
  featured?: boolean;
  isPopular?: boolean;
  isNewArrival?: boolean;
  imageUrl: string;
  badge?: string;
  volume?: string;
  skinType?: string;
  benefits?: string[];
  howToUse?: string;
  ingredients?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export const OFFICIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-sunscreens',
    name: 'Sunscreens',
    slug: 'sunscreens',
    description: 'Zero white-cast sunscreens designed for all melanin skin tones.',
  },
  {
    id: 'cat-cleansers',
    name: 'Cleansers & Face Washes',
    slug: 'cleansers-face-washes',
    description: 'Gentle sulfate-free face washes and clarifying botanical cleansers.',
  },
  {
    id: 'cat-serums',
    name: 'Serums & Eye Care',
    slug: 'serums-eye-care',
    description: 'Potent targeted active drops for hyperpigmentation, acne, and anti-aging.',
  },
  {
    id: 'cat-moisturisers',
    name: 'Face Moisturisers',
    slug: 'face-moisturisers',
    description: 'Deep barrier restoration creams that lock in hydration without clogging pores.',
  },
  {
    id: 'cat-body',
    name: 'Body Care, Scrubs & Soaps',
    slug: 'body-care-scrubs-soaps',
    description: 'Whipped African butters, body scrubs, and glowing botanical soaps.',
  },
  {
    id: 'cat-bundles',
    name: 'Bundles & Sets',
    slug: 'bundles-sets',
    description: 'Curated morning & evening routines for total skin transformation.',
  },
];

export type OrderStatus =
  | 'Pending Payment'
  | 'Payment Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface Customer {
  name: string;
  location: string;
  whatsappNumber: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  deliveryNotes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  subtotal: number;
  volume?: string;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions?: string;
}

export interface PaymentProof {
  bankReference?: string;
  senderName?: string;
  paidAt?: string;
  notes?: string;
  receiptUrl?: string;
}

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee?: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  bankDetails: BankDetails;
  paymentProof?: PaymentProof;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
}

export interface StoreBanner {
  brandName?: string;
  announcementText?: string;
  heading?: string;
  subheading?: string;
  imageUrl?: string;
}

export interface StoreSettings {
  brandName: string;
  tagline?: string;
  announcementText?: string;
  ownerWhatsApp: string;
  contactEmail?: string;
  storeAddress?: string;
  bankDetails: BankDetails;
  banner?: StoreBanner;
  heroBanner?: StoreBanner;
  salesSummaryResetAt?: string;
}
