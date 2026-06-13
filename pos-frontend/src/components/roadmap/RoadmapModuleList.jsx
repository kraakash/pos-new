import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

function scoreTone(score) {
  if (score >= 80) return 'text-emerald-300';
  if (score >= 60) return 'text-cyan-300';
  if (score >= 40) return 'text-amber-300';
  return 'text-red-300';
}

function statusTone(status) {
  if (status === 'MASTERED') return 'text-emerald-300';
  if (status === 'IN_PROGRESS') return 'text-amber-300';
  return 'text-zinc-400';
}

/**
 * RoadmapModuleList Component
 * Renders the stage modules list along with metrics and completion progress.
 *
 * @param {object} props - Component properties
 * @param {Array} props.modules - List of modules inside the section
 * @param {string} props.selectedModuleId - The ID of the currently selected module
 * @param {function} props.onSelectModule - Callback to switch active module details
 */
export function RoadmapModuleList({ modules, selectedModuleId, onSelectModule }) {
  return (
    <Card>
      <p className="font-semibold text-white">Modules</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {(modules || []).map((module) => (
          <button
            key={module.id}
            type="button"
            onClick={() => onSelectModule(module.id)}
            className={`rounded-md border p-3 text-left transition hover:border-indigo-500/50 ${selectedModuleId === module.id ? 'border-indigo-500/60 bg-indigo-500/10' : 'border-white/10 bg-[#242536]'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm text-slate-200">{module.title}</p>
              <Badge>{module.difficulty}</Badge>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Mastery: <span className={`font-semibold ${scoreTone(module.masteryScore || 0)}`}>{(module.masteryScore || 0).toFixed(1)}%</span>
            </p>
            <p className="text-xs text-slate-400">Attempts: {module.attempts || 0}</p>
            <p className="text-xs text-slate-400">Avg solve time: {(module.avgTime || 0).toFixed(1)}s</p>
            <p className={`mt-1 text-xs font-semibold ${statusTone(module.status)}`}>{module.status}</p>
            <div className="mt-2 h-1.5 rounded-full bg-black/50">
              <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${Math.max(2, Math.min(100, module.masteryScore || 0))}%` }} />
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
