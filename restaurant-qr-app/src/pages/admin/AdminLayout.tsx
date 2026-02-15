import { Outlet, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/seating', label: 'Seating', end: false },
  { to: '/admin/analytics', label: 'Analytics', end: false },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-56 shrink-0 bg-slate-800 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="font-bold text-lg">Admin</h1>
          <p className="text-slate-400 text-xs">Restaurant panel</p>
        </div>
        <nav className="p-3 flex flex-col gap-1">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center">
          <h2 className="font-semibold text-slate-800">Dashboard</h2>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-slate-500">Staff view</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
