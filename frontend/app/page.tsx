import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-venue-primary px-6">
      <h1 className="text-2xl font-semibold text-white">Venue Seat</h1>
      <p className="mt-2 text-sm text-white/80">Mall & Food Court</p>
      <div className="mt-12 flex flex-col gap-4">
        <Link
          href="/guest"
          className="btn-accent w-full max-w-xs py-4 text-center text-base font-semibold"
        >
          Guest
        </Link>
        <Link
          href="/admin/login"
          className="btn-secondary w-full max-w-xs border-white/30 py-4 text-center text-base font-semibold text-white"
        >
          Admin
        </Link>
      </div>
    </main>
  )
}
