/**
 * Empty state: soft dashed border, centered copy.
 */
export function EmptyState({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="rounded-xl border border-dashed border-venue-border bg-venue-surface/60 px-6 py-12 text-center">
      <p className="text-base font-medium text-venue-foreground">{title}</p>
      {description && (
        <p className="mt-1.5 text-sm text-gray-500">{description}</p>
      )}
    </div>
  )
}
