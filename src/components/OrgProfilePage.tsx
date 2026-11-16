import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ImagePlus,
  Save,
  Send,
  Trash2,
  User,
  XCircle,
  FileUp,
} from 'lucide-react';
import { upload } from '@vercel/blob/client';
import {
  getOrgByCode,
  type OrganizationConfig,
} from '../config/org-config';
import { useAuth } from '../hooks/useAuth';
import { useLiveUpdates } from '../hooks/useLiveUpdates';
import { CAMPUS_HERO_IMAGE, resolvePostImageUrl } from '../lib/mediaAssets';
import { notifyPortalDataChanged } from '../lib/portalUpdates';
import type { OrganizationProfile, OrgPost } from '../types/portal';
import { FacebookPostCard } from './FacebookPostCard';
import { OrgEmblem } from './OrgEmblem';

interface OrgProfilePageProps {
  org: OrganizationConfig;
  organizations: OrganizationConfig[];
  onBackToDirectory: () => void;
  onSelectOrg: (orgCode: string) => void;
  onOpenLogin: () => void;
  onOpenLightbox: (imageUrl: string, caption: string) => void;
  onOrganizationProfileUpdated: (orgCode: string, profile: OrganizationProfile) => void;
}

type OrgViewTab = 'feed' | 'profile' | 'compose' | 'proposal' | 'submissions';

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

