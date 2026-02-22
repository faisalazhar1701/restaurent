/**
 * Guest flow layout: full-height flex column.
 */
export default function GuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {children}
    </div>
  )
}
