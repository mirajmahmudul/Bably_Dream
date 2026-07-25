interface SectionContentProps {
  eyebrow: string
  headline: string
  description: string
  ctaLabel?: string
}

export default function SectionContent({
  eyebrow,
  headline,
  description,
  ctaLabel,
}: SectionContentProps) {
  return (
    <div className="max-w-3xl">
      <p
        className="animate-fade-rise mb-4 text-sm uppercase tracking-[0.2em]"
        style={{ color: '#C9CDD3' }}
      >
        {eyebrow}
      </p>
      <h2
        className="animate-fade-rise-delay font-display text-5xl font-normal sm:text-6xl md:text-7xl"
        style={{ lineHeight: 1, letterSpacing: '-1.5px', color: '#F2F4F7' }}
      >
        {headline}
      </h2>
      <p
        className="animate-fade-rise-delay-2 mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
        style={{ color: '#C9CDD3' }}
      >
        {description}
      </p>
      {ctaLabel && (
        <button
          type="button"
          className="animate-fade-rise-delay-2 mt-10 rounded-full px-10 py-4 text-base transition-transform duration-300 hover:scale-[1.03]"
          style={{
            backgroundColor: '#E8EAED',
            color: '#0A0A0B',
          }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
