import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ORGANIZATIONS } from '../config/org-config';
import { useLiveUpdates } from '../hooks/useLiveUpdates';
import type { OrgPost } from '../types/portal';
import { FacebookPostCard } from './FacebookPostCard';

interface GlobalFeedPageProps {
  onBackToDirectory: () => void;
  onSelectOrg: (orgCode: string) => void;
  onOpenLightbox: (imageUrl: string, caption: string) => void;
}

export function GlobalFeedPage({
  onBackToDirectory,
  onSelectOrg,
  onOpenLightbox,
}: GlobalFeedPageProps) {
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [posts, setPosts] = useState<OrgPost[]>([]);
  const [avatarByOrg, setAvatarByOrg] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const query = selectedOrg !== 'all' ? `?org=${encodeURIComponent(selectedOrg)}` : '';
      const [feedRes, orgsRes] = await Promise.all([
        fetch(`/api/feed${query}`),
        fetch('/api/organizations'),
      ]);
      if (!feedRes.ok || !orgsRes.ok) {
        throw new Error('Unable to load the campus announcement feed.');
      }
      const [feedData, orgsData] = await Promise.all([feedRes.json(), orgsRes.json()]);
      setPosts(feedData.posts ?? []);
      setAvatarByOrg(
        Object.fromEntries(
          (orgsData.organizations ?? []).map(
            (org: { code: string; avatarUrl?: string | null }) => [
              org.code,
              org.avatarUrl ?? null,
            ]
          )
        )
      );
    } catch (error) {
      console.error('Failed to load global feed:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedOrg]);

  useLiveUpdates(loadFeed);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  return (
    <main className="portal-page-enter mx-auto max-w-4xl space-y-3 px-3 py-4 sm:space-y-4 sm:px-6 sm:py-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToDirectory}
          className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-emerald-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Organizations Directory</span>
        </button>
      </div>

      <div className="space-y-1.5 rounded-2xl border border-stone-200 bg-white/85 p-3.5 shadow-sm sm:space-y-2 sm:rounded-[20px] sm:p-4">
        <h1 className="font-display text-2xl font-semibold text-stone-900 sm:text-3xl">
          Global Campus Announcements
        </h1>
        <p className="text-sm text-stone-600">
          Live stream of announcements and bulletins published by all 12 official PTC student
          organizations.
        </p>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-stone-200 bg-white/80 p-1 shadow-sm sm:gap-1.5 sm:p-1.5">
        <button
          type="button"
          onClick={() => setSelectedOrg('all')}
          className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer sm:px-3 sm:text-xs ${
            selectedOrg === 'all'
              ? 'bg-[#14532d] text-white shadow-[0_8px_18px_rgba(20,83,45,0.22)]'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          All 12 Orgs
        </button>
        {ORGANIZATIONS.map((org) => (
          <button
            key={org.code}
            type="button"
            onClick={() => setSelectedOrg(org.code)}
            className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer sm:px-3 sm:text-xs ${
              selectedOrg === org.code
                ? 'bg-[#14532d] text-white shadow-[0_8px_18px_rgba(20,83,45,0.22)]'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            {org.shortName}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-72 animate-pulse rounded-[22px] border border-stone-200 bg-white/90 shadow-sm" />
          <div className="h-72 animate-pulse rounded-[22px] border border-stone-200 bg-white/90 shadow-sm" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-[20px] border border-stone-200 bg-white/90 p-7 text-center shadow-sm">
          <p className="text-sm font-medium text-stone-900">
            No announcements for this filter yet.
          </p>
          <button
            type="button"
            onClick={() => setSelectedOrg('all')}
            className="mt-3 rounded-lg bg-[#14532d] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#14532d] cursor-pointer"
          >
            Show All Organizations
          </button>
        </div>
      ) : (
        <div className="portal-stagger space-y-4">
          {posts.map((post) => (
            <FacebookPostCard
              key={post.id}
              post={post}
              organizationImageUrl={avatarByOrg[post.orgCode]}
              showOrgLink
              onOpenOrg={onSelectOrg}
              onOpenLightbox={onOpenLightbox}
            />
          ))}
        </div>
      )}
    </main>
  );
}
