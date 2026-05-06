import { useState } from 'react';
import Sidebar from './Sidebar';

const Roadmap = () => {
  // Yeh temporary state data hai. Baad mein isko aapke backend API /api/study-plans se replace karenge.
  const [ongoingPlans] = useState([
    { id: 1, title: 'SQL 50', total: 50, completed: 5, colorStart: '#0284c7', colorEnd: '#06b6d4', icon: 'SQL' },
    { id: 2, title: 'Top Interview 150', total: 150, completed: 0, colorStart: '#047857', colorEnd: '#10b981', icon: 'TOP' }
  ]);

  const [featuredPlans] = useState([
    { id: 3, title: 'LeetCode 75', desc: 'Ace Coding Interview with 75 Qs', colorStart: '#1d4ed8', colorEnd: '#3b82f6', icon: '🎯' },
    { id: 2, title: 'Top Interview 150', desc: 'Must-do List for Interview Prep', colorStart: '#0f766e', colorEnd: '#14b8a6', icon: '💬' },
    { id: 4, title: 'Binary Search', desc: '8 Patterns, 42 Qs = Master BS', colorStart: '#6d28d9', colorEnd: '#a855f7', icon: '🌪️' },
    { id: 1, title: 'SQL 50', desc: 'Crack SQL Interview in 50 Qs', colorStart: '#0369a1', colorEnd: '#0ea5e9', icon: '☁️' }
  ]);

  return (
    <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#12161b] to-[#0e1115] p-8 md:p-12 text-white">
        <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Study Plan</h1>
          <button className="bg-[#2a2a2a] text-sm px-4 py-2 rounded-md hover:bg-gray-700 transition font-medium">
            My Study Plan &gt;&gt;
          </button>
        </div>

        {/* Ongoing Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-white">Ongoing</h2>
          <div className="flex flex-wrap gap-4">
            {ongoingPlans.map(plan => (
              <div key={`ongoing-${plan.id}`} className="bg-[#2a2a2a] p-4 rounded-xl w-full md:w-80 flex items-center gap-4 shadow-lg border border-gray-800 hover:border-gray-600 transition-colors cursor-pointer">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner"
                  style={{ background: `linear-gradient(135deg, ${plan.colorStart}, ${plan.colorEnd})` }}
                >
                  {plan.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-gray-200">{plan.title}</h3>
                  <div className="mt-2 h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ 
                        width: `${plan.total > 0 ? (plan.completed / plan.total) * 100 : 0}%`,
                        background: `linear-gradient(90deg, ${plan.colorStart}, ${plan.colorEnd})`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1.5 flex justify-between font-medium">
                    <span>Total Progress</span>
                    <span>{plan.completed} / {plan.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPlans.map(plan => (
              <div 
                key={`featured-${plan.id}`} 
                className="h-56 p-6 rounded-2xl flex flex-col relative overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 shadow-xl"
                style={{ background: `linear-gradient(135deg, ${plan.colorStart}, ${plan.colorEnd})` }}
              >
                <div className="z-10 relative">
                  <h3 className="font-bold text-xl text-white tracking-wide">{plan.title}</h3>
                  <p className="text-sm mt-2 text-white opacity-90 leading-snug">{plan.desc}</p>
                </div>
                {/* Decorative Element */}
                <div className="absolute -bottom-6 -right-4 text-9xl opacity-20 filter blur-[2px] pointer-events-none">
                  {plan.icon}
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
