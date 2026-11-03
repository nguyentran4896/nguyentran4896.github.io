import type { MDXComponents } from "mdx/types"
import type { ImgHTMLAttributes } from "react"

export const mdxComponents: MDXComponents = {
  h2: ({ children, ...props }) => (
    <h2
      {...props}
      className="font-display text-[2rem] sm:text-4xl mt-14 md:mt-16 mb-4 leading-[1.15] tracking-tight text-foreground text-balance"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      {...props}
      className="font-display text-2xl md:text-3xl mt-10 md:mt-12 mb-3 leading-tight text-foreground text-balance"
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p
      {...props}
      className="my-5 text-[1.0625rem] sm:text-[1.125rem] leading-[1.78] text-foreground/80 text-pretty"
    >
      {children}
    </p>
  ),
  a: ({ children, className, ...props }) => (
    <a
      {...props}
      className={className?.includes("heading-anchor") ? className : "text-accent-text underline decoration-accent/40 underline-offset-[5px] decoration-[1.5px] hover:decoration-accent transition-colors"}
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul
      {...props}
      className="my-6 space-y-2 pl-6 list-disc marker:text-accent text-foreground/80 text-[1.0625rem] sm:text-[1.125rem] leading-[1.78]"
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      {...props}
      className="my-6 space-y-2 pl-6 list-decimal marker:text-accent text-foreground/80 text-[1.0625rem] sm:text-[1.125rem] leading-[1.78]"
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li {...props} className="leading-[1.7] pl-1">
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      {...props}
      className="my-10 pl-6 sm:pl-8 border-l-2 border-accent/60 font-display text-2xl sm:text-3xl italic text-foreground leading-[1.3] text-balance"
    >
      {children}
    </blockquote>
  ),
  hr: (props) => (
    <hr {...props} className="my-14 border-0 flex items-center justify-center text-center after:content-['§'] after:font-display after:italic after:text-foreground/30 after:text-lg" />
  ),
  code: ({ children, ...props }) => (
    <code
      {...props}
      className="font-mono text-[0.86em] px-1.5 py-0.5 rounded-[3px] bg-foreground/[0.06] border border-border text-foreground"
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre
      {...props}
      className="my-7 p-5 overflow-x-auto rounded-2xl border border-border bg-card font-mono text-[0.85rem] leading-relaxed"
    >
      {children}
    </pre>
  ),
  img: (props: ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      loading="lazy"
      decoding="async"
      {...props}
      // w-full + h-auto lets the browser reserve space from the intrinsic
      // width/height attributes (forwarded via {...props}), preventing layout
      // shift (CLS) as article images load. Give MDX <img> real width/height.
      className="my-10 w-full h-auto rounded-2xl border border-border"
      alt={props.alt ?? ""}
    />
  ),
  strong: ({ children, ...props }) => (
    <strong {...props} className="text-foreground font-medium">
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em {...props} className="italic">
      {children}
    </em>
  ),
}
