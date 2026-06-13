import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { ErrorState } from '../components/ui/error-state';
import { RoadmapModuleList } from '../components/roadmap/RoadmapModuleList';
import { RoadmapSectionStats } from '../components/roadmap/RoadmapSectionStats';
import { apiFetch } from '../lib/api';
import { useRoadmapStore } from '../store/roadmapStore';
import { useAuthGuard } from '../hooks/useAuthGuard';

/**
 * RoadmapSectionPage
 * Renders stage list, practice/theory tabs, problem-solving connections,
 * and module mastery stats.
 */
export default function RoadmapSectionPage() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const { isGuest, requireAuth } = useAuthGuard();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('practice');

  const section = useRoadmapStore((s) => s.section);
  const moduleData = useRoadmapStore((s) => s.module);
  const setSection = useRoadmapStore((s) => s.setSection);
  const setModule = useRoadmapStore((s) => s.setModule);
  const setSelectedSectionId = useRoadmapStore((s) => s.setSelectedSectionId);
  const setSelectedModuleId = useRoadmapStore((s) => s.setSelectedModuleId);

  const loadSection = async (targetSectionId) => {
    const path = isGuest ? `/roadmap/public/section/${targetSectionId}` : `/roadmap/section/${targetSectionId}`;
    const data = await apiFetch(path);
    setSection(data);
    setSelectedSectionId(targetSectionId);
    return data;
  };

  const loadModule = async (moduleId) => {
    if (isGuest) {
      const sec = useRoadmapStore.getState().section;
      const m = sec?.modules?.find((x) => x.id === moduleId);
      if (m) {
        setModule({ ...m, practiceProblems: [], analytics: {} });
        setSelectedModuleId(moduleId);
      }
      return m;
    }
    const data = await apiFetch(`/roadmap/module/${moduleId}`);
    setModule(data);
    setSelectedModuleId(moduleId);
    return data;
  };

  const reload = async (targetModuleId) => {
    const sec = await loadSection(sectionId);
    const moduleId = targetModuleId || sec?.modules?.[0]?.id;
    if (moduleId) {
      await loadModule(moduleId);
    }
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      await reload();
    } catch (e) {
      setError(e.message || 'Failed to load section');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId]);

  const firstPracticeModule = section?.modules?.find((m) => m.practiceTopic);

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white font-sans">{section?.title || 'Section'}</h2>
          <p className="mt-1 text-sm text-slate-400 font-semibold">{section?.description || 'Loading section details...'}</p>
        </div>
        <Button
          disabled={!firstPracticeModule}
          title={firstPracticeModule ? '' : 'No practice problems linked to this section yet'}
          onClick={() => {
            if (!firstPracticeModule) return;
            if (!requireAuth(null, { title: 'Log in to start practising', message: 'Sign up or log in to begin this section.' })) return;
            navigate(`/problems?topic=${encodeURIComponent(firstPracticeModule.practiceTopic)}`);
          }}
        >
          Start Practice
        </Button>
      </div>

      {!loading && error && (
        <ErrorState
          className="mt-6"
          title="Couldn't load this section"
          message={error}
          onRetry={load}
        />
      )}

      {loading && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[320px]" />
          <Skeleton className="h-[320px]" />
        </div>
      )}

      {!loading && !error && section && (
        <>
          <RoadmapSectionStats section={section} />

          <div className="mt-5 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <RoadmapModuleList
              modules={section.modules}
              selectedModuleId={moduleData?.id}
              onSelectModule={loadModule}
            />

            <Card>
              {moduleData ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold text-white">{moduleData.title}</h3>
                    <Badge>{moduleData.status}</Badge>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant={activeTab === 'practice' ? 'primary' : 'ghost'} onClick={() => setActiveTab('practice')}>Practice</Button>
                    <Button variant={activeTab === 'analytics' ? 'primary' : 'ghost'} onClick={() => setActiveTab('analytics')}>Analytics</Button>
                  </div>

                  {activeTab === 'practice' && (
                    <div className="mt-4 space-y-3">
                      {(moduleData.practiceProblems || []).length ? (
                        (moduleData.practiceProblems || []).map((p) => (
                          <div key={p.id} className="rounded-xl border border-white/8 bg-black/10 p-3.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-bold text-sm text-slate-200">{p.title}</p>
                              <Badge>{p.status}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-slate-400 font-semibold">{p.difficulty} · {p.estimatedMinutes} min</p>
                            <Button className="mt-2.5" size="sm" onClick={() => {
                              if (!requireAuth(null, { title: 'Log in to solve problems', message: 'Sign up or log in to start solving practice problems.' })) return;
                              navigate(`/problems?topic=${encodeURIComponent(moduleData.practiceTopic || moduleData.title)}`);
                            }}>
                              Solve
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-sm text-center">
                          <p className="font-bold text-zinc-200">No coding problems linked to this module yet</p>
                          <p className="mt-1.5 text-xs text-slate-400 font-semibold leading-relaxed">
                            {moduleData.practiceTopic
                              ? "The problem bank doesn't have problems tagged with this topic yet — check back after the next seed update."
                              : "This is a theory module without practice mapping. Use Mock Interview to test your understanding."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'analytics' && (
                    <div className="mt-4 grid gap-3 text-sm">
                      <div className="rounded-xl border border-white/8 bg-black/15 p-3.5 flex justify-between items-center">
                        <span className="text-slate-300 font-semibold">Accuracy</span>
                        <span className="font-bold text-indigo-400">{(moduleData.analytics?.accuracyPct || 0).toFixed(1)}%</span>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-black/15 p-3.5 flex justify-between items-center">
                        <span className="text-slate-300 font-semibold">Avg Solve Time</span>
                        <span className="font-bold text-slate-200">{(moduleData.analytics?.avgSolveTime || 0).toFixed(1)}s</span>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-black/15 p-3.5 flex justify-between items-center">
                        <span className="text-slate-300 font-semibold">Attempts</span>
                        <span className="font-bold text-slate-200">{moduleData.analytics?.attempts || 0}</span>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-black/15 p-3.5">
                        <p className="font-semibold text-slate-300">Weak Patterns</p>
                        <p className="mt-1 text-xs text-slate-400 font-medium">{(moduleData.analytics?.weakPatterns || []).join(', ') || 'No critical weak pattern found.'}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-400 font-semibold">Select a module to see details.</p>
              )}
            </Card>
          </div>
        </>
      )}
    </AppShell>
  );
}
