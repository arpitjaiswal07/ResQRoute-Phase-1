"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CarFront,
  ChevronRight,
  Flame,
  MapPin,
  PhoneCall,
  ShieldAlert,
  Siren,
  TriangleAlert,
} from "lucide-react";

const safetySections = [
  {
    icon: CarFront,
    title: "Vehicle Breakdown",
    description:
      "Move your vehicle to a safe location if possible and switch on hazard lights.",
    tips: [
      "Slow down and move to the left shoulder.",
      "Turn on hazard lights.",
      "Keep passengers away from moving traffic.",
      "Call a mechanic or towing service.",
    ],
  },
  {
    icon: TriangleAlert,
    title: "Stranded or Unsafe",
    description:
      "If you are stuck in an isolated or unsafe area, prioritize your personal safety.",
    tips: [
      "Keep vehicle doors locked.",
      "Avoid getting out in isolated areas.",
      "Share your live location with someone you trust.",
      "Move toward a well-lit public place when safe.",
    ],
  },
  {
    icon: Flame,
    title: "Smoke or Fire",
    description:
      "If smoke or fire is coming from the vehicle, get everyone away from it.",
    tips: [
      "Stop the vehicle safely.",
      "Switch off the engine.",
      "Move away from the vehicle.",
      "Do not open a hot radiator.",
      "Call emergency services if there is a fire.",
    ],
  },
  {
    icon: Siren,
    title: "Accident or Injury",
    description:
      "For collisions or injuries, get emergency assistance immediately.",
    tips: [
      "Move to a safe location if possible.",
      "Check for injuries without putting yourself in danger.",
      "Call 112 for emergency assistance.",
      "Give responders your exact location.",
    ],
  },
];

export default function SafetyGuidePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">

          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Home
          </Link>

          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldAlert className="size-5" />
            </span>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold sm:text-lg">
                Safety Guide
              </h1>

              <p className="truncate text-xs text-muted-foreground">
                Stay safe during roadside emergencies
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">

        {/* HERO */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <ShieldAlert className="size-3.5" />
                Roadside Safety
              </div>

              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Stay calm. Stay safe.
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Follow these simple steps when your vehicle breaks
                down or you face an emergency on the road.
              </p>
            </div>

            <a
              href="tel:112"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              <PhoneCall className="size-5" />
              Call 112
            </a>

          </div>
        </div>

        {/* EMERGENCY BANNER */}
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 sm:p-5">

          <div className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600">
              <Siren className="size-5" />
            </span>

            <div>
              <h3 className="font-bold text-red-700 dark:text-red-400">
                Immediate danger?
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                If there is an injury, fire, collision, or immediate
                danger, contact emergency services instead of waiting
                for roadside assistance.
              </p>
            </div>
          </div>

        </div>

        {/* SAFETY CARDS */}
        <div className="grid gap-4 sm:grid-cols-2">

          {safetySections.map((section) => {
            const Icon = section.icon;

            return (
              <article
                key={section.title}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/30"
              >

                <div className="flex items-start gap-4">

                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>

                  <div className="min-w-0">
                    <h3 className="font-bold">
                      {section.title}
                    </h3>

                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {section.description}
                    </p>
                  </div>

                </div>

                <div className="mt-5 border-t border-border pt-4">

                  <ul className="space-y-3">
                    {section.tips.map((tip) => (
                      <li
                        key={tip}
                        className="flex gap-2.5 text-sm"
                      >
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />

                        <span className="leading-relaxed text-muted-foreground">
                          {tip}
                        </span>
                      </li>
                    ))}
                  </ul>

                </div>
              </article>
            );
          })}

        </div>

        {/* LOCATION */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="size-5" />
              </span>

              <div>
                <h3 className="font-bold">
                  Keep your location ready
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Your location can help roadside and emergency
                  responders reach you faster.
                </p>
              </div>
            </div>

            <Link
              href="/map"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Open Map
              <ChevronRight className="size-4" />
            </Link>

          </div>
        </div>

        {/* QUICK RULES */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">

          <h3 className="font-bold">
            Remember these basics
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">

            <div className="rounded-xl bg-muted/50 p-4">
              <strong className="text-sm">
                01 · Be visible
              </strong>

              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Use hazard lights and stay away from traffic.
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <strong className="text-sm">
                02 · Stay calm
              </strong>

              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Avoid risky actions while trying to fix a problem.
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <strong className="text-sm">
                03 · Get help
              </strong>

              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Contact roadside or emergency services when needed.
              </p>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-center gap-2 py-7 text-center text-xs text-muted-foreground">
          <ShieldAlert className="size-4" />
          ResQRoute Safety Guide
        </div>

      </section>
    </main>
  );
}