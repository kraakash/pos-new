import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/questions`;

const initialForm = {
  title: '',
  description: '',
  difficulty: 'Easy',
  category: '',
};

const difficultyStyles = {
  Easy: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
  Medium: 'text-yellow-300 bg-yellow-400/10 border-yellow-400/20',
  Hard: 'text-red-300 bg-red-400/10 border-red-400/20',
};



export default function PracticePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const stats = useMemo(() => {
    const total = questions.length;
    const easy = questions.filter((question) => question.difficulty === 'Easy').length;
    const medium = questions.filter((question) => question.difficulty === 'Medium').length;
    const hard = questions.filter((question) => question.difficulty === 'Hard').length;

    return { total, easy, medium, hard };
  }, [questions]);

  const categories = useMemo(() => {
    const cats = questions.map(q => q.category).filter(Boolean);
    return ['All', ...new Set(cats)];
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'All') return questions;
    return questions.filter(q => q.category === selectedCategory);
  }, [questions, selectedCategory]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_BASE_URL, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Questions fetch nahi ho paaye.');
      }

      setQuestions(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuestions();
  }, []);



  return (
    <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#12161b] to-[#0e1115]">
        <TopBar title="Questions" subtitle="Practice Library" />
        <div className="max-w-6xl mx-auto px-8 md:px-12 pb-12">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              ['Total Questions', stats.total, 'from-[#0369a1] to-[#0ea5e9]'],
              ['Easy', stats.easy, 'from-[#047857] to-[#10b981]'],
              ['Medium', stats.medium, 'from-[#ca8a04] to-[#facc15]'],
              ['Hard', stats.hard, 'from-[#b91c1c] to-[#ef4444]'],
            ].map(([label, value, gradient]) => (
              <div key={label} className={`rounded-xl p-5 shadow-lg border border-white/10 bg-gradient-to-br ${gradient}`}>
                <p className="text-[13px] text-white/80 mb-2 font-medium">{label}</p>
                <p className="text-[34px] tracking-tight font-bold text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6">

            <section className="bg-[#2a2a2a] border border-gray-800 rounded-xl p-5 shadow-lg">
              <p className="text-xl font-semibold mb-4 text-white">Question Bank</p>

              {categories.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-5 pb-5 border-b border-gray-800">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                        selectedCategory === cat 
                          ? 'bg-[#40e0d0]/10 text-[#40e0d0] border-[#40e0d0]/30' 
                          : 'bg-[#171c23] text-gray-400 border-[#222a35] hover:border-gray-500 hover:text-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {isLoading ? (
                <div className="py-16 text-center text-sm text-gray-500">Loading questions...</div>
              ) : filteredQuestions.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-500">No questions found for this category.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredQuestions.map((question) => (
                    <article
                      key={question.id}
                      onClick={() => navigate(`/practice/${question.id}`)}
                      className="bg-[#171c23] border border-[#222a35] rounded-xl p-4 cursor-pointer hover:border-gray-600 hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                            {question.isSolved && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#40e0d0]" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            {question.title}
                          </h3>
                          {question.category && (
                            <p className="text-xs text-gray-500 mt-2">{question.category}</p>
                          )}
                        </div>
                        <span className={`shrink-0 px-3 py-1 rounded-full border text-xs font-semibold ${difficultyStyles[question.difficulty] || difficultyStyles.Easy}`}>
                          {question.difficulty || 'Easy'}
                        </span>
                      </div>
                      <div className="mt-4 h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#0f766e] to-[#14b8a6]"></div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
