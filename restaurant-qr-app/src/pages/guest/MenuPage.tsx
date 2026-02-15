import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MENU_CATEGORIES, MENU_ITEMS } from '../../data/constants';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>(MENU_CATEGORIES[0]);

  const items = MENU_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-800">Menu</h1>
        <div className="flex gap-2 mt-3 overflow-x-auto -mx-1">
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-4">
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex gap-4 p-0"
            >
              <div className="w-24 h-24 shrink-0 bg-slate-200 rounded-l-xl flex items-center justify-center text-slate-400 text-xs">
                Image
              </div>
              <div className="py-3 pr-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-medium text-slate-800">{item.name}</h3>
                  <p className="text-teal-600 font-semibold mt-0.5">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  className="self-start mt-2 py-2 px-4 rounded-lg bg-teal-500 text-white text-sm font-medium active:scale-[0.98] transition-transform touch-manipulation"
                >
                  Add to cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex gap-3">
        <Link
          to="/guest/people"
          className="flex-1 py-3 rounded-xl bg-teal-500 text-white font-semibold text-center active:scale-[0.98] transition-transform touch-manipulation"
        >
          Continue to checkout
        </Link>
      </footer>
    </div>
  );
}
