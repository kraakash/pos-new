import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Radar, Gauge, Zap, ShieldCheck, BrainCircuit } from 'lucide-react';

const capabilityCards = [
  {
    icon: <Radar size={16} />,
    title: 'Adaptive DSA Roadmap',
    desc: 'Sectioned curriculum across DSA, OS, CN, DBMS, system design, and core languages — weak topics surface automatically.'
  },
  {
    icon: <Gauge size={16} />,
    title: 'Real Code Execution',
    desc: 'Run and submit in JavaScript, Python, or C++ via Judge0 — see runtime, memory, and per-test verdicts inline.'
  },
  {
    icon: <Zap size={16} />,
    title: 'AI Mock Interviews',
    desc: 'Adaptive 5-question rounds for DSA, system design, core CS, and HR — with structured feedback per answer.'
  },
  {
    icon: <ShieldCheck size={16} />,
    title: 'Integrity-Aware Scoring',
    desc: 'Keystroke and paste-ratio signals separate genuine solving from copy-paste — readiness scores you can actually trust.'
  }
];

const modules = ['Focus Queues', 'Mock Drill', 'Resume Lab', 'Code Arena', 'Integrity Signal'];

/**
 * LandingPage Page Component
 * Renders the homepage layout with visual floating card containers, features showcase grids,
 * and entry points to practice library paths.
 */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070911] text-white font-sans">
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.75; }
        }
        .float-a { animation: floatA 6s ease-in-out infinite; }
        .float-b { animation: floatB 7s ease-in-out infinite; }
        .glow-pulse { animation: glowPulse 4s ease-in-out infinite; }
      `}</style>

      {/* Radial glow background styles */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(251,146,60,0.16),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-45 [background:linear-gradient(125deg,transparent_0%,rgba(56,189,248,0.08)_42%,rgba(251,146,60,0.08)_76%,transparent_100%)]" />

      {/* Header element */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-cyan-400/20 px-2.5 py-1 text-sm font-bold text-cyan-200">POS</span>
          <div>
            <p className="text-sm font-black text-zinc-300">Placement OS</p>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Career Operating System</p>
          </div>
        </div>

        <nav className="hidden items-center gap-7 text-sm text-zinc-300 md:flex">
          <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
          <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
        </nav>

        <Link to="/auth" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-300/70 hover:bg-cyan-300/10">
          Launch App <ArrowRight size={15} />
        </Link>
      </header>

      {/* Main hero page body */}
      <main className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-6 pb-16 pt-6 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:pt-12">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs text-cyan-100">
            <Sparkles size={13} /> Built for Indian campus placements
          </div>

          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl text-white">
            One platform.
            <br />
            From your first DSA
            <br />
            to your final HR round.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400">
            Placement OS is an end-to-end campus placement prep system: adaptive DSA roadmaps, real code execution in Monaco editor, AI mock interviews, ATS-style resume scoring, and learning analytics.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {['Adaptive DSA roadmap', 'Live code execution', 'AI mock interviews', 'ATS resume scoring', 'Integrity-aware analytics'].map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth" className="rounded-full bg-cyan-300 px-7 py-3 font-bold text-black transition hover:bg-cyan-200">
              Start Free
            </Link>
            <Link to="/problems" className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 font-bold text-white shadow-[0_0_30px_rgba(251,146,60,0.35)] transition hover:bg-amber-400">
              Enter Code Arena <ArrowRight size={16} />
            </Link>
          </div>

          <div id="features" className="mt-10 grid gap-3 sm:grid-cols-2">
            {capabilityCards.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan-300/50 hover:bg-cyan-300/[0.06]">
                <div className="mb-2 inline-flex rounded-lg bg-white/10 p-2 text-cyan-200">{item.icon}</div>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="relative h-[560px]">
          <div className="absolute inset-0 rounded-[28px] border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.02] p-4 backdrop-blur-xl">
            <div className="rounded-2xl border border-white/10 bg-[#0c1020]/90 p-4">
              <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
                <span>LIVE PRACTICE SESSION</span>
                <span>Language: Python</span>
              </div>
              <div className="rounded-xl border border-cyan-300/20 bg-black/60 p-4 font-mono text-xs leading-6 text-cyan-200">
                <p>def longest_subarray(nums):</p>
                <p className="pl-4">left = 0</p>
                <p className="pl-4">best = 0</p>
                <p className="pl-4">for right in range(len(nums)):</p>
                <p className="pl-8">while invalid_window(nums, left, right):</p>
                <p className="pl-12">left += 1</p>
                <p className="pl-8">best = max(best, right - left + 1)</p>
                <p className="pl-4">return best</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <p className="text-xs text-zinc-500">Focus Time</p>
                <p className="mt-1 text-lg font-semibold">12m 48s</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <p className="text-xs text-zinc-500">Integrity Ratio</p>
                <p className="mt-1 text-lg font-semibold text-cyan-300">86%</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <p className="text-xs text-zinc-500">AI Quality Score</p>
                <p className="mt-1 text-lg font-semibold">84 / 100</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <p className="text-xs text-zinc-500">Learning Velocity</p>
                <p className="mt-1 text-lg font-semibold text-amber-300">RISING</p>
              </div>
            </div>
          </div>

          <div className="float-a absolute -left-4 top-16 rounded-xl border border-cyan-300/40 bg-black/75 px-4 py-2 text-sm text-zinc-100 shadow-lg">Milestone Unlocked: Top 10%</div>
          <div className="float-b absolute -right-4 bottom-24 rounded-xl border border-amber-400/40 bg-black/75 px-4 py-2 text-sm text-zinc-100 shadow-lg">Weekly Readiness +8</div>

          <div className="absolute -bottom-5 left-4 flex flex-wrap gap-2">
            {modules.map((item) => (
              <span key={item} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                {item}
              </span>
            ))}
          </div>

          <div className="glow-pulse absolute -right-2 top-4 rounded-2xl bg-amber-500/90 p-3 text-white shadow-lg"><BrainCircuit size={20} /></div>
        </section>
      </main>
    </div>
  );
}
