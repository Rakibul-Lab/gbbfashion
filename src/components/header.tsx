'use client'

import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  ShoppingCart,
  Menu,
  ChevronDown,
  Search,
  User,
  Heart,
  X,
  Settings,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'

const navCategories = [
  {
    value: 'new-arrivals',
    label: 'NEW ARRIVALS',
    subcategories: [],
  },
  {
    value: 'women',
    label: 'WOMEN',
    subcategories: [
      { value: 'hand-bag', label: 'Hand Bag' },
      { value: 'cross-body-bag', label: 'Cross Body Bag' },
      { value: 'shoulder-bag', label: 'Shoulder Bag' },
      { value: 'tote-bag', label: 'Tote Bag' },
      { value: 'mini-bag', label: 'Mini Bag' },
      { value: 'bag-pack', label: 'Bag Pack' },
    ],
  },
  {
    value: 'men',
    label: 'MEN',
    subcategories: [
      { value: 'bag-pack', label: 'Bag Pack Bag' },
      { value: 'long-wallet', label: 'Money Bag / Long Wallet' },
    ],
  },
  {
    value: 'shoes',
    label: 'SHOES',
    subcategories: [
      { value: 'man-shoes', label: 'Man Shoes' },
      { value: 'women-shoes', label: 'Women Shoes' },
    ],
  },
  {
    value: 'belt',
    label: 'BELT',
    subcategories: [
      { value: 'male-belt', label: 'Male' },
      { value: 'female-belt', label: 'Female' },
    ],
  },
  {
    value: 'kids',
    label: 'KIDS',
    subcategories: [],
  },
  {
    value: 'accessories',
    label: 'ACCESSORIES',
    subcategories: [
      { value: 'key-holder', label: 'Key Holder (Leather)' },
    ],
  },
  {
    value: 'prime-drop',
    label: 'PRIME DROP',
    subcategories: [],
  },
]

