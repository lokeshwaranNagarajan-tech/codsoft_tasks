import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ToastProvider from '@/components/ui/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AMCET ERP - Annai Mira College of Engineering and Technology',
  description: 'Official College ERP Management System for Annai Mira College of Engineering and Technology (AMCET)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-900 text-slate-100">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased`}>
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
