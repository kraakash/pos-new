import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── Score ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const offset = circumference - (progress / 100) * circumference;

  const color =
    progress >= 75 ? '#40e0d0' : progress >= 50 ? '#facc15' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#1e2532" strokeWidth="10" />
        <circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 64 64)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white">{Math.round(progress)}</span>
        <span className="text-xs text-gray-500">/ 100</span>
      </div>
    </div>
  );
}

// ── Section card ───────────────────────────────────────────────────────────────
function ResultSection({ title, items, accent }) {
  const colors = {
    teal:   'text-[#40e0d0] bg-[#40e0d0]/10 border-[#40e0d0]/20',
    yellow: 'text-yellow-300 bg-yellow-400/10 border-yellow-400/20',
    red:    'text-red-400 bg-red-400/10 border-red-400/20',
    blue:   'text-blue-400 bg-blue-400/10 border-blue-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  };
  const dot = {
    teal:   'bg-[#40e0d0]',
    yellow: 'bg-yellow-400',
    red:    'bg-red-400',
    blue:   'bg-blue-400',
    purple: 'bg-purple-400',
  };

  return (
    <div className="bg-[#171c23] border border-[#222a35] rounded-xl p-5 space-y-3">
      <p className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border ${colors[accent]}`}>
        {title}
      </p>
      <ul className="space-y-2 pt-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot[accent]}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile]       = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [drag, setDrag]       = useState(false);

  // Auth guard
  const token = localStorage.getItem('token');
  if (!token) { navigate('/auth'); return null; }

  // ── File helpers ─────────────────────────────────────────────────────────────
  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Only PDF files are accepted.'); return; }
    if (f.size > 3 * 1024 * 1024)    { setError('File must be under 3 MB.'); return; }
    setError('');
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/resume/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Analysis failed. Please try again.');
      setResult(data);
    } catch (e) {
      setError(e.message || 'Resume analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const aiAvailable = result?.aiAvailable !== false;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#12161b] to-[#0e1115]">
        <TopBar title="Resume Analyzer" subtitle="Career Tools" />

        <div className="max-w-4xl mx-auto px-8 md:px-12 pb-12 space-y-6">

          {/* ── Upload card ── */}
          <div className="bg-[#171c23] border border-[#222a35] rounded-xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]">
            <p className="text-sm text-gray-400 mb-4">
              Upload your resume and get an AI-powered score with actionable feedback.
            </p>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer py-10 transition-all duration-200 ${
                drag
                  ? 'border-[#40e0d0] bg-[#40e0d0]/5'
                  : file
                  ? 'border-[#40e0d0]/40 bg-[#40e0d0]/5'
                  : 'border-[#2c3441] bg-[#12161b] hover:border-[#40e0d0]/40 hover:bg-[#40e0d0]/5'
              }`}
            >
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              {/* Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${file ? 'bg-[#40e0d0]/15' : 'bg-[#1a212b]'}`}>
                {file ? (
                  <svg className="w-6 h-6 text-[#40e0d0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
              </div>

              {file ? (
                <>
                  <p className="text-sm font-semibold text-[#40e0d0]">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-300">Drop your resume here or <span className="text-[#40e0d0]">browse</span></p>
                  <p className="text-xs text-gray-500">PDF only · Max 3 MB</p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={submit}
                disabled={!file || loading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#0f766e] to-[#14b8a6] text-white text-sm font-semibold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Analyzing Resume…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Analyze Resume
                  </>
                )}
              </button>

              {(file || result) && (
                <button
                  onClick={reset}
                  className="px-4 py-2.5 rounded-lg border border-[#2c3441] text-sm text-gray-400 hover:bg-[#1a212b] hover:text-gray-200 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* ── Error state ── */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4">
              <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-300">Analysis Failed</p>
                <p className="text-sm text-red-400/80 mt-0.5">{error}</p>
              </div>
              {file && (
                <button onClick={submit} className="text-xs text-red-300 hover:text-red-200 font-medium underline underline-offset-2 mt-0.5">
                  Retry
                </button>
              )}
            </div>
          )}

          {/* ── AI unavailable banner ── */}
          {result && !aiAvailable && (
            <div className="flex items-start gap-3 bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-5 py-4">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
              </svg>
              <p className="text-sm text-yellow-300">
                AI scoring is currently unavailable. Heuristic analysis ran successfully.
              </p>
            </div>
          )}

          {/* ── Results ── */}
          {result && (
            <>
              {/* Score row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score ring */}
                <div className="md:col-span-1 bg-[#171c23] border border-[#222a35] rounded-xl p-6 flex flex-col items-center justify-center gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]">
                  {aiAvailable ? (
                    <>
                      <ScoreRing score={result.score || 0} />
                      <p className="text-sm font-semibold text-white">Overall Score</p>
                      <p className="text-xs text-gray-500">Analyzed by Google Gemini</p>
                    </>
                  ) : (
                    <div className="text-center space-y-2">
                      <p className="text-4xl font-bold text-yellow-300">—</p>
                      <p className="text-sm text-gray-400">AI score unavailable</p>
                      <p className="text-xs text-gray-500">Heuristics ran successfully</p>
                    </div>
                  )}
                </div>

                {/* Quick summary stats */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  {[
                    ['Impact Points',    (result.impact    || []).length, 'from-[#0f766e] to-[#14b8a6]'],
                    ['Structure Checks', (result.structure || []).length, 'from-[#1d4ed8] to-[#3b82f6]'],
                    ['Issues Found',     (result.whatIsWrong || []).length, 'from-[#b91c1c] to-[#ef4444]'],
                    ['Items Missing',    (result.missing || []).length, 'from-[#7e22ce] to-[#a855f7]'],
                  ].map(([label, value, gradient]) => (
                    <div key={label} className={`rounded-xl p-5 shadow-lg border border-white/10 bg-gradient-to-br ${gradient}`}>
                      <p className="text-[13px] text-white/70 mb-1 font-medium">{label}</p>
                      <p className="text-[34px] tracking-tight font-bold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResultSection
                  title="Impact"
                  accent="teal"
                  items={result.impact?.length ? result.impact : ['No notable impact bullets detected.']}
                />
                <ResultSection
                  title="Structure"
                  accent="blue"
                  items={result.structure?.length ? result.structure : ['No structure issues detected.']}
                />
                <ResultSection
                  title="What's Wrong"
                  accent="red"
                  items={result.whatIsWrong?.length ? result.whatIsWrong : ['No major mistakes found. Your resume looks structurally solid.']}
                />
                <ResultSection
                  title="What's Missing"
                  accent="purple"
                  items={result.missing?.length ? result.missing : ['No critical sections appear to be missing.']}
                />
              </div>

              <ResultSection
                title="How to Make It Better"
                accent="yellow"
                items={result.howToImprove?.length ? result.howToImprove : ['Your resume is in good shape. Continue refining impact bullets and tailoring to target roles.']}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
