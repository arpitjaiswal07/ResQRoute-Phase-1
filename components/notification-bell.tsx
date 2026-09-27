'use client'

import {
  Bell,
  CheckCheck,
  Clock3,
  X,
} from 'lucide-react'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

type NotificationItem = {
  _id: string
  type: string
  title: string
  message: string
  breakdownId?: string
  read: boolean
  createdAt: string
}

export function NotificationBell() {
  const [open, setOpen] =
    useState(false)

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([])

  const [unreadCount, setUnreadCount] =
    useState(0)

  const [loading, setLoading] =
    useState(false)

  const dropdownRef =
    useRef<HTMLDivElement | null>(null)

  async function loadNotifications(
    silent = false,
  ) {
    try {
      if (!silent) {
        setLoading(true)
      }

      const response = await fetch(
        '/api/notifications',
        {
          cache: 'no-store',
        },
      )

      if (!response.ok) {
        return
      }

      const data =
        await response.json()

      setNotifications(
        data.notifications || [],
      )

      setUnreadCount(
        Number(
          data.unreadCount || 0,
        ),
      )
    } catch (error) {
      console.error(
        'Notification loading error:',
        error,
      )
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadNotifications()

    const interval =
      setInterval(() => {
        loadNotifications(true)
      }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick,
      )
    }
  }, [])

  async function markAsRead(
    id: string,
  ) {
    try {
      const response =
        await fetch(
          `/api/notifications/${id}`,
          {
            method: 'PATCH',
          },
        )

      if (!response.ok) {
        return
      }

      setNotifications(
        (current) =>
          current.map(
            (notification) =>
              notification._id === id
                ? {
                    ...notification,
                    read: true,
                  }
                : notification,
          ),
      )

      setUnreadCount(
        (current) =>
          Math.max(0, current - 1),
      )
    } catch (error) {
      console.error(
        'Mark notification read error:',
        error,
      )
    }
  }

  async function markAllAsRead() {
    try {
      const response =
        await fetch(
          '/api/notifications',
          {
            method: 'PATCH',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              all: true,
            }),
          },
        )

      if (!response.ok) {
        return
      }

      setNotifications(
        (current) =>
          current.map(
            (notification) => ({
              ...notification,
              read: true,
            }),
          ),
      )

      setUnreadCount(0)
    } catch (error) {
      console.error(
        'Mark all notifications read error:',
        error,
      )
    }
  }

  function formatTime(
    value: string,
  ) {
    try {
      return new Date(
        value,
      ).toLocaleString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        },
      )
    } catch {
      return ''
    }
  }

  function handleNotificationClick(
    notification: NotificationItem,
  ) {
    if (!notification.read) {
      markAsRead(
        notification._id,
      )
    }

    if (
      notification.breakdownId
    ) {
      setOpen(false)

      /*
       * Keep the notification click
       * non-destructive.
       *
       * The existing dashboard already
       * contains the request information.
       */
    }
  }

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() => {
          setOpen(
            (current) => !current,
          )

          if (!open) {
            loadNotifications()
          }
        }}
        className="relative flex size-10 items-center justify-center rounded-xl border bg-background transition hover:bg-muted"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="size-4" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99
              ? '99+'
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[100] w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h3 className="text-sm font-bold">
                Notifications
              </h3>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : 'All caught up'}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={
                    markAllAsRead
                  }
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                >
                  <CheckCheck className="size-3.5" />
                  Mark all read
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="flex size-8 items-center justify-center rounded-lg hover:bg-muted"
                aria-label="Close notifications"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading &&
            notifications.length ===
              0 ? (
              <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
                <Clock3 className="size-4 animate-pulse" />
                Loading notifications...
              </div>
            ) : notifications.length ===
              0 ? (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-muted">
                  <Bell className="size-5 text-muted-foreground" />
                </div>

                <p className="mt-3 text-sm font-semibold">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  New activity will appear here.
                </p>
              </div>
            ) : (
              notifications.map(
                (
                  notification,
                ) => (
                  <button
                    key={
                      notification._id
                    }
                    type="button"
                    onClick={() =>
                      handleNotificationClick(
                        notification,
                      )
                    }
                    className={`w-full border-b px-4 py-4 text-left transition hover:bg-muted/60 ${
                      notification.read
                        ? 'bg-background'
                        : 'bg-primary/[0.04]'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${
                          notification.read
                            ? 'bg-muted'
                            : 'bg-primary/10'
                        }`}
                      >
                        <Bell
                          className={`size-4 ${
                            notification.read
                              ? 'text-muted-foreground'
                              : 'text-primary'
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm ${
                              notification.read
                                ? 'font-medium'
                                : 'font-bold'
                            }`}
                          >
                            {
                              notification.title
                            }
                          </p>

                          {!notification.read && (
                            <span className="mt-1 size-2 shrink-0 rounded-full bg-red-500" />
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {
                            notification.message
                          }
                        </p>

                        <p className="mt-2 text-[10px] text-muted-foreground">
                          {formatTime(
                            notification.createdAt,
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                ),
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}