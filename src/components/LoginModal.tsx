import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import {
  ORGANIZATIONS,
  CESSCA_ADMIN_EMAIL,
  type OrganizationConfig,
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
  const [passcode, setPasscode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, passcode);
      onAuthenticated(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleQuickSignIn(targetEmail: string, targetPasscode: string) {
    setEmail(targetEmail);
    setPasscode(targetPasscode);
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(targetEmail, targetPasscode);
      onAuthenticated(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="bg-white border border-stone-200 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div>
            <h2 id="login-modal-title" className="font-display text-xl font-semibold text-stone-900">
              Officer & CESSCA Portal Sign-In
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Students can browse all 12 organizations freely without logging in.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close login modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Manual Credential Login Form */}
          <form onSubmit={handleSubmit} className="md:col-span-5 space-y-4">
            <h3 className="text-sm font-semibold text-stone-900">Account Credentials</h3>

            {error && (
              <div className="flex items-start gap-2 p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-stone-700 mb-1">
                PTC Official Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="president@ptc.edu.ph"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/25 focus:border-[#1E3A8A]"
              />
            </div>

            <div>
              <label htmlFor="login-passcode" className="block text-xs font-medium text-stone-700 mb-1">
                Officer / Admin Passcode
              </label>
              <input
                id="login-passcode"
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/25 focus:border-[#1E3A8A]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172E6E] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              {submitting ? 'Verifying...' : 'Sign In'}
            </button>
          </form>

          {/* Direct Role Directory for CESSCA + 12 Presidents */}
          <div className="md:col-span-7 md:border-l md:border-stone-200 md:pl-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-900">Quick Officer & Admin Access</h3>
              <span className="text-xs text-stone-500">1-click session</span>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleQuickSignIn(CESSCA_ADMIN_EMAIL, 'cessca-ptc-2026')}
              className="w-full flex items-center justify-between p-3 text-left border border-stone-200 hover:border-[#1E3A8A] bg-stone-50 hover:bg-[#1E3A8A]/5 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-md bg-[#1E3A8A] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-stone-900 truncate">
                    CESSCA Super Administrator
                  </div>
                  <div className="text-xs text-stone-500 truncate">
                    Review & approve all 12 organization letters
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-[#1E3A8A] shrink-0 ml-2">Sign in</span>
            </button>

            <div className="text-xs font-medium text-stone-500 pt-1">
              Official Organization Presidents
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {ORGANIZATIONS.map((org: OrganizationConfig) => (
                <button
                  key={org.code}
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleQuickSignIn(org.email, 'ptc-officer-2026')}
                  className="flex items-center gap-2.5 p-2.5 text-left border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                >
                  <div
                    className="w-7 h-7 rounded-md text-white text-[10px] font-mono font-semibold flex items-center justify-center shrink-0"
                    style={{ backgroundColor: org.accentColor }}
                  >
                    {org.shortName.slice(0, 3).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-stone-900 truncate">{org.shortName}</div>
                    <div className="text-[11px] text-stone-500 truncate">{org.president}</div>
                  </div>
                  <UserCheck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
