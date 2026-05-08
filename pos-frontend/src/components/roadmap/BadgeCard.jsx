/**
 * BadgeCard — shows a single earned or locked badge
 * Props: badge, earned (bool)
 */
export default function BadgeCard({ badge, earned = false }) {
  return (
    <div
      title={badge.description}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all duration-200
        ${earned
          ? 'border-opacity-40 bg-opacity-5 hover:scale-105 cursor-default'
          : 'border-[#1e2532] bg-[#12161b] opacity-40 grayscale'
        }`}
      style={earned
        ? { borderColor: `${badge.color}44`, background: `${badge.color}0a`, boxShadow: `0 0 12px ${badge.color}22` }
        : {}
      }
    >
      <span className="text-2xl">{badge.icon}</span>
      <div>
        <p className="text-xs font-semibold text-white leading-tight">{badge.title}</p>
        <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{badge.description}</p>
      </div>
      {earned && (
        <span
          className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: `${badge.color}22`, color: badge.color }}
        >
          Earned
        </span>
      )}
    </div>
  );
}
