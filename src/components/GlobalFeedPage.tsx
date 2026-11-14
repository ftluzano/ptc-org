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
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToDirectory}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 transition-colors hover:text-[#1E3A8A] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Organizations Directory</span>
        </button>
      </div>

      <div className="space-y-2 rounded-[20px] border border-stone-200 bg-white/85 p-4 shadow-sm">
        <h1 className="font-display text-3xl font-semibold text-stone-900">
          Global Campus Announcements
        </h1>
        <p className="text-sm text-stone-600">
          Live stream of CESSCA-approved events and bulletins across all 12 official PTC student
          organizations.
        </p>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-stone-200 bg-white/80 p-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => setSelectedOrg('all')}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            selectedOrg === 'all'
              ? 'bg-[#172554] text-white shadow-[0_8px_18px_rgba(23,37,84,0.22)]'
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
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              selectedOrg === org.code
                ? 'bg-[#172554] text-white shadow-[0_8px_18px_rgba(23,37,84,0.22)]'
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
            No approved announcements for this filter yet.
          </p>
          <button
            type="button"
            onClick={() => setSelectedOrg('all')}
            className="mt-3 rounded-lg bg-[#172554] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#1c2f72] cursor-pointer"
          >
            Show All Organizations
          </button>
        </div>
      ) : (
        <div className="space-y-4">
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