export function OrgProfilePage({
  org,
  organizations,
  onBackToDirectory,
  onSelectOrg,
  onOpenLogin,
  onOpenLightbox,
  onOrganizationProfileUpdated,
}: OrgProfilePageProps) {
  const { user, getAuthHeaders } = useAuth();
  const isOwningOfficer = user?.role === 'president' && user.orgCode === org.code;
  const userAssignedOrg = user?.orgCode ? getOrgByCode(user.orgCode) : null;

  const [activeTab, setActiveTab] = useState<OrgViewTab>('feed');
  const [posts, setPosts] = useState<OrgPost[]>([]);
  const [submissions, setSubmissions] = useState<OrgPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile>({
    bannerDataUrl: null,
    avatarDataUrl: null,
    aboutText: '',
    organizationName: '',
    organizationShortName: '',
    presidentName: '',
  });
  const [bannerDraft, setBannerDraft] = useState<string | null>(null);
  const [avatarDraft, setAvatarDraft] = useState<string | null>(null);
  const [aboutDraft, setAboutDraft] = useState('');
  const [organizationNameDraft, setOrganizationNameDraft] = useState('');
  const [organizationShortNameDraft, setOrganizationShortNameDraft] = useState('');
  const [presidentNameDraft, setPresidentNameDraft] = useState('');
  const [bannerChanged, setBannerChanged] = useState(false);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [aboutChanged, setAboutChanged] = useState(false);
  const [organizationNameChanged, setOrganizationNameChanged] = useState(false);
  const [presidentNameChanged, setPresidentNameChanged] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Composer state
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('2026-12-10');
  const [caption, setCaption] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [proposalFileInputKey, setProposalFileInputKey] = useState(0);
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const displayOrg = {
    ...org,
    fullName: organizationProfile.organizationName || org.fullName,
    shortName: organizationProfile.organizationShortName || org.shortName,
    president: organizationProfile.presidentName || org.president,
  };

  const loadOrganizationData = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const [publicRes, profileRes] = await Promise.all([
        fetch(`/api/organizations/${org.code}/posts`),
        fetch(`/api/organizations/${org.code}/profile`),
      ]);
      if (publicRes.ok) {
        const data = await publicRes.json();
        setPosts(data.posts ?? []);
      }
      if (!profileRes.ok) {
        throw new Error('Unable to load this organization’s profile images.');
      }
      const profileData = await profileRes.json();
      setOrganizationProfile(profileData.profile);

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
    } catch (error) {
      setPosts([]);
      setFormMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to load organization data.',
      });
    } finally {
      setLoadingPosts(false);
    }
  }, [org.code, isOwningOfficer, user?.role, getAuthHeaders]);

  useLiveUpdates(loadOrganizationData);

  useEffect(() => {
    if (formMessage?.type !== 'success') return;

    const timeoutId = window.setTimeout(() => setFormMessage(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [formMessage]);

  useEffect(() => {
    setActiveTab('feed');
    setFormMessage(null);
    setBannerDraft(null);
    setAvatarDraft(null);
    setAboutDraft('');
    setOrganizationNameDraft('');
    setOrganizationShortNameDraft('');
    setPresidentNameDraft('');
    setBannerChanged(false);
    setAvatarChanged(false);
    setAboutChanged(false);
    setOrganizationNameChanged(false);
    setPresidentNameChanged(false);
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
      const dataUrl = await readImageAsDataUrl(file);
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

  async function handleProfileImageSelect(
    asset: 'banner' | 'avatar',
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setFormMessage({ type: 'error', text: 'Choose a PNG, JPEG, or WebP image.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormMessage({ type: 'error', text: 'Profile images must be 5 MB or smaller.' });
      return;
    }

    try {
      const dataUrl = await readImageAsDataUrl(file);
      if (asset === 'banner') {
        setBannerDraft(dataUrl);
        setBannerChanged(true);
      } else {
        setAvatarDraft(dataUrl);
        setAvatarChanged(true);
      }
      setFormMessage(null);
    } catch (error) {
      setFormMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to read the selected image.',
      });
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setFormMessage(null);
    setSavingProfile(true);
    const updates: Array<{
      asset: 'banner' | 'avatar';
      changed: boolean;
      dataUrl: string | null;
    }> = [
      { asset: 'banner', changed: bannerChanged, dataUrl: bannerDraft },
      { asset: 'avatar', changed: avatarChanged, dataUrl: avatarDraft },
    ];
    let savedProfile: OrganizationProfile | null = null;

    try {
      for (const update of updates) {
        if (!update.changed) continue;
        const response = await fetch(`/api/organizations/${org.code}/profile/${update.asset}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ dataUrl: update.dataUrl }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to save organization profile image.');
        }

        savedProfile = data.profile as OrganizationProfile;
        setOrganizationProfile(savedProfile);
        if (update.asset === 'banner') setBannerChanged(false);
        else setAvatarChanged(false);
      }

      if (aboutChanged) {
        const response = await fetch(`/api/organizations/${org.code}/profile/about`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ aboutText: aboutDraft }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to save organization About.');
        }
        savedProfile = data.profile as OrganizationProfile;
        setOrganizationProfile(savedProfile);
        setAboutChanged(false);
        setAboutDraft('');
      }

      if (organizationNameChanged || presidentNameChanged) {
        const response = await fetch(`/api/organizations/${org.code}/profile/name`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            organizationName: organizationNameDraft,
            organizationShortName: organizationShortNameDraft,
            presidentName: presidentNameDraft,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to save organization name.');
        }
        savedProfile = data.profile as OrganizationProfile;
        setOrganizationProfile(savedProfile);
        setOrganizationNameChanged(false);
        setOrganizationNameDraft('');
        setOrganizationShortNameDraft('');
        setPresidentNameChanged(false);
        setPresidentNameDraft('');
      }

      setBannerDraft(null);
      setAvatarDraft(null);
      if (savedProfile) {
        onOrganizationProfileUpdated(org.code, savedProfile);
        notifyPortalDataChanged();
      }
      setFormMessage({ type: 'success', text: 'Organization profile updated.' });
    } catch (error) {
      setFormMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to save profile images.',
      });
    } finally {
      setSavingProfile(false);
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
        throw new Error(data.error || 'Failed to publish announcement.');
      }
      setTitle('');
      setCaption('');
      setImagePreview(null);
      setUploadedImageUrl(null);
      setFormMessage({
        type: 'success',
        text: `Announcement published to the ${displayOrg.shortName} page and campus feed.`,
      });
      notifyPortalDataChanged();
      await loadOrganizationData();
      setActiveTab('feed');
    } catch (err) {
      setFormMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Submission error.',
      });
    } finally {
      setSubmittingPost(false);
    }
  }

  async function handleSubmitProposal(e: React.FormEvent) {
    e.preventDefault();
    if (!proposalFile) {
      setFormMessage({ type: 'error', text: 'Choose a proposal file to send to CESSCA.' });
      return;
    }
    if (proposalFile.size === 0 || proposalFile.size > 25 * 1024 * 1024) {
      setFormMessage({ type: 'error', text: 'Proposal files must be larger than 0 bytes and no larger than 25 MB.' });
      return;
    }

    setFormMessage(null);
    setSubmittingProposal(true);
    try {
      const safeName = proposalFile.name.replace(/[\\/?#%]/g, '_').slice(0, 180) || 'proposal-file';
      const pathname = `proposals/${org.code}/${user?.uid}/${crypto.randomUUID()}-${safeName}`;
      const blob = await upload(pathname, proposalFile, {
        access: 'private',
        handleUploadUrl: '/api/proposals/upload',
        headers: getAuthHeaders(),
        contentType: proposalFile.type || 'application/octet-stream',
        multipart: true,
      });
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          title: proposalTitle,
          message: proposalMessage,
          fileName: proposalFile.name,
          pathname: blob.pathname,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send proposal to CESSCA.');
      }

      setProposalTitle('');
      setProposalMessage('');
      setProposalFile(null);
      setProposalFileInputKey((key) => key + 1);
      setFormMessage({ type: 'success', text: 'Proposal file sent securely to CESSCA.' });
      notifyPortalDataChanged();
      setActiveTab('feed');
    } catch (error) {
      setFormMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to send proposal to CESSCA.',
      });
    } finally {
      setSubmittingProposal(false);
    }
  }

  async function handleDeleteSubmission(item: OrgPost) {
    const isApproved = item.status === 'approved';
    const action = isApproved ? 'delete this approved announcement' : 'withdraw this submission';
    if (!window.confirm(`Are you sure you want to ${action}? This cannot be undone.`)) return;

    setFormMessage(null);
    setDeletingPostId(item.id);
    try {
      const res = await fetch(`/api/organizations/${org.code}/posts/${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to remove this announcement.');
      }
      setFormMessage({
        type: 'success',
        text: isApproved ? 'Approved announcement deleted.' : 'Submission withdrawn.',
      });
      notifyPortalDataChanged();
      await loadOrganizationData();
    } catch (error) {
      setFormMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to remove this announcement.',
      });
    } finally {
      setDeletingPostId(null);
    }
  }

  return (
    <main className="portal-page-enter mx-auto max-w-7xl space-y-3 px-3 py-3 sm:space-y-4 sm:px-6 sm:py-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToDirectory}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 transition-colors hover:text-[#166534] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="hidden font-mono text-xs text-stone-500 sm:block">/org/{org.code}</span>
      </div>

      <section className="overflow-hidden rounded-[20px] border border-stone-200 bg-white shadow-[0_22px_40px_rgba(15,23,42,0.08)] sm:rounded-[26px]">
        <div className="relative h-28 overflow-hidden bg-stone-200 sm:h-44">
          <img
            src={organizationProfile.bannerDataUrl || CAMPUS_HERO_IMAGE}
            alt={`${displayOrg.fullName} cover`}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative px-3 pb-3 pt-0 sm:px-5 sm:pb-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start">
              <div className="-mt-8 shrink-0 sm:-mt-8">
                <OrgEmblem org={displayOrg} size="lg" imageUrl={organizationProfile.avatarDataUrl} />
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <h1 className="break-words font-display text-lg font-semibold leading-tight text-stone-900 sm:text-2xl lg:text-3xl">
                  {displayOrg.shortName} — {displayOrg.fullName}
                </h1>
              </div>
            </div>

            {!user ? (
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
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto border-t border-stone-200 pt-2.5 sm:mt-4 sm:gap-2 sm:pt-3">
              <button
                type="button"
                onClick={() => setActiveTab('feed')}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer sm:px-3.5 sm:text-xs ${
                  activeTab === 'feed'
                    ? 'bg-[#166534] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Public Feed ({posts.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrganizationNameDraft(displayOrg.fullName);
                  setOrganizationShortNameDraft(displayOrg.shortName);
                  setPresidentNameDraft(displayOrg.president);
                  setOrganizationNameChanged(false);
                  setPresidentNameChanged(false);
                  setActiveTab('profile');
                }}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer sm:px-3.5 sm:text-xs ${
                  activeTab === 'profile'
                    ? 'bg-[#166534] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Edit Organization Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('compose')}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer sm:px-3.5 sm:text-xs ${
                  activeTab === 'compose'
                    ? 'bg-[#166534] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Publish Announcement
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('proposal')}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer sm:px-3.5 sm:text-xs ${
                  activeTab === 'proposal'
                    ? 'bg-[#166534] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Send Proposal to CESSCA
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('submissions')}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer sm:px-3.5 sm:text-xs ${
                  activeTab === 'submissions'
                    ? 'bg-[#166534] text-white'
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
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#166534] hover:bg-[#14532d] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Go to {userAssignedOrg.shortName} Studio
          </button>
        </div>
      )}

      {/* Two-Column Organization Workspace */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
        {/* Left Sidebar: Organization Charter & Quick Switcher */}
        <aside className="space-y-3 sm:space-y-4 lg:col-span-4">
          <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-3.5 sm:p-4">
            <h2 className="font-display text-lg font-semibold text-stone-900">
              About {displayOrg.shortName}
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              {organizationProfile.aboutText || org.mission}
            </p>

            <dl className="pt-3 border-t border-stone-100 space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-stone-400">Official President</dt>
                  <dd className="font-medium text-stone-900">                  {displayOrg.president}</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-3.5 sm:p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              All 12 PTC Organizations
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {organizations.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => onSelectOrg(item.code)}
                  className={`px-2.5 py-2 text-left text-xs rounded-lg transition-colors truncate cursor-pointer ${
                    item.code === org.code
                      ? 'bg-[#166534] text-white font-semibold'
                      : 'text-stone-700 hover:bg-stone-100 font-medium'
                  }`}
                >
                  {item.shortName}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Main Feed / Officer Publishing / Proposal Submission */}
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

          {activeTab === 'profile' && isOwningOfficer && (
            <form
              onSubmit={handleSaveProfile}
              className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 sm:space-y-5 sm:p-5"
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-stone-900">
                  Edit Organization Profile
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  Update your organization’s name, president, About text, and page images.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="organization-name" className="block text-xs font-medium text-stone-700">
                    Organization name
                  </label>
                  <input
                    id="organization-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    value={organizationNameDraft}
                    onChange={(event) => {
                      setOrganizationNameDraft(event.target.value);
                      setOrganizationNameChanged(
                        event.target.value !== displayOrg.fullName ||
                          organizationShortNameDraft !== displayOrg.shortName
                      );
                    }}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="organization-short-name" className="block text-xs font-medium text-stone-700">
                    Short name
                  </label>
                  <input
                    id="organization-short-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={40}
                    value={organizationShortNameDraft}
                    onChange={(event) => {
                      setOrganizationShortNameDraft(event.target.value);
                      setOrganizationNameChanged(
                        event.target.value !== displayOrg.shortName ||
                          organizationNameDraft !== displayOrg.fullName
                      );
                    }}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="organization-president-name" className="block text-xs font-medium text-stone-700">
                    President name
                  </label>
                  <input
                    id="organization-president-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={presidentNameDraft}
                    onChange={(event) => {
                      setPresidentNameDraft(event.target.value);
                      setPresidentNameChanged(event.target.value !== displayOrg.president);
                    }}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="organization-about" className="block text-xs font-medium text-stone-700">
                  About
                </label>
                <textarea
                  id="organization-about"
                  rows={4}
                  maxLength={2000}
                  value={
                    aboutChanged
                      ? aboutDraft
                      : organizationProfile.aboutText || org.mission
                  }
                  onChange={(event) => {
                    setAboutDraft(event.target.value);
                    setAboutChanged(
                      event.target.value !== (organizationProfile.aboutText || org.mission)
                    );
                  }}
                  placeholder="Describe your organization and its mission..."
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm leading-relaxed text-stone-800 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]/20"
                />
                <div className="text-right text-[11px] text-stone-400">
                  {aboutChanged ? aboutDraft.length : (organizationProfile.aboutText || org.mission).length}
                  /2000
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-stone-700">Banner image</label>
                  <div className="overflow-hidden rounded-lg border border-stone-200">
                    <img
                      src={
                        bannerChanged
                          ? bannerDraft || CAMPUS_HERO_IMAGE
                          : organizationProfile.bannerDataUrl || CAMPUS_HERO_IMAGE
                      }
                      alt={`${displayOrg.fullName} banner preview`}
                      className="h-36 w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-stone-100 px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200">
                      <ImagePlus className="h-4 w-4" />
                      Choose banner
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => void handleProfileImageSelect('banner', e)}
                        className="sr-only"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setBannerDraft(null);
                        setBannerChanged(true);
                      }}
                      className="cursor-pointer text-xs text-stone-600 hover:text-stone-900"
                    >
                      Use campus default
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-stone-700">Profile image</label>
                  <div className="flex h-36 items-center justify-center rounded-lg border border-stone-200 bg-stone-50">
                    <OrgEmblem
                      org={displayOrg}
                      size="lg"
                      imageUrl={avatarChanged ? avatarDraft : organizationProfile.avatarDataUrl}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-stone-100 px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200">
                      <ImagePlus className="h-4 w-4" />
                      Choose profile image
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => void handleProfileImageSelect('avatar', e)}
                        className="sr-only"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarDraft(null);
                        setAvatarChanged(true);
                      }}
                      className="cursor-pointer text-xs text-stone-600 hover:text-stone-900"
                    >
                      Remove profile image
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setBannerDraft(null);
                    setAvatarDraft(null);
                    setAboutDraft('');
                    setOrganizationNameDraft('');
                    setOrganizationShortNameDraft('');
                    setPresidentNameDraft('');
                    setBannerChanged(false);
                    setAvatarChanged(false);
                    setAboutChanged(false);
                    setOrganizationNameChanged(false);
                    setPresidentNameChanged(false);
                    setActiveTab('feed');
                  }}
                  className="cursor-pointer rounded-lg px-4 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    savingProfile ||
                    (!bannerChanged &&
                      !avatarChanged &&
                      !aboutChanged &&
                      !organizationNameChanged &&
                      !presidentNameChanged)
                  }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#166534] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#14532d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'compose' && isOwningOfficer && (
            <form
              onSubmit={handleSubmitLetter}
              className="space-y-3.5 rounded-xl border border-stone-200 bg-white p-4 sm:space-y-4 sm:p-5"
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-stone-900">
                  Publish an Announcement
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Publish directly to your organization page and the campus-wide announcement feed.
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
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]/20 focus:border-[#166534]"
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
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]/20 focus:border-[#166534]"
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
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]/20 focus:border-[#166534]"
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingPost ? 'Publishing...' : 'Publish Announcement'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'proposal' && isOwningOfficer && (
            <form
              onSubmit={handleSubmitProposal}
              className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 sm:p-5"
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-stone-900">
                  Send a Proposal File to CESSCA
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                  Use this separate request channel for project proposals and supporting documents.
                  Any file type is accepted, up to 25 MB per file.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="proposal-title" className="block text-xs font-medium text-stone-700">
                  Proposal title
                </label>
                <input
                  id="proposal-title"
                  type="text"
                  required
                  minLength={3}
                  maxLength={160}
                  value={proposalTitle}
                  onChange={(event) => setProposalTitle(event.target.value)}
                  placeholder="e.g., Student Leadership Workshop"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="proposal-message" className="block text-xs font-medium text-stone-700">
                  Message to CESSCA (optional)
                </label>
                <textarea
                  id="proposal-message"
                  rows={4}
                  maxLength={2000}
                  value={proposalMessage}
                  onChange={(event) => setProposalMessage(event.target.value)}
                  placeholder="Add context or instructions for reviewing your attached file."
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm leading-relaxed focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="proposal-file" className="block text-xs font-medium text-stone-700">
                  Proposal file
                </label>
                <input
                  id="proposal-file"
                  key={proposalFileInputKey}
                  type="file"
                  required
                  onChange={(event) => setProposalFile(event.target.files?.[0] ?? null)}
                  className="block w-full cursor-pointer rounded-lg border border-stone-200 bg-stone-50 p-2 text-xs text-stone-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-emerald-800 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-900"
                />
                <p className="text-[11px] text-stone-500">
                  {proposalFile
                    ? `${proposalFile.name} · ${(proposalFile.size / (1024 * 1024)).toFixed(2)} MB`
                    : 'PDF, Word, spreadsheets, images, and other file formats are supported.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('feed')}
                  className="cursor-pointer rounded-lg px-4 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProposal || !proposalFile}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileUp className="h-4 w-4" />
                  {submittingProposal ? 'Uploading and sending...' : 'Send Proposal'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'submissions' && isOwningOfficer && (
            <div className="space-y-3">
              {submissions.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-3">
                  <p className="text-sm font-medium text-stone-900">No announcements published yet.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('compose')}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#166534] rounded-lg hover:bg-[#14532d] transition-colors cursor-pointer"
                  >
                    Publish First Announcement
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
                              Published
                            </span>
                          )}
                          {item.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                              <Clock className="w-4 h-4" />
                              Pending Review
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

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          disabled={deletingPostId !== null}
                          onClick={() => void handleDeleteSubmission(item)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 hover:underline disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>
                            {deletingPostId === item.id
                              ? 'Deleting...'
                              : item.status === 'approved'
                                ? 'Delete Announcement'
                                : 'Withdraw Submission'}
                          </span>
                        </button>
                      </div>
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
                    No announcements yet
                  </h3>
                </div>
              ) : (
                <div className="portal-stagger space-y-4">
                  {posts.map((post) => (
                    <FacebookPostCard
                      key={post.id}
                      post={post}
                      organizationImageUrl={organizationProfile.avatarDataUrl}
                      showEngagementActions={false}
                      onOpenLightbox={onOpenLightbox}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
