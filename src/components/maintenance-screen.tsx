'use client'

import { motion } from 'framer-motion'
import type { MaintenanceSettings } from '@/lib/maintenance-settings'

type Props = {
  settings: MaintenanceSettings
}

/**
 * Full-viewport maintenance template — brand-first, calm editorial fashion mood.
 */
export function MaintenanceScreen({ settings }: Props) {
  const title = settings.title || "We'll be back soon"
  const message =
    settings.message ||
    'GBB Fashion is undergoing scheduled maintenance. Please check back shortly.'

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0c0a09] text-[#faf7f2]">
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(180,83,9,0.28), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 100%, rgba(68,64,60,0.45), transparent 50%), radial-gradient(ellipse 50% 40% at 0% 80%, rgba(120,53,15,0.2), transparent 45%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />

      {/* Soft orbiting ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] h-[min(70vw,520px)] w-[min(70vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/15"
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] h-[min(52vw,380px)] w-[min(52vw,380px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
        animate={{ rotate: -360 }}
        transition={{ duration: 110, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-[family-name:Georgia,serif] text-3xl tracking-[0.28em] text-amber-200/90 sm:text-4xl"
        >
          GBB
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-1 text-[11px] font-medium uppercase tracking-[0.45em] text-stone-400"
        >
          Fashion
        </motion.p>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 h-px w-24 origin-center bg-gradient-to-r from-transparent via-amber-500/70 to-transparent"
        />

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 max-w-xl font-[family-name:Georgia,serif] text-3xl leading-tight text-[#faf7f2] sm:text-5xl"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-lg text-sm leading-relaxed text-stone-400 sm:text-base"
        >
          {message}
        </motion.p>

        {settings.eta ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-wide text-amber-100/90"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
            Expected return: {settings.eta}
          </motion.p>
        ) : null}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-14 flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-stone-500"
        >
          <span className="inline-block h-px w-6 bg-stone-600" />
          Temporarily closed
          <span className="inline-block h-px w-6 bg-stone-600" />
        </motion.div>
      </div>
    </div>
  )
}
