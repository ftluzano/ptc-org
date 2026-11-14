import React from 'react';
import { LogIn, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand wordmark */}
        <button
          type="button"
          onClick={() => onNavigate({ page: 'directory' })}
          className="font-display text-lg sm:text-xl font-semibold tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:text-[#1E3A8A] transition-colors cursor-pointer"
        >
          PTC Student Orgs
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            type="button"
            onClick={() => onNavigate({ page: 'directory' })}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              route.page === 'directory' || route.page === 'org'
                ? 'border-[#1E3A8A] text-stone-900'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            Organizations
          </button>

          <button
            type="button"
            onClick={() => onNavigate({ page: 'feed' })}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              route.page === 'feed'
                ? 'border-[#1E3A8A] text-stone-900'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            Global Feed
          </button>

          {user?.role === 'president' && userOrg && (
            <button
              type="button"
              onClick={() => onNavigate({ page: 'org', orgCode: userOrg.code })}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                route.page === 'org' && route.orgCode === userOrg.code
                  ? 'border-[#1E3A8A] text-stone-900'
                  : 'border-transparent hover:text-stone-900'
              }`}
            >
              {userOrg.shortName} Studio
            </button>
          )}

          {user?.role === 'cessca' && (
            <button
              type="button"
              onClick={() => onNavigate({ page: 'cessca' })}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                route.page === 'cessca'
                  ? 'border-[#1E3A8A] text-stone-900'
                  : 'border-transparent hover:text-stone-900'
              }`}
            >
              CESSCA Review
            </button>
          )}

          <button
            type="button"
            onClick={onOpenWorkflowInfo}
            className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:text-stone-900 transition-colors cursor-pointer"
          >
            Approval Guide
          </button>
        </nav>

        {/* Zone 3: Single primary action button */}
        <div className="flex items-center shrink-0">
          {user ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile secondary bar (compact, single-line controls) */}
      <div className="md:hidden border-t border-stone-200 px-4 py-2 flex items-center gap-4 overflow-x-auto text-xs font-medium text-stone-600">
        <button
          type="button"
          onClick={() => onNavigate({ page: 'directory' })}
          className={`whitespace-nowrap shrink-0 py-1 ${
            route.page === 'directory' || route.page === 'org' ? 'text-[#1E3A8A] font-semibold' : ''
          }`}
        >
          Organizations
        </button>
        <button
          type="button"
          onClick={() => onNavigate({ page: 'feed' })}
          className={`whitespace-nowrap shrink-0 py-1 ${
            route.page === 'feed' ? 'text-[#1E3A8A] font-semibold' : ''
          }`}
        >
          Global Feed
        </button>
        {user?.role === 'president' && userOrg && (
          <button
            type="button"
            onClick={() => onNavigate({ page: 'org', orgCode: userOrg.code })}
            className="whitespace-nowrap shrink-0 py-1 text-[#1E3A8A] font-semibold"
          >
            {userOrg.shortName} Studio
          </button>
        )}
        {user?.role === 'cessca' && (
          <button
            type="button"
            onClick={() => onNavigate({ page: 'cessca' })}
            className="whitespace-nowrap shrink-0 py-1 text-[#1E3A8A] font-semibold"
          >
            CESSCA Review
          </button>
        )}
        <button
          type="button"
          onClick={onOpenWorkflowInfo}
          className="whitespace-nowrap shrink-0 py-1"
        >
          Approval Guide
        </button>
      </div>
    </header>
  );
}
