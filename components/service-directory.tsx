"use client";

import { useEffect, useState } from "react";
import {
  Wrench,
  Truck,
  Car,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  DEFAULT_CENTER,
  type ServiceCategory,
  type Shop,
} from "@/lib/shops";
import { ShopCard } from "@/components/shop-card";

const TABS: { id: ServiceCategory; icon: typeof Wrench; short: string }[] = [
  { id: "mechanics", icon: Wrench, short: "Mechanics" },
  { id: "towing", icon: Truck, short: "Towing" },
  { id: "rentals", icon: Car, short: "Rentals" },
];

const REQUEST_TIMEOUT_MS = 10_000;

export function ServiceDirectory({
  active,
  onChange,
  coords,
  search = "",
}: {
  active: ServiceCategory;
  onChange: (c: ServiceCategory) => void;
  coords: { lat: number; lng: number } | null;
  search?: string;
}) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const queryCoords = coords ?? DEFAULT_CENTER;
    const controller = new AbortController();

    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    setLoading(true);
    setError("");

    fetch(
      `/api/shops?lat=${queryCoords.lat}&lng=${queryCoords.lng}&category=${active}`,
      {
        cache: "no-store",
        signal: controller.signal,
      },
    )
      .then(async (r) => {
        let d: {
          error?: string;
          providers?: Shop[];
        } = {};

        try {
          d = await r.json();
        } catch {
          throw new Error("Unable to read service response");
        }

        if (!r.ok) {
          throw new Error(d.error || "Unable to load services");
        }

        if (!cancelled) {
          setShops(d.providers || []);
        }
      })
      .catch((e) => {
        if (cancelled) return;

        if (e?.name === "AbortError") {
          setError(
            "Service request timed out. Please check your connection and try again.",
          );
          return;
        }

        setError(
          e?.message || "Unable to load services. Please try again.",
        );
      })
      .finally(() => {
        window.clearTimeout(timeoutId);

        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [coords, active]);

  const filteredShops = shops.filter((shop) => {
    if (
      active === "mechanics" &&
      shop.services?.vehicleRepair === false
    ) {
      return false;
    }

    const q = search.trim().toLowerCase();

    return (
      !q ||
      [shop.name, shop.address, ...(shop.tags || [])]
        .filter(Boolean)
        .some((v) =>
          String(v).toLowerCase().includes(q),
        )
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-2 shadow-sm sm:flex-row">
        {TABS.map(({ id, icon: Icon, short }) => {
          const selected = active === id;

          return (
            <button
              key={id}
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(id)}
              className={cn(
                "group flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold transition-all",
                selected
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg transition-colors",
                  selected
                    ? "bg-primary-foreground/15"
                    : "bg-secondary group-hover:bg-background",
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>

              <span>{short}</span>

              {/* <span
                className={cn(
                  "hidden text-xs font-medium sm:inline",
                  selected
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground/70",
                )}
              >
                {CATEGORY_LABELS[id]
                  .replace(" & Garages", "")
                  .replace(" Services", "")
                  .replace("Emergency ", "")}
              </span> */}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-muted-foreground">
          {loading
            ? "Finding nearby providers…"
            : `${filteredShops.length} provider${
                filteredShops.length === 1 ? "" : "s"
              } available`}
        </p>

        <span className="hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground sm:inline-flex">
          <SlidersHorizontal className="size-3.5" />
          Sorted by distance
        </span>
      </div>

      {!coords && shops.length === 0 && !loading && !error ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
          Showing demo-area services. Share your GPS above for real nearby
          results.
        </div>
      ) : loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="service-skeleton h-64 rounded-2xl border border-border"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No {CATEGORY_LABELS[active].toLowerCase()} found within the available
          search area.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}