import {
  Phone,
  Star,
  MapPin,
  Clock,
  MessageCircle,
  BadgeCheck,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Shop } from '@/lib/shops'

export function ShopCard({ shop }: { shop: Shop }) {
  const km = shop.distanceKm ?? 0

  const waText = encodeURIComponent(
    `Hi ${shop.name}, I have a vehicle breakdown and need emergency assistance. Can you help?`,
  )

  const hasLocation =
    typeof shop.lat === 'number' &&
    typeof shop.lng === 'number' &&
    Number.isFinite(shop.lat) &&
    Number.isFinite(shop.lng)

  const mapUrl = hasLocation
    ? `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`
    : undefined

  return (
    <article className="rq-provider-card relative">
      {/* SHOP STATUS */}
      <span
        className={
          shop.open
            ? 'rq-open absolute right-4 top-4'
            : 'rq-open rq-closed absolute right-4 top-4'
        }
      >
        {shop.open ? 'Open' : 'Closed'}
      </span>

      <div className="rq-provider-main">
        <div className="rq-provider-thumb">
          <WrenchMini />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3>{shop.name}</h3>

            {shop.verified && (
              <BadgeCheck className="size-5 shrink-0 text-cyan-400" />
            )}
          </div>

          <div className="rq-provider-meta">
            <Star className="fill-amber-400 text-amber-400 size-3.5" />

            {shop.rating.toFixed(1)} ({shop.reviews})

            <span>•</span>

            {km < 0.1 ? '<1' : km.toFixed(1)} km

            <span>•</span>

            <Clock className="size-3.5" />

            {shop.eta}
          </div>

          <div className="rq-tags">
            {(shop.tags || []).map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="rq-provider-actions">

        {/* CALL */}
        <a
          href={`tel:${shop.phone}`}
          className="rq-provider-call"
        >
          <Phone className="size-4" />
          Call
        </a>

        {/* CHAT */}
        <Button
          variant="outline"
          nativeButton={false}
          className="rq-provider-chat"
          render={
            <a
              href={
                shop.whatsapp
                  ? `https://wa.me/${shop.whatsapp}?text=${waText}`
                  : undefined
              }
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          <MessageCircle className="size-4" />
          Chat
          <ArrowUpRight className="size-3.5 opacity-60" />
        </Button>

        {/* LOCATION */}
        <Button
          variant="outline"
          nativeButton={false}
          className="rq-provider-chat"
          render={
            <a
              href={mapUrl}
              target={hasLocation ? '_blank' : undefined}
              rel={hasLocation ? 'noreferrer' : undefined}
              aria-label={
                hasLocation
                  ? `Open ${shop.name} location`
                  : 'Provider location unavailable'
              }
              title={
                hasLocation
                  ? 'Open location'
                  : 'Location unavailable'
              }
            />
          }
        >
          <MapPin className="size-4" />
          Location
        </Button>
      </div>
    </article>
  )
}

function WrenchMini() {
  return (
    <span className="rq-thumb-icon">
      <MapPin className="size-5" />
    </span>
  )
}