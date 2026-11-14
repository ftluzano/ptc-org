import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ImagePlus,
  Send,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import {
  ORGANIZATIONS,
  getOrgByCode,
  type OrganizationConfig,
} from '../config/org-config';
import { useAuth } from '../hooks/useAuth';
import { CAMPUS_HERO_IMAGE, resolvePostImageUrl } from '../lib/mediaAssets';
import type { OrgPost } from '../types/portal';
import { FacebookPostCard } from './FacebookPostCard';
import { OrgEmblem } from './OrgEmblem';

interface OrgProfilePageProps {
  org: OrganizationConfig;
  onBackToDirectory: () => void;
  onSelectOrg: (orgCode: string) => void;
  onOpenLogin: () => void;
  onOpenLightbox: (imageUrl: string, caption: string) => void;
  onPostsMutated: () => void;
}

type OrgViewTab = 'feed' | 'compose' | 'submissions';

export function OrgProfilePage({
  org,
  onBackToDirectory,
  onSelectOrg,
  onOpenLogin,
  onOpenLightbox,
  onPostsMutated,
}: OrgProfilePageProps) {
  const { user, getAuthHeaders } = useAuth();
  const isOwningOfficer = user?.role === 'president' && user.orgCode === org.code;
  const userAssignedOrg = user?.orgCode ? getOrgByCode(user.orgCode) : null;

  const [activeTab, setActiveTab] = useState<OrgViewTab>('feed');
  const [posts, setPosts] = useState<OrgPost[]>([]);
  const [submissions, setSubmissions] = useState<OrgPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Composer state
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('2026-12-10');
  const [caption, setCaption] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const loadOrganizationData = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const publicRes = await fetch(`/api/organizations/${org.code}/posts`);
      if (publicRes.ok) {
        const data = await publicRes.json();
        setPosts(data.posts ?? []);
      }

      if (isOwningOfficer || user?.role === 'cessca') {
        const subRes = await fetch(`/api/organizations/${org.code}/submissions`, {
          headers: getAuthHeaders(),
        });
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubmissions(subData.submissions ?? []);
        }
      } else {
        setSubmissions([]);
      }
    } catch {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, [org.code, isOwningOfficer, user?.role, getAuthHeaders]);

  useEffect(() => {
    setActiveTab('feed');
    setFormMessage(null);
    void loadOrganizationData();
  }, [loadOrganizationData]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormMessage({ type: 'error', text: 'Image file must be 5 MB or smaller.' });
      return;
    }

    setFormMessage(null);
    setUploadingImage(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read file.'));
        reader.readAsDataURL(file);
      });

      setImagePreview(dataUrl);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Image upload failed.');
      }
      setUploadedImageUrl(data.url);
    } catch (err) {
      setFormMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to upload image.',
      });
      setImagePreview(null);
      setUploadedImageUrl(null);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmitLetter(e: React.FormEvent) {
    e.preventDefault();
    setFormMessage(null);
    setSubmittingPost(true);
    try {
      const res = await fetch(`/api/organizations/${org.code}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          title,
          eventDate,
          caption,
          imageUrl: uploadedImageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit event letter.');
      }
      setTitle('');
      setCaption('');
      setImagePreview(null);
      setUploadedImageUrl(null);
      setFormMessage({
        type: 'success',
        text: `Submitted letter ${data.post.letterRef} to CESSCA for approval.`,
      });
      await loadOrganizationData();
      onPostsMutated();
      setActiveTab('submissions');
    } catch (err) {
      setFormMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Submission error.',
      });
    } finally {
      setSubmittingPost(false);
    }
  }

  async function handleWithdrawSubmission(postId: string) {
    try {
      const res = await fetch(`/api/organizations/${org.code}/posts/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await loadOrganizationData();
        onPostsMutated();
      }
    } catch {
      // Ignore error
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToDirectory}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 transition-colors hover:text-[#1E3A8A] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All 12 Organizations</span>
        </button>

        <span className="font-mono text-xs text-stone-500">/org/{org.code}</span>
      </div>

      <section className="overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-[0_22px_40px_rgba(15,23,42,0.08)]">
        <div className="relative h-36 overflow-hidden bg-stone-200 sm:h-44">
          <img
            src={CAMPUS_HERO_IMAGE}
            alt={`${org.fullName} cover`}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background: `linear-gradient(120deg, ${org.accentColor} 0%, rgba(17,24,39,0.55) 100%)`,
            }}
          />
        </div>

        <div className="relative px-5 pb-4 pt-0">
          <div className="-mt-10 flex flex-col justify-between gap-4 sm:-mt-8 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <OrgEmblem org={org} size="lg" />
              <div className="pt-1 sm:pb-1">
                <h1 className="font-display text-2xl font-semibold text-stone-900 sm:text-3xl">
                  {org.shortName} — {org.fullName}
                </h1>
              </div>
            </div>

            {isOwningOfficer ? (
              <button
                type="button"
                onClick={() => setActiveTab('compose')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#172554] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_22px_rgba(23,37,84,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#1b2d66] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Event Letter</span>
              </button>
            ) : !user ? (
              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-100 px-4 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Officer Sign-In</span>
              </button>
            ) : null}
          </div>

          {isOwningOfficer && (
            <div className="mt-4 flex items-center gap-2 overflow-x-auto border-t border-stone-200 pt-3">
              <button
                type="button"
                onClick={() => setActiveTab('feed')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'feed'
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Public Feed ({posts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('compose')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'compose'
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Draft Event Letter
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('submissions')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'submissions'
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                My Submissions ({submissions.length})
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Cross-org restriction notice when another org's officer is viewing */}
      {user?.role === 'president' && !isOwningOfficer && userAssignedOrg && (
        <div className="bg-white border border-stone-200 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-stone-700">
            Read-only view. Your officer session is restricted to{' '}
            <span className="font-semibold text-stone-900">
              {userAssignedOrg.shortName} ({userAssignedOrg.president})
            </span>
            .
          </p>
          <button
            type="button"
            onClick={() => onSelectOrg(userAssignedOrg.code)}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Go to {userAssignedOrg.shortName} Studio
          </button>
        </div>
      )}

      {/* Two-Column Organization Workspace */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
        {/* Left Sidebar: Organization Charter & Quick Switcher */}
        <aside className="space-y-4 lg:col-span-4">
          <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
            <h2 className="font-display text-lg font-semibold text-stone-900">
              About {org.shortName}
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">{org.mission}</p>

            <dl className="pt-3 border-t border-stone-100 space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-stone-400">Official President</dt>
                  <dd className="font-medium text-stone-900">{org.president}</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              All 12 PTC Organizations
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {ORGANIZATIONS.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => onSelectOrg(item.code)}
                  className={`px-2.5 py-2 text-left text-xs rounded-lg transition-colors truncate cursor-pointer ${
                    item.code === org.code
                      ? 'bg-[#1E3A8A] text-white font-semibold'
                      : 'text-stone-700 hover:bg-stone-100 font-medium'
                  }`}
                >
                  {item.shortName}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Main Feed / Officer Composer / Submissions */}
        <section className="space-y-4 lg:col-span-8">
          {formMessage && (
            <div
              className={`p-4 rounded-xl border text-sm ${
                formMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {formMessage.text}
            </div>
          )}

          {activeTab === 'compose' && isOwningOfficer && (
            <form
              onSubmit={handleSubmitLetter}
              className="space-y-4 rounded-xl border border-stone-200 bg-white p-5"
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-stone-900">
                  Submit Event Announcement Letter
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Your submission is stored in {org.shortName}&apos;s isolated database as pending and
                  routed to CESSCA for official clearance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="post-title" className="block text-xs font-medium text-stone-700 mb-1">
                    Event Title
                  </label>
                  <input
                    id="post-title"
                    type="text"
                    required
                    minLength={3}
                    maxLength={160}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Annual General Assembly & Tech Talk"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label htmlFor="post-date" className="block text-xs font-medium text-stone-700 mb-1">
                    Event Date
                  </label>
                  <input
                    id="post-date"
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="post-caption" className="block text-xs font-medium text-stone-700 mb-1">
                  Announcement Caption & Details
                </label>
                <textarea
                  id="post-caption"
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={5}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write the full announcement caption, venue, time, and registration notes for PTC students..."
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Event Poster / Photo Attachment (Optional, max 5 MB)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg cursor-pointer transition-colors">
                    <ImagePlus className="w-4 h-4" />
                    <span>{uploadingImage ? 'Uploading...' : 'Choose Image File'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(e) => void handleFileSelect(e)}
                      className="sr-only"
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setUploadedImageUrl(null);
                      }}
                      className="text-xs text-red-700 hover:underline cursor-pointer"
                    >
                      Remove image
                    </button>
                  )}
                </div>

                {imagePreview && (
                  <div className="mt-3 border border-stone-200 rounded-lg overflow-hidden max-w-md">
                    <img
                      src={imagePreview}
                      alt="Event attachment preview"
                      className="w-full max-h-56 object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('feed')}
                  className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPost || uploadingImage}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-[#172E6E] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingPost ? 'Sending to CESSCA...' : 'Submit Pending Letter'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'submissions' && isOwningOfficer && (
            <div className="space-y-3">
              {submissions.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-3">
                  <p className="text-sm font-medium text-stone-900">No event letters submitted yet.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('compose')}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172E6E] transition-colors cursor-pointer"
                  >
                    Draft First Event Letter
                  </button>
                </div>
              ) : (
                submissions.map((item) => {
                  const thumbUrl = resolvePostImageUrl(item.imageUrl);
                  return (
                    <div
                      key={item.id}
                      className="space-y-3 rounded-xl border border-stone-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-stone-500">
                            <span className="font-mono tabular-nums">{item.letterRef}</span>
                            <span aria-hidden="true">·</span>
                            <span>Event: {item.eventDate}</span>
                          </div>
                          <h3 className="text-base font-semibold text-stone-900">{item.title}</h3>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                              <CheckCircle2 className="w-4 h-4" />
                              Approved
                            </span>
                          )}
                          {item.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                              <Clock className="w-4 h-4" />
                              Pending CESSCA
                            </span>
                          )}
                          {item.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                              <XCircle className="w-4 h-4" />
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-stone-600 leading-relaxed">{item.caption}</p>

                      {thumbUrl && (
                        <img
                          src={thumbUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-48 h-28 object-cover rounded-lg border border-stone-200"
                        />
                      )}

                      {item.feedback && (
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700">
                          <span className="font-semibold text-stone-900">CESSCA Remarks: </span>
                          {item.feedback}
                        </div>
                      )}

                      {item.status !== 'approved' && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => void handleWithdrawSubmission(item.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 hover:underline cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Withdraw Submission</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'feed' && (
            <div className="space-y-4">
              {loadingPosts ? (
                <div className="bg-white border border-stone-200 rounded-xl p-8 animate-pulse h-64" />
              ) : posts.length === 0 ? (
                <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-7 text-center">
                  <h3 className="font-display text-xl font-semibold text-stone-900">
                    No approved announcements yet
                  </h3>
                  <p className="text-sm text-stone-600 max-w-md mx-auto">
                    {org.shortName} has not published any CESSCA-cleared bulletins yet. Check back
                    soon or browse other student organizations.
                  </p>
                  {isOwningOfficer && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('compose')}
                      className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172E6E] transition-colors cursor-pointer"
                    >
                      Draft First Event Announcement
                    </button>
                  )}
                </div>
              ) : (
                posts.map((post) => (
                  <FacebookPostCard
                    key={post.id}
                    post={post}
                    onOpenLightbox={onOpenLightbox}
                  />
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
