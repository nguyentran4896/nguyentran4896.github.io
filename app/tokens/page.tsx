import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { SmoothScroll } from "@/components/smooth-scroll"
import { TokenizerPlaygroundLoader } from "@/components/tokenizer-playground-loader"

const SITE_URL = "https://nguyentran4896.github.io"

export const metadata: Metadata = {
  title: "Tokenizer Playground",
  description:
    "Interactive BPE tokenizer playground. Paste any text and watch it decompose into tokens in real time — supports o200k_base and cl100k_base encodings.",
  alternates: { canonical: "/tokens/" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/tokens/`,
    siteName: "Nguyen Tran",
    title: "Tokenizer Playground — Nguyen Tran",
    description:
      "Interactive BPE tokenizer playground. See how language models read your text.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tokenizer Playground — Nguyen Tran",
    description:
      "Interactive BPE tokenizer playground. See how language models read your text.",
    site: "@nguyentran4896",
    creator: "@nguyentran4896",
  },
}

export default function TokensPage() {
  return (
    <SmoothScroll>
      <Navbar />
      <main id="main" className="min-h-screen pt-24 pb-32">
        <TokenizerPlaygroundLoader />
      </main>
    </SmoothScroll>
  )
}
