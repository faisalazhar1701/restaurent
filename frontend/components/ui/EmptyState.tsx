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
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-8 py-16 text-center">
      <p className="text-base font-medium text-slate-900">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      )}
    </div>
  )
}
