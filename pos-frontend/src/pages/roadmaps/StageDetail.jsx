import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { getRoadmap, getRoadmapStages } from '../../roadmaps/index';
import { useRoadmapProgress } from '../../hooks/useRoadmapProgress';

/**
 * StageDetail — shows all topics inside a stage with completion toggles.
 * Route: /roadmaps/:roadmapId/stage/:stageId
 */
export default function StageDetail() {
  const { roadmapId, stageId } = useParams();
  const navigate = useNavigate();

  const [meta, setMeta] = useState(null);
  const [stage, setStage] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [allStages, setAllStages] = useState([]);

  const { progress, completeTopic, getStageProgress } = useRoadmapProgress(roadmapId, allStages);

  useEffect(() => {
    async function load() {
      const m = getRoadmap(roadmapId);
      if (!m) { navigate('/roadmaps'); return; }
      setMeta(m);
      const stages = await getRoadmapStages(roadmapId);
      setAllStages(stages);
      const found = stages.find((s) => s.id === stageId);
      if (!found) { navigate(`/roadmaps/${roadmapId}`); return; }
      setStage(found);
      setLoadingData(false);
    }
    load();
  }, [roadmapId, stageId, navigate]);

  if (loadingData || !stage || !meta) {
    return (
      <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#40e0d0] border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const { done, total, pct } = getStageProgress(stage);
  const difficultyColor = { Beginner: '#34d399', Intermediate: '#fbbf24', Advanced: '#f87171' }[stage.difficulty];
  const typeLabels = { dsa: '🧩 DSA', cs: '🎓 CS', dev: '🛠️ Dev', project: '🚀 Project', concept: '💡 Concept', setup: '⚙️ Setup', aptitude: '🧮 Aptitude', communication: '🗣️ Communication', interview: '🎯 Interview', resume: '📄 Resume', linkedin: '💼 LinkedIn', company: '🏢 Company', execution: '⚡ Execution', industry: '🏭 Industry' };

  return (
    <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#12161b] to-[#0e1115]">
        <TopBar title={stage.title} subtitle={`Stage ${stage.stageNumber}`} />

        <div className="max-w-4xl mx-auto px-8 md:px-12 pb-16">

          {/* Back */}
          <button
            onClick={() => navigate(`/roadmaps/${roadmapId}`)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-6"
          >
            ← Back to Roadmap
          </button>

          {/* Stage header card */}
          <div
            className="relative bg-[#171c23] border border-[#222a35] rounded-2xl p-6 mb-6 overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at top left, ${stage.color}, transparent 60%)` }}
            />
            <div className="relative z-10 flex items-start gap-4">
              <span className="text-4xl">{stage.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Stage {stage.stageNumber}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${difficultyColor}18`, color: difficultyColor }}>{stage.difficulty}</span>
                  <span className="text-[10px] text-gray-500">⏱ ~{stage.estimatedWeeks} weeks</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{stage.title}</h2>
                <p className="text-sm text-gray-400 leading-relaxed">{stage.description}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="relative z-10 mt-5">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>{done}/{total} topics completed</span>
                <span style={{ color: stage.color }}>{pct}%</span>
              </div>
              <div className="h-2 bg-[#12161b] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: stage.color }} />
              </div>
            </div>
          </div>

          {/* Topics */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-widest">Topics ({total})</h3>
            <div className="space-y-2">
              {stage.topics?.map((topic) => {
                const isDone = progress[topic.id] === 'completed';
                return (
                  <div
                    key={topic.id}
                    className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200
                      ${isDone ? 'border-[#40e0d0]/20 bg-[#40e0d0]/5' : 'border-[#1e2532] bg-[#171c23] hover:border-[#2c3441]'}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => !isDone && completeTopic(topic.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all
                          ${isDone ? 'border-[#40e0d0] bg-[#40e0d0]' : 'border-[#2c3441] hover:border-[#40e0d0]/50'}`}
                      >
                        {isDone && <svg className="w-3 h-3 text-black" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </button>

                      <div>
                        <p className={`text-sm font-medium transition-colors ${isDone ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                          {topic.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-600">{typeLabels[topic.type] || topic.type}</span>
                          {topic.duration && <span className="text-[10px] text-gray-600">· {topic.duration}</span>}
                          {topic.category && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#12161b', color: '#6b7280' }}>
                              {topic.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isDone && <span className="text-[10px] text-[#40e0d0] font-semibold">Done ✓</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Tasks */}
          {stage.tasks?.length > 0 && (
            <div className="bg-[#171c23] border border-[#222a35] rounded-2xl p-6 mb-6">
              <h3 className="text-sm font-semibold text-white mb-4">📋 Recommended Tasks</h3>
              <ul className="space-y-2">
                {stage.tasks.map((task, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="mt-0.5 text-[#40e0d0] flex-shrink-0">→</span>
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Resources */}
          {stage.resources?.length > 0 && (
            <div className="bg-[#171c23] border border-[#222a35] rounded-2xl p-6 mb-6">
              <h3 className="text-sm font-semibold text-white mb-4">🔗 Resources</h3>
              <div className="space-y-2">
                {stage.resources.map((res, i) => (
                  <a
                    key={i}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#1e2532] hover:border-[#2c3441] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{res.type === 'video' ? '▶️' : res.type === 'course' ? '🎓' : res.type === 'practice' ? '🏋️' : res.type === 'tool' ? '🔧' : '🔗'}</span>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{res.title}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 capitalize">{res.type}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* What to Ignore */}
          {stage.whatToIgnore?.length > 0 && (
            <div className="bg-[#171c23] border border-[#f87171]/20 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-[#f87171] mb-4">⚠️ What To Ignore / Avoid</h3>
              <ul className="space-y-2">
                {stage.whatToIgnore.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="text-[#f87171] flex-shrink-0 mt-0.5">✕</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
