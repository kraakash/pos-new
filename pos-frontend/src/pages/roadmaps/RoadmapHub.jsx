import { ROADMAPS } from '../../roadmaps/index';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import RoadmapCard from '../../components/roadmap/RoadmapCard';

/**
 * RoadmapHub — Landing page showing all available roadmaps.
 * Route: /roadmaps
 */
export default function RoadmapHub() {
  const navigate = useNavigate();
  const available = ROADMAPS.filter((r) => r.status === 'available');
  const comingSoon = ROADMAPS.filter((r) => r.status === 'coming_soon');

  return (
    <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#12161b] to-[#0e1115]">
        <TopBar title="Roadmaps" subtitle="Career Paths" />

        <div className="max-w-6xl mx-auto px-8 md:px-12 pb-16">

          {/* Hero banner */}
          <div className="relative bg-[#171c23] border border-[#222a35] rounded-2xl p-8 mb-10 overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at top right, #40e0d0, transparent 60%)' }}
            />
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#40e0d0] font-semibold mb-2">Placement OS</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
              Choose Your Career Path
            </h2>
            <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
              Structured, stage-by-stage roadmaps designed for CSE students. Track your progress,
              earn badges, and get placement-ready with guided missions.
            </p>
            <div className="flex gap-4 mt-6 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-[#40e0d0]">✓</span> Stage-wise progress
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-[#40e0d0]">✓</span> Daily missions
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-[#40e0d0]">✓</span> Placement readiness score
              </div>
            </div>
          </div>

          {/* Available roadmaps */}
          {available.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-lg font-bold text-white">Available Now</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#40e0d0]/10 text-[#40e0d0] border border-[#40e0d0]/20">
                  {available.length} Roadmap{available.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {available.map((rm) => (
                  <RoadmapCard key={rm.id} roadmap={rm} />
                ))}
              </div>
            </section>
          )}

          {/* Coming soon */}
          {comingSoon.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-lg font-bold text-white">Coming Soon</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#1e2532] text-gray-500 border border-[#2c3441]">
                  {comingSoon.length} Roadmaps
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {comingSoon.map((rm) => (
                  <RoadmapCard key={rm.id} roadmap={rm} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
