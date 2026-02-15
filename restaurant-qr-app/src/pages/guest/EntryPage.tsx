import { Link } from 'react-router-dom';
import { RESTAURANT } from '../../data/constants';

export default function EntryPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-teal-50 to-white">
      <div className="w-16 h-16 rounded-2xl bg-teal-500 mb-6 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
        {RESTAURANT.name.charAt(0)}
      </div>
      <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">
        {RESTAURANT.name}
      </h1>
      <p className="text-slate-600 text-center mb-8 max-w-xs">
        {RESTAURANT.tagline}. Scan to order at your table.
      </p>
      <Link
        to="/guest/menu"
        className="w-full max-w-xs py-4 px-6 rounded-xl bg-teal-500 text-white font-semibold text-center shadow-md active:scale-[0.98] transition-transform touch-manipulation"
      >
        Start Order
      </Link>
      <p className="text-slate-400 text-sm mt-6">No app download required</p>
    </div>
  );
}
