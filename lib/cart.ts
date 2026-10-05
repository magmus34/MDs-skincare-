'use client';

import { useState, useEffect } from 'react';
import { Product } from './types';

export interface CartItem {
  product: Product;
  quantity: number;
}

const CART_STORAGE_KEY = 'md_skincare_cart_v1';
const CART_EVENT_NAME = 'md_cart_updated';

export function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(CART_EVENT_NAME, { detail: items }));
  } catch {
    // ignore
  }
}

export function addItemToCart(product: Product, quantity: number = 1): void {
  const current = getStoredCart();
  const existingIndex = current.findIndex((item) => item.product.id === product.id);

  if (existingIndex > -1) {
    current[existingIndex].quantity += quantity;
  } else {
    current.push({ product, quantity });
  }

  saveStoredCart(current);
}

export function updateCartItemQuantity(productId: string, delta: number): void {
  const current = getStoredCart();
  const existing = current.find((item) => item.product.id === productId);

  if (!existing) return;

  existing.quantity += delta;
  if (existing.quantity <= 0) {
    const filtered = current.filter((item) => item.product.id !== productId);
    saveStoredCart(filtered);
  } else {
    saveStoredCart(current);
  }
}

export function removeCartItem(productId: string): void {
  const current = getStoredCart();
  const filtered = current.filter((item) => item.product.id !== productId);
  saveStoredCart(filtered);
}

export function clearCart(): void {
  saveStoredCart([]);
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(getStoredCart());

    const handleUpdate = () => {
      setItems(getStoredCart());
    };

    window.addEventListener(CART_EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(CART_EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return {
    items: mounted ? items : [],
    totalCount: mounted ? totalCount : 0,
    subtotal: mounted ? subtotal : 0,
    addItem: addItemToCart,
    updateQuantity: updateCartItemQuantity,
    removeItem: removeCartItem,
    clearCart,
  };
}
