'use client'

type NavigateFn = (path: string, mode?: 'push' | 'replace') => void

let navigateFn: NavigateFn | null = null

export function registerAppNavigator(fn: NavigateFn) {
  navigateFn = fn
}

export function appNavigate(path: string, mode: 'push' | 'replace' = 'push') {
  if (typeof window === 'undefined') return
  const current = `${window.location.pathname}${window.location.search}`
  if (current === path) return

  if (navigateFn) {
    navigateFn(path, mode)
    return
  }

  if (mode === 'replace') {
    window.history.replaceState(window.history.state, '', path)
  } else {
    window.history.pushState(window.history.state, '', path)
  }
}
