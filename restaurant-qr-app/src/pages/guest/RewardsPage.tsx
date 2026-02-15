import { Link } from 'react-router-dom';
import { REWARDS } from '../../data/constants';

export default function RewardsPage() {
  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-slate-50">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Rewards</h1>
      <p className="text-slate-600 text-sm mb-6">
        Your points and available rewards. (UI only – no real logic.)
      </p>

      <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
        <p className="text-teal-100 text-sm">Points balance</p>
        <p className="text-3xl font-bold mt-1">{REWARDS.pointsBalance.toLocaleString()}</p>
        <p className="text-teal-100 text-xs mt-2">Keep ordering to unlock more rewards</p>
      </div>

      <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
        Rewards list
      </h2>
      <ul className="space-y-3 mb-8">
        {REWARDS.tiers.map((tier) => (
          <li
            key={tier.id}
            className={`rounded-xl border-2 p-4 flex items-center justify-between ${
              tier.unlocked
                ? 'border-teal-200 bg-teal-50'
                : 'border-slate-200 bg-slate-100 opacity-80'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  tier.unlocked ? 'bg-teal-500 text-white' : 'bg-slate-300 text-slate-500'
                }`}
              >
                {tier.unlocked ? '✓' : '🔒'}
              </span>
              <div>
                <p className="font-medium text-slate-800">{tier.name}</p>
                <p className="text-sm text-slate-500">{tier.points} pts required</p>
              </div>
            </div>
            {tier.unlocked ? (
              <span className="text-xs font-medium text-teal-600">Unlocked</span>
            ) : (
              <span className="text-xs text-slate-400">Locked</span>
            )}
          </li>
        ))}
      </ul>

      <Link
        to="/guest/seating"
        className="block w-full py-4 rounded-xl bg-teal-500 text-white font-semibold text-center active:scale-[0.98] transition-transform touch-manipulation"
      >
        Back to table
      </Link>
    </div>
  );
}
