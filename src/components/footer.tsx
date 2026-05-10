'use client'

import { ShoppingBag, Mail, Phone, MapPin } from 'lucide-react'
import { useStore } from '@/lib/store'

export function Footer() {
  const { setView, setCategoryFilter } = useStore()

  const handleCategoryClick = (category: string) => {
    setCategoryFilter(category)
    setView('shop')
  }

  return (
    <footer className="mt-auto border-t bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Store Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-amber-700">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: 'Jost, sans-serif' }}>
                Baand <span className="text-amber-400">GBB</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Premium leather bags, shoes, and accessories crafted with care. Elevate your style with our curated collection of fashion essentials.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-amber-600 hover:text-white transition-colors text-xs font-bold">
                in
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-amber-600 hover:text-white transition-colors text-xs font-bold">
                𝕏
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-amber-600 hover:text-white transition-colors text-xs font-bold">
                fb
              </a>
            </div>
          </div>

          {/* Help & Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4" style={{ fontFamily: 'Jost, sans-serif' }}>Help & Info</h3>
            <ul className="space-y-2.5 text-sm">
              <li><span className="hover:text-amber-400 cursor-pointer transition-colors">Track Your Order</span></li>
              <li><span className="hover:text-amber-400 cursor-pointer transition-colors">Shipping & Delivery</span></li>
              <li><span className="hover:text-amber-400 cursor-pointer transition-colors">Returns & Refunds</span></li>
              <li><span className="hover:text-amber-400 cursor-pointer transition-colors">FAQs</span></li>
              <li><span className="hover:text-amber-400 cursor-pointer transition-colors">Size Guide</span></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4" style={{ fontFamily: 'Jost, sans-serif' }}>Categories</h3>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => handleCategoryClick('women')} className="hover:text-amber-400 cursor-pointer transition-colors">Women&apos;s Bags</button></li>
              <li><button onClick={() => handleCategoryClick('men')} className="hover:text-amber-400 cursor-pointer transition-colors">Men&apos;s Bags</button></li>
              <li><button onClick={() => handleCategoryClick('shoes')} className="hover:text-amber-400 cursor-pointer transition-colors">Shoes</button></li>
              <li><button onClick={() => handleCategoryClick('belt')} className="hover:text-amber-400 cursor-pointer transition-colors">Belt</button></li>
              <li><button onClick={() => handleCategoryClick('kids')} className="hover:text-amber-400 cursor-pointer transition-colors">Kids</button></li>
              <li><button onClick={() => handleCategoryClick('accessories')} className="hover:text-amber-400 cursor-pointer transition-colors">Accessories</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4" style={{ fontFamily: 'Jost, sans-serif' }}>Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                info@baandgbb.com
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-amber-400 shrink-0" />
                +1 (555) 234-5678
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <span>123 Fashion Avenue<br />New York, NY 10001</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500">Business Hours</p>
              <p className="text-sm text-slate-400 mt-1">Mon — Sat: 9AM — 8PM EST</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Baand GBB. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <span className="hover:text-amber-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-amber-400 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-amber-400 cursor-pointer transition-colors">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
