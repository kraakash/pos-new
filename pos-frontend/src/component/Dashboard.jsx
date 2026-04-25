import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // This function automatically runs when the user reaches /dashboard
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      
      // If there's no token, instantly kick them back to login
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        // Fetch the protected backend route using the token
        const response = await fetch('http://localhost:5001/api/users/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        // If the token is invalid or expired
        if (!response.ok) {
          throw new Error(result.message || 'Failed to authenticate dashboard data');
        }

        // Save the successful backend data into our state
        setData(result);
      } catch (err) {
        setError(err.message);
        
        // Optionally auto-logout the user if their token was rejected
        if (err.message.toLowerCase().includes('authorized') || err.message.toLowerCase().includes('token')) {
            localStorage.removeItem('token');
            navigate('/auth');
        }
      }
    };

    fetchDashboardData();
  }, [navigate]);

  return (
    <div className="min-h-screen p-8 text-white bg-gradient-to-br from-[#121820] via-[#101a21] to-[#0d141e]">
      <div className="max-w-4xl mx-auto mt-12 bg-[#161a23] p-8 rounded-xl shadow-2xl border border-[#202835]">
        <h1 className="text-3xl font-bold text-[#40e0d0] mb-4">Protected Dashboard</h1>
        
        {error ? (
          <div className="text-red-400 p-4 bg-red-500/10 rounded">{error}</div>
        ) : !data ? (
          <div className="text-gray-400 font-medium animate-pulse">Loading your secure data...</div>
        ) : (
          <div className="animate-fadeUp">
            <p className="text-lg text-gray-200 mb-6">{data.message}</p>
            <div className="bg-[#242b3b] p-6 rounded-lg text-gray-300 shadow-inner">
              <h2 className="text-xl font-semibold mb-4 text-[#40e0d0]">Your Profile Details:</h2>
              <ul className="space-y-3">
                <li className="flex justify-between border-b border-gray-600/30 pb-2">
                    <strong className="text-gray-400">Name</strong> 
                    <span className="text-white">{data.user?.name || 'N/A'}</span>
                </li>
                <li className="flex justify-between border-b border-gray-600/30 pb-2">
                    <strong className="text-gray-400">Email</strong> 
                    <span className="text-white">{data.user?.email || 'N/A'}</span>
                </li>
                <li className="flex justify-between border-b border-gray-600/30 pb-2">
                    <strong className="text-gray-400">User ID</strong> 
                    <span className="text-white">{data.user?.id || 'N/A'}</span>
                </li>
              </ul>
              
              {data.overview && (
                 <div className="mt-6 p-4 bg-[#40e0d0]/10 border border-[#40e0d0]/30 rounded">
                     <p className="text-sm text-[#40e0d0]">{data.overview}</p>
                 </div>
              )}
            </div>
            
            <button 
              className="mt-8 px-6 py-2 bg-red-500/10 border border-red-500/40 text-red-500 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors font-medium"
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/auth');
              }}
            >
              Logout Securely
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
