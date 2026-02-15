/**
 * Guest flow layout: full-height flex column.
 */
export default function GuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-venue-surface">
      {children}
    </div>
  )
}
