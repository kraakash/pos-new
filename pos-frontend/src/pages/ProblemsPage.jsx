import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCw, Search, X } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { EmptyState } from "../components/ui/empty-state";
import { apiFetch } from "../lib/api";

/**
 * Normalizes question properties to ensure UI consistency regardless of schema naming.
 * 
 * @param {object} q - The question object from backend database
 * @returns {object} - Normalized question representation
 */
function normalizeQuestion(q) {
  return {
    id: q.id,
    displayId: q.id,
    title: q.title,
    topic: q.category || 'General',
    difficulty: String(q.difficulty || "EASY").toLowerCase(),
    tags: q.tags || [],
    isSolved: Boolean(q.isSolved),
    isAttempted: Boolean(q.isAttempted || q.isSolved)
  };
}

const difficultyTone = {
  easy: "border-emerald-300/40 bg-emerald-300/15 text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.12)]",
  medium: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  hard: "border-rose-500/30 bg-rose-500/15 text-rose-300",
};

const statCards = [
  {
    key: "total",
    difficulty: null,
    label: "Total Questions",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #67e8f9 54%, #818cf8 100%)",
  },
  {
    key: "easy",
    difficulty: "easy",
    label: "Easy",
    gradient: "linear-gradient(135deg, #6ee7b7 0%, #5eead4 52%, #22d3ee 100%)",
  },
  {
    key: "medium",
    difficulty: "medium",
    label: "Medium",
    gradient: "linear-gradient(135deg, #fcd34d 0%, #fb923c 52%, #fda4af 100%)",
  },
  {
    key: "hard",
    difficulty: "hard",
    label: "Hard",
    gradient: "linear-gradient(135deg, #fb7185 0%, #f472b6 52%, #a78bfa 100%)",
  },
];

const statusFilters = [
  { id: "solved", label: "Solved" },
  { id: "attempted", label: "Attempted" },
  { id: "notAttempted", label: "Not Attempted" },
];

/**
 * Metric summary card displaying question counts.
 * 
 * @param {object} props - Component properties
 */
function StatCard({ label, value, gradient, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`overflow-hidden rounded-2xl border border-white/10 bg-[#303143] text-left shadow-[0_18px_38px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-indigo-300/30 hover:shadow-[0_24px_48px_rgba(0,0,0,0.26)] focus:outline-none ${
        active
          ? "ring-2 ring-white/80 ring-offset-2 ring-offset-black/40"
          : "opacity-90 hover:opacity-100"
      }`}
    >
      <div className="relative h-16 p-4" style={{ background: gradient }}>
        <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-white/20 blur-xl" />
        <span className="relative inline-flex rounded-xl border border-white/40 bg-white/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_12px_28px_rgba(0,0,0,0.16)]">
          {label}
        </span>
      </div>
      <div className="p-4">
        <p className="text-4xl font-black text-white">{value}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          {label === "Total Questions" ? "Complete practice bank" : `${label} level questions`}
        </p>
      </div>
    </button>
  );
}

/**
 * Lists a single coding question.
 * 
 * @param {object} props - Component properties
 */
function QuestionCard({ problem, solved }) {
  const statusLabel = solved ? "Solved" : problem.isAttempted ? "Attempted" : "Not attempted";
  const statusClass = solved
    ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
    : problem.isAttempted
      ? "border-indigo-300/30 bg-indigo-300/10 text-indigo-200"
      : "border-slate-300/10 bg-slate-300/5 text-slate-400";

  return (
    <Link
      to={`/practice/${problem.id}`}
      className="group block rounded-xl border border-white/10 bg-[#242536] px-4 py-3 transition hover:-translate-y-0.5 hover:border-indigo-300/50 hover:bg-[#303143]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-white group-hover:text-indigo-200">
            {problem.title}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold capitalize ${difficultyTone[problem.difficulty] || difficultyTone.easy}`}
        >
          {problem.difficulty}
        </span>
      </div>
      <div className="mt-3">
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black ${statusClass}`}>
          {statusLabel}
        </span>
      </div>
    </Link>
  );
}

