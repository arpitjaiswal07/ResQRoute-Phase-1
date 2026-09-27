'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  UserCircle,
  Wrench,
} from 'lucide-react'

type ShopUser = {
  id: string
  name: string
  email: string
  phone: string
  role: 'shop'
}

type ShopProfile = {
  id: string
  name: string
  category: string
  rating: number
  reviews: number
  phone: string
  whatsapp: string
  address: string
  lat: number
  lng: number
  open: boolean
  verified: boolean
  active: boolean
  services?: {
    vehicleRepair: boolean
    emergencyAssistance: boolean
  }
}

export default function ShopProfilePage() {
  const [user, setUser] =
    useState<ShopUser | null>(null)

  const [shop, setShop] =
    useState<ShopProfile | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        setError('')

        const meResponse = await fetch(
          '/api/auth/me',
          {
            cache: 'no-store',
          },
        )

        if (!meResponse.ok) {
          window.location.href =
            '/shop-login'
          return
        }

        const meData =
          await meResponse.json()

        if (
          !meData?.authenticated ||
          meData?.user?.role !== 'shop'
        ) {
          window.location.href =
            '/shop-login'
          return
        }

        setUser(meData.user)

        const profileResponse =
          await fetch(
            '/api/shop/profile',
            {
              cache: 'no-store',
            },
          )

        const profileData =
          await profileResponse.json()

        if (!profileResponse.ok) {
          throw new Error(
            profileData?.error ||
              'Unable to load shop profile',
          )
        }

        setShop(profileData.shop)
      } catch (err) {
        console.error(
          'Shop profile load error:',
          err,
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load profile',
        )
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  function handleViewLocation() {
    if (!shop) return

    const url =
      `https://www.google.com/maps/search/?api=1&query=` +
      `${shop.lat},${shop.lng}`

    window.open(
      url,
      '_blank',
      'noopener,noreferrer',
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10">
              <UserCircle className="size-6 animate-pulse text-primary" />
            </div>

            <p className="mt-4 text-sm font-medium">
              Loading shop profile...
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Please wait a moment.
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !shop || !user) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4">
          <div className="w-full rounded-3xl border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-500/10">
              <UserCircle className="size-6 text-red-500" />
            </div>

            <h1 className="mt-4 text-xl font-bold">
              Unable to load profile
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {error ||
                'Shop profile information could not be loaded.'}
            </p>

            <div className="mt-6 flex justify-center">
              <Link
                href="/shop-dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <ArrowLeft className="size-4" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/shop-dashboard"
            className="flex items-center gap-2 font-display text-lg font-bold"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wrench className="size-4" />
            </div>

            <span>
              ResQ<span className="text-primary">
                Route
              </span>
            </span>
          </Link>

          <Link
            href="/shop-dashboard"
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
        </div>
      </header>

      {/* MAIN */}

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* PAGE INTRO */}

        <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserCircle className="size-8" />
            </div>

            <div>
              <p className="text-sm font-semibold text-primary">
                SHOP PROFILE
              </p>

              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
                {shop.name}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage and view your shop account
                information.
              </p>
            </div>
          </div>
        </section>

        {/* PROFILE INFORMATION */}

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* ACCOUNT */}

          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserCircle className="size-5" />
              </div>

              <div>
                <h2 className="font-display text-lg font-bold">
                  Account Information
                </h2>

                <p className="text-sm text-muted-foreground">
                  Your ResQRoute shop account.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Account Name
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {user.name || '—'}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />

                  <p className="text-xs font-medium text-muted-foreground">
                    Email Address
                  </p>
                </div>

                <p className="mt-1 text-sm font-semibold">
                  {user.email || '—'}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />

                  <p className="text-xs font-medium text-muted-foreground">
                    Account Phone
                  </p>
                </div>

                <p className="mt-1 text-sm font-semibold">
                  {user.phone || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* BUSINESS */}

          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Store className="size-5" />
              </div>

              <div>
                <h2 className="font-display text-lg font-bold">
                  Business Information
                </h2>

                <p className="text-sm text-muted-foreground">
                  Your public service-provider profile.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Business Name
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {shop.name || '—'}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Service Category
                </p>

                <p className="mt-1 text-sm font-semibold capitalize">
                  {shop.category || '—'}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />

                  <p className="text-xs font-medium text-muted-foreground">
                    Business Phone
                  </p>
                </div>

                <p className="mt-1 text-sm font-semibold">
                  {shop.phone || '—'}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  WhatsApp
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {shop.whatsapp || '—'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STATUS */}

        <section className="mt-6 rounded-2xl border bg-card p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`flex size-10 items-center justify-center rounded-xl ${
                  shop.open
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}
              >
                {shop.open ? (
                  <ShieldCheck className="size-5" />
                ) : (
                  <ShieldCheck className="size-5" />
                )}
              </div>

              <div>
                <h2 className="font-display text-lg font-bold">
                  Service Status
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Current availability of your roadside
                  assistance service.
                </p>
              </div>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                shop.open
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  shop.open
                    ? 'bg-emerald-500'
                    : 'bg-red-500'
                }`}
              />

              {shop.open
                ? 'Available'
                : 'Unavailable'}
            </span>
          </div>
        </section>

        {/* LOCATION */}

        <section className="mt-6 rounded-2xl border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="size-5" />
            </div>

            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold">
                Service Location
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Your registered roadside assistance
                location.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-muted/50 p-5">
            <p className="text-sm font-semibold">
              {shop.address || 'Address not available'}
            </p>

            <p className="mt-2 break-all text-xs text-muted-foreground">
              Coordinates: {shop.lat}, {shop.lng}
            </p>

            <button
              type="button"
              onClick={handleViewLocation}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <MapPin className="size-4" />
              Open in Google Maps
            </button>
          </div>
        </section>

        {/* SECURITY */}

        <section className="mt-6 rounded-2xl border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>

            <div>
              <h2 className="font-display text-lg font-bold">
                Account Security
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Your shop account is protected by
                ResQRoute authentication. Only your
                authenticated shop account can access
                this profile and manage customer
                assistance requests.
              </p>
            </div>
          </div>
        </section>

        {/* ACTIONS */}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/shop-dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>

          <Link
            href="/shop-dashboard/services"
            className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            <Wrench className="size-4" />
            Manage Services
          </Link>
        </div>
      </div>
    </main>
  )
}