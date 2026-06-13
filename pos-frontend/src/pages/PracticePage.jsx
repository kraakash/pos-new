import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { ArrowLeft, Play, RotateCcw, Settings, Check } from "lucide-react";
import { apiFetch } from "../lib/api";
import { useAuthGuard } from "../hooks/useAuthGuard";

const LANGUAGES = [
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
  { id: "python", label: "Python 3" },
  { id: "javascript", label: "JavaScript" }
];

const DEFAULT_LANGUAGE = "python";
const DRAFT_PREFIX = "placement-os:practice-draft";

const TABS = [
  { id: "problem", label: "Problem" },
  { id: "submissions", label: "Submissions" },
  { id: "discussion", label: "Discussion" }
];

/**
 * Returns color classes corresponding to question difficulty levels.
 * 
 * @param {string} difficulty - Difficulty tag (EASY, MEDIUM, HARD)
 * @returns {string} - Tailored CSS color styles
 */
function difficultyTone(difficulty) {
  const d = String(difficulty || "EASY").toUpperCase();
  if (d === "EASY") return "text-emerald-400 bg-emerald-400/5 border-emerald-400/20";
  if (d === "MEDIUM") return "text-yellow-400 bg-yellow-400/5 border-yellow-400/20";
  return "text-red-400 bg-red-400/5 border-red-400/20";
}

/**
 * Capitalizes difficulty label texts.
 * 
 * @param {string} d - Difficulty tag
 * @returns {string} - Styled text
 */
function difficultyLabel(d) {
  if (!d) return "";
  return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
}

/**
 * Returns color classes corresponding to execution status strings.
 * 
 * @param {string} status - Compiler output status
 * @returns {string} - Tailwind styling
 */
function statusTone(status) {
  if (status === "Accepted") return "text-emerald-400";
  if (status === "Wrong Answer") return "text-red-400";
  if (status === "Compilation Error" || status === "Compile Error") return "text-orange-400";
  if (status === "Runtime Error") return "text-red-400";
  return "text-yellow-400";
}

/**
 * Generates localdraft key for language choice.
 */
function languageDraftKey(questionId) {
  return `${DRAFT_PREFIX}:${questionId}:language`;
}

/**
 * Generates localdraft key for workspace code.
 */
function codeDraftKey(questionId, language) {
  return `${DRAFT_PREFIX}:${questionId}:${language}:code`;
}

/**
 * Reads code localdraft string.
 */
function readDraft(questionId, language) {
  try {
    return localStorage.getItem(codeDraftKey(questionId, language));
  } catch {
    return null;
  }
}

/**
 * Saves current code workspace to localStorage.
 */
function writeDraft(questionId, language, nextCode) {
  try {
    localStorage.setItem(languageDraftKey(questionId), language);
    localStorage.setItem(codeDraftKey(questionId, language), nextCode);
  } catch {
    // best-effort
  }
}

/**
 * Clears saved code workspace localdraft.
 */
function clearDraft(questionId, language) {
  try {
    localStorage.removeItem(codeDraftKey(questionId, language));
    localStorage.setItem(languageDraftKey(questionId), language);
  } catch {
    // best-effort
  }
}

/**
 * PracticePage Page Component
 * Renders the dual-panel coding workspace. Left side displays markdown statements
 * and past solutions. Right side hosts Monaco editor and execution compiler consoles.
 */
