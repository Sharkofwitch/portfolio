import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jakob Szarkowicz - Photography Portfolio",
  description: "A visual journey through digital and analog photography, captured through contemporary and classic lenses.",
  icons: {
    icon: [
      { url: '/camera-favicon.svg', type: 'image/svg+xml' },
      { url: '/camera-favicon-32.svg', sizes: '32x32', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/camera-favicon.svg', type: 'image/svg+xml' }
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.className} dark`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          {/* Header and Footer won't be shown in admin pages */}
          {!children?.toString().includes('/admin') && <Header />}
          <main className={`flex-grow ${!children?.toString().includes('/admin') ? 'pt-16' : ''}`}>
            {children}
          </main>
          {!children?.toString().includes('/admin') && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}
