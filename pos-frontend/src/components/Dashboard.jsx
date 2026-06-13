import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2,
  UserRound,
  ShieldCheck,
  Flame,
  Sparkles,
  Target,
  Trophy,
  Search,
  BookOpen,
  History,
  ArrowRight,
  Plus,
  PenTool,
  Save,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Skeleton } from './ui/skeleton';
import { apiFetch } from '../lib/api';
import { cn } from '../lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

function Panel({ children, className = '' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn('rounded-[22px] border border-white/8 bg-[#303143] p-5 shadow-[0_18px_38px_rgba(0,0,0,0.2)]', className)}
    >
      {children}
    </motion.section>
  );
}

function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-[10px] font-black uppercase tracking-[0.24em] text-indigo-200">{eyebrow}</p>}
        <h2 className="mt-1 text-lg font-black text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}

const BADGES = [
  { name: "First Spark", count: 1, desc: "Solved 1 DSA problem", icon: Sparkles, color: "text-amber-300 bg-amber-500/10" },
  { name: "DSA Builder", count: 5, desc: "Solved 5 DSA problems", icon: Code2, color: "text-indigo-300 bg-indigo-500/10" },
  { name: "Problem Solver", count: 10, desc: "Solved 10 DSA problems", icon: Target, color: "text-violet-300 bg-violet-500/10" },
  { name: "Interview Ready", count: 20, desc: "Solved 20 DSA problems", icon: ShieldCheck, color: "text-emerald-300 bg-emerald-500/10" },
  { name: "Placement Pro", count: 50, desc: "Solved 50 DSA problems", icon: Trophy, color: "text-yellow-300 bg-yellow-500/10" }
];

