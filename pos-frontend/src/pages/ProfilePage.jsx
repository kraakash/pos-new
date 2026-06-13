import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award,
  Briefcase,
  Code2,
  Edit3,
  ExternalLink,
  Flame,
  Layers3,
  LogOut,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserRound
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Skeleton } from '../components/ui/skeleton';
import { ErrorState } from '../components/ui/error-state';
import { apiFetch } from '../lib/api';
import { profilePath, userHandle } from '../lib/routes';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

// Custom Brand SVG Icons since lucide-react has deprecated brand icons
const Github = ({ size = 24, strokeWidth = 2, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 24, strokeWidth = 2, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const DEFAULT_FORM = {
  email: '',
  username: '',
  fullName: '',
  branch: '',
  year: 1,
  skillLevel: 'BEGINNER',
  placementGoal: '',
  contactNo: '',
  linkedinUrl: '',
  githubUrl: '',
  leetcodeUrl: '',
  codeforcesUrl: '',
  codechefUrl: '',
  hackerrankUrl: '',
  location: '',
  collegeName: ''
};

const statCards = [
  { key: 'questionsSolved', label: 'DSA Problems Solved', fallback: '0',  subtitle: 'Across arrays, graphs, DP',     icon: Code2,       accent: 'text-indigo-300' },
  { key: 'mockInterviews',  label: 'Mock Interviews',     fallback: '0',  subtitle: 'Completed interview rounds',   icon: UserRound,   accent: 'text-violet-300' },
  { key: 'resumeAtsScore',  label: 'Readiness Score',     fallback: '0',  suffix: '%', subtitle: 'Placement profile strength', icon: ShieldCheck, accent: 'text-emerald-300' },
  { key: 'currentStreak',   label: 'Learning Streak',     fallback: '0',  suffix: 'd', subtitle: 'Consistent prep momentum',   icon: Flame,       accent: 'text-amber-300' }
];

const skillGroups = [
  { title: 'Programming Languages', items: ['C++', 'JavaScript', 'Python', 'Java', 'SQL'] },
  { title: 'Frameworks & Technologies', items: ['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'Git'] },
  { title: 'Core CS Subjects', items: ['DBMS', 'Operating Systems', 'Computer Networks', 'OOPs', 'System Design'] }
];

const roles = ['Frontend Engineer', 'Backend Engineer', 'SDE I'];
const domains = ['Web Development', 'AI/ML', 'DevOps', 'Data Science'];

const codingProfiles = [
  { platform: 'LeetCode',   formKey: 'leetcodeUrl',   brand: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 48%, #fb923c 100%)',  logoClass: 'bg-white' },
  { platform: 'Codeforces', formKey: 'codeforcesUrl', brand: 'linear-gradient(135deg, #60a5fa 0%, #a5b4fc 48%, #fda4af 100%)',  logoClass: 'bg-white' },
  { platform: 'GitHub',     formKey: 'githubUrl',     brand: 'linear-gradient(135deg, #e2e8f0 0%, #c7d2fe 50%, #94a3b8 100%)',  logoClass: 'bg-[#111827] text-white', icon: Github },
  { platform: 'LinkedIn',   formKey: 'linkedinUrl',   brand: 'linear-gradient(135deg, #7dd3fc 0%, #60a5fa 50%, #67e8f9 100%)',  logoClass: 'bg-[#0A66C2] text-white',  icon: Linkedin },
  { platform: 'CodeChef',   formKey: 'codechefUrl',   brand: 'linear-gradient(135deg, #fde68a 0%, #fdba74 48%, #facc15 100%)',  logoClass: 'bg-white' },
  { platform: 'HackerRank', formKey: 'hackerrankUrl', brand: 'linear-gradient(135deg, #6ee7b7 0%, #5eead4 50%, #22d3ee 100%)',  logoClass: 'bg-white' }
];

function deriveHandleFromUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url.includes('://') ? url : `https://${url}`);
    const segments = u.pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || u.hostname;
  } catch {
    return url;
  }
}

const projects = [
  {
    title: 'Spreezy',
    description: 'Offer aggregation platform for malls and restaurants with discovery, filters, and merchant workflows.',
    stack: ['React', 'Node.js', 'MongoDB']
  },
  {
    title: 'Placement OS',
    description: 'Student preparation workspace for DSA practice, resumes, roadmaps, and mock interviews.',
    stack: ['React', 'Express', 'PostgreSQL']
  },
  {
    title: 'Interview Tracker',
    description: 'Role-wise interview preparation tracker with feedback logs and readiness milestones.',
    stack: ['JavaScript', 'PostgreSQL', 'Docker']
  }
];

const profileSuggestions = ['Add coding profile links', 'Complete target role details', 'Add two more projects'];

function getFirstName(name, fallback = 'Student') {
  const clean = String(name || '').trim();
  return clean ? clean.split(/\s+/)[0] : fallback;
}

function Panel({ children, className = '' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn('rounded-[22px] border border-white/8 bg-[#303143] p-4 shadow-[0_18px_38px_rgba(0,0,0,0.2)]', className)}
    >
      {children}
    </motion.section>
  );
}

function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-[10px] font-black uppercase tracking-[0.24em] text-indigo-200">{eyebrow}</p>}
        <h2 className="mt-1 text-lg font-black text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function SkillPill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-[#252638] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-indigo-300/30 hover:text-white">
      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
      {children}
    </span>
  );
}

