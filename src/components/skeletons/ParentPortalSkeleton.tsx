export function ParentPortalSkeleton() {
  return (
    <div className="min-h-[300px] p-4 space-y-4 animate-pulse" role="status" aria-label="A carregar">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted" />
        <div className="space-y-1.5">
          <div className="h-5 w-40 rounded-lg bg-muted" />
          <div className="h-3 w-28 rounded bg-muted" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="h-20 rounded-2xl bg-muted" />
        <div className="h-20 rounded-2xl bg-muted" />
        <div className="h-20 rounded-2xl bg-muted" />
      </div>

      {/* Children streaks */}
      <div className="h-16 rounded-2xl bg-muted" />

      {/* Children cards */}
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-24 rounded-2xl bg-muted" />
        <div className="h-24 rounded-2xl bg-muted" />
      </div>

      {/* Chart area */}
      <div className="h-36 rounded-2xl bg-muted" />
    </div>
  );
}