const PREP_TRACKS = [
  { id: 'sde', name: 'SDE Prep Track', total: 28, emoji: '💻', color: 'bg-indigo-500' },
  { id: 'frontend', name: 'Frontend Developer Track', total: 18, emoji: '🎨', color: 'bg-emerald-500' },
  { id: 'backend', name: 'Backend Developer Track', total: 22, emoji: '⚙️', color: 'bg-violet-500' }
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('submissions'); // submissions | notes
  
  // Note Form State
  const [noteTopic, setNoteTopic] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteMessage, setNoteMessage] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dynamic user profile & stats
      const me = await apiFetch('/user/me');
      setUserStats(me);

      // Fetch submissions
      const subs = await apiFetch('/user/submissions').catch(() => []);
      setSubmissions(subs);

      // Fetch notes
      const userNotes = await apiFetch('/user/notes').catch(() => []);
      setNotes(userNotes);
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Generate GitHub style Contribution heat map for the last 24 weeks
  const contributionGrid = useMemo(() => {
    const solvedDates = userStats?.stats?.solvedDates || {};
    const weeks = [];
    const today = new Date();
    const startDate = new Date();
    // 24 weeks back
    startDate.setDate(today.getDate() - 24 * 7);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek); // align to Sunday

    const currentDate = new Date(startDate);
    for (let w = 0; w < 24; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = currentDate.toISOString().slice(0, 10);
        const count = solvedDates[dateStr] || 0;
        weekDays.push({
          dateStr,
          count,
          dayLabel: currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(weekDays);
    }
    return weeks;
  }, [userStats]);

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteTopic.trim() || !noteContent.trim()) return;
    setNoteSaving(true);
    setNoteMessage('');
    try {
      const note = await apiFetch('/user/notes', {
        method: 'POST',
        body: JSON.stringify({
          topic: noteTopic,
          content: noteContent
        })
      });
      setNotes((prev) => [note, ...prev]);
      setNoteTopic('');
      setNoteContent('');
      setNoteMessage('Note saved successfully!');
      setTimeout(() => setNoteMessage(''), 3000);
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setNoteSaving(false);
    }
  };

  // Recharts Chart Data Calculations
  const lineChartData = useMemo(() => {
    const solvedDates = userStats?.stats?.solvedDates || {};
    const dates = [];
    // Populate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      dates.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        solved: solvedDates[dateStr] || 0
      });
    }
    return dates;
  }, [userStats]);

  const barChartData = useMemo(() => {
    return [
      { name: 'Arrays', score: userStats?.stats?.questionsSolved > 0 ? Math.min(userStats.stats.questionsSolved, 4) : 0 },
      { name: 'Dynamic Programming', score: userStats?.stats?.questionsSolved > 5 ? 1 : 0 },
      { name: 'Graphs', score: userStats?.stats?.questionsSolved > 10 ? 1 : 0 }
    ];
  }, [userStats]);

  if (loading || !userStats) {
    return (
      <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#12161b] to-[#0e1115]">
          <TopBar title="Dashboard" />
          <div className="px-8 pb-8 pt-6 space-y-5">
            <Skeleton className="h-[240px] w-full" />
            <div className="grid gap-5 lg:grid-cols-3">
              <Skeleton className="h-[280px]" />
              <Skeleton className="h-[280px]" />
              <Skeleton className="h-[280px]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const displayName = userStats.fullName || userStats.email.split('@')[0];
  const totalSolved = userStats.stats?.questionsSolved || 0;
  const streak = userStats.stats?.currentStreak || 0;
  const readiness = userStats.stats?.resumeAtsScore || 78;
  const avgProgress = userStats.stats?.averageRoadmapProgress || 0;

  return (
    <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#12161b] to-[#0e1115]">
        {/* Dynamic Top Bar */}
        <TopBar title="Dashboard" subtitle="Placement Preparation Control Center" />

        <div className="mx-auto max-w-[1240px] px-8 pb-8 space-y-5">
          {/* Welcome Banner Card */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-[#303143] via-[#2a2b3d] to-[#1f202f] p-6 shadow-xl"
          >
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
                  <Sparkles size={13} className="text-amber-400" />
                  Your Daily Execution Space
                </p>
                <h1 className="mt-3 text-3xl font-black leading-tight text-white">
                  Welcome back, {displayName} 👋
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  You solved {totalSolved} questions so far. Keep the momentum going, practice daily, and unlock placement preparedness.
                </p>
              </div>
              <button
                onClick={() => navigate('/practice')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(109,94,245,0.25)] transition hover:-translate-y-0.5 hover:bg-indigo-400 cursor-pointer self-start md:self-auto"
              >
                Continue Practice
                <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Current Streak', value: `${streak}d`, desc: 'Consistent prep momentum', icon: Flame, color: 'text-amber-300 bg-amber-500/10' },
              { label: 'Questions Solved', value: totalSolved, desc: 'Across DSA study sheets', icon: Code2, color: 'text-indigo-300 bg-indigo-500/10' },
              { label: 'Roadmap Progress', value: `${avgProgress}%`, desc: 'Average active path status', icon: Target, color: 'text-cyan-300 bg-cyan-500/10' },
              { label: 'Readiness Score', value: `${readiness}%`, desc: 'Profile strength score', icon: ShieldCheck, color: 'text-emerald-300 bg-emerald-500/10' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-2xl border border-white/8 bg-[#303143] p-4.5 transition hover:border-white/15 shadow-md"
                >
                  <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', stat.color)}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[26px] font-black text-white leading-none">{stat.value}</p>
                    <p className="mt-2 text-xs font-black text-slate-200">{stat.label}</p>
                    <p className="mt-1 text-[11px] text-slate-500 leading-tight">{stat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid gap-5 lg:grid-cols-2">
            <Panel>
              <SectionHeader eyebrow="Performance" title="Weekly Coding Progress" />
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8e9aa8' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#8e9aa8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Line type="monotone" dataKey="solved" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 4, fill: '#303143', stroke: '#818cf8', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel>
              <SectionHeader eyebrow="Syllabus Strength" title="Topic Mastery Breakdown" />
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} barCategoryGap="20%" margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8e9aa8' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#8e9aa8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score > 0 ? '#40e0d0' : '#475569'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          {/* GitHub Style Activity Heat Map */}
          <Panel>
            <SectionHeader eyebrow="Consistency" title="DSA Activity Map" />
            <div className="mt-3">
              <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
                {contributionGrid.map((week, wIdx) => (
                  <div key={wIdx} className="grid grid-rows-7 gap-1 flex-shrink-0">
                    {week.map((day, dIdx) => {
                      let colorClass = "bg-[#252638] border border-white/5";
                      if (day.count === 1) colorClass = "bg-indigo-900/50 border border-indigo-500/20";
                      else if (day.count === 2) colorClass = "bg-indigo-700/60 border border-indigo-400/30";
                      else if (day.count >= 3) colorClass = "bg-indigo-500 border border-indigo-300/40";
                      return (
                        <div
                          key={dIdx}
                          title={`${day.dayLabel}: ${day.count} solved`}
                          className={cn("w-3.5 h-3.5 rounded-[3px] transition hover:scale-125", colorClass)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Last 6 months of consistency</span>
                <div className="flex items-center gap-1">
                  <span>Less</span>
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-[#252638]" />
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-900/50" />
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-700/60" />
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-500" />
                  <span>More</span>
                </div>
              </div>
            </div>
          </Panel>

          {/* Two Columns Grid: Badge Locker, Prep Tracks & Practice Journal */}
          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              {/* Practice Journal Container */}
              <Panel>
                <div className="flex border-b border-white/8 mb-4">
                  <button
                    onClick={() => setActiveTab('submissions')}
                    className={cn(
                      "flex items-center gap-2 pb-3 px-1 text-sm font-bold transition border-b-2 cursor-pointer",
                      activeTab === 'submissions'
                        ? 'border-indigo-400 text-white'
                        : 'border-transparent text-slate-400 hover:text-white'
                    )}
                  >
                    <History size={16} />
                    Submissions Log
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={cn(
                      "flex items-center gap-2 pb-3 px-1 ml-6 text-sm font-bold transition border-b-2 cursor-pointer",
                      activeTab === 'notes'
                        ? 'border-indigo-400 text-white'
                        : 'border-transparent text-slate-400 hover:text-white'
                    )}
                  >
                    <BookOpen size={16} />
                    What I Learned
                  </button>
                </div>

                {/* Submissions Tab View */}
                {activeTab === 'submissions' && (
                  <div className="space-y-3">
                    {submissions.length === 0 ? (
                      <div className="text-center py-8 text-sm text-slate-500">
                        No submissions logged. Code solutions in practice to sync.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                          <thead>
                            <tr className="border-b border-white/5 text-slate-500 text-xs font-black uppercase">
                              <th className="py-2.5">Question</th>
                              <th className="py-2.5">Language</th>
                              <th className="py-2.5 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {submissions.map((sub, idx) => (
                              <tr key={idx} className="border-b border-white/5 last:border-0">
                                <td className="py-3 font-semibold text-white">
                                  {sub.Question?.title || `Question ID: ${sub.questionId}`}
                                  <span className={cn(
                                    "ml-2 inline-block rounded px-1.5 py-0.5 text-[9px] font-black uppercase",
                                    sub.Question?.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-300' :
                                    sub.Question?.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-300' : 'bg-red-500/10 text-red-300'
                                  )}>
                                    {sub.Question?.difficulty || 'DSA'}
                                  </span>
                                </td>
                                <td className="py-3 text-slate-400 font-mono text-xs">{sub.language}</td>
                                <td className="py-3 text-right">
                                  <span className={cn(
                                    "font-black uppercase text-[10px] tracking-wide",
                                    sub.status === 'Accepted' ? 'text-emerald-300' : 'text-rose-400'
                                  )}>
                                    {sub.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* What I Learned Notes Tab View */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    {/* Add note form */}
                    <form onSubmit={handleSaveNote} className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-widest">
                        <PenTool size={12} className="text-indigo-400" />
                        Log Your Daily Insight
                      </div>
                      <input
                        type="text"
                        value={noteTopic}
                        onChange={(e) => setNoteTopic(e.target.value)}
                        placeholder="Topic/Concept, e.g. Dijkstra, Sliding Window"
                        className="h-10 w-full rounded-xl border border-white/10 bg-[#0B1020]/70 px-4 text-xs font-semibold text-white outline-none focus:border-indigo-300/40"
                      />
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="What did you solve or learn today that you want to remember?"
                        rows={3}
                        className="w-full rounded-xl border border-white/10 bg-[#0B1020]/70 p-3 text-xs font-semibold text-white outline-none focus:border-indigo-300/40 resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <button
                          type="submit"
                          disabled={noteSaving || !noteTopic.trim() || !noteContent.trim()}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-400 cursor-pointer disabled:opacity-40"
                        >
                          <Save size={13} />
                          {noteSaving ? 'Saving...' : 'Save Entry'}
                        </button>
                        {noteMessage && <span className="text-xs font-semibold text-emerald-300">{noteMessage}</span>}
                      </div>
                    </form>

                    {/* Notes listing */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {notes.length === 0 ? (
                        <div className="text-center py-6 text-sm text-slate-500">
                          No learning entries logged yet. Write one above.
                        </div>
                      ) : (
                        notes.map((note) => (
                          <div key={note.id} className="rounded-xl border border-white/5 bg-[#252638] p-3.5">
                            <div className="flex justify-between items-center text-xs font-black text-indigo-300">
                              <span>📍 {note.topic}</span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-slate-300 leading-relaxed font-semibold whitespace-pre-wrap">
                              {note.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </Panel>
            </div>

            <div className="space-y-5">
              {/* Badge Locker Widget */}
              <Panel>
                <SectionHeader eyebrow="Achievements" title="Badge Locker" />
                <div className="space-y-3">
                  {BADGES.map((badge) => {
                    const unlocked = totalSolved >= badge.count;
                    const Icon = badge.icon;
                    return (
                      <div
                        key={badge.name}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl p-3 border transition-all duration-300",
                          unlocked
                            ? "bg-white/[0.04] border-white/10 text-slate-200"
                            : "bg-black/10 border-transparent text-slate-600 opacity-60"
                        )}
                      >
                        <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', unlocked ? badge.color : 'bg-white/[0.02]')}>
                          <Icon size={16} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-white">{badge.name}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{badge.desc}</p>
                        </div>
                        {unlocked ? (
                          <CheckCircle2 size={16} className="text-indigo-400" />
                        ) : (
                          <HelpCircle size={16} className="text-slate-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Panel>

              {/* Your Prep Tracks */}
              <Panel>
                <SectionHeader eyebrow="Placement Target" title="Active Study Paths" />
                <div className="space-y-4">
                  {PREP_TRACKS.map((track) => {
                    // Find progress dynamically
                    const dbProgress = userStats?.stats?.roadmapProgress?.find(p => p.roadmapId === track.id);
                    const pct = dbProgress?.percent || 0;
                    const solved = dbProgress?.completedCount || 0;

                    return (
                      <Link
                        key={track.id}
                        to={track.id === 'sde' ? '/roadmap/dashboard' : '/roadmap'}
                        className="block rounded-2xl border border-white/5 bg-black/10 p-3.5 transition hover:border-white/15"
                      >
                        <div className="flex items-center justify-between text-xs font-black text-slate-300">
                          <span className="flex items-center gap-2">
                            <span>{track.emoji}</span>
                            {track.name}
                          </span>
                          <span className="text-indigo-300">{pct}%</span>
                        </div>
                        <div className="mt-2.5 h-1.5 rounded-full bg-black/30">
                          <div
                            style={{ width: `${pct}%` }}
                            className={cn("h-full rounded-full transition-all duration-500", track.color)}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{solved} / {track.total} topics completed</span>
                          <span className="inline-flex items-center gap-0.5 hover:text-indigo-300">
                            Open Path <ArrowRight size={10} />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Panel>
            </div>
          </div>
        </div>

        {/* Global Dashboard Footer */}
        <footer className="border-t border-white/5 bg-[#171c23]/30 px-8 py-8 mt-12">
          <div className="mx-auto max-w-[1240px] grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <span className="text-sm font-black tracking-wider text-[#40e0d0]">Placement OS</span>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed font-semibold">
                An unified technical education platform tracking DSA progress, project milestones, and readiness scoring.
              </p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Resources</span>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-500 font-semibold">
                <li><Link to="/roadmap" className="hover:text-white">Prep Sheets</Link></li>
                <li><Link to="/practice" className="hover:text-white">DSA Sheets</Link></li>
                <li><Link to="/resume" className="hover:text-white">Resume scoring</Link></li>
              </ul>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Support</span>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-500 font-semibold">
                <li className="text-slate-400">support@placementos.dev</li>
                <li><a href="#" className="hover:text-white">API status</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">System</span>
              <p className="mt-3 text-xs text-slate-500 font-semibold leading-relaxed">
                Version: 1.2.0-stable<br />
                Connection: PostgreSQL
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-[1240px] border-t border-white/5 mt-6 pt-4 text-center text-[10px] text-slate-600 font-bold">
            &copy; 2026 Placement OS. All rights reserved. Made by advanced engineering teams.
          </div>
        </footer>
      </main>
    </div>
  );
}
