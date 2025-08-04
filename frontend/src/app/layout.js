import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import UserCreationHook from "../components/UserCreationHook";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "sKrapy - Digitizing India's Scrap Ecosystem",
    template: "%s | sKrapy"
  },
  description: "Transform your scrap into cash with sKrapy. India's premier digital scrap marketplace connecting sellers and buyers for electronics, metals, and recyclable materials. Get instant quotes, doorstep pickup, and fair prices.",
  keywords: [
    "scrap dealer",
    "scrap buyer",
    "electronic waste",
    "metal scrap",
    "recyclable materials",
    "India scrap marketplace",
    "sell scrap online",
    "scrap collection",
    "waste management",
    "circular economy"
  ],
  authors: [{ name: "sKrapy Team" }],
  creator: "sKrapy",
  publisher: "sKrapy",
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
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://skrapy.com',
    siteName: 'sKrapy',
    title: "sKrapy - Digitizing India's Scrap Ecosystem",
    description: "Transform your scrap into cash with sKrapy. India's premier digital scrap marketplace connecting sellers and buyers for electronics, metals, and recyclable materials.",
    images: [
      {
        url: '/logo.svg',
        width: 498,
        height: 500,
        alt: 'sKrapy Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "sKrapy - Digitizing India's Scrap Ecosystem",
    description: "Transform your scrap into cash with sKrapy. India's premier digital scrap marketplace.",
    images: ['/logo.svg'],
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '16x16 32x32',
        type: 'image/x-icon',
      },
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.ico',
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#87C232',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang='en-IN'>
        <head>
          <link rel="canonical" href="https://skrapy.com" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "sKrapy",
                "description": "Digitizing India's scrap ecosystem",
                "url": "https://skrapy.com",
                "logo": "https://skrapy.com/logo.svg",
                "sameAs": [],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "areaServed": "IN",
                  "availableLanguage": ["English", "Hindi"]
                },
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "IN"
                }
              })
            }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <UserCreationHook />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
