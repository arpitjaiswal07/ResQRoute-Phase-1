'use client'

import { useEffect, useState } from 'react'
import {
  Bell,
  CarFront,
  ChevronRight,
  CircleCheck,
  Crosshair,
  MapPin,
  Navigation,
  Search,
  ShieldAlert,
  Sparkles,
  Truck,
  Wrench,
  LoaderCircle,
  X,
} from 'lucide-react'

import { RescueMap } from '@/components/rescue-map'
import { ServiceDirectory } from '@/components/service-directory'
import {
  DEFAULT_CENTER,
  type ServiceCategory,
} from '@/lib/shops'
import { RequestHelp } from '@/components/request-help'
import { SosButton } from '@/components/sos-button'

const QUICK: Array<{
  id: ServiceCategory
  title: string
  subtitle: string
  icon: typeof Wrench
}> = [
  {
    id: 'mechanics',
    title: 'Find Mechanic',
    subtitle: 'Car repair & service',
    icon: Wrench,
  },
  {
    id: 'towing',
    title: 'Find Towing',
    subtitle: '24/7 towing service',
    icon: Truck,
  },
  {
    id: 'rentals',
    title: 'Rental Cars',
    subtitle: 'Emergency rentals',
    icon: CarFront,
  },
]

type SearchProvider = {
  id: string
  name: string
  category: ServiceCategory
  address?: string
  tags?: string[]
}

type BreakdownStatus =
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'CANCELLED'

type BreakdownNotification = {
  id: string
  status: BreakdownStatus
  message: string
  time: string
}

const ACTIVE_BREAKDOWN_KEY =
  'resqroute_active_breakdown_id'

const LAST_BREAKDOWN_STATUS_KEY =
  'resqroute_last_breakdown_status'

const NOTIFICATION_KEY =
  'resqroute_breakdown_notification'

function getNotificationMessage(
  status: BreakdownStatus,
) {
  switch (status) {
    case 'REQUESTED':
      return 'Your roadside assistance request has been sent.'

    case 'ASSIGNED':
      return 'A service provider has accepted your request.'

    case 'ON_THE_WAY':
      return 'Your service provider is on the way.'

    case 'ARRIVED':
      return 'Your service provider has arrived.'

    case 'COMPLETED':
      return 'Your roadside assistance request is completed.'

    case 'CANCELLED':
      return 'Your roadside assistance request was cancelled.'

    default:
      return 'Your roadside assistance request was updated.'
  }
}

function getStatusLabel(
  status: BreakdownStatus,
) {
  switch (status) {
    case 'REQUESTED':
      return 'Request Sent'

    case 'ASSIGNED':
      return 'Shop Assigned'

    case 'ON_THE_WAY':
      return 'On The Way'

    case 'ARRIVED':
      return 'Provider Arrived'

    case 'COMPLETED':
      return 'Completed'

    case 'CANCELLED':
      return 'Cancelled'

    default:
      return status
  }
}

