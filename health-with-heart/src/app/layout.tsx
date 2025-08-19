import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Health With Heart - Executive Medical Report Platform',
  description:
    'Unified medical system for executive medical bookings, clinical data entry, report generation, and billing',
  keywords:
    'medical, executive health, medical reports, healthcare, South Africa',
  authors: [{ name: 'Health With Heart' }],
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <div className='min-h-screen bg-background'>{children}</div>
      </body>
    </html>
  );
}
