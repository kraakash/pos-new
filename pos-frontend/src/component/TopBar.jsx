import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * TopBar Component
 * Har page ke top-right corner mein profile avatar aur logout button dikhata hai.
 * JWT token se user ke initials nikal ke avatar mein show karta hai.
 */
export default function TopBar({ title, subtitle }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // localStorage se directly naam lena (login/signup pe save hota hai)
  const getInitials = () => {
    const name = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserName = () => {
    return localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'User';
  };

  // Click bahar hone par dropdown band karna
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/auth');
  };

  return (
    <header className="flex items-center justify-between px-8 md:px-12 pt-8 pb-4 max-w-6xl mx-auto w-full">
      {/* Left: Page Title */}
      <div>
        {subtitle && (
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#40e0d0] mb-1">
            {subtitle}
          </p>
        )}
        {title && (
          <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
        )}
      </div>

      {/* Right: Profile Avatar + Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-[#1a212b] hover:bg-[#222a35] border border-[#2c3441] rounded-full pl-1 pr-3 py-1 transition-all duration-200 group"
        >
          {/* Avatar Circle */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#40e0d0] to-[#0e9488] flex items-center justify-center text-xs font-bold text-black">
            {getInitials()}
          </div>
          {/* Name */}
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
            {getUserName()}
          </span>
          {/* Chevron */}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-[#1a212b] border border-[#2c3441] rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="px-4 py-3 border-b border-[#2c3441]">
              <p className="text-xs text-gray-500">Signed in as</p>
              <p className="text-sm font-semibold text-white truncate">{getUserName()}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              {/* Logout Icon */}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
