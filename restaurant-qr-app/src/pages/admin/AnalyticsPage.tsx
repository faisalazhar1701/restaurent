import { ADMIN_STATS } from '../../data/constants';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
      <p className="text-slate-600 text-sm">Placeholder cards and chart (static visuals).</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Orders</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{ADMIN_STATS.ordersToday}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Guests</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{ADMIN_STATS.guestsToday}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Revenue</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            ${ADMIN_STATS.revenueToday.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-4">Chart placeholder</h2>
        <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
          Chart area (static placeholder)
        </div>
      </div>
    </div>
  );
}
