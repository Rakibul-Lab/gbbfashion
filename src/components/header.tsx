'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ShoppingCart,
  Menu,
  ChevronDown,
  Settings,
  Home,
  Store,
  Cpu,
} from 'lucide-react'

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'diagnostics', label: 'AI Diagnostics' },
  { value: 'predictive', label: 'Predictive Maintenance' },
  { value: 'monitoring', label: 'Smart Monitoring' },
  { value: 'robotic', label: 'Robotic Maintenance' },
  { value: 'analytics', label: 'AI Analytics' },
]

export function Header() {
  const { setView, setCategoryFilter, cartCount } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const count = cartCount()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-teal-600">Baand</span>{' '}
              <span className="text-slate-900">GBB</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('home')}
              className="text-slate-600 hover:text-teal-600"
            >
              <Home className="h-4 w-4 mr-1" />
              Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('shop')}
              className="text-slate-600 hover:text-teal-600"
            >
              <Store className="h-4 w-4 mr-1" />
              Shop
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-teal-600">
                  Categories
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.value}
                    onClick={() => {
                      setCategoryFilter(cat.value)
                      setView('shop')
                    }}
                  >
                    {cat.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('cart')}
              className="relative text-slate-600 hover:text-teal-600"
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('admin')}
              className="hidden sm:flex text-slate-400 hover:text-slate-600"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-600">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="text-lg font-bold mb-4">
                  <span className="text-teal-600">Baand</span>{' '}
                  <span className="text-slate-900">GBB</span>
                </SheetTitle>
                <nav className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => { setView('home'); setMobileOpen(false) }}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => { setView('shop'); setMobileOpen(false) }}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Shop
                  </Button>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">Categories</div>
                  {categories.map((cat) => (
                    <Button
                      key={cat.value}
                      variant="ghost"
                      className="justify-start pl-8"
                      onClick={() => {
                        setCategoryFilter(cat.value)
                        setView('shop')
                        setMobileOpen(false)
                      }}
                    >
                      {cat.label}
                    </Button>
                  ))}
                  <div className="border-t my-2" />
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => { setView('admin'); setMobileOpen(false) }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
