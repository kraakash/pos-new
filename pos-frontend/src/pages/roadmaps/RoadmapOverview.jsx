import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StageCard from '../../components/roadmap/StageCard';
import ReadinessGauge from '../../components/roadmap/ReadinessGauge';
import BadgeCard from '../../components/roadmap/BadgeCard';
import { getRoadmap, getRoadmapStages, getRoadmapBadges } from '../../roadmaps/index';
import { useRoadmapProgress } from '../../hooks/useRoadmapProgress';

/**
 * RoadmapOverview — skill tree page for a single roadmap.
 * Route: /roadmaps/:roadmapId
 */
export default function RoadmapOverview() {
  const { roadmapId } = useParams();
  const navigate = useNavigate();

  const [meta, setMeta] = useState(null);
  const [stages, setStages] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('roadmap'); // roadmap | badges | companies

  const { progress, loading: progressLoading, getStageProgress, getReadinessScore, getWeakAreas } = useRoadmapProgress(roadmapId, stages);

  // Load static data
  useEffect(() => {
    async function load() {
      const m = getRoadmap(roadmapId);
      if (!m) { navigate('/roadmaps'); return; }
      setMeta(m);
      const [s, b] = await Promise.all([getRoadmapStages(roadmapId), getRoadmapBadges(roadmapId)]);
      setStages(s);
      setBadges(b);
      setLoadingData(false);
    }
    load();
  }, [roadmapId, navigate]);

  if (loadingData || progressLoading) {
    return (
      <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#40e0d0] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading roadmap...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!meta) return null;

  const readiness = getReadinessScore();
  const weakAreas = getWeakAreas();
  const totalCompleted = stages.reduce((acc, s) => acc + getStageProgress(s).done, 0);
  const totalTopics = stages.reduce((acc, s) => acc + getStageProgress(s).total, 0);

  // Stage is unlocked if previous stage is ≥50% complete (or it's the first stage)
  const isStageUnlocked = (index) => {
    if (index === 0) return true;
    const prev = stages[index - 1];
    return prev ? getStageProgress(prev).pct >= 50 : false;
  };

  const isStageCompleted = (stage) => getStageProgress(stage).pct === 100;

  const TABS = ['roadmap', 'badges', 'companies'];

  return (
    <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#12161b] to-[#0e1115]">
        <TopBar title={meta.title} subtitle={meta.subtitle} />

        <div className="max-w-6xl mx-auto px-8 md:px-12 pb-16">

          {/* Back link */}
          <button
            onClick={() => navigate('/roadmaps')}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-6"
          >
            ← All Roadmaps
          </button>

          {/* Top stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Topics Done', value: `${totalCompleted}/${totalTopics}`, color: meta.color },
              { label: 'Stages', value: `${stages.filter((_, i) => isStageCompleted(stages[i])).length}/${stages.length}`, color: meta.color },
              { label: 'Readiness', value: `${readiness.overall}%`, color: readiness.overall >= 60 ? '#40e0d0' : '#fbbf24' },
              { label: 'Duration', value: meta.duration, color: '#818cf8' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#171c23] border border-[#222a35] rounded-xl p-4">
                <p className="text-[11px] text-gray-500 font-medium mb-1">{stat.label}</p>
                <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Two-column: Readiness + Weak Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <ReadinessGauge score={readiness.overall} breakdown={readiness} />

            {/* Weak areas */}
            <div className="bg-[#171c23] border border-[#222a35] rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-5">⚠️ Weak Areas</p>
              {weakAreas.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-sm text-gray-500">
                  No weak areas yet — keep going! 🎉
                </div>
              ) : (
                <div className="space-y-4">
                  {weakAreas.map((area) => (
                    <div key={area.id}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-300 font-medium flex items-center gap-2">
                          <span>{area.icon}</span> {area.title}
                        </span>
                        <span className="text-[#f87171] font-semibold">{area.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-[#12161b] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${area.pct}%`, background: '#f87171' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-[#171c23] border border-[#222a35] rounded-xl mb-6 w-fit">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all duration-200
                  ${activeTab === tab
                    ? 'text-[#12161b] font-bold'
                    : 'text-gray-500 hover:text-gray-300'
                  }`}
                style={activeTab === tab ? { background: meta.color } : {}}
              >
                {tab === 'roadmap' ? '🗺️ Roadmap' : tab === 'badges' ? '🏅 Badges' : '🏢 Companies'}
              </button>
            ))}
          </div>

          {/* Tab: Roadmap (Skill Tree) */}
          {activeTab === 'roadmap' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-400">
                  {stages.length} stages · Click a stage to open it
                </h2>
                <button
                  onClick={() => navigate(`/roadmaps/${roadmapId}/daily`)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all"
                  style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}33` }}
                >
                  ⚡ Daily Mission
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stages.map((stage, index) => {
                  const unlocked = isStageUnlocked(index);
                  const completed = isStageCompleted(stage);
                  // Merge progress into topics
                  const enriched = {
                    ...stage,
                    topics: stage.topics?.map((t) => ({ ...t, completed: progress[t.id] === 'completed' })),
                  };
                  return (
                    <StageCard
                      key={stage.id}
                      stage={enriched}
                      index={index}
                      isUnlocked={unlocked}
                      isCompleted={completed}
                      accentColor={meta.color}
                      onClick={() => navigate(`/roadmaps/${roadmapId}/stage/${stage.id}`)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab: Badges */}
          {activeTab === 'badges' && (
            <div>
              <p className="text-xs text-gray-500 mb-5">
                {badges.filter((b) => {
                  if (b.condition.type === 'stage_complete') return isStageCompleted(stages.find((s) => s.id === b.condition.stageId) || {});
                  return false;
                }).length} / {badges.length} earned
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map((badge) => {
                  let earned = false;
                  if (badge.condition.type === 'stage_complete') {
                    const s = stages.find((st) => st.id === badge.condition.stageId);
                    earned = s ? isStageCompleted(s) : false;
                  } else if (badge.condition.type === 'topic_complete') {
                    earned = progress[badge.condition.topicId] === 'completed';
                  }
                  return <BadgeCard key={badge.id} badge={badge} earned={earned} />;
                })}
              </div>
            </div>
          )}

          {/* Tab: Companies (link to detail page) */}
          {activeTab === 'companies' && (
            <div className="flex items-center justify-center h-40">
              <button
                onClick={() => navigate(`/roadmaps/${roadmapId}/companies`)}
                className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}33` }}
              >
                View Company Tracks →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
