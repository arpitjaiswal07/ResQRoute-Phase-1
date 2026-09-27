'use client'

import {
  Bell,
  LogIn,
  Menu,
  Moon,
  Navigation,
  PhoneCall,
  Sun,
  UserCircle,
} from 'lucide-react'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type HeaderUser = {
  name: string
  email: string
  role: 'user' | 'shop'
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  const [user, setUser] = useState<HeaderUser | null>(null)

  const [loadingUser, setLoadingUser] = useState(true)

  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch('/api/auth/me', {
          cache: 'no-store',
        })

        if (!response.ok) {
          setUser(null)
          return
        }

        const data = await response.json()

        if (data?.authenticated && data?.user) {
          setUser({
            name: data.user.name,
            email: data.user.email,
            role: data.user.role === 'shop' ? 'shop' : 'user',
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Unable to load header user:', error)
        setUser(null)
      } finally {
        setLoadingUser(false)
      }
    }

    loadUser()
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem('resqroute-theme')

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      setDarkMode(true)
    } else {
      document.documentElement.classList.remove('dark')
      setDarkMode(false)
    }
  }, [])

  const toggleTheme = () => {
    const nextDarkMode = !darkMode

    setDarkMode(nextDarkMode)

    if (nextDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('resqroute-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('resqroute-theme', 'light')
    }
  }

  const profileHref =
    user?.role === 'shop'
      ? '/shop-dashboard'
      : '/profile'

  return (
    <header className="rq-header">
      <div className="rq-header-inner">

        {/* MOBILE MENU */}
        <button
          type="button"
          className="icon-btn mobile-only"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <Menu className="size-5" />
        </button>

        {/* LOGO */}
        <a
          href="#top"
          className="rq-brand"
          aria-label="ResQRoute home"
        >
          <span className="rq-logo-mark">
            <Navigation className="size-5" />
          </span>

          <span className="rq-brand-text">
            ResQ<span>Route</span>
          </span>
        </a>

        {/* NAVIGATION */}
        <nav className={`rq-nav ${open ? 'is-open' : ''}`}>
          <a
            href="#home"
            onClick={() => setOpen(false)}
          >
            Home
          </a>

          <a
            href="#map"
            onClick={() => setOpen(false)}
          >
            Map
          </a>

          <a
            href="#services"
            onClick={() => setOpen(false)}
          >
            Services
          </a>

          <a
            href="#assistant"
            onClick={() => setOpen(false)}
          >
            AI Diagnosis
          </a>
        </nav>

        {/* HEADER ACTIONS */}
        <div className="rq-header-actions">

          {/* THEME TOGGLE */}
          <button
            type="button"
            className="icon-btn theme-toggle"
            aria-label={
              darkMode
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
            title={
              darkMode
                ? 'Switch to Light Mode'
                : 'Switch to Dark Mode'
            }
            onClick={toggleTheme}
          >
            {darkMode ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
          </button>

          {/* NOTIFICATIONS */}
          <button
            type="button"
            className="icon-btn desktop-only"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
          </button>

          {/* EMERGENCY 112 */}
          <a
            href="tel:112"
            className="header-112"
          >
            <PhoneCall className="size-4" />
            <span>112 Emergency</span>
          </a>

          {/* PROFILE / LOGIN */}
          {!loadingUser && user ? (
<Link
  href={profileHref}
  className="header-user"
  aria-label={
    user.role === 'shop'
      ? 'Open shop dashboard'
      : 'Open profile'
  }
  onClick={() => setOpen(false)}
>
  <span className="header-profile-avatar">
    <UserCircle className="size-5" />
  </span>
</Link>
          ) : !loadingUser ? (
            <Link
              href="/login"
              className="header-login"
              onClick={() => setOpen(false)}
            >
              <LogIn className="size-4" />
              <span>Login</span>
            </Link>
          ) : null}

        </div>
      </div>
    </header>
  )
}