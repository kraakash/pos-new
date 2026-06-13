import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { getRoadmap, getRoadmapCompanies } from '../../roadmaps/index';

/**
 * CompanyTrack — shows company-specific preparation guide.
 * Route: /roadmaps/:roadmapId/companies
 */
export default function CompanyTrack() {
  const { roadmapId } = useParams();
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all'); // all | service | product | startup
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function load() {
      const m = getRoadmap(roadmapId);
      if (!m) { navigate('/roadmaps'); return; }
      setMeta(m);
      const c = await getRoadmapCompanies(roadmapId);
      setCompanies(c);
      if (c.length > 0) setSelected(c[0]);
      setLoadingData(false);
    }
    load();
  }, [roadmapId, navigate]);

  if (loadingData || !meta) {
    return (
      <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#40e0d0] border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const filtered = filter === 'all' ? companies : companies.filter((c) => c.type === filter);
  const diffColor = { Easy: '#34d399', 'Easy-Medium': '#a3e635', Medium: '#fbbf24', 'Medium-Hard': '#fb923c', Hard: '#f87171', 'Very Hard': '#e879f9', Varies: '#60a5fa' };

  return (
    <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#12161b] to-[#0e1115]">
        <TopBar title="Company Tracks" subtitle={meta.title} />

        <div className="max-w-6xl mx-auto px-8 md:px-12 pb-16">
          <button
            onClick={() => navigate(`/roadmaps/${roadmapId}`)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-6"
          >
            ← Back to Roadmap
          </button>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {['all', 'service', 'product', 'startup'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                  ${filter === f ? 'text-[#12161b]' : 'bg-[#171c23] border border-[#222a35] text-gray-500 hover:text-gray-300'}`}
                style={filter === f ? { background: meta.color } : {}}
              >
                {f === 'all' ? 'All Companies' : f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company list */}
            <div className="lg:col-span-1 space-y-2">
              {filtered.map((company) => (
                <button
                  key={company.id}
                  onClick={() => setSelected(company)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all
                    ${selected?.id === company.id
                      ? 'border-opacity-40 text-white'
                      : 'border-[#1e2532] bg-[#171c23] text-gray-400 hover:border-[#2c3441] hover:text-gray-200'
                    }`}
                  style={selected?.id === company.id
                    ? { borderColor: `${meta.color}44`, background: `${meta.color}0f` }
                    : {}
                  }
                >
                  <span className="text-xl">{company.logo}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{company.name}</p>
                    <p className="text-[10px] capitalize" style={{ color: diffColor[company.difficulty] || '#6b7280' }}>
                      {company.difficulty}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize
                    ${company.type === 'product' ? 'bg-[#60a5fa]/10 text-[#60a5fa]'
                    : company.type === 'startup' ? 'bg-[#34d399]/10 text-[#34d399]'
                    : 'bg-[#6b7280]/10 text-[#6b7280]'}`}
                  >
                    {company.type}
                  </span>
                </button>
              ))}
            </div>

            {/* Company detail */}
            {selected && (
              <div className="lg:col-span-2 bg-[#171c23] border border-[#222a35] rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6 pb-5 border-b border-[#1e2532]">
                  <span className="text-4xl">{selected.logo}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selected.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded-full"
                        style={{ background: `${diffColor[selected.difficulty] || '#6b7280'}18`, color: diffColor[selected.difficulty] || '#6b7280' }}>
                        {selected.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">⏱ {selected.timeline} prep</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Round pattern */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Round Pattern</p>
                    <div className="space-y-1.5">
                      {selected.rounds.map((round, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="w-5 h-5 rounded-full bg-[#12161b] border border-[#2c3441] text-[10px] font-bold text-gray-500 flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          {round}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills required */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Skills Required</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.skills.map((skill) => (
                        <span key={skill} className="text-xs px-2.5 py-1 rounded-lg bg-[#12161b] border border-[#1e2532] text-gray-400">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quick info */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Quick Info</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">DSA Level</span>
                        <span className="text-gray-300 font-medium">{selected.dsaLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Aptitude Required</span>
                        <span className={`font-medium ${selected.aptitude ? 'text-[#fbbf24]' : 'text-[#34d399]'}`}>
                          {selected.aptitude ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Project Expectation</span>
                        <span className="text-gray-300 font-medium">{selected.projectExpectation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">💡 Key Tip</p>
                    <p className="text-sm text-gray-400 leading-relaxed">{selected.tips}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
