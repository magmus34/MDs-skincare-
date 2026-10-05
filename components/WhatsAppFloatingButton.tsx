'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { sanitizePhoneForWhatsApp } from '@/lib/format';

interface WhatsAppFloatingButtonProps {
  ownerWhatsApp: string;
  brandName: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  ownerWhatsApp,
  brandName,
}) => {
  const phone = sanitizePhoneForWhatsApp(ownerWhatsApp || '+2349070938624');
  const message = encodeURIComponent(
    `Hello ${brandName}! I am shopping on your website and would like to ask a quick question about your skincare products.`
  );
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <aside aria-label="Customer Support">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 bg-emerald-700 hover:bg-emerald-800 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition group"
        title="Chat with us on WhatsApp"
        aria-label="Chat with store support on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 text-emerald-200 fill-emerald-200 group-hover:rotate-6 transition" />
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          Chat With Us
        </span>
      </a>
    </aside>
  );
};
