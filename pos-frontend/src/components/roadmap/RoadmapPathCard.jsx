import { ArrowRight, Calendar, Layers } from 'lucide-react';

/**
 * RoadmapPathCard Component
 * Displays available or coming soon learning paths on the roadmap hub.
 *
 * @param {object} props - Component properties
 * @param {object} props.path - Static path metadata (id, title, role, tags, etc.)
 * @param {boolean} props.soon - Whether the path is marked as Coming Soon
 * @param {function} props.onStart - Callback triggered when path is started
 */
export function RoadmapPathCard({ path, soon = false, onStart }) {
  const Icon = path.icon;

  return (
    <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-[#303143] p-5 transition hover:border-indigo-500/40">
      <div className="absolute right-4 top-4">
        {soon ? (
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Soon
          </span>
        ) : path.popular ? (
          <span className="rounded-full border border-indigo-500/40 bg-indigo-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
            Popular
          </span>
        ) : null}
      </div>

      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${path.accentBg}`}>
        <Icon size={22} className={path.accent} />
      </div>

      <div className="mt-5">
        <h3 className="text-lg font-bold text-white">{path.title}</h3>
        <p className={`mt-1 text-sm ${path.accent}`}>{path.role}</p>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-400">{path.description}</p>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={14} />
          {path.duration}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Layers size={14} />
          {path.stages} stages
        </span>
        {!soon && (
          <button
            type="button"
            onClick={() => onStart?.(path)}
            className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-indigo-400 transition hover:text-indigo-300"
          >
            Start <ArrowRight size={14} />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
        {path.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-slate-400 bg-white/5">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
