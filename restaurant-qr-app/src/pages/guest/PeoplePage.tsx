import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GUEST_COUNTS } from '../../data/constants';

export default function PeoplePage() {
  const [dineIn, setDineIn] = useState<boolean>(true);
  const [guestCount, setGuestCount] = useState<number>(2);

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-slate-50">
      <h1 className="text-xl font-bold text-slate-800 mb-1">How are you dining?</h1>
      <p className="text-slate-600 text-sm mb-6">Select your option and party size.</p>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
          Dining option
        </h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setDineIn(true)}
            className={`flex-1 py-4 px-4 rounded-xl border-2 text-center font-medium transition-all touch-manipulation ${
              dineIn
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            Dine-in
          </button>
          <button
            type="button"
            onClick={() => setDineIn(false)}
            className={`flex-1 py-4 px-4 rounded-xl border-2 text-center font-medium transition-all touch-manipulation ${
              !dineIn
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            Takeaway
          </button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
          Number of guests
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {GUEST_COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setGuestCount(n)}
              className={`py-4 rounded-xl border-2 font-semibold transition-all touch-manipulation ${
                guestCount === n
                  ? 'border-teal-500 bg-teal-500 text-white'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-auto pt-4">
        <Link
          to="/guest/order-path"
          className="block w-full py-4 rounded-xl bg-teal-500 text-white font-semibold text-center active:scale-[0.98] transition-transform touch-manipulation"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
