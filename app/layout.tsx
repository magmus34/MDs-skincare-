import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MD Skincare Haven',
  description:
    'Premium botanical skincare store with persistent product management, direct bank transfer checkout, and WhatsApp order confirmation.',
  openGraph: {
    title: 'MD Skincare Haven',
    description:
      'Premium botanical skincare store with persistent product management, direct bank transfer checkout, and WhatsApp order confirmation.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased min-h-screen bg-stone-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
