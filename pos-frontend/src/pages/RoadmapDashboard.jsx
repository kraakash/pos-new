import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, ArrowLeft } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { EmptyState } from '../components/ui/empty-state';
import { ErrorState } from '../components/ui/error-state';
import { apiFetch } from '../lib/api';
import { useRoadmapStore } from '../store/roadmapStore';
import { useAuthGuard } from '../hooks/useAuthGuard';

function scoreTone(score) {
  if (score >= 80) return 'text-emerald-300';
  if (score >= 60) return 'text-cyan-300';
  if (score >= 40) return 'text-amber-300';
  return 'text-red-300';
}

/**
 * RoadmapDashboard
 * Displays active roadmap sections, overall completion progress,
 * and mastery readiness metrics.
 */
export default function RoadmapDashboard() {
  const navigate = useNavigate();
  const { isGuest, requireAuth } = useAuthGuard();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const dashboard = useRoadmapStore((s) => s.dashboard);
  const setDashboard = useRoadmapStore((s) => s.setDashboard);
  const setProgress = useRoadmapStore((s) => s.setProgress);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const requests = isGuest
        ? [apiFetch('/roadmap'), Promise.resolve(null)]
        : [apiFetch('/roadmap'), apiFetch('/roadmap/progress')];
      const [dashboardData, progressData] = await Promise.all(requests);
      setDashboard(dashboardData);
      if (progressData) setProgress(progressData);
    } catch (e) {
      setError(e.message || 'Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sections = dashboard?.sections || [];

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/roadmap')}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-slate-300 transition hover:border-indigo-500/40 hover:text-white"
          >
            <ArrowLeft size={14} /> Career paths
          </button>
          <h2 className="text-2xl font-bold text-white font-sans">CSE → SDE Roadmap</h2>
        </div>
      </div>

      {loading && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[280px]" />
          <Skeleton className="h-[280px]" />
        </div>
      )}

      {!loading && error && (
        <ErrorState
          className="mt-6"
          title="Couldn't load your roadmap"
          message={error}
          onRetry={load}
        />
      )}

      {!loading && !error && dashboard && sections.length === 0 && (
        <EmptyState
          className="mt-6"
          icon={Map}
          title="Your roadmap is being prepared"
          message="Complete onboarding to generate a personalised section-by-section plan."
        />
      )}

      {!loading && !error && dashboard && sections.length > 0 && (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <p className="text-sm text-slate-300 font-bold">Overall Completion</p>
              <p className="mt-1 text-3xl font-black text-indigo-400">{dashboard.overallCompletion}%</p>
              <div className="mt-3 h-2 rounded-full bg-black/40">
                <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${dashboard.overallCompletion}%` }} />
              </div>
            </Card>
            <Card>
              <p className="text-sm text-slate-300 font-bold">Overall Mastery</p>
              <p className={`mt-1 text-3xl font-black ${scoreTone(dashboard.overallMastery)}`}>{dashboard.overallMastery}%</p>
              <p className="mt-2 text-xs text-slate-400 font-semibold">Readiness Score {Number(dashboard.readinessScore || 0).toFixed(1)}</p>
            </Card>
          </div>

          <Card className="mt-5">
            <p className="mb-3 font-bold text-white text-base">Sections</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    requireAuth(() => navigate(`/roadmap/${s.id}`), {
                      title: 'Log in to open this section',
                      message: 'Sign up or log in to start working through this section of the roadmap.'
                    })
                  }
                  className="rounded-xl border border-white/8 bg-black/20 p-4 text-left transition hover:border-indigo-500/50"
                >
                  <p className="font-bold text-slate-200">{s.title}</p>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">{s.description}</p>
                  <p className="mt-3 text-sm text-slate-300">Completion: <span className="font-bold text-indigo-400">{s.completionPct}%</span></p>
                  <p className="text-sm text-slate-300">Mastery: <span className={`font-bold ${scoreTone(s.masteryScore)}`}>{s.masteryScore}%</span></p>
                  <p className="mt-2 text-xs text-slate-400 line-clamp-1">Weak: {s.weakModules.map((w) => w.title).join(', ') || 'None'}</p>
                </button>
              ))}
            </div>
          </Card>
        </>
      )}
    </AppShell>
  );
}
