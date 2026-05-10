'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Instagram, Facebook, Twitter, Send } from 'lucide-react'
import { motion } from 'framer-motion'

export function Footer() {
  const { setView, setCategoryFilter } = useStore()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleCategoryClick = (category: string) => {
    setCategoryFilter(category)
    setView('shop')
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
              onClick={() => setView('home')}
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
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-rose-600 hover:text-white transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-rose-600 hover:text-white transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-rose-600 hover:text-white transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
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
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Get 10% off your first order
            </p>
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} GBB Fashion. All rights reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-700 rounded px-2 py-0.5">
                Visa
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-700 rounded px-2 py-0.5">
                Mastercard
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-700 rounded px-2 py-0.5 bg-slate-800">
                bKash
              </span>
            </div>

            {/* Policy Links */}
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="hover:text-white cursor-pointer transition-colors duration-200">
                Privacy Policy
              </span>
              <span className="hover:text-white cursor-pointer transition-colors duration-200">
                Terms of Service
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
