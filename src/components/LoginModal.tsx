import React, { useState } from 'react';
import { AlertCircle, ShieldCheck, X } from 'lucide-react';
import {
  CESSCA_ADMIN_NAME,
  ORGANIZATIONS,
} from '../config/org-config';
import { OrgEmblem } from './OrgEmblem';
import { useAuth } from '../hooks/useAuth';
import type { AuthUser, OrgStats } from '../types/portal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: AuthUser) => void;
  statsByCode: Record<string, OrgStats>;
}

export function LoginModal({ isOpen, onClose, onAuthenticated, statsByCode }: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      onAuthenticated(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  function chooseAccount(accountId: string) {
    setSelectedAccount(accountId);
    setError(null);
  }

  return (
    <div
      className="portal-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-2 backdrop-blur-xs sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="portal-modal-panel max-h-[calc(100dvh-1rem)] w-full max-w-4xl overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-xl sm:max-h-[90vh] sm:rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h2 id="login-modal-title" className="font-display text-lg font-semibold leading-tight text-stone-900 sm:text-xl">
              Officer & CESSCA Portal Sign-In
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">
              Students can browse all 12 organizations without logging in.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
            aria-label="Close login modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-4 sm:gap-6 sm:p-6 md:grid-cols-12">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:col-span-5">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="mb-1 block text-xs font-medium text-stone-700">
                PTC Official Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="president@ptc.edu.ph"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]/25"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1 block text-xs font-medium text-stone-700">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]/25"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full cursor-pointer rounded-lg bg-[#166534] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#14532d] disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <section className="space-y-2.5 border-t border-stone-200 pt-3 sm:space-y-3 sm:pt-5 md:col-span-7 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-stone-900">Organization Accounts</h3>
              <span className="text-xs text-stone-500">12 organizations + CESSCA</span>
            </div>

            <button
              type="button"
              disabled={submitting}
              aria-pressed={selectedAccount === 'cessca'}
              onClick={() => chooseAccount('cessca')}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                selectedAccount === 'cessca'
                  ? 'border-[#166534] bg-[#166534]/5'
                  : 'border-stone-200 bg-stone-50 hover:border-[#166534] hover:bg-[#14532d]/5'
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#166534] text-white">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-stone-900">
                  {CESSCA_ADMIN_NAME}
                </span>
              </span>
            </button>

            <div className="portal-stagger grid max-h-44 grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:max-h-64 sm:grid-cols-2 sm:gap-2">
              {ORGANIZATIONS.map((org) => (
                <button
                  key={org.code}
                  type="button"
                  disabled={submitting}
                  aria-pressed={selectedAccount === org.code}
                  onClick={() => chooseAccount(org.code)}
                  className={`flex min-w-0 cursor-pointer items-center gap-1.5 rounded-lg border p-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2.5 sm:p-2.5 ${
                    selectedAccount === org.code
                      ? 'border-[#166534] bg-[#166534]/5'
                      : 'border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50'
                  }`}
                >
                  <OrgEmblem org={org} size="sm" imageUrl={statsByCode[org.code]?.avatarUrl} />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-stone-900">
                      {org.shortName}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500">
              Choosing an account won’t fill in your email. Enter it manually.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
