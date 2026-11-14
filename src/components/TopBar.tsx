import React from 'react';
import { LogIn, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import ptcLogo from '../assets/images/ptc logo.png';
import { useAuth } from '../hooks/useAuth';
import { getOrgByCode } from '../config/org-config';

export type ActiveRoute =
  | { page: 'directory' }
  | { page: 'org'; orgCode: string }
  | { page: 'feed' }
  | { page: 'cessca' };

interface TopBarProps {
  route: ActiveRoute;
  onNavigate: (route: ActiveRoute) => void;
  onOpenLogin: () => void;
}

export function TopBar({ route, onNavigate, onOpenLogin }: TopBarProps) {
  const { user, logout } = useAuth();
  const userOrg = user?.orgCode ? getOrgByCode(user.orgCode) : null;

  return (
    <header className="portal-header-enter sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-8 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate({ page: 'directory' })}
          className="group inline-flex min-w-0 items-center gap-2 shrink cursor-pointer sm:shrink-0 sm:gap-2.5"
        >
          <img src={ptcLogo} alt="Pateros Technological College seal" className="h-8 w-8 shrink-0 object-contain sm:h-10 sm:w-10" />
          <span className="hidden whitespace-nowrap font-display text-sm font-semibold tracking-tight text-stone-900 transition-colors group-hover:text-[#1E3A8A] sm:inline sm:text-xl">
            Student Organization Platform
          </span>
          <span className="truncate font-display text-xs font-semibold tracking-tight text-stone-900 transition-colors group-hover:text-[#1E3A8A] sm:hidden">
            PTC Student Orgs
          </span>
        </button>

        {(user?.role === 'president' || user?.role === 'cessca') && (
          <nav className="hidden md:flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50/80 p-1 text-sm font-medium text-stone-600 shadow-inner shadow-stone-100">
            {user?.role === 'president' && userOrg && (
              <button
                type="button"
                onClick={() => onNavigate({ page: 'org', orgCode: userOrg.code })}
                className={`whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 transition-colors cursor-pointer ${
                  route.page === 'org' && route.orgCode === userOrg.code
                    ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200'
                    : 'hover:text-stone-900'
                }`}
              >
                {userOrg.shortName} Studio
              </button>
            )}

            {user?.role === 'cessca' && (
              <button
                type="button"
                onClick={() => onNavigate({ page: 'cessca' })}
                className={`whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 transition-colors cursor-pointer ${
                  route.page === 'cessca'
                    ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200'
                    : 'hover:text-stone-900'
                }`}
              >
                CESSCA Review
              </button>
            )}
          </nav>
        )}

        <div className="flex items-center shrink-0">
          {user ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-[10px] font-medium text-stone-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md sm:gap-2 sm:rounded-xl sm:px-4 sm:text-xs"
              title={`Signed in as ${user.displayName} (${user.email}). Click to sign out.`}
            >
              {user.role === 'cessca' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E3A8A]" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-[#1E3A8A]" />
              )}
              <span className="max-w-[112px] truncate sm:max-w-[160px]">
                {user.role === 'cessca' ? 'CESSCA Admin' : `${userOrg?.shortName ?? 'Officer'}`} · Sign Out
              </span>
              <LogOut className="w-3.5 h-3.5 text-stone-500" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#172554] px-3 py-2 text-[11px] font-semibold text-white shadow-[0_8px_18px_rgba(23,37,84,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#1b2d66] sm:gap-2 sm:rounded-xl sm:px-4 sm:text-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {(user?.role === 'president' || user?.role === 'cessca') && (
        <div className="flex items-center gap-2 overflow-x-auto border-t border-stone-200/80 bg-stone-50/70 px-3 py-1.5 text-[11px] font-medium text-stone-600 md:hidden">
          {user?.role === 'president' && userOrg && (
            <button
              type="button"
              onClick={() => onNavigate({ page: 'org', orgCode: userOrg.code })}
              className="whitespace-nowrap shrink-0 rounded-full bg-white px-2 py-1 text-[#1E3A8A] font-semibold shadow-sm ring-1 ring-stone-200"
            >
              {userOrg.shortName} Studio
            </button>
          )}
          {user?.role === 'cessca' && (
            <button
              type="button"
              onClick={() => onNavigate({ page: 'cessca' })}
              className="whitespace-nowrap shrink-0 rounded-full bg-white px-2 py-1 text-[#1E3A8A] font-semibold shadow-sm ring-1 ring-stone-200"
            >
              CESSCA Review
            </button>
          )}
        </div>
      )}
    </header>
  );
}
