'use client'

import { Cpu, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500">
                <Cpu className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Baand <span className="text-teal-400">GBB</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Next-generation AI-powered maintenance solutions that predict, diagnose, and resolve challenges before they impact your operations.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Products</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-teal-400 cursor-pointer transition-colors">AI Diagnostics</span></li>
              <li><span className="hover:text-teal-400 cursor-pointer transition-colors">Predictive Maintenance</span></li>
              <li><span className="hover:text-teal-400 cursor-pointer transition-colors">Smart Monitoring</span></li>
              <li><span className="hover:text-teal-400 cursor-pointer transition-colors">Robotic Solutions</span></li>
              <li><span className="hover:text-teal-400 cursor-pointer transition-colors">Analytics Platform</span></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-teal-400 cursor-pointer transition-colors">About Us</span></li>
              <li><span className="hover:text-teal-400 cursor-pointer transition-colors">Careers</span></li>
              <li><span className="hover:text-teal-400 cursor-pointer transition-colors">Blog</span></li>
              <li><span className="hover:text-teal-400 cursor-pointer transition-colors">Press</span></li>
              <li><span className="hover:text-teal-400 cursor-pointer transition-colors">Partners</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-400" />
                info@baandgbb.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-teal-400" />
                +1 (555) 234-5678
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-teal-400 mt-0.5" />
                <span>123 Innovation Drive<br />San Francisco, CA 94105</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Baand GBB. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="hover:text-teal-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-teal-400 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-teal-400 cursor-pointer transition-colors">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
