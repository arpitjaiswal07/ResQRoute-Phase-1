"use client";

import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { useState } from "react";

import { RescueMap } from "@/components/rescue-map";
import { DEFAULT_CENTER } from "@/lib/shops";
import type { ServiceCategory } from "@/lib/shops";

export default function MapPage() {
  const [activeCategory, setActiveCategory] =
    useState<ServiceCategory>("mechanics");

  /*
   * For now we use the project's existing default center.
   *
   * Later, when browser GPS is connected here,
   * this center will be replaced with the user's
   * actual latitude/longitude.
   */
  const center = DEFAULT_CENTER;

  const hasLocation = false;

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* =========================
          HEADER
      ========================== */}
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
        {/* Back / Home */}
        <Link
          href="/"
          className="
            inline-flex
            shrink-0
            items-center
            gap-2
            rounded-full
            border
            border-border
            px-4
            py-2
            text-sm
            font-medium
            transition-colors
            hover:bg-muted
          "
        >
          <ArrowLeft className="size-4" />
          <span>Home</span>
        </Link>

        {/* Page title */}
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="
              flex
              size-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-primary
              text-primary-foreground
            "
          >
            <MapPin className="size-5" />
          </span>

          <div className="min-w-0">
            <h1 className="truncate text-base font-bold sm:text-lg">
              Nearby Services
            </h1>

            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              Find roadside assistance near you
            </p>
          </div>
        </div>
      </header>

      {/* =========================
          CATEGORY FILTER
      ========================== */}
      <section className="border-b border-border px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">

          {/* Mechanics */}
          <button
            type="button"
            onClick={() => setActiveCategory("mechanics")}
            className={`
              shrink-0
              rounded-full
              px-4
              py-2
              text-sm
              font-semibold
              transition-colors
              ${
                activeCategory === "mechanics"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-foreground hover:bg-muted"
              }
            `}
          >
            Mechanics
          </button>

          {/* Towing */}
          <button
            type="button"
            onClick={() => setActiveCategory("towing")}
            className={`
              shrink-0
              rounded-full
              px-4
              py-2
              text-sm
              font-semibold
              transition-colors
              ${
                activeCategory === "towing"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-foreground hover:bg-muted"
              }
            `}
          >
            Towing
          </button>

          {/* Rentals */}
          <button
            type="button"
            onClick={() => setActiveCategory("rentals")}
            className={`
              shrink-0
              rounded-full
              px-4
              py-2
              text-sm
              font-semibold
              transition-colors
              ${
                activeCategory === "rentals"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-foreground hover:bg-muted"
              }
            `}
          >
            Rentals
          </button>
        </div>
      </section>

      {/* =========================
          MAP AREA
      ========================== */}
      <section className="px-3 py-4 sm:px-5 sm:py-5">

        <div
          className="
            mx-auto
            h-[calc(100vh-190px)]
            min-h-[520px]
            w-full
            max-w-7xl
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-muted
          "
        >
          <RescueMap
            center={center}
            hasLocation={hasLocation}
            activeCategory={activeCategory}
          />
        </div>

      </section>
    </main>
  );
}