import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'DineDesk - Modern Restaurant Management & Dining Platform',
  description:
    'Experience seamless dining with DineDesk. Browse digital menus, order online, reserve tables, track food in real-time, and manage kitchen queues.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased font-sans`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
