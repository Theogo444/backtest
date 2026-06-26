// ============================================================================
//  Skeleton.jsx — placeholders de chargement (UX : chargement progressif)
// ============================================================================

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

// Bloc de métriques en cours de chargement
export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card">
          <Skeleton className="mb-2 h-3 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      ))}
    </div>
  )
}

// Graphique en cours de chargement
export function ChartSkeleton({ height = 320 }) {
  return (
    <div className="card">
      <Skeleton className="mb-4 h-4 w-1/3" />
      <Skeleton style={{ height }} className="w-full" />
    </div>
  )
}
