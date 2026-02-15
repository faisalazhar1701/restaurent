import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-50">
      <h1 className="text-xl font-bold text-slate-800 mb-6">QR Restaurant Ordering</h1>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <Link
          to="/guest"
          className="py-4 px-6 rounded-xl bg-teal-500 text-white font-semibold text-center active:scale-[0.98] transition-transform touch-manipulation"
        >
          Guest (order flow)
        </Link>
        <Link
          to="/admin"
          className="py-4 px-6 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold text-center active:scale-[0.98] transition-transform touch-manipulation"
        >
          Admin
        </Link>
      </div>
    </div>
  );
}
