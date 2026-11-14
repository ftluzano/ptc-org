import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ORGANIZATIONS } from '../config/org-config';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadFeed() {
      setLoading(true);
      try {
        const query = selectedOrg !== 'all' ? `?org=${encodeURIComponent(selectedOrg)}` : '';
        const res = await fetch(`/api/feed${query}`);
        if (res.ok && active) {
          const data = await res.json();
          setPosts(data.posts ?? []);
        }
      } catch {
        if (active) setPosts([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadFeed();
    return () => {
      active = false;
    };
  }, [selectedOrg]);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToDirectory}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-[#1E3A8A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Organizations Directory</span>
        </button>
      </div>

      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-stone-900">
          Global Campus Announcements
        </h1>
        <p className="text-sm text-stone-600">
          Live stream of CESSCA-approved events and bulletins across all 12 official PTC student
          organizations.
        </p>
      </div>

      {/* Interactive Organization Filter Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-lg overflow-x-auto">
        <button
          type="button"
          onClick={() => setSelectedOrg('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            selectedOrg === 'all'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          All 12 Orgs
        </button>
        {ORGANIZATIONS.map((org) => (
          <button
            key={org.code}
            type="button"
            onClick={() => setSelectedOrg(org.code)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedOrg === org.code
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {org.shortName}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl h-72 animate-pulse" />
          <div className="bg-white border border-stone-200 rounded-xl h-72 animate-pulse" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-3">
          <p className="text-sm font-medium text-stone-900">
            No approved announcements for this filter yet.
          </p>
          <button
            type="button"
            onClick={() => setSelectedOrg('all')}
            className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172E6E] transition-colors cursor-pointer"
          >
            Show All Organizations
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <FacebookPostCard
              key={post.id}
              post={post}
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
