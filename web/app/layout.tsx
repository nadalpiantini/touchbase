import type { Metadata } from "next";
import { Oswald, Inter, Lobster_Two, Geist_Mono } from "next/font/google";
import './globals.css';
import { ToastProvider } from "@/components/ui";
import { ThemeProvider } from "@/components/providers";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const lobsterTwo = Lobster_Two({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-lobster",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://touchbase.app';

export const metadata: Metadata = {
  title: {
    default: "TouchBase - Your Dugout in the Cloud",
    template: "%s | TouchBase",
  },
  description: "Modern sports management platform. Manage players, coaches, schedules, and analytics all in one powerful platform built for modern sports organizations.",
  keywords: ["sports management", "team management", "player tracking", "sports analytics", "coaching platform", "sports education"],
  authors: [{ name: "TouchBase" }],
  creator: "TouchBase",
  publisher: "TouchBase",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'es': '/es',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    alternateLocale: 'en_US',
    url: siteUrl,
    siteName: 'TouchBase',
    title: 'TouchBase - Your Dugout in the Cloud',
    description: 'Modern sports management platform. Manage players, coaches, schedules, and analytics all in one powerful platform.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TouchBase - Sports Management Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TouchBase - Your Dugout in the Cloud',
    description: 'Modern sports management platform. Manage players, coaches, schedules, and analytics all in one powerful platform.',
    images: ['/og-image.png'],
    creator: '@touchbaseapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${oswald.variable} ${inter.variable} ${lobsterTwo.variable} ${geistMono.variable} antialiased font-sans`}>
        <ThemeProvider>
          <ToastProvider>
            <a href="#main-content" className="skip-to-main">
              Skip to main content
            </a>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
