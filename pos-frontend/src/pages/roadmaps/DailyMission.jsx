import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { getRoadmap, getRoadmapStages } from '../../roadmaps/index';
import { useRoadmapProgress } from '../../hooks/useRoadmapProgress';

const MISSION_TEMPLATES = [
  (topic) => `Complete "${topic.title}" topic`,
  (topic) => `Revise: ${topic.title}`,
  () => 'Solve 3 practice problems',
  () => 'Apply to 2 companies today',
  () => 'Spend 30 min on aptitude practice',
  () => 'Read one interview experience on GeeksForGeeks',
  () => 'Update your GitHub with today\'s progress',
];

function generateMissions(stages, progress) {
  const missions = [];
  // Find in-progress or next topics
  for (const stage of stages) {
    for (const topic of (stage.topics || [])) {
      if (progress[topic.id] !== 'completed' && missions.length < 5) {
        missions.push({
          id: `m-${topic.id}`,
          text: `Study: ${topic.title}`,
          type: topic.type,
          stageId: stage.id,
          topicId: topic.id,
          completed: false,
        });
      }
    }
    if (missions.length >= 3) break;
  }
  // Add fixed daily tasks
  missions.push({ id: 'daily-apply', text: 'Apply to 2 companies today', type: 'execution', completed: false });
  missions.push({ id: 'daily-aptitude', text: 'Solve 5 aptitude questions on IndiaBix', type: 'aptitude', completed: false });
  return missions.slice(0, 5);
}

const typeIcon = { dsa: '🧩', cs: '🎓', dev: '🛠️', project: '🚀', concept: '💡', execution: '⚡', aptitude: '🧮', default: '📌' };

/**
 * DailyMission — shows today's generated tasks based on user's weak areas.
 * Route: /roadmaps/:roadmapId/daily
 */
export default function DailyMission() {
  const { roadmapId } = useParams();
  const navigate = useNavigate();

  const [meta, setMeta] = useState(null);
  const [stages, setStages] = useState([]);
  const [missions, setMissions] = useState([]);
  const [doneMissions, setDoneMissions] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  const { progress, loading } = useRoadmapProgress(roadmapId, stages);

  useEffect(() => {
    async function load() {
      const m = getRoadmap(roadmapId);
      if (!m) { navigate('/roadmaps'); return; }
      setMeta(m);
      const s = await getRoadmapStages(roadmapId);
      setStages(s);
      setLoadingData(false);
    }
    load();
  }, [roadmapId, navigate]);

  useEffect(() => {
    if (!loadingData && !loading && stages.length > 0) {
      const today = new Date().toDateString();
      const savedKey = `daily_missions_${roadmapId}_${today}`;
      const saved = JSON.parse(localStorage.getItem(savedKey) || 'null');
      if (saved) {
        setMissions(saved.missions);
        setDoneMissions(saved.done || {});
      } else {
        const generated = generateMissions(stages, progress);
        setMissions(generated);
        localStorage.setItem(savedKey, JSON.stringify({ missions: generated, done: {} }));
      }
    }
  }, [loadingData, loading, stages, progress, roadmapId]);

  const toggleMission = (id) => {
    const updated = { ...doneMissions, [id]: !doneMissions[id] };
    setDoneMissions(updated);
    const today = new Date().toDateString();
    const key = `daily_missions_${roadmapId}_${today}`;
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    localStorage.setItem(key, JSON.stringify({ ...saved, done: updated }));
  };

  const completedCount = Object.values(doneMissions).filter(Boolean).length;
  const totalCount = missions.length;
  const allDone = completedCount === totalCount && totalCount > 0;

  if (loadingData || !meta) {
    return (
      <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#40e0d0] border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#12161b] to-[#0e1115]">
        <TopBar title="Daily Mission" subtitle={meta.title} />

        <div className="max-w-2xl mx-auto px-8 md:px-12 pb-16">
          <button
            onClick={() => navigate(`/roadmaps/${roadmapId}`)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-6"
          >
            ← Back to Roadmap
          </button>

          {/* Date header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-500 font-medium">{today}</p>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {allDone ? '🎉 All done today!' : "Today's Missions"}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold" style={{ color: meta.color }}>{completedCount}/{totalCount}</p>
              <p className="text-[10px] text-gray-500">completed</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-[#171c23] rounded-full overflow-hidden mb-8 border border-[#1e2532]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`, background: meta.color }}
            />
          </div>

          {/* All done message */}
          {allDone && (
            <div
              className="rounded-2xl p-6 mb-8 text-center border"
              style={{ background: `${meta.color}0f`, borderColor: `${meta.color}30` }}
            >
              <div className="text-4xl mb-3">🏆</div>
              <p className="font-bold text-white text-lg">Streak maintained!</p>
              <p className="text-sm text-gray-400 mt-1">You crushed today's missions. Come back tomorrow.</p>
            </div>
          )}

          {/* Mission list */}
          <div className="space-y-3">
            {missions.map((mission) => {
              const done = !!doneMissions[mission.id];
              return (
                <button
                  key={mission.id}
                  onClick={() => toggleMission(mission.id)}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-200
                    ${done
                      ? 'border-[#40e0d0]/20 bg-[#40e0d0]/5'
                      : 'border-[#222a35] bg-[#171c23] hover:border-[#2c3441]'
                    }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${done ? 'border-[#40e0d0] bg-[#40e0d0]' : 'border-[#2c3441]'}`}
                  >
                    {done && <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>

                  {/* Icon */}
                  <span className="text-xl">{typeIcon[mission.type] || typeIcon.default}</span>

                  {/* Text */}
                  <span className={`text-sm font-medium flex-1 ${done ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                    {mission.text}
                  </span>

                  {done && <span className="text-[10px] text-[#40e0d0] font-semibold">Done</span>}
                </button>
              );
            })}
          </div>

          {/* Motivational tip */}
          <div className="mt-8 p-5 rounded-2xl border border-[#1e2532] bg-[#171c23]">
            <p className="text-xs font-semibold text-gray-500 mb-2">💡 Today's Tip</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Consistency beats intensity. 2 hours of focused practice daily is better than 10 hours on weekends.
              Keep your streak alive — every day counts.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