export default function PracticePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isGuest, requireAuth } = useAuthGuard();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "submissions" ? "submissions" : "problem");
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [code, setCode] = useState("");
  const codeRef = useRef("");
  const languageRef = useRef(DEFAULT_LANGUAGE);

  const [activeTestCase, setActiveTestCase] = useState(0);
  const [consoleTab, setConsoleTab] = useState("testcases");

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [runError, setRunError] = useState("");

  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const updateLanguage = (nextLanguage) => {
    languageRef.current = nextLanguage;
    setLanguage(nextLanguage);
  };

  const updateCode = (nextCode) => {
    codeRef.current = nextCode;
    setCode(nextCode);
  };

  // Fetch question details on load
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    
    apiFetch(`/questions/${id}`)
      .then((res) => {
        if (!active) return;
        const questionData = res.data;
        let nextLanguage = DEFAULT_LANGUAGE;
        try {
          nextLanguage = localStorage.getItem(languageDraftKey(questionData.id)) || DEFAULT_LANGUAGE;
        } catch {
          nextLanguage = DEFAULT_LANGUAGE;
        }
        if (!questionData?.starterCode?.[nextLanguage]) nextLanguage = DEFAULT_LANGUAGE;
        
        const savedCode = readDraft(questionData.id, nextLanguage);
        setQuestion(questionData);
        updateLanguage(nextLanguage);
        updateCode(savedCode ?? questionData?.starterCode?.[nextLanguage] ?? "");
      })
      .catch((err) => {
        if (active) setLoadError(err.message || "Failed to load question");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (searchParams.get("tab") === "submissions") {
      setActiveTab("submissions");
    }
  }, [searchParams]);

  // Fetch past solution records when history tab mounts
  useEffect(() => {
    if (activeTab !== "submissions" || !id || isGuest) return;
    let active = true;
    setLoadingSubmissions(true);
    
    apiFetch(`/questions/${id}/submissions`)
      .then((res) => active && setSubmissions(res.data || []))
      .catch(() => active && setSubmissions([]))
      .finally(() => active && setLoadingSubmissions(false));
      
    return () => {
      active = false;
    };
  }, [activeTab, id, isGuest]);

  const activeInput = useMemo(
    () => question?.examples?.[activeTestCase]?.input || "",
    [question, activeTestCase]
  );

  const expectedOutput = useMemo(
    () => question?.examples?.[activeTestCase]?.output || "",
    [question, activeTestCase]
  );

  /**
   * Toggles editor language template.
   */
  const handleLanguageChange = (nextLanguage) => {
    updateLanguage(nextLanguage);
    if (!question) return;
    const nextCode = readDraft(question.id, nextLanguage) ?? question.starterCode?.[nextLanguage] ?? "";
    updateCode(nextCode);
    writeDraft(question.id, nextLanguage, nextCode);
  };

  /**
   * Resets code to default template.
   */
  const handleResetCode = () => {
    if (!question) return;
    clearDraft(question.id, language);
    updateCode(question.starterCode?.[language] || "");
  };

  const handleCodeChange = (nextCode) => {
    const normalizedCode = nextCode ?? "";
    updateCode(normalizedCode);
    if (question?.id) writeDraft(question.id, language, normalizedCode);
  };

  /**
   * Executes candidate code against standard test cases (run-only round).
   */
  const handleRun = async () => {
    if (!question) return;
    if (!requireAuth(null, { message: 'Sign up or log in to execute your solution against test cases.' })) return;
    
    setIsRunning(true);
    setRunError("");
    setRunResult(null);
    setConsoleTab("output");
    
    try {
      const res = await apiFetch("/code/run", {
        method: "POST",
        body: JSON.stringify({
          questionId: question.id,
          language,
          code,
          input: activeInput
        })
      });
      setRunResult(res.data);
    } catch (err) {
      setRunError(err.message || "Execution engine failed.");
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Submits candidate code for full evaluation and updates database stats.
   */
  const handleSubmit = async () => {
    if (!question) return;
    if (!requireAuth(null, { message: 'Sign up or log in to submit your solution and track progress.' })) return;
    
    const submittedQuestionId = question.id;
    const submittedLanguage = languageRef.current;
    const submittedCode = codeRef.current;
    
    setIsSubmitting(true);
    setRunError("");
    setRunResult(null);
    setConsoleTab("output");
    
    try {
      // 1. Compile run-test
      const runRes = await apiFetch("/code/run", {
        method: "POST",
        body: JSON.stringify({
          questionId: question.id,
          language: submittedLanguage,
          code: submittedCode,
          input: activeInput
        })
      });
      
      const result = runRes.data;
      const actual = (result.stdout || "").trim();
      const expected = (expectedOutput || "").trim();
      let status = result.status?.description || "Unknown";

      if (status === "Accepted") {
        if (!expected) status = "No Expected Output";
        else if (actual !== expected) status = "Wrong Answer";
      }

      const finalResult = { ...result, status: { description: status } };
      setRunResult(finalResult);

      // 2. Log submission turn
      await apiFetch(`/questions/${question.id}/submit`, {
        method: "POST",
        body: JSON.stringify({
          code: submittedCode,
          language: submittedLanguage,
          status,
          runtimeMs: typeof result.time === "number" ? Math.round(result.time * 1000) : undefined,
          memoryKb: typeof result.memory === "number" ? result.memory : undefined,
          stdout: result.stdout,
          stderr: result.stderr
        })
      });

      // Refresh list if submissions tab is active
      if (activeTab === "submissions") {
        const subs = await apiFetch(`/questions/${id}/submissions`);
        setSubmissions(subs.data || []);
      }
    } catch (err) {
      setRunError(err.message || "Submit compilation failed.");
    } finally {
      writeDraft(submittedQuestionId, submittedLanguage, submittedCode);
      updateLanguage(submittedLanguage);
      updateCode(submittedCode);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#252638] text-[#818cf8] font-sans font-bold text-sm">
        Loading workspace...
      </div>
    );
  }

  if (loadError || !question) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#252638] text-white font-sans">
        <p className="text-lg font-bold">{loadError || "Question not found"}</p>
        <Link to="/problems" className="text-[#818cf8] hover:underline font-semibold text-sm">
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#252638] font-sans text-gray-300">
      {/* Header element */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#3a3b4f] bg-[#242436] px-6">
        <div className="flex items-center gap-6">
          <Link
            to="/problems"
            className="group flex items-center gap-2 text-gray-400 transition-colors hover:text-[#818cf8]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#3a3b4f] bg-[#303143] group-hover:border-[#818cf8]/50">
              <ArrowLeft size={16} />
            </div>
            <span className="text-sm font-semibold tracking-wide">Library</span>
          </Link>
          <div className="h-6 w-px bg-[#3a3b4f]" />
          <h2 className="font-bold text-white text-base">{question.title}</h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 rounded-lg border border-[#3a3b4f] bg-[#303143] px-4 py-2 text-sm font-bold text-gray-300 transition-all hover:bg-[#1f2630] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play size={14} className="text-[#818cf8]" />
            {isRunning ? "Running..." : "Run Code"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-[#818cf8] px-6 py-2 text-sm font-black text-black shadow-[0_0_15px_rgba(129,140,248,0.3)] transition-all hover:bg-[#6366f1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Solution"}
          </button>
        </div>
      </header>

      {/* Main split-pane workspace panel */}
      <div className="flex flex-1 gap-4 overflow-hidden bg-gradient-to-br from-[#252638] to-[#242436] p-4">
        
        {/* LEFT COMPONENT */}
        <div className="flex w-[45%] flex-col overflow-hidden rounded-2xl border border-[#3a3b4f] bg-[#303143] shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
          <div className="flex gap-2 border-b border-[#3a3b4f] px-4 pb-2 pt-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all ${
                  activeTab === tab.id
                    ? "bg-[#818cf8]/10 text-[#818cf8]"
                    : "text-gray-500 hover:bg-[#2c3040] hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "problem" && (
              <div className="space-y-8">
                <div>
                  <h1 className="mb-4 flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
                    {question.isSolved && <Check size={26} className="text-[#818cf8]" />}
                    {question.title}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-4 py-1.5 text-xs font-bold ${difficultyTone(question.difficulty)}`}>
                      {difficultyLabel(question.difficulty)}
                    </span>
                    {question.category && (
                      <span className="rounded-full border border-[#45465c] bg-[#3a3b4f] px-4 py-1.5 text-xs font-bold text-gray-300">
                        {question.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-gray-300 font-medium">
                  {(question.description || "").split("\n").map((para, i) => (
                    <p key={i} className="mb-4">
                      {para}
                    </p>
                  ))}
                </div>

                {question.examples?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Examples</h3>
                    {question.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="group relative overflow-hidden rounded-xl border border-[#3a3b4f] bg-[#252638] p-5"
                      >
                        <div className="absolute left-0 top-0 h-full w-1 bg-[#818cf8]/50 transition-colors group-hover:bg-[#818cf8]" />
                        <p className="mb-3 text-[10px] font-bold uppercase text-slate-500">Example {idx + 1}</p>
                        <div className="space-y-2 font-mono text-xs">
                          <div className="flex">
                            <span className="w-20 text-gray-500 font-semibold">Input:</span>
                            <span className="text-[#a5d6ff]">{ex.input}</span>
                          </div>
                          <div className="flex">
                            <span className="w-20 text-gray-500 font-semibold">Output:</span>
                            <span className="text-[#7ee787]">{ex.output}</span>
                          </div>
                          {ex.explanation && (
                            <div className="mt-2 flex border-t border-[#3a3b4f] pt-2">
                              <span className="w-20 text-gray-500 font-semibold">Explain:</span>
                              <span className="whitespace-normal text-gray-400">{ex.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
                  {question.constraints?.length > 0 && (
                    <div className="rounded-xl border border-[#3a3b4f] bg-[#252638] p-5">
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Constraints</h3>
                      <ul className="space-y-2">
                        {question.constraints.map((c, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1 text-xs text-[#818cf8]">▹</span>
                            <code className="rounded bg-[#2c3040] px-1.5 py-0.5 font-mono text-xs text-gray-300">{c}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(question.expectedTimeComplexity || question.expectedSpaceComplexity) && (
                    <div className="flex flex-col justify-center gap-4 rounded-xl border border-[#3a3b4f] bg-[#252638] p-5">
                      {question.expectedTimeComplexity && (
                        <div>
                          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Time Complexity</p>
                          <code className="font-mono text-sm text-[#ff7b72] font-semibold">{question.expectedTimeComplexity}</code>
                        </div>
                      )}
                      {question.expectedSpaceComplexity && (
                        <div>
                          <p className="mb-1 text-xs font-bold uppercase text-slate-400">Space Complexity</p>
                          <code className="font-mono text-sm text-[#79c0ff] font-semibold">{question.expectedSpaceComplexity}</code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="space-y-4">
                <h3 className="mb-6 text-lg font-bold text-white">Submission History</h3>
                {loadingSubmissions ? (
                  <div className="mt-10 text-center text-gray-500 font-semibold text-sm">Loading submissions...</div>
                ) : submissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                    <p className="font-semibold text-sm">No submissions yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => {
                          writeDraft(question.id, sub.language, sub.code);
                          updateCode(sub.code);
                          updateLanguage(sub.language);
                        }}
                        className="group flex cursor-pointer items-center justify-between rounded-xl border border-[#3a3b4f] bg-[#252638] p-4 transition-colors hover:border-[#818cf8]/50"
                      >
                        <div className="flex flex-col">
                          <span className={`text-base font-black ${statusTone(sub.status)}`}>{sub.status}</span>
                          <span className="mt-1 text-xs font-semibold text-slate-500">
                            {new Date(sub.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="rounded-full border border-[#45465c] bg-[#2c3040] px-3 py-1 font-mono text-xs text-gray-300 font-semibold">
                            {sub.language}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold text-[#818cf8] opacity-0 transition-opacity group-hover:opacity-100">
                            View Code &rarr;
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "discussion" && (
              <div className="flex h-full flex-col items-center justify-center text-slate-500">
                <p className="font-bold text-sm">Discussion section is under construction</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Monaco Editor */}
        <div className="flex w-[55%] flex-col gap-4">
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[#3a3b4f] bg-[#303143] shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
            <div className="flex h-12 items-center justify-between border-b border-[#3a3b4f] bg-[#252638] px-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Language</span>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="cursor-pointer appearance-none rounded-md border border-[#45465c] bg-[#2c3040] px-3 py-1 text-xs font-bold text-[#818cf8] outline-none transition-colors focus:border-[#818cf8]/50"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-[#45465c] bg-[#2c3040] p-1.5 text-gray-500 transition-colors hover:text-gray-300"
                  title="Settings"
                >
                  <Settings size={14} />
                </button>
                <button
                  onClick={handleResetCode}
                  className="rounded-md border border-[#45465c] bg-[#2c3040] p-1.5 text-gray-500 transition-colors hover:text-gray-300"
                  title="Reset Code"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            <div className="relative flex-1 bg-[#242436]">
              <Editor
                height="100%"
                theme="vs-dark"
                language={language === "cpp" ? "cpp" : language}
                value={code}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 15,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  padding: { top: 20 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  formatOnPaste: true,
                  automaticLayout: true
                }}
              />
            </div>
          </div>

          {/* Console Output tabs */}
          <div className="flex h-[260px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#3a3b4f] bg-[#303143] shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
            <div className="flex h-10 items-center gap-6 border-b border-[#3a3b4f] bg-[#252638] px-4">
              <button
                onClick={() => setConsoleTab("testcases")}
                className={`relative flex h-full items-center text-xs font-bold ${
                  consoleTab === "testcases" ? "text-[#818cf8]" : "text-slate-500 transition-colors hover:text-gray-300"
                }`}
              >
                Testcases
                {consoleTab === "testcases" && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#818cf8]" />}
              </button>
              <button
                onClick={() => setConsoleTab("output")}
                className={`relative flex h-full items-center text-xs font-bold ${
                  consoleTab === "output" ? "text-[#818cf8]" : "text-slate-500 transition-colors hover:text-gray-300"
                }`}
              >
                Console Output
                {consoleTab === "output" && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#818cf8]" />}
              </button>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden p-4">
              {consoleTab === "testcases" && (
                <>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {(question.examples || []).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestCase(idx)}
                        className={`rounded-lg border px-4 py-1.5 text-xs font-semibold transition-all ${
                          activeTestCase === idx
                            ? "border-[#818cf8]/50 bg-[#2c3040] text-white shadow-[0_0_10px_rgba(64,224,208,0.1)]"
                            : "border-[#3a3b4f] bg-[#252638] text-gray-500 hover:border-gray-600 hover:text-gray-300"
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {question.examples?.[activeTestCase] && (
                    <div className="flex-1 space-y-4 overflow-y-auto">
                      {(question.examples[activeTestCase].input || "").split(", ").map((variable, i) => {
                        const eq = variable.indexOf(" = ");
                        const name = eq >= 0 ? variable.slice(0, eq) : "Input";
                        const value = eq >= 0 ? variable.slice(eq + 3) : variable;
                        return (
                          <div key={i} className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{name}</span>
                            <div className="rounded-xl border border-[#3a3b4f] bg-[#242436] px-4 py-2.5 font-mono text-xs text-[#a5d6ff]">
                              {value}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {consoleTab === "output" && (
                <div className="flex-1 overflow-y-auto">
                  {isRunning || isSubmitting ? (
                    <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-500">
                      {isSubmitting ? "Submitting..." : "Running code..."}
                    </div>
                  ) : runError ? (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 font-mono">
                      {runError}
                    </div>
                  ) : runResult ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border border-[#45465c] bg-[#2c3040] px-3 py-1 text-xs font-bold ${statusTone(runResult.status?.description)}`}
                        >
                          {runResult.status?.description || "Finished"}
                        </span>
                        {typeof runResult.time === "number" && runResult.time > 0 && (
                          <span className="rounded-full border border-[#45465c] bg-[#2c3040] px-3 py-1 text-xs font-semibold text-slate-400">
                            {runResult.time}s
                          </span>
                        )}
                        {typeof runResult.memory === "number" && runResult.memory > 0 && (
                          <span className="rounded-full border border-[#45465c] bg-[#2c3040] px-3 py-1 text-xs font-semibold text-slate-400">
                            {runResult.memory} KB
                          </span>
                        )}
                      </div>

                      {runResult.stderr && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 font-mono">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-400">Runtime / Compile Error</p>
                          <pre className="whitespace-pre-wrap text-xs text-red-300">{runResult.stderr}</pre>
                        </div>
                      )}

                      {runResult.stdout && (
                        <div className="rounded-xl border border-[#3a3b4f] bg-[#242436] p-4 font-mono">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Standard Output</p>
                          <pre className="whitespace-pre-wrap text-xs text-gray-200">{runResult.stdout}</pre>
                        </div>
                      )}

                      {expectedOutput && (
                        <div className="rounded-xl border border-[#3a3b4f] bg-[#242436] p-4 font-mono">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Expected Output</p>
                          <pre className="whitespace-pre-wrap text-xs text-[#7ee787]">{expectedOutput}</pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-500">
                      Run code to see output.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
