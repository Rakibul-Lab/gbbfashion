'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useShopNavigation } from '@/hooks/use-shop-navigation'
import { useStoreCommerce } from '@/hooks/use-store-commerce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Instagram, Facebook, Send } from 'lucide-react'
import { motion } from 'framer-motion'

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .56.04.82.12V9.01a6.27 6.27 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.77a8.18 8.18 0 0 0 4.76 1.52V6.84a4.85 4.85 0 0 1-1-.15z" />
    </svg>
  )
}

export function Footer() {
  const { setView } = useStore()
  const { goToShop, goHome } = useShopNavigation()
  const { facebookUrl, instagramUrl, tiktokUrl } = useStoreCommerce()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleCategoryClick = (category: string) => {
    goToShop({ category })
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <footer className="mt-auto bg-slate-900 text-slate-300">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Brand Info */}
          <div>
            <button
              onClick={goHome}
              className="mb-5 hover:opacity-70 transition-opacity"
            >
              <span className="text-2xl">
                <span className="font-bold text-white">GBB</span>{' '}
                <span className="font-light text-slate-400">Fashion</span>
              </span>
            </button>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">
              Premium leather bags, shoes, and accessories crafted with care. Elevate your everyday style with our curated collection of Bangladeshi fashion essentials.
            </p>
            {(instagramUrl || facebookUrl || tiktokUrl) && (
              <div className="flex items-center gap-3">
                {instagramUrl ? (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-rose-600 hover:text-white transition-colors duration-300"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                ) : null}
                {facebookUrl ? (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-rose-600 hover:text-white transition-colors duration-300"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                ) : null}
                {tiktokUrl ? (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-rose-600 hover:text-white transition-colors duration-300"
                    aria-label="TikTok"
                  >
                    <TikTokIcon className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleCategoryClick('new-arrivals')}
                  className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('prime-drop')}
                  className="text-sm text-rose-400 hover:text-rose-300 transition-colors duration-200 font-medium"
                >
                  Prime Drop
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('women')}
                  className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Shop Women
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('men')}
                  className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Shop Men
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('shoes')}
                  className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Shoes
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('accessories')}
                  className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Accessories
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('belt')}
                  className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Belt
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('kids')}
                  className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Kids
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] mb-5">
              Customer Service
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors duration-200">
                  Track Your Order
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors duration-200">
                  Shipping & Delivery
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors duration-200">
                  Returns & Refunds
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors duration-200">
                  FAQs
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors duration-200">
                  Size Guide
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] mb-5">
              Subscribe to Our Newsletter
            </h3>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 rounded-md text-sm focus:border-rose-500 focus:ring-rose-500/20 flex-1"
                  required
                />
                <Button
                  type="submit"
                  className="h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-md px-4 shrink-0 transition-colors duration-200"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            {subscribed && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-emerald-400 mt-2"
              >
                Thank you for subscribing!
              </motion.p>
            )}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500 leading-relaxed">
                By subscribing, you agree to our Privacy Policy and consent to receive marketing emails from GBB Fashion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 space-y-3">
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500 order-1 sm:order-none">
              &copy; {new Date().getFullYear()} GBB Fashion. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 order-3 sm:order-none">
              <span className="hover:text-white cursor-pointer transition-colors duration-200">
                Privacy Policy
              </span>
              <span className="hover:text-white cursor-pointer transition-colors duration-200">
                Terms of Service
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Developed by:{' '}
            <span className="text-slate-400">Ahanaf Adud &amp; Rakibul Hassan</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
