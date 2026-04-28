import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-[48ch] w-full">
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
          00 — Offline
        </p>
        <h1 className="font-sans font-light italic leading-[1.05] tracking-tight text-4xl sm:text-5xl md:text-6xl">
          You&rsquo;re offline.
        </h1>
        <p className="mt-6 text-foreground/65 leading-relaxed">
          The page you requested isn&rsquo;t cached on this device. Reconnect and try again, or
          head back to a page you&rsquo;ve already visited.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <Link
            href="/"
            className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground hover:text-accent transition-colors"
          >
            ← Home
          </Link>
        </div>
      </div>
    </main>
  )
}
