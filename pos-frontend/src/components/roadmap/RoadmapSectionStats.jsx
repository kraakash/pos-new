import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

function scoreTone(score) {
  if (score >= 80) return 'text-emerald-300';
  if (score >= 60) return 'text-cyan-300';
  if (score >= 40) return 'text-amber-300';
  return 'text-red-300';
}

/**
 * RoadmapSectionStats Component
 * Renders statistical summary of the selected section.
 *
 * @param {object} props - Component properties
 * @param {object} props.section - Aggregated section data
 */
export function RoadmapSectionStats({ section }) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <Card>
        <p className="text-sm text-slate-300 font-bold">Completion</p>
        <p className="mt-1 text-3xl font-black text-indigo-400">{section.completionPct}%</p>
        <div className="mt-3 h-2 rounded-full bg-black/40">
          <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${section.completionPct}%` }} />
        </div>
      </Card>
      <Card>
        <p className="text-sm text-slate-300 font-bold">Mastery Score</p>
        <p className={`mt-1 text-3xl font-black ${scoreTone(section.masteryScore || 0)}`}>
          {(section.masteryScore || 0).toFixed(1)}%
        </p>
        <p className="mt-2 text-xs text-slate-400">{section.moduleCount} modules in this section</p>
      </Card>
      <Card>
        <p className="text-sm text-slate-300 font-bold">Weak Modules</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {section.weakModules?.length
            ? section.weakModules.map((w) => <Badge key={w.id} className="border-indigo-500/20 bg-indigo-500/5 text-indigo-300">{w.title}</Badge>)
            : <span className="text-xs text-slate-400 font-semibold">No weak module detected</span>}
        </div>
      </Card>
    </div>
  );
}
