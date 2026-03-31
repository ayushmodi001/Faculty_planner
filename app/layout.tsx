import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "UAPS - University Academic Planning System",
  "operatingSystem": "Web-based",
  "applicationCategory": "AcademicPlanningApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "124"
  },
  "description": "Enterprise-grade AI-powered academic scheduling and curriculum management for modern universities. Optimize faculty workload and track syllabus coverage in real-time.",
};

export const metadata: Metadata = {
  title: {
    template: "%s | UAPS - University Academic Planning System",
    default: "UAPS | Centralized University Academic Planning & AI Scheduling",
  },
  description: "UAPS is the industry-standard platform for automated university academic scheduling, curriculum management, and AI-driven faculty alignment.",
  keywords: ["University Planning", "Academic Scheduling", "Timetable Automation", "Curriculum Management", "AI Faculty Planner", "UAPS"],
  authors: [{ name: "UAPS Engineering" }],
  creator: "UAPS Engineering",
  publisher: "University Academic Planning System",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://uaps.edu'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "UAPS | The Future of University Academic Planning",
    description: "Streamline your institution's academic cycle with our AI-powered scheduling and curriculum management engine.",
    url: "/",
    siteName: "UAPS",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UAPS Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UAPS | AI-Powered Academic Scheduling",
    description: "Enterprise-grade academic planning and scheduling automation for universities.",
    images: ["/og-image.png"],
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
    icon: "/l.png",
    shortcut: "/l.png",
    apple: "/l.png",
  },
};

import { Suspense } from "react";
import Preloader from "@/components/Preloader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <Preloader />
          </Suspense>
          {children}
          <Toaster />
          <Script
            id="json-ld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
