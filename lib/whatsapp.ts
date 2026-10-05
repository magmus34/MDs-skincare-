import { Order } from './types';
import { formatNaira } from './format';
import { sanitizePhoneForWhatsApp } from './format';

export function getCustomerPaymentConfirmedWhatsAppUrl(
  order: Order,
  brandName: string = 'MD Skincare Haven'
): string {
  const customerPhone = sanitizePhoneForWhatsApp(order.customer.whatsappNumber);
  const itemsList = order.items
    .map((item) => `• ${item.quantity}x ${item.name} (${formatNaira(item.subtotal)})`)
    .join('\n');

  const text =
    `Hello ${order.customer.name}! 🌟\n\n` +
    `Great news from *${brandName}*!\n` +
    `Your payment of *${formatNaira(order.totalAmount)}* for Order *#${order.id}* has been confirmed! 🎉\n\n` +
    `*Order Details:*\n${itemsList}\n\n` +
    `*Delivery To:*\n${order.customer.location || 'As specified'}\n\n` +
    `We are preparing your package for immediate dispatch. Thank you for shopping with us! 🌿✨`;

  return `https://wa.me/${customerPhone}?text=${encodeURIComponent(text)}`;
}

export function getOrderWhatsAppUrl(
  order: Order,
  ownerPhone: string,
  brandName: string = 'MD Skincare Haven'
): string {
  const sanitizedOwner = sanitizePhoneForWhatsApp(ownerPhone);
  const itemsList = order.items
    .map((item) => `• ${item.quantity}x ${item.name} (${formatNaira(item.subtotal)})`)
    .join('\n');

  const text =
    `Hello *${brandName}*! 🌿\n\n` +
    `I have just placed a new order!\n\n` +
    `*Order Reference:* ${order.id}\n` +
    `*Customer Name:* ${order.customer.name}\n` +
    `*Delivery Location:* ${order.customer.location}\n` +
    `*WhatsApp Phone:* ${order.customer.whatsappNumber}\n\n` +
    `*Items Ordered:*\n${itemsList}\n\n` +
    `*Total Amount:* ${formatNaira(order.totalAmount)}\n` +
    `*Payment Method:* Direct Bank Transfer\n\n` +
    `I will be sending my proof of payment shortly. Please confirm my order! 🙏✨`;

  return `https://wa.me/${sanitizedOwner}?text=${encodeURIComponent(text)}`;
}
