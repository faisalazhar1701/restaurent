import { Link } from 'react-router-dom';
import { ADMIN_STATS } from '../../data/constants';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Orders today</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{ADMIN_STATS.ordersToday}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Guests today</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{ADMIN_STATS.guestsToday}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Revenue today</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            ${ADMIN_STATS.revenueToday.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Link
          to="/admin/seating"
          className="py-3 px-5 rounded-xl bg-teal-500 text-white font-medium"
        >
          Seating overview
        </Link>
        <Link
          to="/admin/analytics"
          className="py-3 px-5 rounded-xl border border-slate-200 text-slate-700 font-medium"
        >
          Analytics
        </Link>
      </div>
    </div>
  );
}
