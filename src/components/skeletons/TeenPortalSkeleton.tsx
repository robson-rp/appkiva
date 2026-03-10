export function TeenPortalSkeleton() {
  return (
    <div className="min-h-[300px] p-4 space-y-4 animate-pulse" role="status" aria-label="A carregar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-5 w-36 rounded-lg bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
        <div className="w-10 h-10 rounded-full bg-muted" />
      </div>

      {/* Balance card */}
      <div className="h-28 rounded-2xl bg-muted" />

      {/* Budget bar */}
      <div className="h-10 rounded-xl bg-muted" />

      {/* Category breakdown grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="h-20 rounded-xl bg-muted" />
        <div className="h-20 rounded-xl bg-muted" />
        <div className="h-20 rounded-xl bg-muted" />
      </div>

      {/* Transactions */}
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-14 rounded-xl bg-muted" />
        <div className="h-14 rounded-xl bg-muted" />
        <div className="h-14 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
