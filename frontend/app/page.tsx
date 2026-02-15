import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-venue-surface px-6">
      <div className="mx-auto max-w-content text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-venue-muted">
          Mall & Food Court Operations
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-venue-primary sm:text-4xl">
          Venue Seat
        </h1>
        <p className="mt-4 text-base text-venue-muted">
          Order at your table. Browse menus. Get seated automatically.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href="/guest"
            className="btn-primary w-full py-3.5 text-center sm:w-auto sm:min-w-[180px]"
          >
            I&apos;m a guest
          </Link>
          <Link
            href="/admin/login"
            className="btn-secondary w-full py-3.5 text-center sm:w-auto sm:min-w-[180px]"
          >
            Admin
          </Link>
        </div>
      </div>
    </main>
  )
}
