'use client'

import { useEffect, useState } from 'react'
import {
  LoaderCircle,
  Send,
  CheckCircle2,
  Clock3,
  UserCheck,
  Navigation,
  MapPin,
  CircleCheck,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { ServiceCategory } from '@/lib/shops'

type RequestHelpProps = {
  coords: {
    lat: number
    lng: number
  } | null
  serviceType: ServiceCategory
}

type BreakdownStatus =
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'CANCELLED'

type Breakdown = {
  _id: string
  name?: string
  phone?: string
  problem: string
  serviceType: ServiceCategory
  lat: number
  lng: number
  status: BreakdownStatus
  providerId?: string
  createdAt?: string
  updatedAt?: string
}

const STORAGE_KEY =
  'resqroute_active_breakdown_id'

const STATUS_STEPS: {
  status: BreakdownStatus
  label: string
  description: string
  icon: typeof Clock3
}[] = [
  {
    status: 'REQUESTED',
    label: 'Request sent',
    description:
      'Your assistance request has been received.',
    icon: Clock3,
  },
  {
    status: 'ASSIGNED',
    label: 'Shop assigned',
    description:
      'A service provider has accepted your request.',
    icon: UserCheck,
  },
  {
    status: 'ON_THE_WAY',
    label: 'On the way',
    description:
      'The service provider is heading to your location.',
    icon: Navigation,
  },
  {
    status: 'ARRIVED',
    label: 'Provider arrived',
    description:
      'The service provider has reached your location.',
    icon: MapPin,
  },
  {
    status: 'COMPLETED',
    label: 'Completed',
    description:
      'Your roadside assistance request is complete.',
    icon: CircleCheck,
  },
]

function getStatusIndex(
  status: BreakdownStatus,
) {
  return STATUS_STEPS.findIndex(
    (step) => step.status === status,
  )
}

export function RequestHelp({
  coords,
  serviceType,
}: RequestHelpProps) {
  const [problem, setProblem] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const [requestId, setRequestId] =
    useState<string | null>(null)

  const [breakdown, setBreakdown] =
    useState<Breakdown | null>(null)

  /*
   * Fetch the latest breakdown status.
   */
  async function fetchStatus(
    id: string,
  ): Promise<Breakdown | null> {
    try {
      const response = await fetch(
        `/api/breakdowns/${id}`,
        {
          cache: 'no-store',
        },
      )

      const data: {
        breakdown?: Breakdown
        error?: string
      } = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to load request status',
        )
      }

      if (data.breakdown) {
        setBreakdown(data.breakdown)

        return data.breakdown
      }

      return null
    } catch (error) {
      console.error(
        'Breakdown status fetch error:',
        error,
      )

      return null
    }
  }

  /*
   * Restore the active request after page refresh.
   */
  useEffect(() => {
    const savedRequestId =
      localStorage.getItem(STORAGE_KEY)

    if (!savedRequestId) {
      return
    }

    setRequestId(savedRequestId)
    setDone(true)
  }, [])

  /*
   * Poll the breakdown status every 4 seconds.
   */
  useEffect(() => {
    if (!requestId) {
      return
    }

    // Local constant ensures TypeScript knows
    // this value is definitely a string.
    const id = requestId

    let cancelled = false

    let intervalId:
      | ReturnType<typeof setInterval>
      | null = null

    async function startPolling() {
      const latest =
        await fetchStatus(id)

      if (cancelled) {
        return
      }

      if (
        latest?.status === 'COMPLETED' ||
        latest?.status === 'CANCELLED'
      ) {
        return
      }

      intervalId = setInterval(
        async () => {
          if (cancelled) {
            return
          }

          const updated =
            await fetchStatus(id)

          if (
            updated?.status ===
              'COMPLETED' ||
            updated?.status ===
              'CANCELLED'
          ) {
            if (intervalId) {
              clearInterval(intervalId)
              intervalId = null
            }
          }
        },
        4000,
      )
    }

    startPolling()

    return () => {
      cancelled = true

      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [requestId])

  async function submit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault()

    if (!coords) {
      setError(
        'Location is not available.',
      )
      return
    }

    if (!problem.trim()) {
      setError(
        'Please describe the problem.',
      )
      return
    }

    setBusy(true)
    setError('')
    setRequestId(null)
    setBreakdown(null)
    setDone(false)

    try {
      const response = await fetch(
        '/api/breakdowns',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            problem: problem.trim(),
            serviceType,
            lat: coords.lat,
            lng: coords.lng,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Unable to create request',
        )
      }

      const createdBreakdown =
        data?.breakdown as
          | Breakdown
          | undefined

      if (!createdBreakdown?._id) {
        throw new Error(
          'Request was created but its ID was not returned.',
        )
      }

      const id = String(
        createdBreakdown._id,
      )

      /*
       * Save request ID so it survives page refresh.
       */
      localStorage.setItem(
        STORAGE_KEY,
        id,
      )

      setRequestId(id)
      setBreakdown(createdBreakdown)
      setDone(true)

      setProblem('')
      setName('')
      setPhone('')
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Request failed',
      )
    } finally {
      setBusy(false)
    }
  }

  /*
   * Start a completely new request.
   */
  function startNewRequest() {
    localStorage.removeItem(
      STORAGE_KEY,
    )

    setDone(false)
    setError('')
    setRequestId(null)
    setBreakdown(null)
  }

  const currentStatus =
    breakdown?.status || 'REQUESTED'

  const currentIndex =
    getStatusIndex(currentStatus)

  const isCancelled =
    currentStatus === 'CANCELLED'

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="font-display text-xl font-bold">
        Request roadside assistance
      </h3>

      <p className="mt-1 text-sm text-muted-foreground">
        Your current GPS coordinates will be
        attached to the request.
      </p>

      {!done ? (
        <form
          onSubmit={submit}
          className="mt-5 grid gap-3 sm:grid-cols-2"
        >
          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Your name (optional)"
            className="rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />

          <input
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            placeholder="Phone (optional)"
            className="rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />

          <textarea
            required
            value={problem}
            onChange={(e) =>
              setProblem(e.target.value)
            }
            placeholder="What happened?"
            className="min-h-24 rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 sm:col-span-2"
          />

          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
            <Button
              type="submit"
              disabled={
                busy ||
                !problem.trim() ||
                !coords
              }
              className="gap-2"
            >
              {busy ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}

              {busy
                ? 'Sending…'
                : 'Request help'}
            </Button>

            {error && (
              <span className="text-sm text-destructive">
                {error}
              </span>
            )}
          </div>
        </form>
      ) : (
        <div className="mt-5 space-y-5">
          {/* Request created */}
          <div className="flex items-start gap-3 rounded-xl bg-primary/10 p-4 text-sm">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-primary">
                Assistance request created
              </p>

              {requestId && (
                <p className="mt-1 break-all text-xs text-muted-foreground">
                  Request ID: {requestId}
                </p>
              )}
            </div>
          </div>

          {/* Live status */}
          <div className="rounded-2xl border border-border bg-background p-4">
            <div>
              <h4 className="font-semibold">
                Live request status
              </h4>

              <p className="mt-1 text-xs text-muted-foreground">
                Status updates automatically.
              </p>
            </div>

            {isCancelled ? (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />

                <div>
                  <p className="font-semibold text-destructive">
                    Request cancelled
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    This assistance request is no longer active.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {STATUS_STEPS.map(
                  (
                    step,
                    index,
                  ) => {
                    const Icon =
                      step.icon

                    const completed =
                      currentIndex >=
                      index

                    const active =
                      currentStatus ===
                      step.status

                    return (
                      <div
                        key={step.status}
                        className="flex items-start gap-3"
                      >
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full border ${
                            completed
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-secondary text-muted-foreground'
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm font-semibold ${
                                completed
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {step.label}
                            </p>

                            {active && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                                Current
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    )
                  },
                )}
              </div>
            )}

            {currentStatus ===
              'COMPLETED' && (
              <div className="mt-5 rounded-xl bg-primary/10 p-4 text-sm font-medium text-primary">
                Your roadside assistance request has
                been completed.
              </div>
            )}
          </div>

          {/* New request */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={startNewRequest}
            >
              New request
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}