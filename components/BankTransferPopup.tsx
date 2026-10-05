'use client';

import React, { useState } from 'react';
import { Order } from '@/lib/types';
import { formatNaira } from '@/lib/format';
import {
  CheckCircle,
  Copy,
  Check,
  Landmark,
  MessageCircle,
  ExternalLink,
  X,
  AlertCircle,
} from 'lucide-react';

interface BankTransferPopupProps {
  order: Order | null;
  whatsAppUrl: string;
  ownerWhatsApp: string;
  brandName: string;
  onClose: () => void;
}

export const BankTransferPopup: React.FC<BankTransferPopupProps> = ({
  order,
  whatsAppUrl,
  ownerWhatsApp,
  brandName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const bank = order.bankDetails || {
    bankName: 'OPay Digital Services',
    accountName: 'Emmanuel Owolabi',
    accountNumber: '9070938624',
    instructions: 'Kindly use your Order Reference as payment narration.',
  };

  const handleCopyAccount = () => {
    try {
      navigator.clipboard.writeText(bank.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleOpenWhatsApp = () => {
    if (whatsAppUrl) {
      window.open(whatsAppUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-emerald-950/50 hover:bg-emerald-950 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-emerald-200" />
          </button>

          <div className="w-12 h-12 bg-emerald-800/80 rounded-2xl mx-auto flex items-center justify-center mb-2 shadow-inner">
            <CheckCircle className="w-7 h-7 text-emerald-300" />
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold">
            Order Placed Successfully!
          </h3>
          <p className="text-xs text-emerald-200 mt-0.5">
            Order Reference: <span className="font-mono font-bold text-white">{order.id}</span>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Amount Due Banner */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">Total Payable:</span>
            <span className="font-serif font-black text-xl text-emerald-950">
              {formatNaira(order.totalAmount)}
            </span>
          </div>

          {/* Bank Details Card */}
          <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
              <Landmark className="w-4 h-4 text-emerald-700" /> Bank Transfer Account
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-emerald-100">
                <span className="text-gray-500">Bank Name:</span>
                <span className="font-bold text-gray-900">{bank.bankName}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-emerald-100">
                <span className="text-gray-500">Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-emerald-950">
                    {bank.accountNumber}
                  </span>
                  <button
                    onClick={handleCopyAccount}
                    className="p-1.5 bg-white hover:bg-emerald-100 rounded-lg text-emerald-800 transition flex items-center gap-1 border border-emerald-200 shadow-2xs"
                    title="Copy account number"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Account Name:</span>
                <span className="font-bold text-gray-900">{bank.accountName}</span>
              </div>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl text-[11px] text-gray-700 border border-emerald-100">
              <span className="font-semibold text-emerald-900">Transfer Remark/Narration: </span>
              <span className="font-mono font-bold">{order.id}</span>
            </div>
          </div>

          {/* Action Note */}
          <div className="text-[11px] text-gray-500 space-y-1">
            <p className="flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Please click the button below to message our team on WhatsApp with your payment proof.
              </span>
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-md active:scale-98"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Confirm Payment on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-gray-700 rounded-2xl font-medium text-xs transition"
            >
              Continue Browsing Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
