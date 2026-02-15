import { Link } from 'react-router-dom';
import { ASSIGNED_TABLE_NUMBER } from '../../data/constants';

export default function SeatingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-50">
      <div className="w-20 h-20 rounded-2xl bg-teal-500 flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-lg">
        {ASSIGNED_TABLE_NUMBER}
      </div>
      <h1 className="text-xl font-bold text-slate-800 text-center mb-2">
        You’re at Table {ASSIGNED_TABLE_NUMBER}
      </h1>
      <p className="text-slate-600 text-center mb-10 max-w-xs">
        Your table has been confirmed. You can view rewards and place your order.
      </p>
      <div className="w-full max-w-xs space-y-3">
        <Link
          to="/guest/rewards"
          className="block w-full py-4 rounded-xl bg-teal-500 text-white font-semibold text-center active:scale-[0.98] transition-transform touch-manipulation"
        >
          Proceed
        </Link>
        <Link
          to="/guest/menu"
          className="block w-full py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-center active:scale-[0.98] transition-transform touch-manipulation"
        >
          Back to menu
        </Link>
      </div>
    </div>
  );
}