/**
 * Filter tag button pill.
 * 
 * @param {object} props - Component properties
 */
function FilterPill({ topic, active, onClick, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
        active
          ? "border-indigo-400/60 bg-indigo-400/15 text-indigo-200"
          : "border-white/10 bg-[#242536] text-slate-400 hover:border-indigo-300/30 hover:text-white"
      }`}
    >
      {topic}
      {typeof count === "number" && (
        <span className="ml-1.5 text-[10px] opacity-70">{count}</span>
      )}
    </button>
  );
}

/**
 * Helper search matcher.
 * 
 * @param {object} problem - Normalised problem
 * @param {string} query - Keyword search
 * @returns {boolean} - True if search query matches any field
 */
function questionMatchesSearch(problem, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const searchable = [
    problem.displayId,
    problem.title,
    problem.topic,
    problem.difficulty,
    ...(problem.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchable.includes(q);
}

/**
 * ProblemsPage Page Component
 * Renders the question bank interface with dynamic totals, keyword searches,
 * category pill tags, and status filter criteria options.
 */
export default function ProblemsPage() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [solvedIds, setSolvedIds] = useState(() => new Set());
  const [activeTopic, setActiveTopic] = useState("All");
  const [activeDifficulty, setActiveDifficulty] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /**
   * Loads or refreshes the listing data from GET /questions.
   * 
   * @param {object} opts - Retrieval configurations
   */
  const load = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/questions");
      const list = Array.isArray(res?.data) ? res.data.map(normalizeQuestion) : [];
      setProblems(list);
      setSolvedIds(new Set(list.filter((q) => q.isSolved).map((q) => q.id)));
    } catch (err) {
      setError(err.message || "Failed to load problems");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Compute stats on the loaded problems array
  const counts = useMemo(() => {
    const c = { total: problems.length, easy: 0, medium: 0, hard: 0, solved: 0, attempted: 0, notAttempted: 0 };
    problems.forEach((p) => {
      if (p.difficulty === "easy") c.easy += 1;
      else if (p.difficulty === "medium") c.medium += 1;
      else if (p.difficulty === "hard") c.hard += 1;

      if (p.isSolved) c.solved += 1;
      else if (p.isAttempted) c.attempted += 1;
      else c.notAttempted += 1;
    });
    return c;
  }, [problems]);

  // Aggregate category types
  const topics = useMemo(() => {
    const counter = problems.reduce((acc, p) => {
      acc[p.topic] = (acc[p.topic] || 0) + 1;
      return acc;
    }, {});
    const sorted = Object.keys(counter).sort();
    return [
      { name: "All", count: problems.length },
      ...sorted.map((name) => ({ name, count: counter[name] })),
    ];
  }, [problems]);

  // Apply filters on query and criteria
  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (activeTopic !== "All" && p.topic !== activeTopic) return false;
      if (activeDifficulty && p.difficulty !== activeDifficulty) return false;
      if (activeStatus) {
        const status = p.isSolved ? "solved" : p.isAttempted ? "attempted" : "notAttempted";
        if (activeStatus !== status) return false;
      }
      if (!questionMatchesSearch(p, searchQuery)) return false;
      return true;
    });
  }, [problems, activeTopic, activeDifficulty, activeStatus, searchQuery]);

  const toggleStatus = (status) => {
    setActiveStatus((prev) => (prev === status ? null : status));
  };

  const suggestions = useMemo(() => {
    const q = searchQuery.trim();
    if (q.length < 2) return [];
    return problems
      .filter((p) => questionMatchesSearch(p, q))
      .slice(0, 6);
  }, [problems, searchQuery]);

  const clearSearchAndFilters = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    setActiveTopic("All");
    setActiveDifficulty(null);
    setActiveStatus(null);
  };

  return (
    <AppShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">
            Practice Library
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">Questions</h1>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-start">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
              placeholder="Search questions"
              className="h-10 w-full rounded-xl border border-white/10 bg-[#303143] pl-11 pr-10 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-300/50 focus:ring-4 focus:ring-indigo-400/10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-white/8 hover:text-white"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute right-0 top-12 z-20 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#242536] p-2 shadow-[0_22px_50px_rgba(0,0,0,0.35)]">
                {suggestions.map((problem) => (
                  <button
                    type="button"
                    key={problem.id}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      setShowSuggestions(false);
                      navigate(`/practice/${problem.id}`);
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#303143]"
                  >
                    <span className="min-w-0 font-sans">
                      <span className="block truncate text-sm font-bold text-white">{problem.title}</span>
                      <span className="text-xs text-slate-500">{problem.topic}</span>
                    </span>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${difficultyTone[problem.difficulty] || difficultyTone.easy}`}>
                      {problem.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={() => load({ silent: true })}
            disabled={loading || refreshing}
            className="gap-2"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? statCards.map((s) => (
              <Skeleton key={s.key} className="h-[120px] rounded-2xl animate-pulse bg-white/5" />
            ))
          : statCards.map((s) => {
              const isTotal = s.difficulty === null;
              const active = isTotal
                ? activeDifficulty === null
                : activeDifficulty === s.difficulty;
              return (
                <StatCard
                  key={s.key}
                  label={s.label}
                  value={counts[s.key]}
                  gradient={s.gradient}
                  active={active}
                  onClick={() =>
                    setActiveDifficulty(
                      isTotal ? null : active ? null : s.difficulty,
                    )
                  }
                />
              );
            })}
      </div>

      <Card className="mt-6">
        <p className="font-bold text-white text-base">Question Bank</p>

        {loading ? (
          <div className="mt-4 flex flex-wrap gap-2 animate-pulse">
            <Skeleton className="h-7 w-16 rounded-full bg-white/5" />
            <Skeleton className="h-7 w-20 rounded-full bg-white/5" />
            <Skeleton className="h-7 w-24 rounded-full bg-white/5" />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => {
                const active = activeStatus === filter.id;
                return (
                  <label
                    key={filter.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-black transition ${
                      active
                        ? "border-indigo-300/50 bg-indigo-400/15 text-indigo-100 shadow-[0_0_18px_rgba(129,140,248,0.14)]"
                        : "border-white/10 bg-[#242536] text-slate-400 hover:border-indigo-300/30 hover:text-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleStatus(filter.id)}
                      className="h-3.5 w-3.5 accent-indigo-400"
                    />
                    {filter.label}
                    <span className="text-[10px] opacity-70">{counts[filter.id]}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <FilterPill
                  key={t.name}
                  topic={t.name}
                  count={t.count}
                  active={activeTopic === t.name}
                  onClick={() => setActiveTopic(t.name)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[110px] rounded-xl animate-pulse bg-white/5" />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Failed to load problems"
              message={error}
              action={
                <Button onClick={() => load()} variant="ghost">
                  Try again
                </Button>
              }
            />
          ) : problems.length === 0 ? (
            <EmptyState
              title="No problems found"
              message="Run the backend seed command to populate the problem bank."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No problems match your filters"
              message={
                searchQuery.trim()
                  ? `No questions found for "${searchQuery.trim()}".`
                  : activeStatus
                    ? "No questions match the selected status filters."
                  : activeDifficulty && activeTopic !== "All"
                  ? `No "${activeDifficulty}" problems in "${activeTopic}".`
                  : activeDifficulty
                    ? `No "${activeDifficulty}" problems found.`
                    : `No problems in "${activeTopic}".`
              }
              action={
                <Button
                  onClick={clearSearchAndFilters}
                  variant="ghost"
                >
                  Show all
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((problem) => (
                <QuestionCard
                  key={problem.id}
                  problem={problem}
                  solved={solvedIds.has(problem.id)}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </AppShell>
  );
}
