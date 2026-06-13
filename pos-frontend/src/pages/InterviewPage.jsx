import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { AiUnavailableBanner } from '../components/ui/banner';
import { apiFetch } from '../lib/api';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { useInterviewStore } from '../store/interviewStore';
import {
  Bot,
  Brain,
  Check,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Database,
  Layers,
  Mic,
  Monitor,
  Network,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

const ROLES = [
  { title: 'SDE I', subtitle: 'DSA • Core CS • APIs', icon: Code2 },
  { title: 'SDE II', subtitle: 'DSA • Design • Leadership', icon: Layers },
  { title: 'Frontend Engineer', subtitle: 'React • UI Systems • Web', icon: Monitor },
  { title: 'Backend Engineer', subtitle: 'APIs • DB • Scalability', icon: Server },
  { title: 'Full Stack Engineer', subtitle: 'Frontend • Backend • Cloud', icon: Network },
  { title: 'Data Analyst', subtitle: 'SQL • Metrics • Insights', icon: Database },
  { title: 'Data Scientist', subtitle: 'ML • Stats • Product Sense', icon: Brain },
  { title: 'AI Engineer', subtitle: 'LLMs • RAG • Evaluation', icon: Bot },
  { title: 'ML Engineer', subtitle: 'Models • Pipelines • MLOps', icon: Cpu },
  { title: 'DevOps Engineer', subtitle: 'CI/CD • Docker • Cloud', icon: Server }
];

const INTERVIEW_TYPES = [
  { id: 'DSA', label: 'DSA Round', description: 'Problem solving and coding strategy', duration: '45 mins', icon: Code2 },
  { id: 'SYSTEM_DESIGN', label: 'System Design Round', description: 'Architecture, tradeoffs, scale', duration: '50 mins', icon: Layers },
  { id: 'CORE_CS', label: 'Core CS Round', description: 'OS, DBMS, CN fundamentals', duration: '35 mins', icon: Cpu },
  { id: 'BEHAVIORAL', label: 'HR / Behavioral Round', description: 'Communication and decision making', duration: '30 mins', icon: Users }
];

const DIFFICULTIES = [
  { id: 'EASY', label: 'Easy', description: 'Beginner Friendly' },
  { id: 'MEDIUM', label: 'Medium', description: 'Placement Standard' },
  { id: 'HARD', label: 'Hard', description: 'FAANG Level' }
];

/**
 * Returns color highlight classes based on score numerical ranges.
 */
function scoreTone(score) {
  if (score >= 80) return 'text-emerald-300';
  if (score >= 60) return 'text-cyan-300';
  if (score >= 40) return 'text-amber-300';
  return 'text-red-300';
}

/**
 * Formats time from raw seconds to MM:SS string.
 */
function formatTime(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function typeLabel(typeId) {
  return INTERVIEW_TYPES.find((item) => item.id === typeId)?.label || 'Not selected';
}

function typeDuration(typeId) {
  return INTERVIEW_TYPES.find((item) => item.id === typeId)?.duration || '45 mins';
}

function difficultyLabel(level) {
  return DIFFICULTIES.find((item) => item.id === level)?.label || 'Medium';
}

/**
 * InterviewPage Page Component
 * Renders the interactive AI Mock Interview workspace. Coordinates round selection setups,
 * dynamic audio voice inputs, question turns responses, and aggregates final candidate summaries.
 */
export default function InterviewPage() {
  const { requireAuth } = useAuthGuard();
  const [step, setStep] = useState('setup');
  const [answer, setAnswer] = useState('');
  const [timer, setTimer] = useState(0);
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');

  const recognitionRef = useRef(null);
  const speechBaseRef = useRef('');

  const role = useInterviewStore((s) => s.role);
  const type = useInterviewStore((s) => s.type);
  const difficulty = useInterviewStore((s) => s.difficulty);
  const sessionId = useInterviewStore((s) => s.sessionId);
  const question = useInterviewStore((s) => s.question);
  const questionNumber = useInterviewStore((s) => s.questionNumber);
  const currentDifficulty = useInterviewStore((s) => s.currentDifficulty);
  const feedback = useInterviewStore((s) => s.feedback);
  const report = useInterviewStore((s) => s.report);

  const setSetup = useInterviewStore((s) => s.setSetup);
  const startSession = useInterviewStore((s) => s.startSession);
  const updateTurn = useInterviewStore((s) => s.updateTurn);
  const setReport = useInterviewStore((s) => s.setReport);
  const reset = useInterviewStore((s) => s.reset);

  // Sync session clock timer
  useEffect(() => {
    if (step !== 'interview') return undefined;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [step]);

  // Configure speech recognition browser engine on mount
  useEffect(() => {
    const SpeechEng = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechEng) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    const recognition = new SpeechEng();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError('');
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setSpeechError('Microphone permission denied. Enable microphone access in browser configurations.');
        return;
      }
      if (event.error === 'no-speech') {
        setSpeechError('No speech detected. Speak closer to the microphone.');
        return;
      }
      setSpeechError('Speech transcription failed. You can continue typing details.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) finalText += transcript;
        else interimText += transcript;
      }

      if (finalText) {
        const merged = `${speechBaseRef.current} ${finalText}`.trim();
        speechBaseRef.current = merged;
        setAnswer(merged);
      }

      if (interimText) {
        setAnswer(`${speechBaseRef.current} ${interimText}`.trim());
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (step !== 'interview' && isListening) {
      recognitionRef.current?.stop();
    }
  }, [step, isListening]);

  const readyToStart = useMemo(() => Boolean(role && type && difficulty), [role, type, difficulty]);

  /**
   * Spawns a new interview session record in backend and returns question 1.
   */
  const startInterview = async () => {
    if (!readyToStart) return;
    if (!requireAuth(null, { message: 'Sign up or log in to launch the AI-powered interview studio.' })) return;
    
    setLoadingStart(true);
    try {
      const data = await apiFetch('/interview/start', {
        method: 'POST',
        body: JSON.stringify({
          role,
          type,
          difficulty,
          title: `${role} ${type} Mock Interview`
        })
      });

      startSession({
        sessionId: data.sessionId,
        question: data.question,
        questionNumber: data.questionNumber,
        difficulty: data.difficulty
      });
      setAnswer('');
      setTimer(0);
      setStep('interview');
    } finally {
      setLoadingStart(false);
    }
  };

  /**
   * Submits candidate response and fetches next prompt or report.
   * 
   * @param {boolean} endInterview - If true, instantly compiles score report
   */
  const nextQuestion = async (endInterview = false) => {
    if (!sessionId || !answer.trim()) return;
    if (isListening) recognitionRef.current?.stop();
    setLoadingNext(true);
    
    try {
      const data = await apiFetch('/interview/respond', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          answer,
          elapsedSeconds: timer,
          endInterview
        })
      });

      if (data.done) {
        const summary = await apiFetch(`/interview/report/${sessionId}`);
        setReport(summary);
        setStep('report');
        return;
      }

      updateTurn({
        question: data.nextQuestion,
        questionNumber: data.questionNumber,
        difficulty: data.difficulty,
        feedback: {
          aiAvailable: data.aiAvailable !== false,
          score: data.score,
          ...data.feedback,
          improvements: data.improvements || []
        }
      });

      setAnswer('');
      setTimer(0);
    } finally {
      setLoadingNext(false);
    }
  };

  const restart = () => {
    if (isListening) recognitionRef.current?.stop();
    reset();
    setAnswer('');
    setTimer(0);
    setStep('setup');
  };

  const startListening = () => {
    if (!speechSupported || !recognitionRef.current || isListening) return;
    speechBaseRef.current = answer.trim();
    setSpeechError('');
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
  };

  return (
    <AppShell wide={step === 'setup'}>
      {step !== 'setup' && (
        <div className="flex items-center justify-end gap-3 font-sans">
          <Button variant="ghost" onClick={restart}>Reset</Button>
        </div>
      )}

      {/* SETUP SELECTION CARD */}
      {step === 'setup' && (
        <div className="space-y-6 font-sans">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#303143] via-[#2d2f44] to-[#242536] p-4 shadow-xl md:p-5"
          >
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-300/25 bg-indigo-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-100">
                  <Sparkles size={14} />
                  AI Interview Simulator
                </span>
                <h1 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-white">
                  Mock Interview Studio
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 font-semibold">
                  Practice real interview scenarios powered by local heuristics and improve your placement readiness.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {['Evaluation Matrix', 'Voice Transcription', 'Immediate Feedback'].map((item) => (
                    <span key={item} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-100">
                      <Check size={15} className="text-emerald-300" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[170px]">
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-x-3 top-1 rounded-[1.5rem] border border-white/10 bg-[#242536]/85 p-4 shadow-xl backdrop-blur"
                >
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-cyan-300 shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
                    <Mic size={28} className="text-white" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-2.5 rounded-full bg-white/10">
                      <div className="h-full w-2/3 rounded-full bg-indigo-400" />
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10">
                      <div className="h-full w-1/2 rounded-full bg-cyan-300" />
                    </div>
                  </div>
                </motion.div>
                <div className="absolute bottom-2 left-2 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-200 shadow-md">
                  Evaluation engine loaded
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-[2rem] border border-white/10 bg-[#303143] p-5 shadow-2xl md:p-6"
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-7">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-200">1. Select Target Role</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {ROLES.map((item, index) => {
                      const Icon = item.icon;
                      const selected = role === item.title;
                      return (
                        <motion.button
                          key={item.title}
                          type="button"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.025 * index }}
                          whileHover={{ y: -4, scale: 1.01 }}
                          onClick={() => setSetup({ role: item.title })}
                          className={cn(
                            'group rounded-2xl border p-3.5 text-left transition cursor-pointer',
                            selected
                              ? 'border-indigo-300 bg-[#46496d] ring-2 ring-indigo-300/60 shadow-lg'
                              : 'border-white/10 bg-[#242536] hover:border-indigo-300/40 hover:bg-[#34364a]'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl border', selected ? 'border-indigo-200/60 bg-indigo-500 text-white' : 'border-white/10 bg-white/5 text-slate-300')}>
                              <Icon size={19} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-bold text-white">{item.title}</span>
                              <span className="mt-1 block text-[11px] font-semibold text-slate-450">{item.subtitle}</span>
                            </span>
                            {selected && (
                              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-indigo-300 text-[#242536]">
                                <Check size={13} />
                              </span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-200">2. Select Round Criteria</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {INTERVIEW_TYPES.map((item) => {
                      const Icon = item.icon;
                      const selected = type === item.id;
                      return (
                        <motion.button
                          key={item.id}
                          type="button"
                          whileHover={{ y: -4, scale: 1.01 }}
                          onClick={() => setSetup({ type: item.id })}
                          className={cn(
                            'rounded-2xl border p-4 text-left transition cursor-pointer',
                            selected
                              ? 'border-indigo-300 bg-[#46496d] ring-2 ring-indigo-300/60 shadow-lg'
                              : 'border-white/10 bg-[#242536] hover:border-cyan-300/35 hover:bg-[#34364a]'
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3">
                              <span className={cn('grid h-11 w-11 place-items-center rounded-xl border', selected ? 'border-indigo-200/60 bg-indigo-500 text-white' : 'border-white/10 bg-white/5 text-cyan-100')}>
                                <Icon size={20} />
                              </span>
                              <div>
                                <p className="text-sm font-bold text-white">{item.label}</p>
                                <p className="mt-1 text-[11px] font-semibold text-slate-400">{item.description}</p>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="rounded-full bg-[#191b2d] px-3 py-1 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                {item.duration}
                              </span>
                              {selected && (
                                <span className="grid h-5 w-5 place-items-center rounded-full bg-indigo-300 text-[#242536]">
                                  <Check size={13} />
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-200">3. Set Difficulty</p>
                  <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-[#242536] p-2 md:grid-cols-3">
                    {DIFFICULTIES.map((level) => {
                      const selected = difficulty === level.id;
                      return (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => setSetup({ difficulty: level.id })}
                          className={cn(
                            'rounded-xl px-4 py-4 text-left transition cursor-pointer',
                            selected
                              ? 'bg-indigo-500 text-white ring-2 ring-indigo-300/70 shadow-lg'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white'
                          )}
                        >
                          <span className="block text-sm font-black">{level.label}</span>
                          <span className={cn('mt-1 block text-xs font-semibold', selected ? 'text-indigo-100' : 'text-slate-550')}>{level.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-[#242536] p-4 shadow-xl">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-200">Session Details</p>
                  <div className="mt-5 space-y-4">
                    {[
                      ['Selected Role', role || 'Not selected'],
                      ['Interview Type', typeLabel(type)],
                      ['Difficulty', difficultyLabel(difficulty)],
                      ['Estimated Duration', typeDuration(type)],
                      ['Round Prompts', '5 adaptive questions']
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-0 last:pb-0">
                        <span className="text-xs text-slate-400 font-semibold">{label}</span>
                        <span className="text-right text-xs font-bold text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#2f3249] p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-400/20 text-indigo-100">
                      <Zap size={22} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">Scoring loops ready</p>
                      <p className="text-xs text-slate-400 font-semibold">Answers will be evaluated for correctness, clarity, and communication.</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startInterview}
                  disabled={!readyToStart || loadingStart}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingStart ? 'Starting Studio...' : 'Start AI Interview'}
                  <ChevronRight size={20} className="transition group-hover:translate-x-1" />
                </button>
              </aside>
            </div>
          </motion.section>
        </div>
      )}

      {/* ACTIVE INTERVIEW PANEL */}
      {step === 'interview' && (
        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr] font-sans">
          <Card className="border border-white/8 bg-[#303143]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20">{role}</Badge>
                <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20">{type}</Badge>
                <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20">{currentDifficulty}</Badge>
              </div>
              <p className="text-xs font-black uppercase tracking-wider text-indigo-200">Question {questionNumber} of 5</p>
            </div>

            <p className="mt-6 text-lg font-black text-white tracking-tight leading-relaxed">{question}</p>

            <div className="mt-6 rounded-2xl border border-white/8 bg-[#242536] p-4 flex items-center justify-between max-w-[140px]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Timer</p>
                <p className="text-xl font-black text-white tracking-tight">{formatTime(timer)}</p>
              </div>
              <Clock className="text-indigo-400" size={20} />
            </div>

            <div className="mt-6 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Answer</label>
              <Textarea
                rows={7}
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  if (isListening) speechBaseRef.current = e.target.value;
                }}
                placeholder="Type your answer here or click Speak Answer..."
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant={isListening ? 'primary' : 'ghost'}
                onClick={isListening ? stopListening : startListening}
                disabled={!speechSupported}
                className="gap-2"
              >
                <Mic size={15} className={isListening ? 'animate-pulse' : ''} />
                {isListening ? 'Stop Speaking' : 'Speak Answer'}
              </Button>
              {!speechSupported && <p className="text-xs font-semibold text-slate-500">Voice transcription is not supported in this browser.</p>}
              {isListening && <p className="text-xs font-bold text-indigo-300">Listening... Speak clearly to transcribe.</p>}
            </div>
            {speechError && <p className="mt-2 text-xs font-bold text-rose-450">{speechError}</p>}

            <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
              <Button
                onClick={() => nextQuestion(false)}
                disabled={loadingNext || !answer.trim()}
              >
                {loadingNext ? 'Evaluating Answer...' : 'Next Question'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => nextQuestion(true)}
                disabled={loadingNext || !answer.trim()}
              >
                End Interview
              </Button>
            </div>
          </Card>

          <Card className="border border-white/8 bg-[#303143]">
            <p className="font-bold text-white text-base">Latest Turn Feedback</p>
            {feedback && feedback.aiAvailable === false && (
              <AiUnavailableBanner className="mt-4" feature="AI evaluation" />
            )}
            {feedback && feedback.aiAvailable !== false ? (
              <div className="mt-4 space-y-4 text-sm font-sans">
                <div className="rounded-2xl border border-white/8 bg-[#242536] p-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score</span>
                  <span className={`text-3xl font-black ${scoreTone(feedback.score || 0)}`}>{feedback.score}%</span>
                </div>
                
                <div className="space-y-3 font-semibold text-slate-300 text-xs leading-relaxed">
                  <p><span className="block font-bold text-white uppercase tracking-wider text-[10px] text-slate-500 mb-0.5">Correctness:</span> {feedback.correctness}</p>
                  <p><span className="block font-bold text-white uppercase tracking-wider text-[10px] text-slate-500 mb-0.5">Clarity:</span> {feedback.clarity}</p>
                  <p><span className="block font-bold text-white uppercase tracking-wider text-[10px] text-slate-500 mb-0.5">Technical Depth:</span> {feedback.depth}</p>
                  <p><span className="block font-bold text-white uppercase tracking-wider text-[10px] text-slate-500 mb-0.5">Communication:</span> {feedback.communication}</p>
                  <p><span className="block font-bold text-white uppercase tracking-wider text-[10px] text-slate-500 mb-0.5">Feedback:</span> {feedback.summary}</p>
                </div>

                {(feedback.improvements || []).length > 0 && (
                  <div className="rounded-2xl border border-white/8 bg-[#242536] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Tips to improve</p>
                    <ul className="space-y-1.5 list-disc pl-4 text-xs font-semibold text-slate-300">
                      {feedback.improvements.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : !feedback ? (
              <div className="flex h-[320px] items-center justify-center text-center text-xs font-semibold text-slate-500 p-6">
                Submit your answer to get instant evaluations.
              </div>
            ) : null}
          </Card>
        </div>
      )}

      {/* FINAL REPORT VIEW */}
      {step === 'report' && report && (
        <div className="mt-6 space-y-6 font-sans">
          <Card className="border border-white/8 bg-[#303143]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-black text-white">Mock Interview Scorecard</h3>
                <p className="mt-1 text-xs font-semibold text-slate-400">Complete performance breakdown and analysis.</p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-xs font-bold px-4 py-1.5 uppercase tracking-wider">
                {report.status}
              </Badge>
            </div>
            
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/8 bg-[#242536] p-4 flex flex-col justify-between min-h-[90px]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overall Score</p>
                <p className={`text-4xl font-black ${scoreTone(report.overallScore || 0)}`}>{report.overallScore}%</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-[#242536] p-4 flex flex-col justify-between min-h-[90px]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Target Role</p>
                <p className="text-lg font-black text-white truncate">{report.role}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-[#242536] p-4 flex flex-col justify-between min-h-[90px]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Criteria</p>
                <p className="text-lg font-black text-white truncate">{report.type}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-[#242536] p-4 flex flex-col justify-between min-h-[90px]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Difficulty Range</p>
                <p className="text-lg font-black text-white">{report.initialDifficulty} &rarr; {report.finalDifficulty}</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="border border-white/8 bg-[#303143]">
              <p className="font-bold text-white text-base">Key Strengths</p>
              <div className="mt-4 space-y-3">
                {(report.strengths || []).length ? (
                  report.strengths.map((str, idx) => (
                    <div key={idx} className="flex gap-2 text-sm leading-6 text-slate-355 font-semibold">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <span>{str}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-semibold text-slate-500">No major strengths recorded in this round.</p>
                )}
              </div>
            </Card>
            
            <Card className="border border-white/8 bg-[#303143]">
              <p className="font-bold text-white text-base">Key Weaknesses</p>
              <div className="mt-4 space-y-3">
                {(report.weaknesses || []).length ? (
                  report.weaknesses.map((weak, idx) => (
                    <div key={idx} className="flex gap-2 text-sm leading-6 text-slate-355 font-semibold">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                      <span>{weak}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-semibold text-slate-500">No major weaknesses identified.</p>
                )}
              </div>
            </Card>
          </div>

          <Card className="border border-white/8 bg-[#303143]">
            <p className="font-bold text-white text-base">Actionable Recommendations</p>
            <div className="mt-4 space-y-3">
              {(report.improvementSuggestions || []).length ? (
                report.improvementSuggestions.map((tip, idx) => (
                  <div key={idx} className="flex gap-2 text-sm leading-6 text-slate-355 font-semibold">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-350" />
                    <span>{tip}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs font-semibold text-slate-500">No suggestions recorded.</p>
              )}
            </div>
            <div className="mt-6 border-t border-white/10 pt-4">
              <Button onClick={restart}>Take Another Round</Button>
            </div>
          </Card>

          {/* Q&A DETAILED LIST */}
          <Card className="border border-white/8 bg-[#303143]">
            <p className="font-bold text-white text-base">Turn Review History</p>
            <p className="mt-1 text-xs text-slate-500 font-semibold">Review candidate submissions and evaluated performance.</p>

            <div className="mt-6 space-y-4">
              {(report.responses || []).map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-white/8 bg-[#242536] p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-3">
                    <p className="text-sm font-bold text-white">Q{idx + 1}. {item.question}</p>
                    <Badge className={cn('text-xs font-black uppercase tracking-wider', scoreTone(item.score || 0))}>
                      Score: {item.score}%
                    </Badge>
                  </div>

                  <div className="rounded-xl border border-white/8 bg-[#303143] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Your Answer</p>
                    <p className="whitespace-pre-wrap text-sm text-white font-medium">{item.answer}</p>
                  </div>

                  <div className="grid gap-4 text-xs font-semibold text-slate-300 md:grid-cols-2 font-sans">
                    <p><span className="block font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Correctness:</span> {item.correctness}</p>
                    <p><span className="block font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Clarity:</span> {item.clarity}</p>
                    <p><span className="block font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Technical Depth:</span> {item.depth}</p>
                    <p><span className="block font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Communication:</span> {item.communication}</p>
                    <p className="md:col-span-2"><span className="block font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Review Summary:</span> {item.feedback}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
