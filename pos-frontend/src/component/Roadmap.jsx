import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Roadmap = () => {
  const [ongoingPlans, setOngoingPlans] = useState([]);
  const [featuredPlans, setFeaturedPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/study-plans`, { headers });
        const data = await response.json();
        if (response.ok && data.data) {
          // Map backend data to frontend format
          const mappedPlans = data.data.map(p => ({
            id: p.id,
            title: p.title,
            desc: p.description,
            total: p.totalQuestions || 0,
            completed: p.completed || 0,
            colorStart: p.themeStartColor || '#1d4ed8',
            colorEnd: p.themeEndColor || '#3b82f6',
            icon: p.title.includes('SQL') ? '☁️' : p.title.includes('Interview') ? '💬' : p.title.includes('Binary Search') ? '🌪️' : '🎯',
            isFeatured: p.isFeatured
          }));
          
          setFeaturedPlans(mappedPlans.filter(p => p.isFeatured));
          setOngoingPlans(mappedPlans.filter(p => p.completed > 0));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="flex h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#12161b] to-[#0e1115] text-white">
        <TopBar title="Study Plan" subtitle="Roadmap" />
        <div className="max-w-6xl mx-auto px-8 md:px-12 pb-12">

        {/* Ongoing Section */}
        {ongoingPlans.length > 0 && (
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
        )}

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
