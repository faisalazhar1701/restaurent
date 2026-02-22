/**
 * Loading skeleton: subtle pulse, consistent heights.
 */
export function Skeleton({
  className = '',
  lines = 1,
}: {
  className?: string
  lines?: number
}) {
  return (
    <div
      className={`animate-pulse space-y-3 ${className}`}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-lg bg-slate-200/80"
          style={{ width: i === lines - 1 && lines > 1 ? '75%' : '100%' }}
        />
      ))}
    </div>
  )
}