export function Header() {
  const { setView, setCategoryFilter, cartCount } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const count = cartCount()

  const handleCategoryClick = (value: string) => {
    if (value === 'new-arrivals') {
      setCategoryFilter('all')
      setView('shop')
    } else if (value === 'prime-drop') {
      setCategoryFilter('all')
      setView('shop')
    } else {
      setCategoryFilter(value)
      setView('shop')
    }
    setActiveDropdown(null)
  }

  const handleSubCategoryClick = (category: string, _subCategory: string) => {
    setCategoryFilter(category)
    setView('shop')
    setActiveDropdown(null)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      useStore.getState().setSearchQuery(searchValue.trim())
      setView('shop')
      setSearchOpen(false)
      setSearchValue('')
    }
  }

  const handleDropdownEnter = (value: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
      dropdownTimeoutRef.current = null
    }
    setActiveDropdown(value)
  }

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current)
      }
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar - Black background matching gbbfashion.com */}
      <div className="bg-slate-900 text-white text-center py-2 px-4">
        <p className="text-xs sm:text-sm tracking-wide">
          New arrivals just dropped — explore the collection.{' '}
          <button
            onClick={() => {
              setCategoryFilter('all')
              setView('shop')
            }}
            className="font-semibold text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-2"
          >
            SHOP NOW
          </button>
        </p>
      </div>

      {/* Main Header - Dark background */}
      <div className="bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
            >
              <span className="text-xl sm:text-2xl font-bold tracking-tight" style={{ fontFamily: 'Jost, sans-serif' }}>
                <span className="text-white">Baand</span>{' '}
                <span className="text-amber-400">GBB</span>
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5 h-16">
              {navCategories.map((cat) => (
                <div
                  key={cat.value}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => cat.subcategories.length > 0 && handleDropdownEnter(cat.value)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    onClick={() => handleCategoryClick(cat.value)}
                    className={`px-3 py-2 text-[13px] font-medium tracking-wider transition-colors whitespace-nowrap ${
                      activeDropdown === cat.value
                        ? 'text-amber-400'
                        : cat.value === 'prime-drop'
                        ? 'text-rose-400 hover:text-rose-300'
                        : 'text-white/80 hover:text-white'
                    }`}
                    style={{ fontFamily: 'Jost, sans-serif' }}
                  >
                    {cat.label}
                    {cat.subcategories.length > 0 && (
                      <ChevronDown className={`h-3 w-3 ml-0.5 inline-block transition-transform ${activeDropdown === cat.value ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {cat.subcategories.length > 0 && activeDropdown === cat.value && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 bg-white border border-slate-100 rounded-lg shadow-xl py-2 min-w-[220px] z-50"
                      >
                        {cat.subcategories.map((sub) => (
                          <button
                            key={sub.value}
                            onClick={() => handleSubCategoryClick(cat.value, sub.value)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors capitalize"
                          >
                            {sub.label}
                          </button>
                        ))}
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          onClick={() => handleCategoryClick(cat.value)}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors uppercase tracking-wider"
                        >
                          View All {cat.label}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-white/70 hover:text-white hover:bg-white/10 h-10 w-10"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex text-white/70 hover:text-white hover:bg-white/10 h-10 w-10"
              >
                <Heart className="h-5 w-5" />
              </Button>

              {/* Account */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex text-white/70 hover:text-white hover:bg-white/10 h-10 w-10"
              >
                <User className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('cart')}
                className="relative text-white/70 hover:text-white hover:bg-white/10 h-10 w-10"
              >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </Button>

              {/* Admin */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('admin')}
                className="hidden sm:flex text-white/30 hover:text-white/60 hover:bg-white/10 h-10 w-10"
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* Mobile menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10 h-10 w-10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                      <SheetTitle className="text-lg font-bold" style={{ fontFamily: 'Jost, sans-serif' }}>
                        <span className="text-slate-900">Baand</span>{' '}
                        <span className="text-amber-600">GBB</span>
                      </SheetTitle>
                    </div>
                    <nav className="flex-1 overflow-y-auto py-2">
                      {navCategories.map((cat) => (
                        <div key={cat.value}>
                          <div className="flex items-center justify-between px-4">
                            <button
                              className={`flex-1 text-left py-3 text-sm font-semibold tracking-wider transition-colors ${
                                cat.value === 'prime-drop'
                                  ? 'text-rose-600'
                                  : 'text-slate-700'
                              }`}
                              style={{ fontFamily: 'Jost, sans-serif' }}
                              onClick={() => {
                                handleCategoryClick(cat.value)
                                setMobileOpen(false)
                              }}
                            >
                              {cat.label}
                            </button>
                            {cat.subcategories.length > 0 && (
                              <button
                                onClick={() => setMobileExpanded(mobileExpanded === cat.value ? null : cat.value)}
                                className="p-2 text-slate-400 hover:text-slate-600"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform ${mobileExpanded === cat.value ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>
                          <AnimatePresence>
                            {cat.subcategories.length > 0 && mobileExpanded === cat.value && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                {cat.subcategories.map((sub) => (
                                  <button
                                    key={sub.value}
                                    className="w-full text-left pl-8 pr-4 py-2.5 text-sm text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors capitalize"
                                    onClick={() => {
                                      handleSubCategoryClick(cat.value, sub.value)
                                      setMobileOpen(false)
                                    }}
                                  >
                                    {sub.label}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                      <div className="border-t border-slate-100 my-2" />
                      <button
                        className="w-full text-left px-4 py-3 text-sm text-slate-500 hover:text-amber-700 transition-colors"
                        onClick={() => { setView('cart'); setMobileOpen(false) }}
                      >
                        Cart ({count})
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 text-sm text-slate-500 hover:text-amber-700 transition-colors"
                        onClick={() => { setView('admin'); setMobileOpen(false) }}
                      >
                        Admin Dashboard
                      </button>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-slate-200 bg-white overflow-hidden"
          >
            <div className="mx-auto max-w-2xl px-4 py-4">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search for bags, shoes, accessories..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-9 rounded-lg border-slate-200 h-11"
                    autoFocus
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => { setSearchOpen(false); setSearchValue('') }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