function BrandLogo({ platform, Icon }) {
  if (Icon) return <Icon size={19} strokeWidth={2.4} />;

  if (platform === 'LeetCode') {
    return (
      <svg viewBox="0 0 42 42" className="h-7 w-7" aria-hidden="true">
        <path d="M24 7 12 19.5c-2.8 2.9-2.8 7.6.1 10.5l4.1 4.1c3 3 7.8 3 10.8 0l3.6-3.6" fill="none" stroke="#111827" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 7 31 14" fill="none" stroke="#FFA116" strokeWidth="4.2" strokeLinecap="round" />
        <path d="M16 24h17" fill="none" stroke="#111827" strokeWidth="4.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (platform === 'Codeforces') {
    return (
      <svg viewBox="0 0 42 42" className="h-7 w-7" aria-hidden="true">
        <rect x="8" y="17" width="7" height="16" rx="2" fill="#2563EB" />
        <rect x="17.5" y="10" width="7" height="23" rx="2" fill="#FACC15" />
        <rect x="27" y="14" width="7" height="19" rx="2" fill="#EF4444" />
      </svg>
    );
  }

  if (platform === 'CodeChef') {
    return (
      <svg viewBox="0 0 42 42" className="h-7 w-7" aria-hidden="true">
        <path d="M11 19c-1.4-5.3 5.1-8.9 8.6-5.1 2.1-5.8 10.9-4.4 10.6 2.2 4.7.7 5.2 7.8.5 9.3H12.2c-4.8-1.4-5.2-6.1-1.2-6.4Z" fill="#7C4A2D" />
        <path d="M13 25.4h17.6l-1.2 8.1H14.2L13 25.4Z" fill="#A16207" />
        <path d="M17 29h9.5" stroke="#FEF3C7" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 42 42" className="h-7 w-7" aria-hidden="true">
      <path d="M21 5 34.9 13v16L21 37 7.1 29V13L21 5Z" fill="#00EA64" />
      <path d="M16 14v14M26 14v14M16 21h10" stroke="#0B1020" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function inputClass() {
  return 'h-11 w-full rounded-2xl border border-white/10 bg-[#0B1020]/70 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-300/60 focus:ring-4 focus:ring-indigo-400/10';
}

export default function ProfilePage() {
  const { username: routeUsername } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [publicStats, setPublicStats] = useState({});

  const logout = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);
  const currentUser = useAuthStore((s) => s.user);
  const isPublicView = Boolean(routeUsername);
  const canEdit = Boolean(currentUser && (!routeUsername || routeUsername === userHandle(currentUser)));

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const me = canEdit
        ? await apiFetch('/user/me')
        : isPublicView
        ? await apiFetch(`/user/public/${encodeURIComponent(routeUsername)}`)
        : await apiFetch('/user/me');
      setForm({
        email: canEdit ? me.email || '' : '',
        username: me.username || '',
        fullName: me.fullName || '',
        branch: me.profile?.branch || '',
        year: me.profile?.year || 1,
        skillLevel: me.profile?.skillLevel || 'BEGINNER',
        placementGoal: me.profile?.placementGoal || '',
        contactNo: me.profile?.contactNo || '',
        linkedinUrl: me.profile?.linkedinUrl || '',
        githubUrl: me.profile?.githubUrl || '',
        leetcodeUrl: me.profile?.leetcodeUrl || '',
        codeforcesUrl: me.profile?.codeforcesUrl || '',
        codechefUrl: me.profile?.codechefUrl || '',
        hackerrankUrl: me.profile?.hackerrankUrl || '',
        location: me.profile?.location || '',
        collegeName: me.profile?.collegeName || ''
      });
      setPublicStats(me.stats || {});
    } catch (e) {
      setLoadError(e.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeUsername, currentUser?.username]);

  const displayName = form.fullName || getFirstName(form.email, 'Student');
  const targetRole = form.placementGoal || 'Aspiring Full Stack Engineer';
  const professionalBio = `${form.branch || 'MCA'} - Open Source Contributor - MERN Stack Developer`;
  const initials = displayName.replace(/^@/, '').slice(0, 2).toUpperCase() || 'ST';

  const completion = useMemo(() => {
    const checks = [
      form.fullName,
      form.username,
      canEdit && form.email,
      form.branch,
      form.placementGoal,
      form.linkedinUrl,
      form.githubUrl,
      form.collegeName,
      form.location
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form, canEdit]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        ...form,
        year: Number(form.year)
      };
      const updated = await apiFetch('/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      setUser(updated);
      setMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (e) {
      setError(e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell wide guest={!currentUser}>
        <div className="mx-auto max-w-[1240px] space-y-5">
        {loading && (
          <div className="grid gap-5">
            <Skeleton className="h-[320px]" />
            <div className="grid gap-5 lg:grid-cols-3">
              <Skeleton className="h-[240px]" />
              <Skeleton className="h-[240px]" />
              <Skeleton className="h-[240px]" />
            </div>
          </div>
        )}

        {!loading && loadError && (
          <ErrorState
            title="Couldn't load profile"
            message={loadError}
            onRetry={load}
          />
        )}

        {!loading && !loadError && (
          <>
            <Panel className="p-0">
              <div className="grid gap-5 p-5 lg:grid-cols-[1.05fr_1fr] lg:p-6">
                <div className="flex flex-col justify-between gap-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-indigo-500 text-2xl font-black text-white">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
                        <Sparkles size={13} />
                        Student Placement Profile
                      </p>
                      <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-4xl">{displayName}</h1>
                      <p className="mt-2 text-base font-semibold text-slate-200">{targetRole}</p>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{professionalBio}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing((prev) => !prev)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-4 py-2.5 text-sm font-black text-white shadow-[0_18px_36px_rgba(109,94,245,0.28)] transition hover:-translate-y-0.5 hover:bg-indigo-400 cursor-pointer"
                      >
                        <Edit3 size={16} />
                        Edit Profile
                      </button>
                    ) : (
                      <Link
                        to={profilePath(form)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-4 py-2.5 text-sm font-black text-white shadow-[0_18px_36px_rgba(109,94,245,0.28)] transition hover:-translate-y-0.5 hover:bg-indigo-400"
                      >
                        <UserRound size={16} />
                        View Profile
                      </Link>
                    )}
                    {canEdit && (
                      <div className="min-w-[220px] rounded-xl border border-white/8 bg-[#2a2b3d] p-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                          <span>Profile completion</span>
                          <span className="text-indigo-300">{completion}%</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-black/30">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${completion}%` }}
                            transition={{ duration: 0.7 }}
                            className="h-full rounded-full bg-indigo-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="flex items-start gap-3 rounded-xl border border-white/8 bg-[#2a2b3d] p-4 transition hover:border-white/15"
                      >
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.04] ${stat.accent}`}>
                          <Icon size={16} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xl font-bold text-white leading-none">
                            {publicStats[stat.key] ?? stat.fallback}{stat.suffix || ''}
                          </p>
                          <p className="mt-1.5 text-xs font-semibold text-slate-200">{stat.label}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">{stat.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Panel>

            {canEdit && isEditing && (
              <Panel>
                <SectionHeader eyebrow="Profile editor" title="Keep your placement identity fresh" />
                <div className="grid gap-4 lg:grid-cols-3">
                  <Field label="Full name">
                    <input className={inputClass()} value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="Full name" />
                  </Field>
                  <Field label="Username">
                    <input className={inputClass()} value={form.username} onChange={(e) => updateField('username', e.target.value)} placeholder="Username" />
                  </Field>
                  <Field label="Email">
                    <input className={inputClass()} type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="Email" />
                  </Field>
                  <Field label="Branch">
                    <input className={inputClass()} value={form.branch} onChange={(e) => updateField('branch', e.target.value)} placeholder="Computer Science" />
                  </Field>
                  <Field label="Year">
                    <input className={inputClass()} type="number" min={1} max={6} value={form.year} onChange={(e) => updateField('year', e.target.value)} />
                  </Field>
                  <Field label="Skill level">
                    <select className={inputClass()} value={form.skillLevel} onChange={(e) => updateField('skillLevel', e.target.value)}>
                      <option value="BEGINNER">BEGINNER</option>
                      <option value="INTERMEDIATE">INTERMEDIATE</option>
                      <option value="ADVANCED">ADVANCED</option>
                    </select>
                  </Field>
                  <Field label="Target role">
                    <input className={inputClass()} value={form.placementGoal} onChange={(e) => updateField('placementGoal', e.target.value)} placeholder="Software Engineer" />
                  </Field>
                  <Field label="College">
                    <input className={inputClass()} value={form.collegeName} onChange={(e) => updateField('collegeName', e.target.value)} placeholder="College name" />
                  </Field>
                  <Field label="Location">
                    <input className={inputClass()} value={form.location} onChange={(e) => updateField('location', e.target.value)} placeholder="Location / City" />
                  </Field>
                  <Field label="LinkedIn URL">
                    <input className={inputClass()} value={form.linkedinUrl} onChange={(e) => updateField('linkedinUrl', e.target.value)} placeholder="LinkedIn URL" />
                  </Field>
                  <Field label="GitHub URL">
                    <input className={inputClass()} value={form.githubUrl} onChange={(e) => updateField('githubUrl', e.target.value)} placeholder="GitHub URL" />
                  </Field>
                  <Field label="Contact number">
                    <input className={inputClass()} value={form.contactNo} onChange={(e) => updateField('contactNo', e.target.value)} placeholder="Contact number" />
                  </Field>
                  
                  {/* Additional Coding Profile Inputs */}
                  <Field label="LeetCode URL">
                    <input className={inputClass()} value={form.leetcodeUrl} onChange={(e) => updateField('leetcodeUrl', e.target.value)} placeholder="LeetCode profile URL" />
                  </Field>
                  <Field label="Codeforces URL">
                    <input className={inputClass()} value={form.codeforcesUrl} onChange={(e) => updateField('codeforcesUrl', e.target.value)} placeholder="Codeforces profile URL" />
                  </Field>
                  <Field label="CodeChef URL">
                    <input className={inputClass()} value={form.codechefUrl} onChange={(e) => updateField('codechefUrl', e.target.value)} placeholder="CodeChef profile URL" />
                  </Field>
                  <Field label="HackerRank URL">
                    <input className={inputClass()} value={form.hackerrankUrl} onChange={(e) => updateField('hackerrankUrl', e.target.value)} placeholder="HackerRank profile URL" />
                  </Field>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={save} disabled={saving} className="rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-400 disabled:opacity-60 cursor-pointer">
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button type="button" onClick={load} className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-slate-300 transition hover:bg-white/8 hover:text-white cursor-pointer">
                    Reset
                  </button>
                  {message && <p className="text-sm font-semibold text-emerald-300">{message}</p>}
                  {error && <p className="text-sm font-semibold text-rose-300">{error}</p>}
                </div>
              </Panel>
            )}

            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5">
                <Panel>
                  <SectionHeader eyebrow="Technical identity" title="Tech Stack & Skills" />
                  <div className="grid gap-3 lg:grid-cols-3">
                    {skillGroups.map((group) => (
                      <div key={group.title} className="rounded-xl border border-white/8 bg-[#2a2b3d] p-4">
                        <h3 className="text-sm font-bold text-white">{group.title}</h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {group.items.map((item) => <SkillPill key={item}>{item}</SkillPill>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel>
                  <SectionHeader eyebrow="Coding ecosystem" title="Coding Profiles" />
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {codingProfiles.map((profile) => {
                      const Icon = profile.icon;
                      const url = (form && form[profile.formKey]) || '';
                      const connected = Boolean(url);
                      const handle = connected ? deriveHandleFromUrl(url) : '';
                      return (
                        <motion.div
                          key={profile.platform}
                          whileHover={{ y: -3 }}
                          className="overflow-hidden rounded-2xl border border-white/10 bg-[#303143] shadow-[0_18px_38px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-indigo-300/30 hover:shadow-[0_24px_48px_rgba(0,0,0,0.26)]"
                        >
                          <div className="relative h-[86px] p-4" style={{ background: profile.brand }}>
                            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/20 blur-xl" />
                            <span className={cn('relative grid h-12 w-12 place-items-center rounded-2xl shadow-[0_14px_28px_rgba(0,0,0,0.16)]', profile.logoClass)}>
                              <BrandLogo platform={profile.platform} Icon={Icon} />
                            </span>
                          </div>
                          <div className="p-3.5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-black text-white">{profile.platform}</p>
                                <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                                  {connected ? `@${handle}` : 'Not connected'}
                                </p>
                              </div>
                              {connected && (
                                <a
                                  href={url.startsWith('http') ? url : `https://${url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-xl border border-white/10 bg-[#252638] p-2 text-slate-400 transition hover:border-white/20 hover:text-white"
                                  aria-label={`Open ${profile.platform}`}
                                >
                                  <ExternalLink size={15} />
                                </a>
                              )}
                            </div>
                            {!connected && canEdit && (
                              <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-transparent px-3 py-2 text-xs font-black text-slate-300 transition hover:border-indigo-300/40 hover:text-white cursor-pointer"
                              >
                                <Plus size={13} /> Connect {profile.platform}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </Panel>

                <Panel>
                  <SectionHeader eyebrow="Portfolio" title="Projects Showcase" />
                  <div className="grid gap-3 lg:grid-cols-3">
                    {projects.map((project) => (
                      <motion.article key={project.title} whileHover={{ y: -4 }} className="rounded-2xl border border-white/10 bg-[#0B1020]/60 p-3.5">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-400/30 to-cyan-300/20 text-cyan-100">
                          <Layers3 size={18} />
                        </div>
                        <h3 className="mt-3 text-base font-black text-white">{project.title}</h3>
                        <p className="mt-2 min-h-[60px] text-[13px] font-semibold leading-5 text-slate-400">{project.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {project.stack.map((item) => <span key={item} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-bold text-slate-300">{item}</span>)}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button type="button" className="rounded-xl bg-indigo-500 px-3 py-2 text-xs font-black text-white cursor-pointer">GitHub</button>
                          <button type="button" className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-slate-300 cursor-pointer">Live Demo</button>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                </Panel>
              </div>

              <div className="space-y-5">
                <Panel>
                  <SectionHeader eyebrow="Placement target" title="Career Focus" />
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-black text-white">Preferred Roles</p>
                      <div className="mt-3 flex flex-wrap gap-2">{roles.map((item) => <SkillPill key={item} active={item === targetRole}>{item}</SkillPill>)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">Interested Domains</p>
                      <div className="mt-3 flex flex-wrap gap-2">{domains.map((item) => <SkillPill key={item}>{item}</SkillPill>)}</div>
                    </div>
                  </div>
                </Panel>

                {canEdit && (
                <Panel>
                  <SectionHeader eyebrow="Profile strength" title={`${completion}% Ready`} />
                  <div className="h-3 rounded-full bg-black/30">
                    <div style={{ width: `${completion}%` }} className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300" />
                  </div>
                  <div className="mt-4 space-y-2">
                    {profileSuggestions.map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 text-sm font-bold text-slate-300">
                        <Target size={16} className="text-cyan-200" />
                        {item}
                      </div>
                    ))}
                  </div>
                </Panel>
                )}

                {canEdit && (
                <Panel>
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-300/30 bg-rose-500/15 px-4 py-3 text-sm font-black text-rose-100 shadow-[0_16px_34px_rgba(244,63,94,0.12)] transition hover:-translate-y-0.5 hover:border-rose-200/50 hover:bg-rose-500/25 hover:text-white cursor-pointer"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </Panel>
                )}
              </div>
            </div>
          </>
        )}

        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#12182B] p-5 shadow-xl">
              <h3 className="text-lg font-black text-white">Confirm Logout</h3>
              <p className="mt-2 text-sm font-semibold text-slate-400">Are you sure you want to logout?</p>
              <div className="mt-5 flex justify-end gap-2">
                <button className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-black text-slate-300 cursor-pointer" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
                <button
                  className="rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-black text-white cursor-pointer"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    logout();
                    navigate('/auth');
                  }}
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
