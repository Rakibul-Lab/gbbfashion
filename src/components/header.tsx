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
    value: 'diagnostics',
    label: 'DIAGNOSTICS',
    subcategories: [
      { value: 'handheld-scanners', label: 'Handheld Scanners' },
      { value: 'vision-systems', label: 'Vision Systems' },
      { value: 'thermal-imaging', label: 'Thermal Imaging' },
    ],
  },
  {
    value: 'predictive',
    label: 'PREDICTIVE',
    subcategories: [
      { value: 'prediction-engines', label: 'Prediction Engines' },
      { value: 'safety-systems', label: 'Safety Systems' },
    ],
  },
  {
    value: 'monitoring',
    label: 'MONITORING',
    subcategories: [
      { value: 'sensor-hubs', label: 'Sensor Hubs' },
      { value: 'mesh-networks', label: 'Mesh Networks' },
    ],
  },
  {
    value: 'robotic',
    label: 'ROBOTIC',
    subcategories: [
      { value: 'robotic-arms', label: 'Robotic Arms' },
      { value: 'maintenance-drones', label: 'Maintenance Drones' },
    ],
  },
  {
    value: 'analytics',
    label: 'ANALYTICS',
    subcategories: [
      { value: 'analytics-platforms', label: 'Analytics Platforms' },
      { value: 'cloud-solutions', label: 'Cloud Solutions' },
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current)
      }
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      {/* Announcement Bar */}
      <div className="bg-slate-900 text-white text-center py-2 px-4">
        <p className="text-xs sm:text-sm tracking-wide">
          New arrivals just dropped — explore the collection.{' '}
          <button
            onClick={() => {
              setCategoryFilter('all')
              setView('shop')
            }}
            className="font-semibold text-teal-400 hover:text-teal-300 transition-colors underline underline-offset-2"
          >
            SHOP NOW
          </button>
        </p>
      </div>

      {/* Main Header */}
      <div className="border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-teal-600 to-emerald-600">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-teal-600">Baand</span>{' '}
                <span className="text-slate-900">GBB</span>
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
                    className={`px-3 py-2 text-[13px] font-semibold tracking-wider transition-colors whitespace-nowrap ${
                      activeDropdown === cat.value
                        ? 'text-teal-600'
                        : cat.value === 'prime-drop'
                        ? 'text-rose-600 hover:text-rose-700'
                        : 'text-slate-700 hover:text-teal-600'
                    }`}
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
                        className="absolute top-full left-0 bg-white border border-slate-100 rounded-lg shadow-xl shadow-slate-200/50 py-2 min-w-[200px] z-50"
                      >
                        {cat.subcategories.map((sub) => (
                          <button
                            key={sub.value}
                            onClick={() => handleSubCategoryClick(cat.value, sub.value)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:text-teal-600 hover:bg-slate-50 transition-colors"
                          >
                            {sub.label}
                          </button>
                        ))}
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          onClick={() => handleCategoryClick(cat.value)}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-teal-600 hover:bg-teal-50 transition-colors"
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
                className="text-slate-500 hover:text-teal-600 h-10 w-10"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Wishlist placeholder */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex text-slate-500 hover:text-teal-600 h-10 w-10"
              >
                <Heart className="h-5 w-5" />
              </Button>

              {/* Account */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex text-slate-500 hover:text-teal-600 h-10 w-10"
              >
                <User className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('cart')}
                className="relative text-slate-500 hover:text-teal-600 h-10 w-10"
              >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </Button>

              {/* Admin (hidden, accessible via icon) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('admin')}
                className="hidden sm:flex text-slate-300 hover:text-slate-500 h-10 w-10"
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* Mobile menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-slate-600 h-10 w-10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                      <SheetTitle className="text-lg font-bold">
                        <span className="text-teal-600">Baand</span>{' '}
                        <span className="text-slate-900">GBB</span>
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
                                    className="w-full text-left pl-8 pr-4 py-2.5 text-sm text-slate-500 hover:text-teal-600 hover:bg-slate-50 transition-colors"
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
                        className="w-full text-left px-4 py-3 text-sm text-slate-500 hover:text-teal-600 transition-colors"
                        onClick={() => { setView('cart'); setMobileOpen(false) }}
                      >
                        🛒 Cart ({count})
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 text-sm text-slate-500 hover:text-teal-600 transition-colors"
                        onClick={() => { setView('admin'); setMobileOpen(false) }}
                      >
                        ⚙️ Admin Dashboard
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
            className="border-b border-slate-100 bg-white overflow-hidden"
          >
            <div className="mx-auto max-w-2xl px-4 py-4">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search for products..."
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
