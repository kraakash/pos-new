import { Link, useLocation } from 'react-router-dom';
import { FileText, FolderOpen, Grid2X2, LockKeyhole, LogIn, Target, UserRound } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { dashboardPath, profilePath } from '../../lib/routes';

const links = [
  { key: 'dashboard', label: 'Dashboard', icon: Grid2X2, match: (path, paths) => path === paths.dashboard || path === '/dashboard' },
  { href: '/roadmap', label: 'Roadmaps', icon: Target, match: (path) => path === '/roadmap' || path.startsWith('/roadmap') },
  { href: '/problems', label: 'Practice', icon: FolderOpen, match: (path) => path === '/problems' || path.startsWith('/practice/') || path === '/problems' },
  { href: '/resume', label: 'Resume Analyzer', icon: FileText, match: (path) => path === '/resume' },
  { href: '/interview', label: 'Mock Interview', icon: UserRound, match: (path) => path === '/interview' }
];

/**
 * Common Layout Wrapper for pages inside Placement OS.
 * Renders a fixed sidebar on larger screens, a top bar menu on mobile viewports,
 * and frames page child elements cleanly inside a dark slate surface.
 * 
 * @param {object} props - Component properties
 * @param {React.ReactNode} props.children - Child elements to wrap
 * @param {boolean} props.wide - If true, maximizes main container max-width
 * @param {boolean} props.guest - Overrides authentication visibility to force guest state
 */
export function AppShell({ children, wide = false, guest }) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isGuest = guest ?? !user;
  const username = user?.username || user?.fullName || user?.name || '';
  
  const paths = {
    dashboard: isGuest ? '/dashboard' : dashboardPath(user),
    profile: profilePath(user)
  };

  // Generate 2-character user initials for the avatar container
  const initials = (() => {
    const fullName = (user?.fullName || user?.name || '').trim();
    if (fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    }
    const handle = (user?.username || '').replace(/^@/, '');
    return handle.slice(0, 2).toUpperCase() || 'U';
  })();

  return (
    <div className="h-screen overflow-hidden bg-[#585967] text-white">
      <div className="flex h-full w-full overflow-hidden bg-[#242436] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden h-screen w-[230px] shrink-0 flex-col overflow-y-auto bg-[#29283a] px-6 py-7 lg:flex">
          <Link to={isGuest ? '/dashboard' : paths.dashboard} className="flex items-center gap-2 text-lg font-black text-white">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white">
              <span className="h-3 w-3 rounded-full bg-indigo-500" />
            </span>
            <span className="leading-tight">Placement OS</span>
          </Link>

          <nav className="mt-10 space-y-3">
            {links.map((link) => {
              const Icon = link.icon;
              const href = link.key === 'dashboard' ? paths.dashboard : link.href;
              const isActive = !isGuest && link.match(location.pathname, paths);
              return (
                <Link
                  key={link.key || link.href}
                  to={href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-bold text-slate-400 transition hover:bg-white/8 hover:text-white',
                    isActive && 'bg-indigo-500 text-white shadow-[0_14px_30px_rgba(99,102,241,0.35)]'
                  )}
                >
                  <Icon size={17} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {isGuest && (
            <div className="mt-auto space-y-3 rounded-3xl bg-[#232232] p-5 text-center shadow-2xl">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-300 shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
                <LogIn size={24} className="text-[#29283a]" />
              </div>
              <p className="text-sm font-semibold text-slate-200">Join Placement OS</p>
              <p className="text-xs text-slate-400">Track your prep, build your profile, and ace placements.</p>
              <Link
                to="/auth?mode=register"
                className="block w-full rounded-2xl bg-indigo-500 py-2.5 text-sm font-bold text-white shadow-[0_16px_35px_rgba(99,102,241,0.35)] transition hover:bg-indigo-400"
              >
                Sign up
              </Link>
              <Link
                to="/auth?mode=login"
                className="block w-full rounded-2xl border border-white/10 bg-transparent py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/5"
              >
                Log in
              </Link>
            </div>
          )}

          {!isGuest && (
            <div className="mt-auto space-y-4">
              <div className="relative overflow-hidden rounded-3xl bg-[#232232] p-4 text-center shadow-2xl">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] bg-gradient-to-br from-pink-300 via-amber-200 to-indigo-300 shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
                  <LockKeyhole size={32} className="text-[#29283a]" />
                </div>
                <p className="mt-4 text-sm text-slate-300">Unlock advanced placement prep</p>
                <button className="mt-4 w-full rounded-2xl bg-indigo-500 py-3 text-sm font-bold text-white shadow-[0_16px_35px_rgba(99,102,241,0.35)] transition hover:bg-indigo-400">
                  Upgrade
                </button>
              </div>
              <Link
                to={paths.profile}
                className={cn(
                  'group flex items-center gap-3 rounded-2xl border border-transparent bg-[#232232] p-3 text-sm font-bold text-slate-300 transition hover:border-white/10 hover:bg-[#303143] hover:text-white',
                  (location.pathname === '/profile' || location.pathname === paths.profile)
                    && 'border-indigo-300/50 bg-gradient-to-r from-indigo-500 to-indigo-400 text-white shadow-[0_16px_35px_rgba(99,102,241,0.35)]'
                )}
              >
                <span
                  className={cn(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500 text-xs font-black text-white transition',
                    (location.pathname === '/profile' || location.pathname === paths.profile) && 'bg-white text-indigo-600 shadow-sm'
                  )}
                >
                  {initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">@{username}</span>
                  <span
                    className={cn(
                      'block text-xs font-semibold text-slate-500 transition group-hover:text-slate-300',
                      (location.pathname === '/profile' || location.pathname === paths.profile) && 'text-indigo-100'
                    )}
                  >
                    Student profile
                  </span>
                </span>
              </Link>
            </div>
          )}
        </aside>

        {/* RESPONSIVE TOP BAR (FOR MOBILE SCREEN SIZES) */}
        <main className="h-screen min-w-0 flex-1 overflow-y-auto bg-[#252638] p-5 md:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 lg:hidden">
            <Link to={isGuest ? '/dashboard' : paths.dashboard} className="flex items-center gap-2 text-lg font-black text-white">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white">
                <span className="h-3 w-3 rounded-full bg-indigo-500" />
              </span>
              Placement OS
            </Link>
            {!isGuest && (
              <Link
                to={paths.profile}
                className="grid h-10 w-10 place-items-center rounded-xl bg-[#303143] text-xs font-black text-indigo-100"
              >
                {initials}
              </Link>
            )}
            {isGuest && (
              <div className="flex gap-2">
                <Link
                  to="/auth?mode=login"
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/5"
                >
                  Log in
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="rounded-xl bg-indigo-500 px-3 py-2 text-xs font-bold text-white shadow-[0_10px_25px_rgba(99,102,241,0.35)] transition hover:bg-indigo-400"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <nav className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
            {links.map((link) => {
              const href = link.key === 'dashboard' ? paths.dashboard : link.href;
              const isActive = !isGuest && link.match(location.pathname, paths);
              return (
                <Link
                  key={link.key || link.href}
                  to={href}
                  className={cn(
                    'shrink-0 rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 transition hover:bg-white/8 hover:text-white',
                    isActive && 'bg-indigo-500 text-white'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* MAIN PAGE WRAPPER */}
          {wide ? (
            <div className="mx-auto w-full max-w-[1440px]">{children}</div>
          ) : (
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          )}
        </main>
      </div>
    </div>
  );
}
