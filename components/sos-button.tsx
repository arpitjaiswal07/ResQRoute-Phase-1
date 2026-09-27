'use client'

import { useState } from 'react'
import { Siren, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SosButton({
  className,
  label = 'Emergency WhatsApp SOS',
}: {
  className?: string
  label?: string
}) {
  const [pending, setPending] = useState(false)

  async function shareSos() {
    const openWhatsApp = (locationLine: string) => {
      const text = encodeURIComponent(
        [
          'EMERGENCY SOS - vehicle breakdown, I need urgent help.',
          locationLine,
          'Sent via ResQRoute',
        ].join('\n'),
      )
      window.open(
        `https://wa.me/?text=${text}`,
        '_blank',
        'noopener,noreferrer',
      )
    }

    if (!('geolocation' in navigator)) {
      openWhatsApp('My live location could not be detected - please call me.')
      window.location.href = 'tel:112'
      return
    }

    setPending(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const maps = `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`
        try {
          await fetch('/api/sos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lat:latitude,lng:longitude,accuracy:pos.coords.accuracy,message:'Emergency SOS'}),keepalive:true})
        } catch {}
        openWhatsApp(`My live location: ${maps}`)
        window.location.href = 'tel:112'
        setPending(false)
      },
      () => {
        openWhatsApp('My live location could not be shared - please call me.')
        window.location.href = 'tel:112'
        setPending(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
  <button
    type="button"
    onClick={shareSos}
    disabled={pending}
    aria-label="Send an emergency SOS with your live GPS location to WhatsApp"
    className={cn(
      'relative inline-flex items-center justify-center gap-2 rounded-lg bg-destructive px-4 font-display font-extrabold tracking-tight text-primary-foreground transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-80',
      !pending && 'animate-sos-pulse',
      className,
    )}
  >
    {pending ? (
      <LoaderCircle
        className="size-4 shrink-0 animate-spin"
        aria-hidden
      />
    ) : (
      <Siren
        className="size-4 shrink-0"
        aria-hidden
      />
    )}

    <span className="font-display font-extrabold tracking-tight">
      {pending ? 'Locating…' : label}
    </span>
  </button>
)
}
