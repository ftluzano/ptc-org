import React, { useState } from 'react';
import { AlertCircle, ShieldCheck, X } from 'lucide-react';
import {
  CESSCA_ADMIN_EMAIL,
  CESSCA_ADMIN_NAME,
  ORGANIZATIONS,
} from '../config/org-config';
import { useAuth } from '../hooks/useAuth';
import type { AuthUser } from '../types/portal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: AuthUser) => void;
}

export function LoginModal({ isOpen, onClose, onAuthenticated }: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const selectedOrg = ORGANIZATIONS.find((org) => org.email.toLowerCase() === normalizedEmail);
  const selectedAdmin = normalizedEmail === CESSCA_ADMIN_EMAIL.toLowerCase();

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

  function chooseAccount(accountEmail: string) {
    setEmail(accountEmail);
    setError(null);
  }

  return (
    <div
      className="portal-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="portal-modal-panel max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <div>
            <h2 id="login-modal-title" className="font-display text-xl font-semibold text-stone-900">
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

        <div className="grid gap-6 p-6 md:grid-cols-12">
          <form onSubmit={handleSubmit} className="space-y-4 md:col-span-5">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Account Credentials</h3>
              <p className="mt-1 text-xs text-stone-500">
                Choose an account, then enter its Firebase password.
              </p>
            </div>

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
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/25"
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
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/25"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full cursor-pointer rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#172E6E] disabled:opacity-50"
            >
              {submitting ? 'Verifying...' : 'Sign In'}
            </button>
          </form>

          <section className="space-y-3 border-t border-stone-200 pt-5 md:col-span-7 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-stone-900">Organization Accounts</h3>
              <span className="text-xs text-stone-500">12 organizations + CESSCA</span>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={() => chooseAccount(CESSCA_ADMIN_EMAIL)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                selectedAdmin
                  ? 'border-[#1E3A8A] bg-[#1E3A8A]/5'
                  : 'border-stone-200 bg-stone-50 hover:border-[#1E3A8A] hover:bg-[#1E3A8A]/5'
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1E3A8A] text-white">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-stone-900">
                  {CESSCA_ADMIN_NAME}
                </span>
                <span className="block truncate text-xs text-stone-500">{CESSCA_ADMIN_EMAIL}</span>
              </span>
            </button>

            <div className="portal-stagger grid max-h-64 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {ORGANIZATIONS.map((org) => {
                const isSelected = selectedOrg?.code === org.code;
                return (
                  <button
                    key={org.code}
                    type="button"
                    disabled={submitting}
                    onClick={() => chooseAccount(org.email)}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected
                        ? 'border-[#1E3A8A] bg-[#1E3A8A]/5'
                        : 'border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[10px] font-mono font-semibold text-white"
                      style={{ backgroundColor: org.accentColor }}
                    >
                      {org.shortName.slice(0, 3).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-stone-900">
                        {org.shortName}
                      </span>
                      <span className="block truncate text-[11px] text-stone-500">{org.email}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
