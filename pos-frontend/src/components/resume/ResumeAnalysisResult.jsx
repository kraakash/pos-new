import { AlertTriangle, CheckCircle2, Lightbulb, Target, TrendingUp } from 'lucide-react';

/**
 * Renders a small categorized feedback card.
 * 
 * @param {object} props - Component properties
 */
function FeedbackPanel({ title, items, icon: Icon, tone, fallback }) {
  const list = items?.length ? items : [fallback];

  return (
    <div className="rounded-2xl border border-white/8 bg-[#242536] p-4">
      <div className="flex items-center gap-2">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}>
          <Icon size={18} />
        </span>
        <p className="text-sm font-black text-white">{title}</p>
      </div>
      <div className="mt-4 space-y-2">
        {list.map((item) => (
          <div key={item} className="flex gap-2 text-sm leading-6 text-slate-300">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-300" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ResumeAnalysisResult Component
 * Displays progress meters representing ATS keywords match and categorized bullet point lists
 * for strengths, weaknesses, structure, and missing components.
 * 
 * @param {object} props - Component properties
 * @param {object} props.result - The analysis response payload object
 */
export function ResumeAnalysisResult({ result }) {
  const aiAvailable = result?.aiAvailable !== false;
  const score = Math.round(result.score || 0);
  const keywordMatch = Math.round(Number(result?.ats?.keyword_match || result?.semanticMatch * 100 || 0));

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-white/8 bg-[#303143] shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
      <div className="grid gap-5 p-5 lg:grid-cols-[280px_1fr]">
        
        {/* Metric gauge side panel */}
        <div className="rounded-3xl bg-[#242536] p-5">
          <p className="text-sm font-black text-white font-sans">Analysis Report</p>
          <div className="mt-5 grid place-items-center">
            <div
              className="grid h-40 w-40 place-items-center rounded-full"
              style={{ background: `conic-gradient(#818cf8 ${score * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
            >
              <div className="grid h-32 w-32 place-items-center rounded-full bg-[#303143]">
                <div className="text-center font-sans">
                  <p className="text-4xl font-black text-white">{score}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ATS Score</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-3 font-sans">
            <div className="rounded-2xl border border-white/8 bg-[#303143] p-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Keyword Match</span>
                <span>{keywordMatch}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/30">
                <div className="h-full rounded-full bg-indigo-400" style={{ width: `${Math.min(100, keywordMatch)}%` }} />
              </div>
            </div>
            <p className="text-xs leading-5 text-slate-500 font-semibold">
              {aiAvailable ? 'Analyzed with role-aware AI feedback.' : 'AI score unavailable; heuristic checks were applied.'}
            </p>
          </div>
        </div>

        {/* Feedback categories panel */}
        <div className="grid gap-4 font-sans">
          <div className="grid gap-4 md:grid-cols-2">
            <FeedbackPanel
              title="Impact"
              items={result.impact}
              icon={TrendingUp}
              tone="bg-emerald-300/15 text-emerald-200"
              fallback="Add measurable outcomes to make project bullets stronger."
            />
            <FeedbackPanel
              title="Structure"
              items={result.structure}
              icon={CheckCircle2}
              tone="bg-indigo-300/15 text-indigo-200"
              fallback="Your resume structure looks clean and readable."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <FeedbackPanel
              title="What's Wrong"
              items={result.whatIsWrong}
              icon={AlertTriangle}
              tone="bg-rose-300/15 text-rose-200"
              fallback="No major mistakes found. Your resume looks structurally solid."
            />
            <FeedbackPanel
              title="Missing"
              items={result.missing}
              icon={Target}
              tone="bg-amber-300/15 text-amber-200"
              fallback="No critical sections appear to be missing."
            />
            <FeedbackPanel
              title="Improve Next"
              items={result.howToImprove}
              icon={Lightbulb}
              tone="bg-cyan-300/15 text-cyan-200"
              fallback="Continue refining impact bullets and tailoring to target roles."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
