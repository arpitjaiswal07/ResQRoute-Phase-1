'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Clock3,
  Moon,
  Navigation,
  Sun,
  Wrench,
} from 'lucide-react'

type Services = {
  vehicleRepair: boolean
  emergencyAssistance: boolean
}

export default function ShopServicesPage() {
  const [darkMode, setDarkMode] = useState(false)

  const [services, setServices] = useState<Services>({
    vehicleRepair: true,
    emergencyAssistance: true,
  })

  const [servicesLoading, setServicesLoading] = useState(true)
  const [serviceError, setServiceError] = useState('')
  const [updatingService, setUpdatingService] = useState<
    keyof Services | null
  >(null)

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('resqroute-theme')
    const isDark = savedTheme === 'dark'

    setDarkMode(isDark)

    document.documentElement.classList.toggle(
      'dark',
      isDark,
    )
  }, [])

  // Load shop services
  useEffect(() => {
    async function loadServices() {
      try {
        setServicesLoading(true)
        setServiceError('')

        const response = await fetch('/api/shop/services', {
          cache: 'no-store',
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Failed to load services',
          )
        }

        if (data.services) {
          setServices({
            vehicleRepair:
              data.services.vehicleRepair ?? true,

            emergencyAssistance:
              data.services.emergencyAssistance ?? true,
          })
        }
      } catch (error) {
        console.error(
          'Failed to load services:',
          error,
        )

        setServiceError(
          'Unable to sync services. Please try again.',
        )
      } finally {
        setServicesLoading(false)
      }
    }

    loadServices()
  }, [])

  function toggleTheme() {
    const nextTheme = !darkMode

    setDarkMode(nextTheme)

    document.documentElement.classList.toggle(
      'dark',
      nextTheme,
    )

    localStorage.setItem(
      'resqroute-theme',
      nextTheme ? 'dark' : 'light',
    )
  }

  async function toggleService(
    service: keyof Services,
  ) {
    if (updatingService !== null) {
      return
    }

    const previousValue = services[service]
    const newValue = !previousValue

    setUpdatingService(service)
    setServiceError('')

    // Optimistic UI update
    setServices((current) => ({
      ...current,
      [service]: newValue,
    }))

    try {
      const response = await fetch('/api/shop/services', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service,
          enabled: newValue,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to update service',
        )
      }

      if (data.services) {
        setServices({
          vehicleRepair:
            data.services.vehicleRepair ?? newValue,

          emergencyAssistance:
            data.services.emergencyAssistance ??
            services.emergencyAssistance,
        })
      }
    } catch (error) {
      console.error(
        'Service toggle error:',
        error,
      )

      // Roll back UI if API update fails
      setServices((current) => ({
        ...current,
        [service]: previousValue,
      }))

      setServiceError(
        'Unable to update service. Please try again.',
      )
    } finally {
      setUpdatingService(null)
    }
  }

  return (
    <main className="shop-services-page">

      {/* HEADER */}
      <header className="shop-services-header">

        <Link
          href="/shop-dashboard"
          className="shop-services-back"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        <div className="shop-services-brand">
          <span className="shop-brand-logo">
            <Navigation className="size-5" />
          </span>

          <span className="shop-brand-name">
            ResQ<span>Route</span>
          </span>
        </div>

        <button
          className="shop-theme-toggle"
          onClick={toggleTheme}
          type="button"
          aria-label={
            darkMode
              ? 'Switch to light theme'
              : 'Switch to dark theme'
          }
          title={
            darkMode
              ? 'Light mode'
              : 'Dark mode'
          }
        >
          {darkMode ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </button>

      </header>

      {/* CONTENT */}
      <section className="shop-services-content">

        <div className="shop-services-heading">
          <div>
            <span className="shop-services-eyebrow">
              SERVICE MANAGEMENT
            </span>

            <h1>
              Manage Your Services
            </h1>

            <p>
              Control the roadside assistance services
              available to ResQRoute customers.
            </p>
          </div>
        </div>

        {serviceError && (
          <div className="shop-services-error">
            {serviceError}
          </div>
        )}

        {/* SERVICE CARDS */}
        <div className="shop-services-grid">

          {/* VEHICLE REPAIR */}
          <div className="shop-service-management-card">

            <div className="shop-service-icon">
              <Wrench className="size-5" />
            </div>

            <div className="shop-service-info">
              <h3>Vehicle Repair</h3>

              <p>
                General roadside vehicle repair and
                mechanical assistance.
              </p>
            </div>

            <button
              className={`shop-service-toggle ${
                services.vehicleRepair
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                toggleService('vehicleRepair')
              }
              type="button"
              disabled={
                servicesLoading ||
                updatingService !== null
              }
            >
              <span className="shop-toggle-track">
                <span className="shop-toggle-thumb" />
              </span>

              <span>
                {servicesLoading
                  ? 'Loading...'
                  : updatingService ===
                      'vehicleRepair'
                    ? 'Updating...'
                    : services.vehicleRepair
                      ? 'Active'
                      : 'Offline'}
              </span>
            </button>

          </div>

          {/* EMERGENCY ASSISTANCE */}
          <div className="shop-service-management-card">

            <div className="shop-service-icon">
              <Navigation className="size-5" />
            </div>

            <div className="shop-service-info">
              <h3>Emergency Assistance</h3>

              <p>
                Immediate roadside assistance for
                stranded customers.
              </p>
            </div>

            <button
              className={`shop-service-toggle ${
                services.emergencyAssistance
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                toggleService(
                  'emergencyAssistance',
                )
              }
              type="button"
              disabled={
                servicesLoading ||
                updatingService !== null
              }
            >
              <span className="shop-toggle-track">
                <span className="shop-toggle-thumb" />
              </span>

              <span>
                {servicesLoading
                  ? 'Loading...'
                  : updatingService ===
                      'emergencyAssistance'
                    ? 'Updating...'
                    : services.emergencyAssistance
                      ? 'Active'
                      : 'Offline'}
              </span>
            </button>

          </div>

          {/* 24/7 AVAILABILITY */}
          <div className="shop-service-management-card">

            <div className="shop-service-icon">
              <Clock3 className="size-5" />
            </div>

            <div className="shop-service-info">
              <h3>24/7 Availability</h3>

              <p>
                Make your workshop available for
                emergency requests.
              </p>
            </div>

            <div className="shop-service-status">
              Coming Soon
            </div>

          </div>

        </div>

      </section>
    </main>
  )
}