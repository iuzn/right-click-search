import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { FirebaseProvider } from "@/components/firebase-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "Right Click Search Extension - Powerful Customizable Right-Click Search Tool",
  description:
    "Transform your browsing experience with powerful right-click search capabilities. Select any text or image and search across multiple engines instantly. Privacy-first Chrome extension with modern design.",
  keywords: [
    "right click search",
    "Chrome extension",
    "browser search tool",
    "custom search engines",
    "text selection search",
    "image search",
    "reverse image search",
    "privacy-first extension",
    "multi-engine search",
    "tab-based interface",
    "Google search extension",
    "YouTube search",
    "GitHub search",
    "Chrome Web Store",
  ],
  authors: [{ name: "Ibrahim Uzun", url: "https://x.com/ibrahimuzn" }],
  creator: "Ibrahim Uzun",
  publisher: "Ibrahim Uzun",
  category: "Productivity",
  classification: "Browser Extension",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://right-click-search.ibrahimuzun.com",
  },
  openGraph: {
    title:
      "Right Click Search Extension - Powerful Customizable Right-Click Search Tool",
    description:
      "Transform your browsing experience with powerful right-click search capabilities. Select any text or image and search across multiple engines instantly. Privacy-first Chrome extension.",
    type: "website",
    url: "https://right-click-search.ibrahimuzun.com",
    siteName: "Right Click Search Extension",
    locale: "en_US",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Right Click Search Extension - Powerful Customizable Right-Click Search Tool",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Right Click Search Extension - Powerful Customizable Right-Click Search Tool",
    description:
      "Transform your browsing experience with powerful right-click search capabilities. Select any text or image and search across multiple engines instantly.",
    creator: "@ibrahimuzn",
    site: "@ibrahimuzn",
    images: ["/images/logo.png"],
  },
  appleWebApp: {
    capable: true,
    title: "Right Click Search",
    statusBarStyle: "default",
  },
  applicationName: "Right Click Search Extension",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://right-click-search.ibrahimuzun.com"),
  verification: {
    google: "your-google-verification-code", // Replace with actual code
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Right Click Search",
    "theme-color": "#000000",
    "color-scheme": "light dark",
    "apple-touch-icon": "/apple-touch-icon.png",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Right Click Search Extension",
    description:
      "Powerful, customizable right-click search extension for Chrome. Transform any selected text or image into instant search results across multiple search engines.",
    url: "https://right-click-search.ibrahimuzun.com",
    applicationCategory: "BrowserApplication",
    operatingSystem: "Chrome",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    downloadUrl:
      "https://chromewebstore.google.com/detail/right-click-search/EXTENSION_ID",
    author: {
      "@type": "Person",
      name: "Ibrahim Uzun",
      url: "https://x.com/ibrahimuzn",
    },
    publisher: {
      "@type": "Person",
      name: "Ibrahim Uzun",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      ratingCount: "1",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "Right-click text search",
      "Image reverse search",
      "Multiple search engines",
      "Custom search engines",
      "Tab-based organization",
      "Privacy-first design",
      "Chrome Storage sync",
      "Modern interface",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link
          rel="canonical"
          href="https://right-click-search.ibrahimuzun.com"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
        />
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="light dark" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Right Click Search" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <FirebaseProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
