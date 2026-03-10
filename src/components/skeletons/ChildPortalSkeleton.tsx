export function ChildPortalSkeleton() {
  return (
    <div className="min-h-[300px] p-4 space-y-4 animate-pulse" role="status" aria-label="A carregar">
      {/* Header: greeting + avatar */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted" />
        <div className="space-y-1.5">
          <div className="h-5 w-32 rounded-lg bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
      </div>

      {/* Stats row: balance + streak */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 rounded-2xl bg-muted" />
        <div className="h-24 rounded-2xl bg-muted" />
      </div>

      {/* Streak widget */}
      <div className="h-16 rounded-2xl bg-muted" />

      {/* Savings / missions cards */}
      <div className="h-28 rounded-2xl bg-muted" />

      {/* Activity list */}
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-14 rounded-xl bg-muted" />
        <div className="h-14 rounded-xl bg-muted" />
        <div className="h-14 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
