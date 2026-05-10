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
      { value: 'cross-body-bag', label: 'Cross Body Bag' },
      { value: 'shoulder-bag', label: 'Shoulder Bag' },
      { value: 'tote-bag', label: 'Tote Bag' },
      { value: 'hand-bag', label: 'Hand Bag' },
      { value: 'mini-bag', label: 'Mini Bag' },
    ],
  },
  {
    value: 'men',
    label: 'MEN',
    subcategories: [
      { value: 'bag-pack', label: 'Backpack' },
      { value: 'duffle-bag', label: 'Duffle Bag' },
      { value: 'wallet', label: 'Wallet' },
      { value: 'cosmetic-bag', label: 'Cosmetic Bag' },
    ],
  },
  {
    value: 'shoes',
    label: 'SHOES',
    subcategories: [
      { value: 'loafers', label: 'Loafers' },
      { value: 'sneakers', label: 'Sneakers' },
      { value: 'runner-shoes', label: 'Runner Shoes' },
    ],
  },
  {
    value: 'belt',
    label: 'BELT',
    subcategories: [
      { value: 'male-belt', label: 'Men' },
      { value: 'female-belt', label: 'Women' },
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

const announcementMessages = [
  'FREE SHIPPING ON ORDERS OVER ৳2,000',
  'CASH ON DELIVERY AVAILABLE',
  'NEW ARRIVALS JUST DROPPED — SHOP NOW',
]

export function Header() {
  const { setView, setCategoryFilter, cartCount } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [announcementIndex, setAnnouncementIndex] = useState(0)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const count = cartCount()

  // Rotate announcement messages
  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcementMessages.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const handleCategoryClick = (value: string) => {
    if (value === 'new-arrivals' || value === 'prime-drop') {
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
      {/* Announcement Bar - Black background */}
      <div className="bg-black text-white text-center py-1.5 px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={announcementIndex}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[11px] sm:text-xs tracking-widest font-medium"
          >
            {announcementMessages[announcementIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Main Header - Clean white background */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Mobile menu button (left side on mobile) */}
            <div className="lg:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-700 hover:text-slate-900 hover:bg-slate-50">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 bg-white">
                  <div className="flex flex-col h-full">
                    {/* Mobile Logo */}
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                      <SheetTitle className="text-xl">
                        <span className="font-bold text-slate-900">GBB</span>{' '}
                        <span className="font-light text-slate-500">Fashion</span>
                      </SheetTitle>
                    </div>
                    <nav className="flex-1 overflow-y-auto py-2">
                      {navCategories.map((cat) => (
                        <div key={cat.value}>
                          <div className="flex items-center justify-between px-5">
                            <button
                              className={`flex-1 text-left py-3.5 text-[13px] font-semibold tracking-widest transition-colors ${
                                cat.value === 'prime-drop'
                                  ? 'text-rose-600'
                                  : 'text-slate-800'
                              }`}
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
                                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileExpanded === cat.value ? 'rotate-180' : ''}`} />
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
                                    className="w-full text-left pl-9 pr-5 py-2.5 text-sm text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
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
                      <div className="border-t border-slate-100 my-3 mx-5" />
                      <button
                        className="w-full text-left px-5 py-3.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-3"
                        onClick={() => { setView('cart'); setMobileOpen(false) }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Cart ({count})
                      </button>
                      <button
                        className="w-full text-left px-5 py-3.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-3"
                        onClick={() => {
                          const currentUser = useStore.getState().user
                          if (currentUser) {
                            if (currentUser.role === 'admin') {
                              setView('admin')
                            } else {
                              setView('home')
                            }
                          } else {
                            setView('login')
                          }
                          setMobileOpen(false)
                        }}
                      >
                        <User className="h-4 w-4" />
                        {useStore.getState().user ? 'Account' : 'Sign In'}
                      </button>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo - Center on mobile, left on desktop */}
            <button
              onClick={() => setView('home')}
              className="flex items-center hover:opacity-70 transition-opacity shrink-0"
            >
              <span className="text-xl sm:text-2xl">
                <span className="font-bold text-slate-900">GBB</span>{' '}
                <span className="font-light text-slate-500">Fashion</span>
              </span>
            </button>

            {/* Desktop Navigation - Center */}
            <nav className="hidden lg:flex items-center gap-0 absolute left-1/2 -translate-x-1/2 h-16">
              {navCategories.map((cat) => (
                <div
                  key={cat.value}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => cat.subcategories.length > 0 && handleDropdownEnter(cat.value)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    onClick={() => handleCategoryClick(cat.value)}
                    className={`relative px-3 py-2 text-[12px] font-semibold tracking-widest transition-colors whitespace-nowrap group ${
                      cat.value === 'prime-drop'
                        ? 'text-rose-600 hover:text-rose-700'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    {cat.label}
                    {cat.subcategories.length > 0 && (
                      <ChevronDown className={`h-3 w-3 ml-0.5 inline-block transition-transform duration-200 ${activeDropdown === cat.value ? 'rotate-180' : ''}`} />
                    )}
                    {/* Hover underline animation */}
                    <span className="absolute bottom-1 left-3 right-3 h-[1.5px] bg-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {cat.subcategories.length > 0 && activeDropdown === cat.value && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 bg-white border border-slate-100 rounded-md shadow-lg py-1.5 min-w-[220px] z-50"
                      >
                        {cat.subcategories.map((sub) => (
                          <button
                            key={sub.value}
                            onClick={() => handleSubCategoryClick(cat.value, sub.value)}
                            className="w-full text-left px-5 py-2.5 text-sm text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          >
                            {sub.label}
                          </button>
                        ))}
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          onClick={() => handleCategoryClick(cat.value)}
                          className="w-full text-left px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors uppercase tracking-wider text-[11px]"
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
            <div className="flex items-center gap-0.5">
              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 h-10 w-10"
              >
                <Search className="h-[18px] w-[18px]" />
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex text-slate-600 hover:text-slate-900 hover:bg-slate-50 h-10 w-10"
              >
                <Heart className="h-[18px] w-[18px]" />
              </Button>

              {/* Account */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const currentUser = useStore.getState().user
                  if (currentUser) {
                    if (currentUser.role === 'admin') {
                      setView('admin')
                    } else {
                      setView('home')
                    }
                  } else {
                    setView('login')
                  }
                }}
                className="hidden sm:flex text-slate-600 hover:text-slate-900 hover:bg-slate-50 h-10 w-10"
              >
                <User className="h-[18px] w-[18px]" />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('cart')}
                className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-50 h-10 w-10"
              >
                <ShoppingCart className="h-[18px] w-[18px]" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white min-w-[18px]">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Overlay - Clean white styling */}
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
                    className="pl-9 rounded-full border-slate-200 h-11 text-sm focus:border-slate-400 focus:ring-slate-400/20"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 h-11 text-sm font-medium"
                >
                  Search
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => { setSearchOpen(false); setSearchValue('') }}
                  className="text-slate-400 hover:text-slate-600 h-11 w-11"
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
