import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const navClass = (path) => {
    return location.pathname === path 
      ? "block px-3 py-2.5 rounded-md bg-[#40e0d0]/10 text-[#40e0d0] text-sm font-medium" 
      : "block px-3 py-2.5 rounded-md hover:bg-[#1a212b] text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors";
  };

  return (
    <aside className="w-64 bg-[#12161b] flex flex-col border-r border-[#1e2532] flex-shrink-0 h-screen sticky top-0">
      <div className="p-6 pb-4">
        <h1 className="text-xl font-bold text-[#40e0d0] tracking-tight">Placement OS</h1>
        <p className="text-[11px] text-gray-500 mt-1 lowercase tracking-wide">Career execution system</p>
      </div>

      <nav className="flex-1 px-4 mt-2 space-y-1">
        <Link to="/dashboard" className={navClass('/dashboard')}>Dashboard</Link>
        <Link to="/roadmap" className={navClass('/roadmap')}>Roadmap</Link>
        <a href="#" className="block px-3 py-2.5 rounded-md hover:bg-[#1a212b] text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors">Today's Experience</a>
        <Link to="/practice" className={navClass('/practice')}>Practice</Link>
        <a href="#" className="block px-3 py-2.5 rounded-md hover:bg-[#1a212b] text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors">Resume Analyzer</a>
        <a href="#" className="block px-3 py-2.5 rounded-md hover:bg-[#1a212b] text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors">Mock Interview</a>
      </nav>

    </aside>
  );
}
