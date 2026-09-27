export function ShopDashboardSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden h-10 w-10 animate-pulse rounded-xl bg-muted sm:block" />
            <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="animate-pulse space-y-5">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-9 w-3/4 max-w-xl rounded bg-muted" />
            <div className="h-4 w-full max-w-2xl rounded bg-muted" />
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="h-11 w-36 rounded-xl bg-muted" />
              <div className="h-11 w-32 rounded-xl bg-muted" />
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-2xl border border-border bg-card p-5">
              <div className="animate-pulse space-y-3">
                <div className="h-9 w-9 rounded-xl bg-muted" />
                <div className="h-7 w-16 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="h-3 w-56 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
          </div>

          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div key={item} className="rounded-2xl border border-border p-4">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="h-3 w-24 rounded bg-muted" />
                    </div>
                    <div className="h-7 w-20 rounded-full bg-muted" />
                  </div>
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-10 w-28 rounded-xl bg-muted" />
                    <div className="h-10 w-32 rounded-xl bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="space-y-2">
            <div className="h-5 w-36 animate-pulse rounded bg-muted" />
            <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          </div>
          <div className="mt-5 rounded-2xl border border-border p-5">
            <div className="animate-pulse space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-4/5 rounded bg-muted" />
                <div className="h-3 w-3/5 rounded bg-muted" />
              </div>
              <div className="h-11 w-full rounded-xl bg-muted" />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
