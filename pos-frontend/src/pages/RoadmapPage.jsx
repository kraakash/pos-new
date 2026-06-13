import { useNavigate } from 'react-router-dom';
import {
  Laptop,
  Palette,
  Settings,
  Globe,
  BarChart3,
  Wrench,
  Check
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { RoadmapPathCard } from '../components/roadmap/RoadmapPathCard';
import { useAuthGuard } from '../hooks/useAuthGuard';

const AVAILABLE = [
  {
    id: 'cse-sde',
    title: 'CSE → SDE',
    role: 'Software Development Engineer',
    description: 'A complete placement preparation roadmap for CSE students. From mindset and DSA fundamentals to system design and live mock interviews.',
    duration: '6–12 months',
    stages: 12,
    tags: ['DSA', 'System Design', 'Projects'],
    icon: Laptop,
    accent: 'text-cyan-300',
    accentBg: 'bg-cyan-300/10',
    href: '/roadmap/dashboard',
    popular: true
  }
];

const COMING_SOON = [
  {
    id: 'frontend',
    title: 'Frontend Dev',
    role: 'Frontend Developer',
    description: 'Master frontend development from HTML basics to advanced React patterns, state management, and performance.',
    duration: '4–6 months',
    stages: 8,
    tags: ['HTML', 'CSS', 'React'],
    icon: Palette,
    accent: 'text-rose-300',
    accentBg: 'bg-rose-300/10'
  },
  {
    id: 'backend',
    title: 'Backend Dev',
    role: 'Backend Developer',
    description: 'Build production-grade backend systems with Node.js, REST & GraphQL APIs, databases, and deployment.',
    duration: '4–8 months',
    stages: 8,
    tags: ['Node.js', 'APIs', 'Databases'],
    icon: Settings,
    accent: 'text-amber-300',
    accentBg: 'bg-amber-300/10'
  },
  {
    id: 'fullstack',
    title: 'Full Stack',
    role: 'Full Stack Developer',
    description: 'Become a complete Full Stack Developer — from frontend to backend, databases, deployment, and beyond.',
    duration: '6–10 months',
    stages: 10,
    tags: ['React', 'Node.js', 'MongoDB'],
    icon: Globe,
    accent: 'text-sky-300',
    accentBg: 'bg-sky-300/10'
  },
  {
    id: 'data',
    title: 'Data Science',
    role: 'Data Scientist / ML Engineer',
    description: 'From Python basics and statistics to machine learning, deep learning, and real-world data projects.',
    duration: '6–12 months',
    stages: 8,
    tags: ['Python', 'ML', 'Statistics'],
    icon: BarChart3,
    accent: 'text-emerald-300',
    accentBg: 'bg-emerald-300/10'
  },
  {
    id: 'devops',
    title: 'DevOps',
    role: 'DevOps / Cloud Engineer',
    description: 'Learn DevOps from Linux fundamentals to Docker, Kubernetes, CI/CD pipelines, cloud platforms, and SRE.',
    duration: '4–8 months',
    stages: 8,
    tags: ['Docker', 'Kubernetes', 'CI/CD'],
    icon: Wrench,
    accent: 'text-violet-300',
    accentBg: 'bg-violet-300/10'
  }
];

/**
 * RoadmapPage
 * Entry point for Career Paths and Roadmap selection.
 */
export default function RoadmapPage() {
  const navigate = useNavigate();
  const { requireAuth } = useAuthGuard();

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-400">
            Career Paths
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white font-sans">Roadmaps</h1>
        </div>
      </div>

      {/* Hero card */}
      <div className="mt-6 rounded-3xl border border-white/8 bg-[#303143]/40 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">
          Placement OS
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">Choose Your Career Path</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-300 font-medium leading-relaxed">
          Structured, stage-by-stage roadmaps designed for CSE students. Track your progress,
          earn badges, and get placement-ready with guided missions.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400 font-semibold">
          <span className="inline-flex items-center gap-2">
            <Check size={14} className="text-emerald-400" />
            Stage-wise progress
          </span>
          <span className="inline-flex items-center gap-2">
            <Check size={14} className="text-emerald-400" />
            Daily missions
          </span>
          <span className="inline-flex items-center gap-2">
            <Check size={14} className="text-emerald-400" />
            Placement readiness score
          </span>
        </div>
      </div>

      {/* Available now */}
      <section className="mt-8">
        <div className="mb-4 flex items-center gap-3">
          <h3 className="text-lg font-bold text-white">Available Now</h3>
          <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
            {AVAILABLE.length} {AVAILABLE.length === 1 ? 'Roadmap' : 'Roadmaps'}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {AVAILABLE.map((path) => (
            <RoadmapPathCard
              key={path.id}
              path={path}
              onStart={(p) =>
                requireAuth(() => navigate(p.href), {
                  title: 'Log in to start this roadmap',
                  message: 'Sign up or log in to begin and track your progress through this roadmap.'
                })
              }
            />
          ))}
        </div>
      </section>

      {/* Coming soon */}
      <section className="mt-10">
        <div className="mb-4 flex items-center gap-3">
          <h3 className="text-lg font-bold text-white">Coming Soon</h3>
          <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {COMING_SOON.length} Roadmaps
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {COMING_SOON.map((path) => (
            <RoadmapPathCard key={path.id} path={path} soon />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
