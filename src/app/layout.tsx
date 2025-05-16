import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "@/styles/social-interactions.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import ToastProvider from "@/components/ToastProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jakob Szarkowicz - Photography Portfolio",
  description:
    "A visual journey through digital and analog photography, captured through contemporary and classic lenses.",
  icons: {
    icon: [
      { url: "/camera-favicon.svg", type: "image/svg+xml" },
      { url: "/camera-favicon-32.svg", sizes: "32x32", type: "image/svg+xml" },
    ],
    apple: [{ url: "/camera-favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.className} dark`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen flex flex-col overflow-x-hidden"
        suppressHydrationWarning
      >
        <AuthProvider>
          <ErrorBoundary>
            <ToastProvider>
              {!children?.toString().includes("/admin") && <Header />}
              <main
                className={`flex-grow ${!children?.toString().includes("/admin") ? "pt-16 md:pt-20" : ""}`}
              >
                <ErrorBoundary>{children}</ErrorBoundary>
              </main>
              {!children?.toString().includes("/admin") && <Footer />}
              <Analytics />
            </ToastProvider>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
