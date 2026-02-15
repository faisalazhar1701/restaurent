import { TABLES } from '../../data/constants';

export default function SeatingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Seating overview</h1>
      <p className="text-slate-600 text-sm">
        Table status (dummy data). Green = available, amber = occupied.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {TABLES.map((table) => (
          <div
            key={table.id}
            className={`rounded-xl border-2 p-5 text-center transition-colors ${
              table.status === 'available'
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-amber-300 bg-amber-50'
            }`}
          >
            <p className="text-2xl font-bold text-slate-800">Table {table.number}</p>
            <p
              className={`text-sm font-medium mt-1 ${
                table.status === 'available' ? 'text-emerald-600' : 'text-amber-700'
              }`}
            >
              {table.status === 'available' ? 'Available' : 'Occupied'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
