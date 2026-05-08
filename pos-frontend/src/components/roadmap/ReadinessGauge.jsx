/**
 * ReadinessGauge — circular progress ring showing placement readiness score
 * Props: score (0-100), breakdown { dsa, projects, coreCS, resume, communication }
 */
export default function ReadinessGauge({ score = 0, breakdown = {} }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = ((score / 100) * circumference).toFixed(1);

  const getScoreColor = (s) => {
    if (s >= 75) return '#40e0d0';
    if (s >= 50) return '#fbbf24';
    return '#f87171';
  };

  const color = getScoreColor(score);

  const breakdownItems = [
    { label: 'DSA', value: breakdown.dsa || 0, color: '#f472b6' },
    { label: 'Projects', value: breakdown.projects || 0, color: '#60a5fa' },
    { label: 'Core CS', value: breakdown.coreCS || 0, color: '#fb923c' },
    { label: 'Resume', value: breakdown.resume || 0, color: '#c084fc' },
    { label: 'Comm.', value: breakdown.communication || 0, color: '#fbbf24' },
  ];

  return (
    <div className="bg-[#171c23] border border-[#222a35] rounded-2xl p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-5">Placement Readiness</p>

      <div className="flex items-center gap-8">
        {/* Radial gauge */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" className="-rotate-90">
            {/* Track */}
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e2532" strokeWidth="10" />
            {/* Progress */}
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circumference}`}
              style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 8px ${color}88)` }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color }}>{score}</span>
            <span className="text-[10px] text-gray-500 font-medium">/ 100</span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 space-y-3">
          {breakdownItems.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400 font-medium">{item.label}</span>
                <span className="font-semibold" style={{ color: item.color }}>{item.value}%</span>
              </div>
              <div className="h-1.5 bg-[#12161b] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${item.value}%`, background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
