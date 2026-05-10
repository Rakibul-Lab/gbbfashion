'use client'

import { Cpu, Mail, Phone, MapPin } from 'lucide-react'
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
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-teal-500 to-emerald-500">
                <Cpu className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Baand <span className="text-teal-400">GBB</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Next-generation AI-powered maintenance solutions that predict, diagnose, and resolve challenges before they impact your operations.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-600 hover:text-white transition-colors text-xs font-bold">
                in
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-600 hover:text-white transition-colors text-xs font-bold">
                𝕏
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-600 hover:text-white transition-colors text-xs font-bold">
                yt
              </a>
            </div>
          </div>

          {/* Help & Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Help & Info</h3>
            <ul className="space-y-2.5 text-sm">
              <li><span className="hover:text-teal-400 cursor-pointer transition-colors">Track Your Order</span></li>
              <li><span className="hover:text-teal-400 cursor-pointer transition-colors">Shipping & Delivery</span></li>
              <li><span className="hover:text-teal-400 cursor-pointer transition-colors">Returns & Refunds</span></li>
              <li><span className="hover:text-teal-400 cursor-pointer transition-colors">FAQs</span></li>
              <li><span className="hover:text-teal-400 cursor-pointer transition-colors">Size Guide</span></li>
            </ul>
          </div>

          {/* Categories / Services */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Categories</h3>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => handleCategoryClick('diagnostics')} className="hover:text-teal-400 cursor-pointer transition-colors">Diagnostics</button></li>
              <li><button onClick={() => handleCategoryClick('predictive')} className="hover:text-teal-400 cursor-pointer transition-colors">Predictive</button></li>
              <li><button onClick={() => handleCategoryClick('monitoring')} className="hover:text-teal-400 cursor-pointer transition-colors">Monitoring</button></li>
              <li><button onClick={() => handleCategoryClick('robotic')} className="hover:text-teal-400 cursor-pointer transition-colors">Robotic</button></li>
              <li><button onClick={() => handleCategoryClick('analytics')} className="hover:text-teal-400 cursor-pointer transition-colors">Analytics</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-teal-400 shrink-0" />
                info@baandgbb.com
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-teal-400 shrink-0" />
                +1 (555) 234-5678
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
                <span>123 Innovation Drive<br />San Francisco, CA 94105</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500">Business Hours</p>
              <p className="text-sm text-slate-400 mt-1">Mon — Fri: 9AM — 6PM PST</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Baand GBB. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <span className="hover:text-teal-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-teal-400 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-teal-400 cursor-pointer transition-colors">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
