import React, { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import type { OrgCategory, OrganizationConfig } from '../config/org-config';
import { CAMPUS_HERO_IMAGE } from '../lib/mediaAssets';
import type { OrgStats } from '../types/portal';
import { OrgEmblem } from './OrgEmblem';

interface OrgDirectoryPageProps {
  organizations: OrganizationConfig[];
  statsByCode: Record<string, OrgStats>;
  loading: boolean;
  onSelectOrg: (orgCode: string) => void;
  onOpenGlobalFeed: () => void;
}

const CATEGORIES: Array<'All' | OrgCategory> = [
  'All',
  'Governance & Media',
  'Technology & Academics',
  'Business & Leadership',
  'Athletics & Arts',
];

export function OrgDirectoryPage({
  organizations,
  statsByCode,
  loading,
  onSelectOrg,
  onOpenGlobalFeed,
}: OrgDirectoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | OrgCategory>('All');

  const filteredOrgs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return organizations.filter((org) => {
      const matchesCategory = activeCategory === 'All' || org.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        org.shortName.toLowerCase().includes(q) ||
        org.fullName.toLowerCase().includes(q) ||
        org.president.toLowerCase().includes(q) ||
        org.scope.toLowerCase().includes(q)
      );
    });
  }, [organizations, searchQuery, activeCategory]);

  const totalApprovedPosts = useMemo(
    () => Object.values(statsByCode).reduce((sum, s) => sum + (s?.approvedCount ?? 0), 0),
    [statsByCode]
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
      {/* Editorial Hero Split */}
      <section className="bg-white border border-stone-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-widest text-stone-500 font-medium">
              Pateros Technological College · Official Student Portal
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-semibold text-stone-900 leading-[1.15] text-balance">
              Twelve student organizations, one verified campus commons.
            </h1>
            <p className="text-base text-stone-600 leading-relaxed max-w-2xl">
              Select any accredited student organization below to view its dedicated page, read
              CESSCA-approved event announcements, and track upcoming campus activities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#org-directory"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <span>Browse 12 Organizations</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onOpenGlobalFeed}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Open Global Announcements</span>
            </button>
          </div>

          {/* Quantitative strip */}
          <div className="pt-5 border-t border-stone-200 grid grid-cols-3 gap-6">
            <div>
              <div className="font-mono text-2xl font-semibold text-stone-900 tabular-nums">
                12
              </div>
              <div className="text-xs text-stone-500 mt-0.5">Official Organizations</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-semibold text-stone-900 tabular-nums">
                {totalApprovedPosts}
              </div>
              <div className="text-xs text-stone-500 mt-0.5">Approved Bulletins</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-semibold text-stone-900 tabular-nums">
                100%
              </div>
              <div className="text-xs text-stone-500 mt-0.5">CESSCA Moderated</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full bg-stone-200">
          <img
            src={CAMPUS_HERO_IMAGE}
            alt="Pateros Technological College courtyard and student center"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 via-black/35 to-transparent text-white">
            <div className="text-xs font-medium text-stone-200">Campus Student Commons</div>
            <div className="text-sm font-medium mt-0.5">
              All event letters are reviewed by CESSCA prior to publication.
            </div>
          </div>
        </div>
      </section>

      {/* Organization Directory Section */}
      <section id="org-directory" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900">
              Official Student Organizations
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Click any organization card to enter its dedicated feed and officer charter.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search org, president, or scope..."
              aria-label="Search student organizations"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
            />
          </div>
        </div>

        {/* Interactive Category Segmented Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-lg overflow-x-auto">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === category
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 12 Organization Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-stone-200 rounded-xl p-6 h-48 animate-pulse"
              />
            ))}
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-3">
            <p className="text-sm font-medium text-stone-900">
              No student organizations match "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172E6E] transition-colors cursor-pointer"
            >
              Reset Directory Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOrgs.map((org) => {
              const stats = statsByCode[org.code];
              const approvedCount = stats?.approvedCount ?? 0;

              return (
                <button
                  key={org.code}
                  type="button"
                  onClick={() => onSelectOrg(org.code)}
                  className="group text-left bg-white border border-stone-200 hover:border-stone-400 rounded-xl p-5 flex flex-col justify-between gap-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] cursor-pointer"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <OrgEmblem org={org} size="md" />
                      <span className="text-xs text-stone-500 font-medium pt-0.5">
                        {org.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-stone-900 group-hover:text-[#1E3A8A] transition-colors">
                        {org.shortName}
                      </h3>
                      <p className="text-sm text-stone-600 line-clamp-2 mt-0.5 leading-snug">
                        {org.scope}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-stone-100 flex items-center justify-between gap-2 text-xs text-stone-500">
                    <div className="truncate">
                      <span className="text-stone-400">President: </span>
                      <span className="font-medium text-stone-800">{org.president}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 font-medium text-stone-700 group-hover:text-[#1E3A8A]">
                      <span className="tabular-nums">
                        {approvedCount} {approvedCount === 1 ? 'post' : 'posts'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
