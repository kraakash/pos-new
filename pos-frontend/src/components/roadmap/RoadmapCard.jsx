import { useNavigate } from 'react-router-dom';

/**
 * RoadmapCard — shown on the Hub page for each roadmap
 * Props: roadmap (meta object)
 */
export default function RoadmapCard({ roadmap }) {
  const navigate = useNavigate();
  const isAvailable = roadmap.status === 'available';

  const handleClick = () => {
    if (isAvailable) navigate(`/roadmaps/${roadmap.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative group bg-[#171c23] border border-[#222a35] rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300
        ${isAvailable
          ? 'hover:border-opacity-60 hover:-translate-y-1 hover:shadow-2xl cursor-pointer'
          : 'opacity-60 cursor-not-allowed'
        }`}
      style={isAvailable ? { '--glow-color': roadmap.color } : {}}
    >
      {/* Popular tag */}
      {roadmap.isPopular && (
        <span
          className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: `${roadmap.color}22`, color: roadmap.color, border: `1px solid ${roadmap.color}44` }}
        >
          Popular
        </span>
      )}

      {/* Coming soon tag */}
      {!isAvailable && (
        <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#222a35] text-gray-500 border border-[#2c3441]">
          Soon
        </span>
      )}

      {/* Icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0"
        style={{ background: `${roadmap.color}18`, border: `1px solid ${roadmap.color}33` }}
      >
        {roadmap.icon}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-white tracking-tight">{roadmap.title}</h3>
        <p className="text-xs font-medium mt-0.5 mb-3" style={{ color: roadmap.color }}>{roadmap.subtitle}</p>
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{roadmap.description}</p>
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between pt-3 border-t border-[#1e2532]">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span>📅</span> {roadmap.duration}
          </span>
          <span className="flex items-center gap-1">
            <span>📚</span> {roadmap.totalStages} stages
          </span>
        </div>
        {isAvailable && (
          <span
            className="text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: roadmap.color }}
          >
            Start →
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {roadmap.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: '#12161b', color: '#6b7280', border: '1px solid #1e2532' }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
