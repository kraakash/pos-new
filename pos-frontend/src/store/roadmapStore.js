import { create } from 'zustand';

/**
 * Zustand Store for managing active roadmap selections, modules, completion,
 * progress, and dashboards.
 */
export const useRoadmapStore = create((set) => ({
  dashboard: null,
  section: null,
  module: null,
  progress: null,
  selectedSectionId: null,
  selectedModuleId: null,
  setDashboard: (dashboard) =>
    set((state) => ({
      dashboard,
      selectedSectionId: state.selectedSectionId || dashboard?.sections?.[0]?.id || null
    })),
  setSection: (section) =>
    set((state) => ({
      section,
      selectedModuleId: state.selectedModuleId || section?.modules?.[0]?.id || null
    })),
  setModule: (module) => set({ module }),
  setProgress: (progress) => set({ progress }),
  setSelectedSectionId: (selectedSectionId) => set({ selectedSectionId }),
  setSelectedModuleId: (selectedModuleId) => set({ selectedModuleId })
}));
