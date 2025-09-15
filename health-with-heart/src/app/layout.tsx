import type { Metadata } from 'next';
import {
  Geist,
  Geist_Mono,
  Montserrat,
  Work_Sans,
  Yrsa,
} from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const workSans = Work_Sans({
  variable: '--font-work-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const yrsa = Yrsa({
  variable: '--font-yrsa',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Health With Heart - Executive Medical Reports',
  description: 'Executive Medical Report Platform for Health With Heart',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${workSans.variable} ${yrsa.variable} antialiased`}
      >
        <UserProvider>{children}</UserProvider>
        <Toaster
          position='top-right'
          toastOptions={{
            style: {
              background: '#F2EFED',
              color: '#586D6A',
              border: '1px solid #B6D9CE',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            },
            className: 'font-work-sans-regular',
          }}
          theme='light'
        />
      </body>
    </html>
  );
}
