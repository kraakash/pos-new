import { useRef, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  FileText,
  Layers3,
  Sparkles,
  UploadCloud
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { AiUnavailableBanner } from '../components/ui/banner';
import { ErrorState } from '../components/ui/error-state';
import { ResumeAnalysisResult } from '../components/resume/ResumeAnalysisResult';
import { apiFormData } from '../lib/api';
import { cn } from '../lib/utils';
import { useAuthGuard } from '../hooks/useAuthGuard';

const ROLE_OPTIONS = [
  'Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'Data Analyst',
  'Data Scientist'
];

const TEMPLATES = [
  { title: 'SDE Fresher',         subtitle: 'DSA, projects, internships',     tone: 'from-indigo-400 to-cyan-300',     sections: ['Education', 'Skills', 'Projects', 'Internship', 'Achievements'], slug: 'sde-fresher' },
  { title: 'Frontend Engineer',   subtitle: 'React, UI systems, performance', tone: 'from-violet-400 to-fuchsia-300',  sections: ['Portfolio', 'React Projects', 'UI Skills', 'Performance', 'Education'], slug: 'frontend-engineer' },
  { title: 'Data Analyst',        subtitle: 'SQL, dashboards, insights',      tone: 'from-amber-300 to-orange-400',    sections: ['Analytics Skills', 'Projects', 'SQL', 'Dashboards', 'Education'], slug: 'data-analyst' },
  { title: 'Backend Engineer',    subtitle: 'APIs, databases, scalability',   tone: 'from-sky-300 to-blue-500',        sections: ['Backend Skills', 'APIs', 'Databases', 'Projects', 'Internship'], slug: 'backend-engineer' },
  { title: 'Full Stack Engineer', subtitle: 'Frontend + backend projects',    tone: 'from-indigo-300 to-violet-500',   sections: ['Full Stack Skills', 'Projects', 'APIs', 'Deployment', 'Education'], slug: 'full-stack-engineer' },
  { title: 'AI / ML Engineer',    subtitle: 'ML models, Python, projects',    tone: 'from-emerald-300 to-cyan-400',    sections: ['ML Skills', 'Projects', 'Datasets', 'Metrics', 'Research'], slug: 'ai-ml-engineer' },
  { title: 'DevOps Engineer',     subtitle: 'CI/CD, Docker, cloud',           tone: 'from-slate-300 to-indigo-400',    sections: ['DevOps Skills', 'Cloud', 'CI/CD', 'Projects', 'Linux'], slug: 'devops-engineer' },
  { title: 'QA / SDET Engineer',  subtitle: 'Testing, automation, quality',   tone: 'from-rose-300 to-pink-500',       sections: ['Testing Skills', 'Automation', 'Projects', 'Bug Reports', 'Tools'], slug: 'qa-sdet' }
];

const CHECKLIST = [
  'Single-column ATS-friendly layout',
  'GitHub/LinkedIn links are clickable',
  'Each project has tech stack + outcome',
  'Bullets start with strong action verbs',
  'No photo, tables, or heavy graphics',
  'Role keywords match target job'
];

/**
 * ResumePage Page Component
 * Renders the ATS Resume Studio. Candidates can select a target role, drop/browse a PDF resume,
 * trigger analysis, and download structured resume templates.
 */
export default function ResumePage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetRole, setTargetRole] = useState(ROLE_OPTIONS[0]);
  const fileInputRef = useRef(null);
  
  const { requireAuth } = useAuthGuard();

  /**
   * Triggers the analysis call. Uploads multipart file to POST /resume/analyze.
   */
  const submit = async () => {
    if (!file) return;
    if (!requireAuth(null, { message: 'Sign up or log in to upload your resume and get AI-powered feedback.' })) return;
    
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetRole', targetRole);
      
      const data = await apiFormData('/resume/analyze', formData);
      setResult(data);
    } catch (e) {
      setError(e.message || 'Resume analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper to trigger download actions for resume outline files.
   * 
   * @param {object} template - The template item config
   */
  const downloadTemplate = (template) => {
    const link = document.createElement('a');
    link.href = `/resume-templates/${template.slug}.pdf`;
    link.download = `${template.slug}-resume.pdf`;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const aiAvailable = result?.aiAvailable !== false;
  const score = Math.round(result?.score || 0);

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Banner Introduction Section */}
        <section className="overflow-hidden rounded-3xl border border-white/8 bg-[#303143] shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8 font-sans">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-indigo-100">
                <Sparkles size={14} />
                ATS Resume Studio
              </span>
              <h1 className="mt-5 text-3xl font-black text-white md:text-4xl">Resume Analyzer</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Upload your resume, choose your target role, and get practical feedback on structure,
                keywords, project impact, and missing sections.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'ATS Structure', icon: Layers3 },
                  { label: 'Role Keywords', icon: BadgeCheck },
                  { label: 'Project Impact', icon: BriefcaseBusiness }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl border border-white/8 bg-[#242536] p-4">
                      <Icon size={18} className="text-indigo-300" />
                      <p className="mt-3 text-sm font-black text-white">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-[#242536] p-5">
              <p className="text-sm font-black text-white">Quick ATS Checklist</p>
              <div className="mt-4 space-y-3">
                {CHECKLIST.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Upload Interface board */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] font-sans">
          <div className="rounded-3xl border border-white/8 bg-[#303143] p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-white">Analyze Your Resume</h2>
                <p className="mt-1 text-xs text-slate-400">PDF only, up to 3 MB.</p>
              </div>
              <select
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                className="h-10 rounded-xl border border-white/10 bg-[#242536] px-3 text-sm font-bold text-white outline-none"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => requireAuth(() => fileInputRef.current?.click(), { message: 'Sign up or log in to upload and analyze your resume.' })}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (!requireAuth(null, { message: 'Sign up or log in to upload and analyze your resume.' })) return;
                const dropped = event.dataTransfer.files?.[0];
                if (dropped) setFile(dropped);
              }}
              className={cn(
                'mt-5 flex min-h-[180px] w-full flex-col items-center justify-center rounded-3xl border border-dashed p-6 text-center transition cursor-pointer',
                file ? 'border-indigo-300/45 bg-indigo-400/10' : 'border-white/12 bg-[#242536] hover:border-indigo-300/45 hover:bg-[#2b2d43]'
              )}
            >
              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-indigo-500/15 text-indigo-200">
                <UploadCloud size={30} />
              </span>
              <p className="mt-4 text-base font-black text-white">
                {file ? file.name : 'Drop your resume here'}
              </p>
              <p className="mt-1 text-sm text-slate-500 font-semibold">
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected` : 'or click to choose a PDF file'}
              </p>
            </button>

            <button
              type="button"
              onClick={submit}
              disabled={!file || loading}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_35px_rgba(99,102,241,0.3)] transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Analyzing Resume...' : 'Analyze Resume'}
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Target Score Locker */}
          <div className="rounded-3xl border border-white/8 bg-[#303143] p-5 shadow-xl">
            <p className="text-sm font-black text-white">Resume Score</p>
            <div className="mt-5 grid place-items-center">
              <div className="relative grid h-36 w-36 place-items-center rounded-full bg-[#242536]">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: `conic-gradient(#818cf8 ${score * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
                />
                <div className="relative grid h-28 w-28 place-items-center rounded-full bg-[#303143]">
                  <span className="text-3xl font-black text-white">{result ? score : '--'}</span>
                </div>
              </div>
            </div>
            <p className="mt-5 text-center text-xs leading-5 text-slate-500 font-semibold">
              Score appears after analysis. Use the templates below to improve structure before uploading.
            </p>
          </div>
        </section>

        {/* Outline layouts section */}
        <section className="font-sans">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-white font-sans">Resume Templates</h2>
              <p className="mt-1 text-xs text-slate-400">Student-friendly outlines you can adapt for placement resumes.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {TEMPLATES.map((template) => (
              <div key={template.title} className="overflow-hidden rounded-3xl border border-white/8 bg-[#303143] shadow-xl">
                <div className={cn('h-24 bg-gradient-to-br p-5', template.tone)}>
                  <FileText size={30} className="text-white" />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-black text-white">{template.title}</h3>
                  <p className="mt-1 text-xs text-slate-400 font-semibold">{template.subtitle}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {template.sections.slice(0, 3).map((section) => (
                      <span key={section} className="rounded-full bg-[#242536] px-2.5 py-1 text-[10px] font-bold text-slate-400">
                        {section}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadTemplate(template)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#242536] px-4 py-2.5 text-xs font-black text-white transition hover:border-indigo-300/45 hover:bg-[#34364a]"
                  >
                    <Download size={15} />
                    Download Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {error && (
        <ErrorState
          className="mt-4"
          title="Resume analysis failed"
          message={error}
          onRetry={file ? submit : undefined}
        />
      )}

      {result && !aiAvailable && (
        <AiUnavailableBanner className="mt-4" feature="AI resume scoring" />
      )}

      {result && <ResumeAnalysisResult result={result} />}
    </AppShell>
  );
}
