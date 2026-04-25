import type React from "react"
import type { Metadata, Viewport } from "next"
import { Playfair_Display, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { site } from "@/lib/content"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
}

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased overflow-x-hidden">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[10001] focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:font-mono focus:text-xs focus:tracking-widest focus:uppercase focus:rounded-full"
        >
          Skip to content
        </a>
        <div className="noise-overlay" />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
