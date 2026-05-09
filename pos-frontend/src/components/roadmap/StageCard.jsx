/**
 * StageCard — shown in the roadmap overview skill tree
 * Props: stage, index, isUnlocked, isCompleted, onClick, accentColor
 */
export default function StageCard({ stage, index, isUnlocked, isCompleted, onClick, accentColor = '#40e0d0' }) {
  const difficultyColor = {
    Beginner: '#34d399',
    Intermediate: '#fbbf24',
    Advanced: '#f87171',
  }[stage.difficulty] || '#6b7280';

  const completedCount = stage.topics?.filter((t) => t.completed).length || 0;
  const totalCount = stage.topics?.length || 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div
      onClick={isUnlocked ? onClick : undefined}
      className={`relative group bg-[#171c23] border rounded-2xl p-5 transition-all duration-300 flex flex-col gap-3
        ${isCompleted
          ? 'border-[#40e0d0]/40 bg-[#40e0d0]/5'
          : isUnlocked
          ? 'border-[#222a35] hover:border-[#2c3441] hover:-translate-y-0.5 hover:shadow-xl cursor-pointer'
          : 'border-[#1a1f27] opacity-50 cursor-not-allowed'
        }`}
    >
      {/* Completed glow */}
      {isCompleted && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: `0 0 20px ${accentColor}18` }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Stage number bubble */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={
              isCompleted
                ? { background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}44` }
                : { background: '#12161b', color: '#4b5563', border: '1px solid #1e2532' }
            }
          >
            {isCompleted ? '✓' : stage.stageNumber}
          </div>

          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Stage {stage.stageNumber}</p>
            <h3 className="text-sm font-semibold text-white leading-tight mt-0.5">{stage.title}</h3>
          </div>
        </div>

        {/* Lock icon */}
        {!isUnlocked && (
          <span className="text-gray-600 text-sm mt-1">🔒</span>
        )}

        {/* Stage icon */}
        {isUnlocked && (
          <span className="text-xl opacity-70">{stage.icon}</span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{stage.description}</p>

      {/* Progress bar */}
      {isUnlocked && totalCount > 0 && (
        <div>
          <div className="flex justify-between text-[10px] text-gray-500 mb-1.5">
            <span>{completedCount}/{totalCount} topics</span>
            <span style={{ color: accentColor }}>{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-[#12161b] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%`, background: stage.color || accentColor }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${difficultyColor}18`, color: difficultyColor }}
          >
            {stage.difficulty}
          </span>
          <span className="text-[10px] text-gray-500">⏱ {stage.estimatedWeeks}w</span>
        </div>

        {isUnlocked && !isCompleted && (
          <span
            className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: accentColor }}
          >
            Open →
          </span>
        )}
      </div>
    </div>
  );
}