export function ResqApp() {
  const [coords, setCoords] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const [locating, setLocating] = useState(false)

  const [category, setCategory] =
    useState<ServiceCategory>('mechanics')

  const [search, setSearch] = useState('')

  // Search suggestions
  const [suggestions, setSuggestions] =
    useState<SearchProvider[]>([])

  const [suggestionsLoading, setSuggestionsLoading] =
    useState(false)

  const [showSuggestions, setShowSuggestions] =
    useState(false)

  // Dynamic greeting
  const [greeting, setGreeting] =
    useState('Good Morning')

  // Logged-in user's name
  const [userName, setUserName] =
    useState('User')

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const [showNotifications, setShowNotifications] =
    useState(false)

  const [notificationUnread, setNotificationUnread] =
    useState(false)

  const [notification, setNotification] =
    useState<BreakdownNotification | null>(null)

  const [notificationLoading, setNotificationLoading] =
    useState(false)

  /*
   * =====================================================
   * DYNAMIC GREETING
   * =====================================================
   */

  useEffect(() => {
    function updateGreeting() {
      const hour = new Date().getHours()

      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning')
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good Afternoon')
      } else if (hour >= 17 && hour < 21) {
        setGreeting('Good Evening')
      } else {
        setGreeting('Good Night')
      }
    }

    updateGreeting()

    const interval = window.setInterval(
      updateGreeting,
      60 * 1000,
    )

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  /*
   * =====================================================
   * LOAD LOGGED-IN USER
   * =====================================================
   */

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          return
        }

        const data = await response.json()

        const user = data?.user

        if (!user) {
          return
        }

        const name =
          user.name ||
          user.fullName ||
          user.username ||
          user.displayName

        if (
          typeof name === 'string' &&
          name.trim()
        ) {
          const firstName =
            name.trim().split(/\s+/)[0]

          setUserName(firstName)
        }
      } catch (error) {
        console.error(
          'Failed to load logged-in user:',
          error,
        )
      }
    }

    loadUser()
  }, [])

  /*
   * =====================================================
   * LOAD SAVED NOTIFICATION
   * =====================================================
   */

  useEffect(() => {
    try {
      const savedNotification =
        localStorage.getItem(
          NOTIFICATION_KEY,
        )

      if (savedNotification) {
        const parsed =
          JSON.parse(
            savedNotification,
          ) as BreakdownNotification

        if (
          parsed &&
          typeof parsed.message === 'string'
        ) {
          setNotification(parsed)
        }
      }

      const savedUnread =
        localStorage.getItem(
          'resqroute_notification_unread',
        )

      if (savedUnread === 'true') {
        setNotificationUnread(true)
      }
    } catch (error) {
      console.error(
        'Unable to restore notification:',
        error,
      )
    }
  }, [])

  /*
   * =====================================================
   * CHECK BREAKDOWN NOTIFICATIONS
   * =====================================================
   *
   * Uses the active breakdown ID already created by
   * RequestHelp.
   *
   * We do NOT change the existing RequestHelp component.
   */

  useEffect(() => {
    let cancelled = false

    async function checkNotification() {
      try {
        const breakdownId =
          localStorage.getItem(
            ACTIVE_BREAKDOWN_KEY,
          )

        if (!breakdownId) {
          return
        }

        setNotificationLoading(true)

        const response = await fetch(
          `/api/breakdowns/${breakdownId}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          return
        }

        const data = await response.json()

        const breakdown =
          data?.breakdown

        if (
          !breakdown ||
          !breakdown.status ||
          cancelled
        ) {
          return
        }

        const currentStatus =
          breakdown.status as BreakdownStatus

        const previousStatus =
          localStorage.getItem(
            LAST_BREAKDOWN_STATUS_KEY,
          )

        /*
         * First load:
         * remember current status without creating
         * a fake unread notification.
         */
        if (!previousStatus) {
          localStorage.setItem(
            LAST_BREAKDOWN_STATUS_KEY,
            currentStatus,
          )

          return
        }

        /*
         * Status changed:
         * create a real notification.
         */
        if (
          previousStatus !==
          currentStatus
        ) {
          const newNotification: BreakdownNotification =
            {
              id: `${breakdownId}-${currentStatus}-${Date.now()}`,
              status: currentStatus,
              message:
                getNotificationMessage(
                  currentStatus,
                ),
              time:
                new Date().toISOString(),
            }

          localStorage.setItem(
            LAST_BREAKDOWN_STATUS_KEY,
            currentStatus,
          )

          localStorage.setItem(
            NOTIFICATION_KEY,
            JSON.stringify(
              newNotification,
            ),
          )

          localStorage.setItem(
            'resqroute_notification_unread',
            'true',
          )

          setNotification(
            newNotification,
          )

          setNotificationUnread(
            true,
          )
        }
      } catch (error) {
        console.error(
          'Notification check failed:',
          error,
        )
      } finally {
        if (!cancelled) {
          setNotificationLoading(false)
        }
      }
    }

    checkNotification()

    const interval =
      window.setInterval(
        checkNotification,
        4000,
      )

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  /*
   * =====================================================
   * NOTIFICATION CLICK
   * =====================================================
   */

  function openNotifications() {
    setShowNotifications(
      (current) => !current,
    )

    if (notificationUnread) {
      setNotificationUnread(false)

      localStorage.setItem(
        'resqroute_notification_unread',
        'false',
      )
    }
  }

  /*
   * =====================================================
   * CLEAR NOTIFICATION
   * =====================================================
   */

  function clearNotification() {
    setNotification(null)
    setNotificationUnread(false)

    localStorage.removeItem(
      NOTIFICATION_KEY,
    )

    localStorage.setItem(
      'resqroute_notification_unread',
      'false',
    )
  }

  /*
   * =====================================================
   * GET CURRENT LOCATION
   * =====================================================
   */

  function fetchLocation() {
    if (!('geolocation' in navigator)) {
      alert(
        'Location is not supported by this browser.',
      )
      return
    }

    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })

        setLocating(false)
      },

      (error) => {
        setLocating(false)

        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
          alert(
            'Location access is blocked. Please allow location permission in your browser settings and try again.',
          )
          return
        }

        if (
          error.code ===
          error.POSITION_UNAVAILABLE
        ) {
          alert(
            'Your location is currently unavailable. Please try again.',
          )
          return
        }

        if (
          error.code ===
          error.TIMEOUT
        ) {
          alert(
            'Location request timed out. Please try again.',
          )
          return
        }

        alert(
          'Unable to get your location. Please try again.',
        )
      },

      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000,
      },
    )
  }

  /*
   * =====================================================
   * CENTER
   * =====================================================
   */

  const center =
    coords ?? DEFAULT_CENTER

  /*
   * =====================================================
   * SEARCH SUGGESTIONS
   * =====================================================
   */

  useEffect(() => {
    const query =
      search.trim().toLowerCase()

    if (!query) {
      setSuggestions([])
      setShowSuggestions(false)
      setSuggestionsLoading(false)
      return
    }

    let cancelled = false

    async function loadSuggestions() {
      setSuggestionsLoading(true)

      try {
        const categories: ServiceCategory[] =
          [
            'mechanics',
            'towing',
            'rentals',
          ]

        const queryCoords =
          coords ?? DEFAULT_CENTER

        const responses =
          await Promise.all(
            categories.map(
              async (
                serviceCategory,
              ) => {
                try {
                  const response =
                    await fetch(
                      `/api/shops?lat=${queryCoords.lat}&lng=${queryCoords.lng}&category=${serviceCategory}`,
                      {
                        cache:
                          'no-store',
                      },
                    )

                  if (
                    !response.ok
                  ) {
                    return []
                  }

                  const data =
                    await response.json()

                  return (
                    (data.providers ||
                      []) as any[]
                  ).map(
                    (
                      shop,
                    ): SearchProvider => ({
                      id: String(
                        shop.id,
                      ),
                      name: String(
                        shop.name ||
                          '',
                      ),
                      category:
                        shop.category ||
                        serviceCategory,
                      address:
                        typeof shop.address ===
                        'string'
                          ? shop.address
                          : undefined,
                      tags:
                        Array.isArray(
                          shop.tags,
                        )
                          ? shop.tags
                          : [],
                    }),
                  )
                } catch {
                  return []
                }
              },
            ),
          )

        if (cancelled) {
          return
        }

        const allProviders =
          responses.flat()

        const uniqueProviders =
          Array.from(
            new Map(
              allProviders.map(
                (provider) => [
                  `${provider.category}-${provider.id}`,
                  provider,
                ],
              ),
            ).values(),
          )

        const matchingProviders =
          uniqueProviders
            .filter(
              (provider) => {
                const searchableText =
                  [
                    provider.name,
                    provider.address,
                    ...(provider.tags ||
                      []),
                    provider.category,
                  ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()

                return searchableText.includes(
                  query,
                )
              },
            )
            .slice(0, 6)

        setSuggestions(
          matchingProviders,
        )

        setShowSuggestions(
          true,
        )
      } catch (error) {
        console.error(
          'Search suggestions failed:',
          error,
        )

        if (!cancelled) {
          setSuggestions([])
          setShowSuggestions(
            true,
          )
        }
      } finally {
        if (!cancelled) {
          setSuggestionsLoading(
            false,
          )
        }
      }
    }

    loadSuggestions()

    return () => {
      cancelled = true
    }
  }, [search, coords])

  /*
   * =====================================================
   * CATEGORY SELECTION
   * =====================================================
   */

  function chooseCategory(
    id: ServiceCategory,
  ) {
    setCategory(id)

    document
      .getElementById('services')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
  }

  /*
   * =====================================================
   * SEARCH SUGGESTION CLICK
   * =====================================================
   */

  function selectSuggestion(
    provider: SearchProvider,
  ) {
    setSearch(provider.name)

    setCategory(
      provider.category,
    )

    setShowSuggestions(false)

    window.setTimeout(() => {
      document
        .getElementById('services')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
    }, 50)
  }

  /*
   * =====================================================
   * CATEGORY DISPLAY
   * =====================================================
   */

  function getCategoryLabel(
    value: ServiceCategory,
  ) {
    if (value === 'mechanics') {
      return 'Mechanic'
    }

    if (value === 'towing') {
      return 'Towing'
    }

    return 'Rental'
  }

  function getCategoryIcon(
    value: ServiceCategory,
  ) {
    if (value === 'mechanics') {
      return Wrench
    }

    if (value === 'towing') {
      return Truck
    }

    return CarFront
  }

  /*
   * =====================================================
   * UI
   * =====================================================
   */

  return (
    <>
      {/* =====================================================
          HOME / USER AREA
          ===================================================== */}

      <section
        id="home"
        className="rq-home"
        aria-label="ResQRoute dashboard"
      >
        <div className="rq-home-glow" />

        <div className="rq-home-inner">

          {/* Top / Greeting */}

          <div className="rq-home-top">
            <div>
              <p className="rq-kicker">
                ROADSIDE ASSISTANCE • 24/7
              </p>

              <h1>
                <b>
                  {greeting},{' '}
                  {userName} !{' '}
                  <span>👋</span>
                </b>
              </h1>

              <p className="rq-subtitle">
                Where are you headed today?
              </p>
            </div>

            {/* =================================================
                HEADER ACTIONS
                ================================================= */}

            <div className="flex items-center gap-2">

              {/* NOTIFICATION BUTTON */}

              <div className="relative">
                <button
                  type="button"
                  onClick={
                    openNotifications
                  }
                  className="relative flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all hover:bg-secondary hover:shadow-md"
                  aria-label="Open notifications"
                  aria-expanded={
                    showNotifications
                  }
                >
                  <Bell className="size-5" />

                  {notificationUnread && (
                    <span
                      className="absolute right-2 top-2 size-2.5 rounded-full bg-red-500 ring-2 ring-card"
                      aria-label="Unread notification"
                    />
                  )}
                </button>

                {/* NOTIFICATION PANEL */}

                {showNotifications && (
                  <div
                    className="absolute right-0 top-14 z-[100] w-[320px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                    role="dialog"
                    aria-label="Notifications"
                  >
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          Notifications
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Roadside assistance updates
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setShowNotifications(
                            false,
                          )
                        }
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                        aria-label="Close notifications"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="max-h-[320px] overflow-y-auto p-3">

                      {notificationLoading &&
                        !notification && (
                          <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                            <LoaderCircle className="size-4 animate-spin" />

                            Checking for updates...
                          </div>
                        )}

                      {!notificationLoading &&
                        !notification && (
                          <div className="px-3 py-8 text-center">
                            <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Bell className="size-5" />
                            </div>

                            <p className="mt-3 text-sm font-semibold text-foreground">
                              No notifications
                            </p>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              Your roadside assistance updates will appear here.
                            </p>
                          </div>
                        )}

                      {notification && (
                        <div className="rounded-2xl border border-border bg-background p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                                notification.status ===
                                'CANCELLED'
                                  ? 'bg-red-500/10 text-red-500'
                                  : notification.status ===
                                    'COMPLETED'
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : 'bg-primary/10 text-primary'
                              }`}
                            >
                              {notification.status ===
                              'COMPLETED' ? (
                                <CircleCheck className="size-5" />
                              ) : (
                                <Bell className="size-5" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-bold text-foreground">
                                  {getStatusLabel(
                                    notification.status,
                                  )}
                                </p>

                                <button
                                  type="button"
                                  onClick={
                                    clearNotification
                                  }
                                  className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                                  aria-label="Clear notification"
                                >
                                  <X className="size-3.5" />
                                </button>
                              </div>

                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {
                                  notification.message
                                }
                              </p>

                              <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                {new Date(
                                  notification.time,
                                ).toLocaleString(
                                  'en-IN',
                                  {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute:
                                      '2-digit',
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* PROFILE BUTTON */}

              <button
                className="rq-profile"
                type="button"
                aria-label="Open profile"
              >
                <span>
                  {userName !== 'User'
                    ? userName
                        .slice(0, 2)
                        .toUpperCase()
                    : 'U'}
                </span>
              </button>

            </div>
          </div>

          {/* =================================================
              SEARCH WITH PROVIDER SUGGESTIONS
              ================================================= */}

          <div className="relative z-50">
            <div className="rq-search">
              <Search className="size-5" />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value,
                  )

                  setShowSuggestions(
                    true,
                  )
                }}
                onFocus={() => {
                  if (
                    search.trim()
                  ) {
                    setShowSuggestions(
                      true,
                    )
                  }
                }}
                onBlur={() => {
                  window.setTimeout(() => {
                    setShowSuggestions(
                      false,
                    )
                  }, 180)
                }}
                placeholder='Search for services, e.g. "battery", "towing"...'
                role="combobox"
                aria-expanded={
                  showSuggestions
                }
                aria-autocomplete="list"
              />

              {search && (
                <button
                  type="button"
                  onMouseDown={(event) =>
                    event.preventDefault()
                  }
                  onClick={() => {
                    setSearch('')
                    setSuggestions([])
                    setShowSuggestions(
                      false,
                    )
                  }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* =================================================
                SUGGESTION DROPDOWN
                ================================================= */}

            {showSuggestions &&
              search.trim() && (
                <div
                  className="
                    absolute
                    left-0
                    right-0
                    top-full
                    mt-2
                    overflow-hidden
                    rounded-2xl
                    border
                    border-border
                    bg-card
                    shadow-2xl
                  "
                  role="listbox"
                >
                  {suggestionsLoading ? (
                    <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground">
                      <LoaderCircle className="size-4 animate-spin" />

                      <span>
                        Finding matching
                        providers...
                      </span>
                    </div>
                  ) : suggestions.length >
                    0 ? (
                    <div className="py-2">
                      {suggestions.map(
                        (provider) => {
                          const Icon =
                            getCategoryIcon(
                              provider.category,
                            )

                          return (
                            <button
                              key={`${provider.category}-${provider.id}`}
                              type="button"
                              role="option"
                              onMouseDown={(
                                event,
                              ) =>
                                event.preventDefault()
                              }
                              onClick={() =>
                                selectSuggestion(
                                  provider,
                                )
                              }
                              className="
                                flex
                                w-full
                                items-center
                                gap-3
                                px-4
                                py-3
                                text-left
                                transition-colors
                                hover:bg-secondary
                              "
                            >
                              <span
                                className="
                                  flex
                                  size-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl
                                  bg-primary/10
                                  text-primary
                                "
                              >
                                <Icon className="size-4" />
                              </span>

                              <span className="min-w-0 flex-1">
                                <span
                                  className="
                                    block
                                    truncate
                                    text-sm
                                    font-bold
                                    text-foreground
                                  "
                                >
                                  {
                                    provider.name
                                  }
                                </span>

                                <span
                                  className="
                                    mt-0.5
                                    block
                                    truncate
                                    text-xs
                                    text-muted-foreground
                                  "
                                >
                                  {getCategoryLabel(
                                    provider.category,
                                  )}

                                  {provider.address
                                    ? ` • ${provider.address}`
                                    : ''}
                                </span>
                              </span>

                              <ChevronRight
                                className="
                                  size-4
                                  shrink-0
                                  text-muted-foreground
                                "
                              />
                            </button>
                          )
                        },
                      )}
                    </div>
                  ) : (
                    <div className="px-4 py-4 text-sm text-muted-foreground">
                      No matching providers
                      found.
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Quick Access */}

          <div className="rq-quick-grid">
            {QUICK.map(
              ({
                id,
                title,
                subtitle,
                icon: Icon,
              }) => (
                <button
                  key={id}
                  type="button"
                  className={`rq-quick-card rq-${id}`}
                  onClick={() =>
                    chooseCategory(id)
                  }
                >
                  <span className="rq-quick-icon">
                    <Icon className="size-7" />
                  </span>

                  <strong>{title}</strong>

                  <small>{subtitle}</small>

                  <ChevronRight className="rq-quick-arrow size-4" />
                </button>
              ),
            )}
          </div>

          {/* Action buttons */}

          <div className="rq-action-row">
            <button
              type="button"
              className="rq-round-action ai"
              onClick={() =>
                document
                  .getElementById(
                    'assistant',
                  )
                  ?.scrollIntoView({
                    behavior: 'smooth',
                  })
              }
            >
              <Sparkles />

              <strong>
                AI Diagnosis
              </strong>

              <small>
                Get instant help
              </small>
            </button>

            <SosButton
              className="rq-round-action sos"
              label="Emergency SOS"
            />

            <button
              type="button"
              className="rq-round-action location"
              onClick={fetchLocation}
              disabled={locating}
            >
              {locating ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Crosshair />
              )}

              <strong>
                {locating
                  ? 'Locating...'
                  : 'My Location'}
              </strong>

              <small>
                Share location
              </small>
            </button>
          </div>

          {/* Help banner */}

          <div className="rq-banner">
            <div className="rq-banner-copy">
              <span className="rq-banner-eyebrow">
                NEED HELP?
              </span>

              <strong>
                Stuck on the road?
                <br />
                We&apos;re just a tap away!
              </strong>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById(
                      'services',
                    )
                    ?.scrollIntoView({
                      behavior: 'smooth',
                    })
                }
              >
                Find Help

                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Status */}

          <div className="rq-status-strip">
            <span>
              <span
                className={`status-dot ${
                  coords ? 'live' : ''
                }`}
              />

              {coords
                ? 'Live location active'
                : 'Location ready'}
            </span>

            <span>
              <ShieldAlert className="size-4" />

              Safety-first assistance
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAP
          ===================================================== */}

      <section
        id="map"
        className="rq-map-section"
      >
        <div className="rq-section-head">
          <div>
            <span className="rq-kicker">
              NEARBY SERVICES
            </span>

            <h2>
              Interactive Map
            </h2>
          </div>

          <button
            type="button"
            className="outline-action"
            onClick={fetchLocation}
          >
            <Navigation className="size-4" />

            Recenter
          </button>
        </div>

        <div className="rq-map-shell">
          <div className="rq-map-search">
            <Search className="size-4" />

            <span>
              Search nearby services...
            </span>
          </div>

          <div className="rq-map-tabs">
            {QUICK.map(
              ({
                id,
                title,
                icon: Icon,
              }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setCategory(id)
                  }
                  className={
                    category === id
                      ? 'active'
                      : ''
                  }
                >
                  <Icon className="size-4" />

                  {title.replace(
                    'Find ',
                    '',
                  )}
                </button>
              ),
            )}
          </div>

          <RescueMap
            center={center}
            hasLocation={!!coords}
            activeCategory={category}
          />

          <div className="rq-map-location">
            <MapPin className="size-4" />

            {coords
              ? 'You are here'
              : 'Approximate area'}
          </div>

          <button
            type="button"
            className="rq-recenter"
            onClick={fetchLocation}
            aria-label="Get my current location"
          >
            <Crosshair className="size-4" />
          </button>
        </div>
      </section>

      {/* =====================================================
          SERVICES
          ===================================================== */}

      <section
        id="services"
        className="rq-services"
      >
        <div className="rq-section-head">
          <div>
            <span className="rq-kicker">
              CHOOSE YOUR HELP
            </span>

            <h2>
              Nearby Services
            </h2>
          </div>

          <a
            href="#map"
            className="view-all"
          >
            View Map

            <ChevronRight className="size-4" />
          </a>
        </div>

        <ServiceDirectory
          active={category}
          onChange={setCategory}
          coords={coords}
          search={search}
        />

        <RequestHelp
          coords={coords}
          serviceType={category}
        />
      </section>
    </>
  )
}