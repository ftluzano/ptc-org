import React from 'react';
import { LogIn, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import ptcLogo from '../assets/images/ptc logo.png';
import { useAuth } from '../hooks/useAuth';
import { getOrgByCode } from '../config/org-config';

export type ActiveRoute =
  | { page: 'home' }
  | { page: 'about' }
  | { page: 'organizations' }
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
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-5 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate({ page: 'about' })}
          className="group inline-flex shrink-0 items-center gap-2 cursor-pointer sm:gap-2.5"
        >
          <img src={ptcLogo} alt="Pateros Technological College seal" className="h-8 w-8 shrink-0 object-contain sm:h-10 sm:w-10" />
          <span className="hidden whitespace-nowrap font-display text-sm font-semibold tracking-tight text-stone-900 transition-colors group-hover:text-[#166534] lg:inline lg:text-xl">
            Student Organization Platform
          </span>
        </button>

        <nav
          aria-label="Main navigation"
          className="flex min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto text-xs font-semibold text-stone-600 sm:gap-1.5 sm:text-sm"
        >
          <button
            type="button"
            onClick={() => onNavigate({ page: 'about' })}
            aria-current={route.page === 'about' ? 'page' : undefined}
            className={`inline-flex shrink-0 items-center rounded-lg px-2 py-2 transition-colors sm:px-3 ${
              route.page === 'about'
                ? 'bg-emerald-800 text-white'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            About PTC
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'organizations' })}
            aria-current={route.page === 'organizations' ? 'page' : undefined}
            className={`inline-flex shrink-0 items-center rounded-lg px-2 py-2 transition-colors sm:px-3 ${
              route.page === 'organizations'
                ? 'bg-emerald-800 text-white'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            Organizations
          </button>
          {user?.role === 'president' && userOrg && (
            <button
              type="button"
              onClick={() => onNavigate({ page: 'org', orgCode: userOrg.code })}
              className={`hidden shrink-0 rounded-lg px-3 py-2 transition-colors md:inline-flex ${
                route.page === 'org' && route.orgCode === userOrg.code
                  ? 'bg-emerald-800 text-white'
                  : 'text-stone-700 hover:bg-stone-200'
              }`}
            >
              {userOrg.shortName} Studio
            </button>
          )}
          {user?.role === 'cessca' && (
            <button
              type="button"
              onClick={() => onNavigate({ page: 'cessca' })}
              className={`hidden shrink-0 rounded-lg px-3 py-2 transition-colors md:inline-flex ${
                route.page === 'cessca'
                  ? 'bg-emerald-800 text-white'
                  : 'text-stone-700 hover:bg-stone-200'
              }`}
            >
              CESSCA Review
            </button>
          )}
        </nav>

        <div className="flex shrink-0 items-center">
          {user ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-[10px] font-medium text-stone-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md sm:gap-2 sm:rounded-xl sm:px-4 sm:text-xs"
              title={`Signed in as ${user.displayName} (${user.email}). Click to sign out.`}
            >
              {user.role === 'cessca' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-[#166534]" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-[#166534]" />
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
              className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-[#14532d] px-2.5 py-2 text-[10px] font-semibold text-white shadow-[0_8px_18px_rgba(20,83,45,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#14532d] sm:gap-2 sm:rounded-xl sm:px-4 sm:text-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

    </header>
  );
}
