import type React from "react"
import type { Metadata, Viewport } from "next"
import { Playfair_Display, Geist_Mono } from "next/font/google"
import Script from "next/script"
import { site, footer } from "@/lib/content"
import "./globals.css"

const GA_MEASUREMENT_ID = "G-LY955VE3JD"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

const SITE_URL = "https://nguyentran4896.github.io"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.title, template: "%s — Nguyen Tran" },
  description: site.description,
  applicationName: "Nguyen Tran Portfolio",
  authors: [{ name: "Nguyen Tran", url: SITE_URL }],
  creator: "Nguyen Tran",
  publisher: "Nguyen Tran",
  keywords: [
    "Nguyen Tran",
    "senior software engineer",
    "AI researcher",
    "medical AI",
    "computer vision",
    "model interpretability",
    "Ho Chi Minh City",
    "Vietnam",
    "portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: SITE_URL,
    siteName: "Nguyen Tran",
    title: site.title,
    description: site.description,
    locale: "en_US",
    firstName: "Nguyen",
    lastName: "Tran",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    creator: "@nguyentran4896",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "64x64" }],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  category: "technology",
}

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nguyen Tran",
  alternateName: "nguyentran4896",
  jobTitle: "Senior Software Engineer & AI Researcher",
  description: site.description,
  url: SITE_URL,
  email: `mailto:${footer.email}`,
  image: `${SITE_URL}/avatar-thailand.jpeg`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ho Chi Minh City",
    addressCountry: "VN",
  },
  sameAs: [
    "https://github.com/nguyentran4896",
    "https://www.linkedin.com/in/nguyentran4896",
  ],
  knowsAbout: [
    "Software Engineering",
    "Artificial Intelligence",
    "Medical AI",
    "Computer Vision",
    "Model Interpretability",
    "Generalisation",
    "Distributed Systems",
    "Ruby on Rails",
    "TypeScript",
    "PyTorch",
  ],
  hasOccupation: {
    "@type": "Occupation",
    name: "Senior Software Engineer & AI Researcher",
    occupationLocation: {
      "@type": "City",
      name: "Ho Chi Minh City",
    },
    skills:
      "Software engineering, distributed systems, medical AI, computer vision, model interpretability",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Ho Chi Minh University of Technology (HCMUT)",
  },
  worksFor: {
    "@type": "Organization",
    name: "Employment Hero",
  },
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.title,
  description: site.description,
  url: SITE_URL,
  inLanguage: "en",
  author: { "@type": "Person", name: "Nguyen Tran", url: SITE_URL },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${geistMono.variable}`}>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body className="font-sans antialiased overflow-x-hidden">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[10001] focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:font-mono focus:text-xs focus:tracking-widest focus:uppercase focus:rounded-full"
        >
          Skip to content
        </a>
        <div className="noise-overlay" />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  )
}
