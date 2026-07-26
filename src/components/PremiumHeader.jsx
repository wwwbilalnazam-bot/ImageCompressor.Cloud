import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Logo from './Logo'

export default function PremiumHeader() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Light mode is the default for every new visitor; dark mode only turns on
  // if the user explicitly picked it before (saved in localStorage). We never
  // read prefers-color-scheme here on purpose.
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const shouldUseDark = saved === 'dark'
    document.documentElement.classList.toggle('dark', shouldUseDark)
    setIsDark(shouldUseDark)
  }, [])

  const toggleDarkMode = () => {
    const next = !isDark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setIsDark(next)
  }

  // Close the drawer whenever the route changes (e.g. back/forward nav)
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Lock body scroll while the drawer is open, and allow Escape to close it
  useEffect(() => {
    if (!mobileMenuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileMenuOpen])

  const currentPath = location.pathname

  const isCompressor = currentPath === '/' || currentPath.includes('/compress-image') || currentPath.includes('compressor')
  const isMergePdf = currentPath === '/merge-pdf'
  const isSplitPdf = currentPath === '/split-pdf'
  const isCompressPdf = currentPath === '/compress-pdf' || currentPath === '/pdf-tools'
  const isConverter = !isCompressor && !isMergePdf && !isSplitPdf && !isCompressPdf

  const navLinks = [
    { path: '/', label: 'Compressor', icon: '⚡', isActive: isCompressor },
    { path: '/converter', label: 'Converter', icon: '🔄', isActive: isConverter },
    { path: '/merge-pdf', label: 'Merge PDF', icon: '🔗', isActive: isMergePdf },
    { path: '/split-pdf', label: 'Split PDF', icon: '✂️', isActive: isSplitPdf },
    { path: '/compress-pdf', label: 'Compress PDF', icon: '🗜️', isActive: isCompressPdf },
  ]

  return (
    <>
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs">
      <div className="container max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Brand Logo & Elegant Typography */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <Logo size="default" />
            <div className="flex items-center gap-1.5">
              <span className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Image<span className="text-emerald-600 dark:text-emerald-400">Compress</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                Cloud
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION TABS */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                  link.isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 text-xs font-bold"
            >
              {isDark ? (
                <>
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="hidden lg:inline">Light</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className="hidden lg:inline">Dark</span>
                </>
              )}
            </button>

            {/* Mobile Hamburger Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
            >
              <span className="relative w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
                <span className={`block h-0.5 w-full bg-current rounded-full transition-all duration-200 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Navigation Drawer */}
    {mobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="mobile-nav-drawer"
            className="md:hidden fixed top-0 right-0 z-50 h-full w-[82%] max-w-xs bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl animate-slide-in-right flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 -mr-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3.5 rounded-xl text-sm font-extrabold uppercase tracking-wider flex items-center gap-3 transition-colors ${
                    link.isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 active:bg-slate-100 dark:active:bg-slate-900'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center gap-3"
              >
                {isDark ? (
                  <>
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Switch to Light Mode</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span>Switch to Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </nav>
        </>
    )}
    </>
  )
}
