export function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id?: string
  eyebrow: string
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`px-5 py-20 sm:px-8 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <header className="reveal mb-12 max-w-3xl sm:mb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-text">{eyebrow}</p>
          <h2 className="mt-4 text-balance font-display text-4xl leading-[1.05] sm:text-6xl">{title}</h2>
        </header>
        {children}
      </div>
    </section>
  )
}
