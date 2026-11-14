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
  onOpenWorkflowInfo: () => void;
}

export function TopBar({ route, onNavigate, onOpenLogin, onOpenWorkflowInfo }: TopBarProps) {
  const { user, logout } = useAuth();
  const userOrg = user?.orgCode ? getOrgByCode(user.orgCode) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onNavigate({ page: 'directory' })}
          className="group inline-flex items-center gap-2.5 shrink-0 cursor-pointer"
        >
          <img src={ptcLogo} alt="Pateros Technological College seal" className="h-10 w-10 object-contain" />
          <span className="font-display text-lg sm:text-xl font-semibold tracking-tight text-stone-900 transition-colors group-hover:text-[#1E3A8A]">
            Student Orgs
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50/80 p-1 text-sm font-medium text-stone-600 shadow-inner shadow-stone-100">
          <button
            type="button"
            onClick={() => onNavigate({ page: 'directory' })}
            className={`whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 transition-colors cursor-pointer ${
              route.page === 'directory' || route.page === 'org'
                ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200'
                : 'hover:text-stone-900'
            }`}
          >
            Organizations
          </button>

          <button
            type="button"
            onClick={() => onNavigate({ page: 'feed' })}
            className={`whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 transition-colors cursor-pointer ${
              route.page === 'feed'
                ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200'
                : 'hover:text-stone-900'
            }`}
          >
            Global Feed
          </button>

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

          <button
            type="button"
            onClick={onOpenWorkflowInfo}
            className="whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 transition-colors hover:text-stone-900 cursor-pointer"
          >
            Approval Guide
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          {user ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md whitespace-nowrap shrink-0 cursor-pointer"
              title={`Signed in as ${user.displayName} (${user.email}). Click to sign out.`}
            >
              {user.role === 'cessca' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E3A8A]" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-[#1E3A8A]" />
              )}
              <span className="max-w-[160px] truncate">
                {user.role === 'cessca' ? 'CESSCA Admin' : `${userOrg?.shortName ?? 'Officer'}`} · Sign Out
              </span>
              <LogOut className="w-3.5 h-3.5 text-stone-500" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 rounded-xl bg-[#172554] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(23,37,84,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#1b2d66] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      <div className="md:hidden border-t border-stone-200/80 bg-stone-50/70 px-4 py-2 flex items-center gap-4 overflow-x-auto text-xs font-medium text-stone-600">
        <button
          type="button"
          onClick={() => onNavigate({ page: 'directory' })}
          className={`whitespace-nowrap shrink-0 rounded-full px-2 py-1 ${
            route.page === 'directory' || route.page === 'org' ? 'bg-white text-[#1E3A8A] font-semibold shadow-sm ring-1 ring-stone-200' : ''
          }`}
        >
          Organizations
        </button>
        <button
          type="button"
          onClick={() => onNavigate({ page: 'feed' })}
          className={`whitespace-nowrap shrink-0 rounded-full px-2 py-1 ${
            route.page === 'feed' ? 'bg-white text-[#1E3A8A] font-semibold shadow-sm ring-1 ring-stone-200' : ''
          }`}
        >
          Global Feed
        </button>
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
        <button
          type="button"
          onClick={onOpenWorkflowInfo}
          className="whitespace-nowrap shrink-0 rounded-full px-2 py-1"
        >
          Approval Guide
        </button>
      </div>
    </header>
  );
}
