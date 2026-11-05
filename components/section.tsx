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
    <section id={id} data-swarm className={`relative px-5 py-16 sm:px-8 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <header className="reveal mb-8 max-w-3xl sm:mb-10">
          <p data-swt="eyebrow" className="font-mono text-xs uppercase tracking-[0.18em] text-accent-text">{eyebrow}</p>
          <h2 className="mt-3 text-balance font-display text-4xl leading-[1.05] sm:text-5xl">{title}</h2>
        </header>
        {children}
      </div>
    </section>
  )
}
