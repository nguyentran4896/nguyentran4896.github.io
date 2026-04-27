import type { MDXComponents } from "mdx/types"
import type { ImgHTMLAttributes } from "react"

export const mdxComponents: MDXComponents = {
  h2: ({ children, ...props }) => (
    <h2
      {...props}
      className="font-sans text-[1.6rem] sm:text-3xl md:text-[2rem] font-light italic mt-14 md:mt-16 mb-4 leading-[1.15] tracking-tight text-foreground text-balance"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      {...props}
      className="font-sans text-xl md:text-2xl font-light italic mt-10 md:mt-12 mb-3 leading-tight text-foreground text-balance"
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
  a: ({ children, ...props }) => (
    <a
      {...props}
      className="text-accent underline decoration-accent/40 underline-offset-[5px] decoration-[1.5px] hover:decoration-accent transition-colors"
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
      className="my-10 pl-6 sm:pl-8 border-l-2 border-accent/60 font-sans text-xl sm:text-2xl md:text-[1.65rem] italic font-light text-foreground/90 leading-[1.35] text-balance"
    >
      {children}
    </blockquote>
  ),
  hr: (props) => (
    <hr {...props} className="my-14 border-0 flex items-center justify-center text-center after:content-['§'] after:font-sans after:italic after:text-foreground/30 after:text-lg" />
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
      className="my-7 p-5 overflow-x-auto rounded-md border border-border bg-foreground/[0.035] font-mono text-[0.85rem] leading-relaxed"
    >
      {children}
    </pre>
  ),
  img: (props: ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      {...props}
      className="my-10 w-full rounded-md border border-border"
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
