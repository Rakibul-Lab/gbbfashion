'use client'

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-900">
      {/* Full-width banner image */}
      <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[580px]">
        <img
          src="/products/hero-banner-wide.png"
          alt="Baand GBB - AI-Powered Maintenance Solutions"
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle gradient overlay at bottom for smooth transition */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
      </div>
    </section>
  )
}
