import sde from './sde/meta';
import frontend from './frontend/meta';
import backend from './backend/meta';
import fullstack from './fullstack/meta';
import datascience from './datascience/meta';
import devops from './devops/meta';

/**
 * ROADMAP REGISTRY
 * To add a new roadmap:
 * 1. Create a new folder: src/roadmaps/<your-roadmap>/
 * 2. Add meta.js and stages.js inside it
 * 3. Import meta here and add to ROADMAPS array
 * That's it. No other changes needed.
 */
export const ROADMAPS = [sde, frontend, backend, fullstack, datascience, devops];

export const getRoadmap = (id) => ROADMAPS.find((r) => r.id === id) || null;

export const getRoadmapStages = async (id) => {
  try {
    const mod = await import(`./${id}/stages.js`);
    return mod.default || [];
  } catch {
    return [];
  }
};

export const getRoadmapBadges = async (id) => {
  try {
    const mod = await import(`./${id}/badges.js`);
    return mod.default || [];
  } catch {
    return [];
  }
};

export const getRoadmapCompanies = async (id) => {
  try {
    const mod = await import(`./${id}/companies.js`);
    return mod.default || [];
  } catch {
    return [];
  }
};
