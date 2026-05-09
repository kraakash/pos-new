import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const lineData = [
  { date: '2026-04-20', orange: 0, cyan: 0 },
  { date: '2026-04-21', orange: 0, cyan: 0 },
  { date: '2026-04-22', orange: 0, cyan: 0 },
  { date: '2026-04-23', orange: 0, cyan: 0 },
  { date: '2026-04-24', orange: 0, cyan: 0 },
  { date: '2026-04-25', orange: 3, cyan: 1 },
  { date: '2026-04-26', orange: 0, cyan: 0 },
];

const barData = [
  { name: 'Dynamic Programming', score: 1 },
  { name: 'Graphs', score: 0 },
  { name: 'Binary Search', score: 0 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = { name: "Vikash Kumar" };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
      
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#12161b] to-[#0e1115]">
        <TopBar title="Dashboard" />
        <div className="px-8 pb-8">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-[#171c23] border border-[#222a35] rounded-xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]">
             <p className="text-[13px] text-gray-400 mb-2 font-medium">Readiness Score</p>
             <p className="text-[34px] tracking-tight font-bold text-[#40e0d0]">82.3</p>
          </div>
          <div className="bg-[#171c23] border border-[#222a35] rounded-xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]">
             <p className="text-[13px] text-gray-400 mb-2 font-medium">Current Streak</p>
             <p className="text-[34px] tracking-tight font-bold text-white">1 days</p>
          </div>
          <div className="bg-[#171c23] border border-[#222a35] rounded-xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]">
             <p className="text-[13px] text-gray-400 mb-2 font-medium">Completion Rate</p>
             <p className="text-[34px] tracking-tight font-bold text-white">33.33%</p>
          </div>
          <div className="bg-[#171c23] border border-[#222a35] rounded-xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]">
             <p className="text-[13px] text-gray-400 mb-2 font-medium">Learning Integrity Score</p>
             <p className="text-[34px] tracking-tight font-bold text-white">100.0</p>
          </div>
        </div>

        {/* Weak Topics */}
        <div className="bg-[#171c23] border border-[#222a35] rounded-xl p-5 mb-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]">
          <p className="text-[13px] font-medium text-gray-400 mb-3">Weak Topics</p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-[#12161b] border border-[#222a35] rounded-full text-xs text-gray-400">Graphs</span>
            <span className="px-3 py-1 bg-[#12161b] border border-[#222a35] rounded-full text-xs text-gray-400">Binary Search</span>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Line Chart */}
          <div className="bg-[#171c23] border border-[#222a35] rounded-xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] min-h-[300px] flex flex-col">
            <p className="text-[15px] font-semibold text-white mb-6">Weekly Progress</p>
            <div className="flex-1 w-full relative -left-4">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222a35" />
                  <XAxis dataKey="date" tick={{fontSize: 10, fill: '#6b7280'}} tickLine={false} axisLine={{stroke: '#222a35'}} />
                  <YAxis tick={{fontSize: 10, fill: '#6b7280'}} tickLine={false} axisLine={false} domain={[0, 3]} tickCount={5} />
                  <Line type="monotone" dataKey="orange" stroke="#eab308" strokeWidth={2} dot={{ r: 4, fill: '#171c23', stroke: '#eab308', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="cyan" stroke="#40e0d0" strokeWidth={2} dot={{ r: 4, fill: '#171c23', stroke: '#40e0d0', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-[#171c23] border border-[#222a35] rounded-xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] min-h-[300px] flex flex-col">
            <p className="text-[15px] font-semibold text-white mb-6">Topic Strength</p>
            <div className="flex-1 w-full relative -left-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barCategoryGap="20%" margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222a35" />
                  <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6b7280'}} tickLine={false} axisLine={{stroke: '#222a35'}} />
                  <YAxis tick={{fontSize: 10, fill: '#6b7280'}} tickLine={false} axisLine={false} domain={[0, 1]} tickCount={5} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score > 0 ? '#40e0d0' : 'transparent'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-[#171c23] border border-[#222a35] rounded-xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] mb-8">
          <p className="text-[15px] font-semibold text-white mb-4">Weekly Leaderboard</p>
          <div className="flex justify-between items-center px-4 py-3 bg-[#12161b] border border-[#222a35] rounded-lg">
            <div className="flex items-center text-sm">
              <span className="text-gray-500 mr-3">#1</span>
              <span className="text-gray-300 font-medium">{user?.name || 'Vikash Kumar'}</span>
            </div>
            <span className="text-sm font-semibold text-[#40e0d0]">12 pts</span>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
