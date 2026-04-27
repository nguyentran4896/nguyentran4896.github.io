import type { MDXComponents } from "mdx/types"
import type { ImgHTMLAttributes } from "react"

export const mdxComponents: MDXComponents = {
  h2: ({ children, ...props }) => (
    <h2
      {...props}
      className="font-sans text-2xl md:text-3xl font-light italic mt-16 mb-5 leading-tight"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      {...props}
      className="font-sans text-xl md:text-2xl font-light italic mt-12 mb-4 leading-tight"
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p {...props} className="my-5 text-base md:text-lg leading-[1.8] text-white/70">
      {children}
    </p>
  ),
  a: ({ children, ...props }) => (
    <a
      {...props}
      className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent transition-colors"
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul {...props} className="my-5 space-y-2 pl-6 list-disc marker:text-accent text-white/70">
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol {...props} className="my-5 space-y-2 pl-6 list-decimal marker:text-accent text-white/70">
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li {...props} className="leading-relaxed">
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      {...props}
      className="my-8 pl-6 border-l border-white/20 font-sans text-xl md:text-2xl italic font-light text-white/85 leading-snug"
    >
      {children}
    </blockquote>
  ),
  hr: (props) => <hr {...props} className="my-12 border-0 border-t border-white/10" />,
  code: ({ children, ...props }) => (
    <code
      {...props}
      className="font-mono text-[0.85em] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/90"
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre
      {...props}
      className="my-6 p-5 overflow-x-auto rounded-md border border-white/10 bg-white/[0.02] font-mono text-sm leading-relaxed"
    >
      {children}
    </pre>
  ),
  img: (props: ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      {...props}
      className="my-8 w-full rounded-md border border-white/10"
      alt={props.alt ?? ""}
    />
  ),
  strong: ({ children, ...props }) => (
    <strong {...props} className="text-white font-medium">
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em {...props} className="italic">
      {children}
    </em>
  ),
}
