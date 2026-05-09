import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_BASE_URL;

/**
 * useRoadmapProgress — manages progress for any roadmap
 * @param {string} roadmapId - e.g. 'sde', 'frontend'
 * @param {Array}  stages    - the stages array from the roadmap's stages.js
 */
export function useRoadmapProgress(roadmapId, stages = []) {
  const [progress, setProgress] = useState({}); // { topicId: 'completed' | 'in_progress' }
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // --- Fetch progress from backend, then merge with any offline localStorage data ---
  const fetchProgress = useCallback(async () => {
    if (!roadmapId || !token) { setLoading(false); return; }

    const localKey = `roadmap_progress_${roadmapId}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || '{}');

    try {
      const res = await fetch(`${API}/roadmap/${roadmapId}/progress`, { headers });
      if (res.ok) {
        const data = await res.json();

        // Convert array → { topicId: status }
        const serverMap = {};
        (data.progress || []).forEach((p) => { serverMap[p.topicId] = p.status; });

        // Merge: server is source of truth, but local offline completions win if not in server
        const merged = { ...serverMap };
        Object.entries(localData).forEach(([topicId, status]) => {
          if (!serverMap[topicId] && status === 'completed') {
            merged[topicId] = status;
          }
        });

        setProgress(merged);
        localStorage.setItem(localKey, JSON.stringify(merged));

        // If there was offline data not yet in server, sync it up silently
        const offlineOnly = Object.entries(localData).filter(([id, s]) => !serverMap[id] && s === 'completed');
        if (offlineOnly.length > 0) {
          fetch(`${API}/roadmap/${roadmapId}/progress/sync`, {
            method: 'POST', headers,
            body: JSON.stringify({ progress: offlineOnly.map(([topicId]) => ({ topicId, status: 'completed' })) }),
          }).catch(() => {}); // fire-and-forget
        }
      } else {
        // API error — fall back to localStorage
        setProgress(localData);
      }
    } catch {
      // Network error — fall back to localStorage
      setProgress(localData);
    } finally {
      setLoading(false);
    }
  }, [roadmapId, token]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  // --- Mark topic as complete ---
  const completeTopic = useCallback(async (topicId) => {
    const optimistic = { ...progress, [topicId]: 'completed' };
    setProgress(optimistic);
    // Persist locally always
    localStorage.setItem(`roadmap_progress_${roadmapId}`, JSON.stringify(optimistic));

    try {
      await fetch(`${API}/roadmap/${roadmapId}/topic/${topicId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ status: 'completed' }),
      });
    } catch {
      // Silently fail — localStorage already saved it
    }
  }, [progress, roadmapId, token]);

  // --- Computed stats ---
  const getStageProgress = useCallback((stage) => {
    const total = stage.topics?.length || 0;
    const done = stage.topics?.filter((t) => progress[t.id] === 'completed').length || 0;
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [progress]);

  const getReadinessScore = useCallback(() => {
    const dsaStage = stages.find((s) => s.id === 'stage-3');
    const csStage = stages.find((s) => s.id === 'stage-4');
    const projectStage = stages.find((s) => s.id === 'stage-6');
    const resumeStage = stages.find((s) => s.id === 'stage-9');
    const commStage = stages.find((s) => s.id === 'stage-7');

    const pct = (stage) => stage ? getStageProgress(stage).pct : 0;

    const dsa = pct(dsaStage);
    const coreCS = pct(csStage);
    const projects = pct(projectStage);
    const resume = pct(resumeStage);
    const communication = pct(commStage);
    const overall = Math.round((dsa * 0.35) + (projects * 0.25) + (coreCS * 0.20) + (resume * 0.10) + (communication * 0.10));

    return { dsa, coreCS, projects, resume, communication, overall };
  }, [stages, getStageProgress]);

  const getWeakAreas = useCallback(() => {
    return stages
      .map((stage) => ({ ...stage, ...getStageProgress(stage) }))
      .filter((s) => s.pct < 40 && s.pct > 0)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 3);
  }, [stages, getStageProgress]);

  return { progress, loading, completeTopic, getStageProgress, getReadinessScore, getWeakAreas, refetch: fetchProgress };
}
