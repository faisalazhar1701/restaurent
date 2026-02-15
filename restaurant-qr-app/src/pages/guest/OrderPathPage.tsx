import { Link } from 'react-router-dom';

export default function OrderPathPage() {
  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-slate-50">
      <h1 className="text-xl font-bold text-slate-800 mb-1">When would you like to order?</h1>
      <p className="text-slate-600 text-sm mb-8">
        Choose whether to place your order now or schedule it for later.
      </p>

      <div className="space-y-4 flex-1">
        <Link
          to="/guest/seating"
          className="block p-5 rounded-xl border-2 border-teal-500 bg-teal-50 transition-all active:scale-[0.99] touch-manipulation"
        >
          <h2 className="font-semibold text-teal-800 text-lg">Order Now</h2>
          <p className="text-teal-600 text-sm mt-1">
            Submit your order right away. Kitchen will start preparing.
          </p>
        </Link>

        <Link
          to="/guest/seating"
          className="block p-5 rounded-xl border-2 border-slate-200 bg-white transition-all active:scale-[0.99] touch-manipulation"
        >
          <h2 className="font-semibold text-slate-800 text-lg">Order Later</h2>
          <p className="text-slate-600 text-sm mt-1">
            Set a time for your order. We’ll remind you and prepare then.
          </p>
        </Link>
      </div>

      <div className="pt-6">
        <Link
          to="/guest/people"
          className="text-teal-600 text-sm font-medium"
        >
          ← Back
        </Link>
      </div>
    </div>
  );
}
