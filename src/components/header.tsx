'use client'

import { useState, useEffect, useRef } from 'react'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'
import type { AccountTab } from '@/lib/store'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ShoppingCart,
  Menu,
  ChevronDown,
  Search,
  User,
  Heart,
  X,
  LogOut,
  Settings,
  UserRound,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { useShopNavigation } from '@/hooks/use-shop-navigation'
import { useSiteLogo } from '@/hooks/use-site-logo'
import { useNavCategories } from '@/hooks/use-nav-categories'
import { DEFAULT_ANNOUNCEMENTS } from '@/lib/site-settings-client'

export function Header() {
  const { goToShop, goHome } = useShopNavigation()
  const { logoUrl, logoWidth, logoHeight } = useSiteLogo()
  const { categories: navCategories } = useNavCategories()
  const { setView, setAccountTab, setUser, cartCount, user } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [announcementIndex, setAnnouncementIndex] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [announcementMessages, setAnnouncementMessages] =
    useState<string[]>(DEFAULT_ANNOUNCEMENTS)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const count = mounted ? cartCount() : 0

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (Array.isArray(data.announcements) && data.announcements.length > 0) {
          setAnnouncementMessages(data.announcements.map(String))
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const openCart = () => {
    setView('cart')
  }

  const openAccount = (tab: AccountTab = 'profile') => {
    if (user) {
      if (user.role === 'admin') setView('admin')
      else {
        setAccountTab(tab)
        setView('account')
      }
    } else {
      setView('login')
    }
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await signOut({ redirect: false })
      setUser(null)
      toast.success('Signed out')
      setView('home')
    } catch {
      toast.error('Logout failed')
    } finally {
      setLoggingOut(false)
    }
  }

  // Rotate announcement messages
  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcementMessages.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [announcementMessages.length])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleCategoryClick = (value: string) => {
    goToShop({ category: value })
    setActiveDropdown(null)
  }

  const handleSubCategoryClick = (category: string, subCategory: string) => {
    goToShop({ category, subCategory })
    setActiveDropdown(null)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      useStore.getState().setSearchQuery(searchValue.trim())
      goToShop({ category: 'all', shopMode: 'browse' })
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
    <header
      className={`sticky top-0 z-50 w-full transition-shadow duration-300 ${
        scrolled ? 'shadow-md shadow-slate-900/10' : ''
      }`}
    >
      {/* Announcement Bar - Black background */}
      <div className="bg-black text-white text-center py-1.5 px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={announcementIndex}
            initial={false}
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
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Mobile / tablet menu button (desktop nav starts at xl) */}
            <div className="xl:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-700 hover:text-slate-900 hover:bg-slate-50">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[min(20rem,100vw)] max-w-full p-0 bg-white">
                  <div className="flex flex-col h-full">
                    {/* Mobile Logo */}
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                      <SheetTitle className="text-xl flex items-center gap-2">
                        <span
                          className="relative shrink-0 overflow-hidden rounded-sm"
                          style={{ width: logoWidth, height: logoHeight }}
                        >
                          <img
                            src={logoUrl}
                            alt=""
                            className="absolute inset-0 h-full w-full object-fill object-center"
                          />
                        </span>
                        <span>
                          <span className="font-bold text-slate-900">GBB</span>{' '}
                          <span className="font-light text-slate-500">Fashion</span>
                        </span>
                      </SheetTitle>
                    </div>
                    <nav className="flex-1 overflow-y-auto py-2">
                      {navCategories.map((cat) => (
                        <div key={cat.value}>
                          <div className="flex items-center justify-between px-5">
                            <button
                              className={`flex-1 text-left py-3.5 text-[13px] font-semibold tracking-widest transition-colors ${
                                cat.highlight
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
                        onClick={() => {
                          setMobileOpen(false)
                          openCart()
                        }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Cart ({count})
                      </button>
                      {user && user.role !== 'admin' ? (
                        <>
                          <button
                            className="w-full text-left px-5 py-3.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-3"
                            onClick={() => {
                              setMobileOpen(false)
                              openAccount('profile')
                            }}
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                              {user.name.trim().charAt(0).toUpperCase() || 'U'}
                            </span>
                            <span className="flex flex-col items-start">
                              <span>Profile</span>
                              <span className="text-[11px] text-slate-400 font-normal">
                                {user.name}
                              </span>
                            </span>
                          </button>
                          <button
                            className="w-full text-left px-5 py-3.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-3"
                            onClick={() => {
                              setMobileOpen(false)
                              openAccount('settings')
                            }}
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </button>
                          <button
                            className="w-full text-left px-5 py-3.5 text-[13px] font-medium text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-3"
                            onClick={() => {
                              setMobileOpen(false)
                              void handleLogout()
                            }}
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </>
                      ) : (
                        <button
                          className="w-full text-left px-5 py-3.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-3"
                          onClick={() => {
                            setMobileOpen(false)
                            openAccount()
                          }}
                        >
                          <User className="h-4 w-4" />
                          {user?.role === 'admin' ? 'Admin Dashboard' : 'Sign In'}
                        </button>
                      )}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo - Center on mobile, left on desktop */}
            <button
              onClick={goHome}
              className="flex items-center gap-2 sm:gap-2.5 hover:opacity-70 transition-opacity shrink-0"
            >
              <span
                className="relative shrink-0 overflow-hidden rounded-sm"
                style={{ width: logoWidth, height: logoHeight }}
              >
                <img
                  src={logoUrl}
                  alt="GBB Fashion"
                  className="absolute inset-0 h-full w-full object-fill object-center"
                />
              </span>
              <span className="text-xl sm:text-2xl">
                <span className="font-bold text-slate-900">GBB</span>{' '}
                <span className="font-light text-slate-500">Fashion</span>
              </span>
            </button>

            {/* Desktop Navigation - Center (xl+ to avoid crowding mid-size laptops) */}
            <nav className="hidden xl:flex items-center gap-0 absolute left-1/2 -translate-x-1/2 h-16" aria-label="Main navigation">
              {navCategories.map((cat) => (
                <div
                  key={cat.value}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => cat.subcategories.length > 0 && handleDropdownEnter(cat.value)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    onClick={() => handleCategoryClick(cat.value)}
                    className={`relative px-2.5 2xl:px-3 py-2 text-[11px] 2xl:text-[12px] font-semibold tracking-wider 2xl:tracking-widest transition-colors whitespace-nowrap group ${
                      cat.highlight
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

              {/* Account — monogram + dropdown when signed in */}
              {user && user.role !== 'admin' ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      title="My Account"
                      className="hidden sm:inline-flex items-center gap-2 h-10 pl-1.5 pr-2.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold tracking-wide text-white">
                        {user.name.trim().charAt(0).toUpperCase() || 'U'}
                      </span>
                      <span className="hidden md:block max-w-[7rem] truncate text-xs font-semibold text-slate-900 pr-0.5">
                        {user.name.split(' ')[0]}
                      </span>
                      <ChevronDown className="hidden md:block h-3.5 w-3.5 text-slate-400 -ml-0.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 mt-1">
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => openAccount('profile')}
                      className="cursor-pointer"
                    >
                      <UserRound className="h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openAccount('settings')}
                      className="cursor-pointer"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={loggingOut}
                      onClick={() => void handleLogout()}
                      className="cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openAccount()}
                  title={user?.role === 'admin' ? 'Admin' : 'Sign In'}
                  className="hidden sm:flex text-slate-600 hover:text-slate-900 hover:bg-slate-50 h-10 w-10"
                >
                  <User className="h-[18px] w-[18px]" />
                </Button>
              )}

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openCart}
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
              <form onSubmit={handleSearch} className="flex items-center gap-1.5 sm:gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search bags, shoes..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-9 rounded-full border-slate-200 h-11 text-sm focus:border-slate-400 focus:ring-slate-400/20"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-3 sm:px-6 h-11 text-sm font-medium shrink-0"
                >
                  <Search className="h-4 w-4 sm:hidden" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => { setSearchOpen(false); setSearchValue('') }}
                  className="text-slate-400 hover:text-slate-600 h-11 w-11 shrink-0"
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
