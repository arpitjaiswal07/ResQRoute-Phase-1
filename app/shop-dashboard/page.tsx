'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ShopDashboardSkeleton } from '@/components/shop-dashboard-skeleton'
import { NotificationBell } from '@/components/notification-bell'
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Navigation,
  Phone,
  Settings,
  ShieldCheck,
  Star,
  Store,
  Sun,
  UserCircle,
  Wrench,
  XCircle,
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
  services: {
    vehicleRepair: boolean
    emergencyAssistance: boolean
  }
}

type BreakdownRequest = {
  _id: string
  name: string
  phone: string
  problem: string
  serviceType: string
  lat: number
  lng: number
  status:
    | 'REQUESTED'
    | 'ASSIGNED'
    | 'ON_THE_WAY'
    | 'ARRIVED'
    | 'COMPLETED'
    | 'CANCELLED'
  providerId: string
  createdAt: string
}

export default function ShopDashboardPage() {
  const [user, setUser] = useState<ShopUser | null>(null)
  const [shop, setShop] = useState<ShopProfile | null>(null)

  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  const [requests, setRequests] = useState<
    BreakdownRequest[]
  >([])

  const [requestActionLoading, setRequestActionLoading] =
    useState<string | null>(null)

  const [requestActionError, setRequestActionError] =
    useState('')

  // --------------------------------------------------
  // AVAILABILITY STATE
  // --------------------------------------------------

  const [availabilityLoading, setAvailabilityLoading] =
    useState(false)

  const [availabilityError, setAvailabilityError] =
    useState('')

  // --------------------------------------------------
  // LOCATION UPDATE STATE
  // --------------------------------------------------

  const [updatingLocation, setUpdatingLocation] =
    useState(false)

  const [locationMessage, setLocationMessage] =
    useState('')

  const [locationError, setLocationError] =
    useState('')

  // --------------------------------------------------
  // THEME
  // --------------------------------------------------

  useEffect(() => {
    const savedTheme = localStorage.getItem(
      'resqroute-shop-theme',
    )

    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  // --------------------------------------------------
  // LOAD DASHBOARD
  // --------------------------------------------------

  useEffect(() => {
    loadShop()
  }, [])

  async function loadShop() {
    try {
      setLoading(true)

      const meResponse = await fetch(
        '/api/auth/me',
        {
          cache: 'no-store',
        },
      )

      if (!meResponse.ok) {
        window.location.href = '/shop-login'
        return
      }

      const meData = await meResponse.json()

      if (
        !meData?.authenticated ||
        meData?.user?.role !== 'shop'
      ) {
        window.location.href = '/shop-login'
        return
      }

      setUser(meData.user)

      const [
        profileResponse,
        requestsResponse,
      ] = await Promise.all([
        fetch('/api/shop/profile', {
          cache: 'no-store',
        }),

        fetch('/api/breakdowns', {
          cache: 'no-store',
        }),
      ])

      if (profileResponse.ok) {
        const profileData =
          await profileResponse.json()

        setShop(profileData.shop)
      }

      if (requestsResponse.ok) {
        const requestsData =
          await requestsResponse.json()

        setRequests(
          requestsData.breakdowns || [],
        )
      }
    } catch (error) {
      console.error(
        'Unable to load shop dashboard:',
        error,
      )
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------
  // THEME
  // --------------------------------------------------

  function toggleTheme() {
    const nextMode = !darkMode

    setDarkMode(nextMode)

    if (nextMode) {
      document.documentElement.classList.add(
        'dark',
      )

      localStorage.setItem(
        'resqroute-shop-theme',
        'dark',
      )
    } else {
      document.documentElement.classList.remove(
        'dark',
      )

      localStorage.setItem(
        'resqroute-shop-theme',
        'light',
      )
    }
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  async function handleLogout() {
    try {
      setLogoutLoading(true)

      await fetch('/api/auth/logout', {
        method: 'POST',
      })

      window.location.href = '/shop-login'
    } catch (error) {
      console.error(
        'Logout failed:',
        error,
      )

      setLogoutLoading(false)
    }
  }

  // --------------------------------------------------
  // AVAILABILITY
  // --------------------------------------------------

  async function handleToggleAvailability() {
    if (!shop || availabilityLoading) {
      return
    }

    const nextOpen = !shop.open

    try {
      setAvailabilityLoading(true)
      setAvailabilityError('')

      const response = await fetch(
        '/api/shop/profile',
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            open: nextOpen,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Unable to update service availability.',
        )
      }

      setShop((currentShop) => {
        if (!currentShop) {
          return currentShop
        }

        return {
          ...currentShop,
          open:
            typeof data?.shop?.open ===
            'boolean'
              ? data.shop.open
              : nextOpen,
        }
      })
    } catch (error) {
      console.error(
        'Availability update error:',
        error,
      )

      setAvailabilityError(
        error instanceof Error
          ? error.message
          : 'Unable to update service availability.',
      )
    } finally {
      setAvailabilityLoading(false)
    }
  }

  // --------------------------------------------------
  // VIEW SHOP LOCATION
  // --------------------------------------------------

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

  // --------------------------------------------------
  // UPDATE SHOP LOCATION
  // --------------------------------------------------

  async function handleUpdateLocation() {
    if (!shop || updatingLocation) {
      return
    }

    setUpdatingLocation(true)
    setLocationMessage('')
    setLocationError('')

    if (!navigator.geolocation) {
      setLocationError(
        'Your browser does not support location services.',
      )

      setUpdatingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat =
          position.coords.latitude

        const lng =
          position.coords.longitude

        try {
          const response = await fetch(
            '/api/shop/location',
            {
              method: 'PATCH',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                lat,
                lng,
              }),
            },
          )

          const data =
            await response.json()

          if (!response.ok) {
            throw new Error(
              data?.error ||
                'Unable to update service location.',
            )
          }

          setShop((currentShop) => {
            if (!currentShop) {
              return currentShop
            }

            return {
              ...currentShop,
              lat: data.location.lat,
              lng: data.location.lng,
            }
          })

          setLocationMessage(
            'Service location updated successfully.',
          )
        } catch (error) {
          console.error(
            'LOCATION UPDATE ERROR:',
            error,
          )

          setLocationError(
            error instanceof Error
              ? error.message
              : 'Unable to update service location.',
          )
        } finally {
          setUpdatingLocation(false)
        }
      },
      (error) => {
        console.error(
          'GEOLOCATION ERROR:',
          error,
        )

        let message =
          'Unable to get your current location.'

        if (error.code === 1) {
          message =
            'Location permission was denied. Please allow location access.'
        } else if (error.code === 2) {
          message =
            'Your current location could not be determined.'
        } else if (error.code === 3) {
          message =
            'Location request timed out. Please try again.'
        }

        setLocationError(message)
        setUpdatingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    )
  }

  // --------------------------------------------------
  // CUSTOMER LOCATION
  // --------------------------------------------------

  function handleCustomerLocation(
    lat: number,
    lng: number,
  ) {
    const url =
      `https://www.google.com/maps/search/?api=1&query=` +
      `${lat},${lng}`

    window.open(
      url,
      '_blank',
      'noopener,noreferrer',
    )
  }

  // --------------------------------------------------
  // REQUEST STATUS
  // --------------------------------------------------

  async function updateRequestStatus(
    requestId: string,
    status:
      | 'ASSIGNED'
      | 'ON_THE_WAY'
      | 'ARRIVED'
      | 'COMPLETED'
      | 'CANCELLED',
  ) {
    if (!shop) return

    try {
      setRequestActionLoading(requestId)
      setRequestActionError('')

      const response = await fetch(
        `/api/breakdowns/${requestId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            status,
            providerId: shop.id,
          }),
        },
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Unable to update request',
        )
      }

      setRequests((current) =>
        current.map((request) =>
          request._id === requestId
            ? {
                ...request,
                status,
                providerId: shop.id,
              }
            : request,
        ),
      )
    } catch (error) {
      setRequestActionError(
        error instanceof Error
          ? error.message
          : 'Unable to update request',
      )
    } finally {
      setRequestActionLoading(null)
    }
  }

  async function handleRequestAction(
    requestId: string,
    action: 'accept' | 'decline',
  ) {
    if (!shop) return

    const nextStatus =
      action === 'accept'
        ? 'ASSIGNED'
        : 'CANCELLED'

    await updateRequestStatus(
      requestId,
      nextStatus,
    )
  }

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  function formatRequestTime(
    date: string,
  ) {
    try {
      return new Date(
        date,
      ).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Unknown time'
    }
  }

  function getServiceLabel(
    serviceType: string,
  ) {
    if (serviceType === 'mechanics') {
      return 'Mechanic'
    }

    if (serviceType === 'towing') {
      return 'Towing'
    }

    if (serviceType === 'rentals') {
      return 'Rental'
    }

    return serviceType
  }

  function getStatusLabel(
    status: BreakdownRequest['status'],
  ) {
    switch (status) {
      case 'REQUESTED':
        return 'New Request'

      case 'ASSIGNED':
        return 'Assigned'

      case 'ON_THE_WAY':
        return 'On the Way'

      case 'ARRIVED':
        return 'Arrived'

      case 'COMPLETED':
        return 'Completed'

      case 'CANCELLED':
        return 'Cancelled'

      default:
        return status
    }
  }

  function getStatusClass(
    status: BreakdownRequest['status'],
  ) {
    switch (status) {
      case 'REQUESTED':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'

      case 'ASSIGNED':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'

      case 'ON_THE_WAY':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'

      case 'ARRIVED':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'

      case 'COMPLETED':
        return 'bg-green-500/10 text-green-600 dark:text-green-400'

      case 'CANCELLED':
        return 'bg-red-500/10 text-red-600 dark:text-red-400'

      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  function getNextAction(
    request: BreakdownRequest,
  ) {
    switch (request.status) {
      case 'ASSIGNED':
        return {
          label: 'Start Trip',
          status:
            'ON_THE_WAY' as const,
        }

      case 'ON_THE_WAY':
        return {
          label: 'Mark Arrived',
          status:
            'ARRIVED' as const,
        }

      case 'ARRIVED':
        return {
          label: 'Complete Request',
          status:
            'COMPLETED' as const,
        }

      default:
        return null
    }
  }

  // --------------------------------------------------
  // REQUEST FILTERS
  // --------------------------------------------------

  const todayRequests =
    requests.filter((request) => {
      const requestDate =
        new Date(request.createdAt)

      const today = new Date()

      return (
        requestDate.getDate() ===
          today.getDate() &&
        requestDate.getMonth() ===
          today.getMonth() &&
        requestDate.getFullYear() ===
          today.getFullYear()
      )
    })

  const incomingRequests =
    requests.filter(
      (request) =>
        request.status ===
          'REQUESTED' &&
        !request.providerId,
    )

  const activeRequests =
    requests.filter(
      (request) =>
        request.providerId ===
          shop?.id &&
        request.status !==
          'CANCELLED' &&
        request.status !==
          'COMPLETED',
    )

  const completedRequests =
    requests.filter(
      (request) =>
        request.providerId ===
          shop?.id &&
        request.status ===
          'COMPLETED',
    )

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return <ShopDashboardSkeleton />
  }

  // --------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-background">
      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-lg font-bold"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wrench className="size-4" />
            </div>

            <span>ResQRoute</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* HEADER AVAILABILITY */}

            <button
              type="button"
              onClick={
                handleToggleAvailability
              }
              disabled={
                availabilityLoading ||
                !shop
              }
              className="hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
              title="Change service availability"
            >
              <span
                className={`size-2 rounded-full ${
                  shop?.open
                    ? 'bg-emerald-500'
                    : 'bg-red-500'
                }`}
              />

              {availabilityLoading
                ? 'Updating...'
                : shop?.open
                  ? 'Available'
                  : 'Offline'}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex size-10 items-center justify-center rounded-xl border hover:bg-muted"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>

            <NotificationBell />
<Link
  href="/shop-dashboard/profile"
  className="hidden items-center gap-2 rounded-xl pl-2 pr-2 py-1.5 transition-colors hover:bg-muted sm:flex"
  aria-label="Open shop profile"
>
  <div className="flex size-9 items-center justify-center rounded-full bg-muted">
    <UserCircle className="size-5" />
  </div>

  <div className="leading-tight text-left">
    <p className="text-sm font-semibold">
      {shop?.name ||
        user?.name ||
        'Shop'}
    </p>

    <p className="text-xs text-muted-foreground">
      Shop Account
    </p>
  </div>
</Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={
                logoutLoading
              }
              className="flex size-10 items-center justify-center rounded-xl border hover:bg-muted disabled:opacity-50"
              aria-label="Logout"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HERO */}

        <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
                <Store className="size-4" />
                Shop Dashboard
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back,{' '}
                {shop?.name ||
                  user?.name ||
                  'Shop'}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Manage your roadside assistance
                services, incoming requests and
                active customer assignments from
                one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop-dashboard/services"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <Settings className="size-4" />
                Manage Services
              </Link>

              <button
                type="button"
                onClick={
                  handleViewLocation
                }
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
              >
                <Navigation className="size-4" />
                View Location
              </button>
            </div>
          </div>
        </section>

        {/* QUICK STATS */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* SERVICE STATUS */}

          <div
            className={`rounded-2xl border p-5 transition-all ${
              shop?.open
                ? 'bg-card'
                : 'border-red-500/20 bg-red-500/[0.03]'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Service Status
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`size-2.5 rounded-full ${
                      shop?.open
                        ? 'bg-emerald-500'
                        : 'bg-red-500'
                    }`}
                  />

                  <p className="text-2xl font-bold">
                    {shop?.open
                      ? 'Available'
                      : 'Offline'}
                  </p>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {shop?.open
                    ? 'Customers can request your service'
                    : 'Customers cannot request your service'}
                </p>
              </div>

              <ShieldCheck
                className={`size-5 ${
                  shop?.open
                    ? 'text-emerald-500'
                    : 'text-muted-foreground'
                }`}
              />
            </div>

            <button
              type="button"
              onClick={
                handleToggleAvailability
              }
              disabled={
                availabilityLoading ||
                !shop
              }
              className={`mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                shop?.open
                  ? 'border border-red-500/20 bg-red-500/5 text-red-600 hover:bg-red-500/10 dark:text-red-400'
                  : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              {availabilityLoading
                ? 'Updating...'
                : shop?.open
                  ? 'Go Offline'
                  : 'Set Available'}
            </button>

            {availabilityError && (
              <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5">
                <p className="text-xs leading-5 text-red-600 dark:text-red-400">
                  {availabilityError}
                </p>
              </div>
            )}
          </div>

          {/* REQUESTS TODAY */}

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Requests Today
              </p>

              <Bell className="size-5 text-primary" />
            </div>

            <p className="mt-3 text-2xl font-bold">
              {todayRequests.length}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              New assistance requests
            </p>
          </div>

          {/* ACTIVE REQUESTS */}

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Active Requests
              </p>

              <Clock3 className="size-5 text-primary" />
            </div>

            <p className="mt-3 text-2xl font-bold">
              {activeRequests.length}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Currently being handled
            </p>
          </div>
        </section>

        {/* MOBILE AVAILABILITY */}

        <section className="mt-4 sm:hidden">
          <button
            type="button"
            onClick={
              handleToggleAvailability
            }
            disabled={
              availabilityLoading ||
              !shop
            }
            className="flex w-full items-center justify-between rounded-2xl border bg-card p-4 text-left disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <span
                className={`size-3 rounded-full ${
                  shop?.open
                    ? 'bg-emerald-500'
                    : 'bg-red-500'
                }`}
              />

              <div>
                <p className="text-sm font-bold">
                  {shop?.open
                    ? 'You are Available'
                    : 'You are Offline'}
                </p>

                <p className="text-xs text-muted-foreground">
                  Tap to change service status
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-primary">
              {availabilityLoading
                ? 'Updating...'
                : shop?.open
                  ? 'Go Offline'
                  : 'Set Available'}
            </span>
          </button>
        </section>

        {/* CUSTOMER REQUESTS */}

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold">
                  Customer Requests
                </h2>

                {incomingRequests.length >
                  0 && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {incomingRequests.length}{' '}
                    new
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                New roadside assistance requests
                waiting for your response.
              </p>
            </div>
          </div>

          {requestActionError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                <XCircle className="size-5 text-destructive" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Request update failed
                </p>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {requestActionError}
                </p>

                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  Please try the action again.
                </p>
              </div>
            </div>
          )}

          {incomingRequests.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
              <CheckCircle2 className="mx-auto size-8 text-emerald-500" />

              <h3 className="mt-3 font-semibold">
                No new requests
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                New customer requests will appear
                here automatically.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {incomingRequests.map(
                (request) => (
                  <div
                    key={request._id}
                    className="rounded-2xl border bg-card p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">
                            {request.name ||
                              'Customer'}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                              request.status,
                            )}`}
                          >
                            {getStatusLabel(
                              request.status,
                            )}
                          </span>

                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                            {getServiceLabel(
                              request.serviceType,
                            )}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6">
                          {request.problem}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                          {request.phone && (
                            <a
                              href={`tel:${request.phone}`}
                              className="inline-flex items-center gap-1.5 hover:text-foreground"
                            >
                              <Phone className="size-3.5" />
                              {request.phone}
                            </a>
                          )}

                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="size-3.5" />
                            {formatRequestTime(
                              request.createdAt,
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleCustomerLocation(
                              request.lat,
                              request.lng,
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
                        >
                          <MapPin className="size-4" />
                          Location
                        </button>

                        <button
                          type="button"
                          disabled={
                            requestActionLoading ===
                            request._id
                          }
                          onClick={() =>
                            handleRequestAction(
                              request._id,
                              'decline',
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-500/5 disabled:opacity-50 dark:text-red-400"
                        >
                          <XCircle className="size-4" />
                          Decline
                        </button>

                        <button
                          type="button"
                          disabled={
                            requestActionLoading ===
                            request._id
                          }
                          onClick={() =>
                            handleRequestAction(
                              request._id,
                              'accept',
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                        >
                          <CheckCircle2 className="size-4" />

                          {requestActionLoading ===
                          request._id
                            ? 'Updating...'
                            : 'Accept Request'}
                        </button>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* ACTIVE ASSIGNMENTS */}

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="font-display text-xl font-bold">
              Active Assignments
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Track and update the status of
              accepted customer requests.
            </p>
          </div>

          {activeRequests.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
              <Clock3 className="mx-auto size-8 text-muted-foreground" />

              <h3 className="mt-3 font-semibold">
                No active assignments
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Accepted requests will appear
                here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeRequests.map(
                (request) => {
                  const nextAction =
                    getNextAction(
                      request,
                    )

                  return (
                    <div
                      key={request._id}
                      className="rounded-2xl border bg-card p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">
                              {request.name ||
                                'Customer'}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                request.status,
                              )}`}
                            >
                              {getStatusLabel(
                                request.status,
                              )}
                            </span>

                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                              {getServiceLabel(
                                request.serviceType,
                              )}
                            </span>
                          </div>

                          <p className="mt-3 text-sm leading-6">
                            {request.problem}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                            {request.phone && (
                              <a
                                href={`tel:${request.phone}`}
                                className="inline-flex items-center gap-1.5 hover:text-foreground"
                              >
                                <Phone className="size-3.5" />
                                {request.phone}
                              </a>
                            )}

                            <span className="inline-flex items-center gap-1.5">
                              <Clock3 className="size-3.5" />
                              {formatRequestTime(
                                request.createdAt,
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleCustomerLocation(
                                request.lat,
                                request.lng,
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
                          >
                            <MapPin className="size-4" />
                            Location
                          </button>

                          {nextAction && (
                            <button
                              type="button"
                              disabled={
                                requestActionLoading ===
                                request._id
                              }
                              onClick={() =>
                                updateRequestStatus(
                                  request._id,
                                  nextAction.status,
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                            >
                              {requestActionLoading ===
                              request._id
                                ? 'Updating...'
                                : nextAction.label}

                              <ChevronRight className="size-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* STATUS PROGRESS */}

                      <div className="mt-6 border-t pt-5">
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            {
                              label: 'Assigned',
                              status: 'ASSIGNED',
                            },
                            {
                              label: 'On the Way',
                              status:
                                'ON_THE_WAY',
                            },
                            {
                              label: 'Arrived',
                              status:
                                'ARRIVED',
                            },
                            {
                              label: 'Completed',
                              status:
                                'COMPLETED',
                            },
                          ].map(
                            (
                              step,
                              index,
                            ) => {
                              const statusOrder =
                                [
                                  'ASSIGNED',
                                  'ON_THE_WAY',
                                  'ARRIVED',
                                  'COMPLETED',
                                ]

                              const currentIndex =
                                statusOrder.indexOf(
                                  request.status,
                                )

                              const stepIndex =
                                statusOrder.indexOf(
                                  step.status,
                                )

                              const completed =
                                stepIndex <=
                                currentIndex

                              return (
                                <div
                                  key={
                                    step.status
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                        completed
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-muted text-muted-foreground'
                                      }`}
                                    >
                                      {index +
                                        1}
                                    </div>

                                    {index <
                                      3 && (
                                      <div
                                        className={`h-px flex-1 ${
                                          stepIndex <
                                          currentIndex
                                            ? 'bg-primary'
                                            : 'bg-border'
                                        }`}
                                      />
                                    )}
                                  </div>

                                  <p
                                    className={`mt-2 text-[11px] font-medium ${
                                      completed
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {
                                      step.label
                                    }
                                  </p>
                                </div>
                              )
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          )}
        </section>

        {/* COMPLETED */}

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="font-display text-xl font-bold">
              Completed Requests
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Recently completed customer assistance requests.
            </p>
          </div>

          {completedRequests.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-foreground">
                No completed requests
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Completed roadside assistance
                jobs will appear here after you
                finish a request.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {completedRequests
                .slice(0, 5)
                .map((request) => (
                  <div
                    key={request._id}
                    className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">
                          {request.name ||
                            'Customer'}
                        </p>

                        <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
                          Completed
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {request.problem}
                      </p>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {formatRequestTime(
                        request.createdAt,
                      )}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* BUSINESS PROFILE */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold">
                  Business Profile
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Your public service-provider
                  information.
                </p>
              </div>

              <Link
                href="/shop-dashboard/profile"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
              >
                Edit
                <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Store className="size-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    {shop?.name || '—'}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {shop?.category || '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                  <Phone className="size-5" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {shop?.phone || '—'}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Business phone
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                  <Mail className="size-5" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {user?.email || '—'}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Account email
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                  <MapPin className="size-5" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {shop?.address || '—'}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Service location
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SERVICE AREA */}

          <div className="rounded-2xl border bg-card p-6">
            <div>
              <h2 className="font-display text-lg font-bold">
                Service Area
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Your registered roadside assistance
                location.
              </p>
            </div>

            <div className="mt-6 rounded-2xl bg-muted/50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Navigation className="size-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    Registered coordinates
                  </p>

                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    {shop?.lat}, {shop?.lng}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={
                    handleUpdateLocation
                  }
                  disabled={
                    updatingLocation
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Navigation className="size-4" />

                  {updatingLocation
                    ? 'Updating...'
                    : 'Update Location'}
                </button>

                <button
                  type="button"
                  onClick={
                    handleViewLocation
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted"
                >
                  <MapPin className="size-4" />

                  Open in Google Maps
                </button>
              </div>

              {locationMessage && (
                <div
                  role="status"
                  className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-sm text-emerald-600 dark:text-emerald-400"
                >
                  {locationMessage}
                </div>
              )}

              {locationError && (
                <div
                  role="alert"
                  className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm text-red-600 dark:text-red-400"
                >
                  {locationError}
                </div>
              )}

              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Update Location uses your browser's
                current GPS position and saves it as
                your shop's service location.
              </p>
            </div>
          </div>
        </section>

        {/* ACTIVE SERVICES */}

        <section className="mt-8 rounded-2xl border bg-card p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-lg font-bold">
                Active Services
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Services currently enabled for your
                shop.
              </p>
            </div>

            <Link
              href="/shop-dashboard/services"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              Manage services
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Wrench className="size-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Vehicle Repair
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Mechanical assistance
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  shop?.services
                    ?.vehicleRepair
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {shop?.services
                  ?.vehicleRepair
                  ? 'Active'
                  : 'Off'}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Emergency Assistance
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Roadside emergency support
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  shop?.services
                    ?.emergencyAssistance
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {shop?.services
                  ?.emergencyAssistance
                  ? 'Active'
                  : 'Off'}
              </span>
            </div>
          </div>
        </section>

        {/* RATING */}

        <section className="mt-8 rounded-2xl border bg-card p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">
                Customer Rating
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Your current public service rating.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Star className="size-6 fill-current text-amber-500" />

              <div>
                <p className="text-2xl font-bold">
                  {shop?.rating ?? 0}
                </p>

                <p className="text-xs text-muted-foreground">
                  {shop?.reviews ?? 0}{' '}
                  reviews
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* REQUEST FLOW */}

        <section className="mt-8 rounded-2xl border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock3 className="size-5" />
            </div>

            <div>
              <h2 className="font-display text-lg font-bold">
                Request Flow
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Customer requests now move through
                a complete assistance lifecycle:
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-amber-600 dark:text-amber-400">
                  REQUESTED
                </span>

                <ChevronRight className="size-4 text-muted-foreground" />

                <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-blue-600 dark:text-blue-400">
                  ASSIGNED
                </span>

                <ChevronRight className="size-4 text-muted-foreground" />

                <span className="rounded-full bg-indigo-500/10 px-3 py-1.5 text-indigo-600 dark:text-indigo-400">
                  ON_THE_WAY
                </span>

                <ChevronRight className="size-4 text-muted-foreground" />

                <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-emerald-600 dark:text-emerald-400">
                  ARRIVED
                </span>

                <ChevronRight className="size-4 text-muted-foreground" />

                <span className="rounded-full bg-green-500/10 px-3 py-1.5 text-green-600 dark:text-green-400">
                  COMPLETED
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}