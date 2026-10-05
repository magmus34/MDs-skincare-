'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cart';
import { formatNaira } from '@/lib/format';
import { Order } from '@/lib/types';
import {
  X,
  User,
  MapPin,
  Phone,
  MessageSquare,
  Landmark,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface CheckoutPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order, whatsAppUrl: string) => void;
  bankName: string;
}

export const CheckoutPopup: React.FC<CheckoutPopupProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  bankName,
}) => {
  const { items, subtotal, clearCart } = useCart();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [note, setNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Please enter your delivery address or city');
      return;
    }
    if (!whatsapp.trim()) {
      setErrorMsg('Please enter your WhatsApp phone number');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Your shopping bag is empty.');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        customer: {
          name: name.trim(),
          location: location.trim(),
          whatsappNumber: whatsapp.trim(),
          deliveryNotes: note.trim() || undefined,
        },
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          imageUrl: i.product.imageUrl,
          volume: i.product.volume,
          subtotal: i.product.price * i.quantity,
        })),
        subtotal: subtotal,
        totalAmount: subtotal,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record your order in database.');
      }

      // Clear local cart now that the database permanently confirmed the order
      clearCart();

      // Trigger success and bank details popup
      onOrderSuccess(data.order, data.whatsAppUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error while placing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900">
                Direct Bank Transfer Checkout
              </h3>
              <p className="text-[11px] text-gray-500">
                Place order & transfer to {bankName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Summary Banner */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-500">Items: </span>
              <span className="font-bold text-gray-900">
                {items.reduce((s, i) => s + i.quantity, 0)} products
              </span>
            </div>
            <div>
              <span className="text-gray-500">Total Due: </span>
              <span className="font-bold text-emerald-800 text-sm">
                {formatNaira(subtotal)}
              </span>
            </div>
          </div>

          {/* 3 Core Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" /> Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chioma Adebayo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Delivery Address / City *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. 12 Admiralty Way, Lekki Phase 1, Lagos"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-700" /> WhatsApp Phone Number *
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 08023456789 or +234..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 outline-none transition"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Order confirmation and bank payment verification will be communicated here.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-gray-400" /> Delivery Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Special delivery instructions or gate code..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-emerald-700 outline-none transition"
              />
            </div>
          </div>

          {/* Transfer Security Note */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              After clicking **Complete Order & View Bank Details**, you will receive our verified account number to make your bank transfer.
            </span>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-md active:scale-98"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Order to Database...</span>
              </>
            ) : (
              <span>Complete Order & View Bank Details</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
