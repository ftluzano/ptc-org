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
      <section className="grid grid-cols-1 overflow-hidden rounded-[28px] border border-stone-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_50%,#f4f1eb_100%)] shadow-[0_22px_50px_rgba(15,23,42,0.08)] lg:grid-cols-12 lg:items-stretch">
        <div className="flex flex-col justify-between gap-6 p-6 sm:p-10 lg:col-span-7">
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1E3A8A]">
              Pateros Technological College · Official Student Portal
            </div>
            <h1 className="max-w-xl font-display text-3xl font-semibold leading-[1.1] text-stone-900 sm:text-4xl lg:text-[42px] text-balance">
              Twelve student organizations, one verified campus commons.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-stone-600">
              Select any accredited student organization below to view its dedicated page, read
              CESSCA-approved event announcements, and track upcoming campus activities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#org-directory"
              className="inline-flex items-center gap-2 rounded-xl bg-[#172554] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(23,37,84,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#1b2d66] whitespace-nowrap shrink-0"
            >
              <span>Browse 12 Organizations</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onOpenGlobalFeed}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-stone-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:bg-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Open Global Announcements</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-stone-200 pt-5">
            <div className="rounded-2xl border border-stone-200 bg-white/70 p-3 shadow-sm">
              <div className="font-mono text-2xl font-semibold text-stone-900 tabular-nums">12</div>
              <div className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-stone-500">
                Official Groups
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white/70 p-3 shadow-sm">
              <div className="font-mono text-2xl font-semibold text-stone-900 tabular-nums">
                {totalApprovedPosts}
              </div>
              <div className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-stone-500">
                Approved Bulletins
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white/70 p-3 shadow-sm">
              <div className="font-mono text-2xl font-semibold text-stone-900 tabular-nums">100%</div>
              <div className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-stone-500">
                Moderated
              </div>
            </div>
          </div>
        </div>

        <div className="relative min-h-[240px] bg-stone-200 lg:col-span-5 lg:min-h-full">
          <img
            src={CAMPUS_HERO_IMAGE}
            alt="Pateros Technological College courtyard and student center"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 text-white">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-stone-200">
              Campus Student Commons
            </div>
            <div className="mt-1 text-sm font-medium">
              All event letters are reviewed by CESSCA prior to publication.
            </div>
          </div>
        </div>
      </section>

      <section id="org-directory" className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-stone-900 sm:text-3xl">
              Official Student Organizations
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Click any organization card to enter its dedicated feed and officer charter.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search org, president, or scope..."
              aria-label="Search student organizations"
              className="w-full rounded-xl border border-stone-300 bg-white/90 py-2.5 pl-9 pr-3 text-sm text-stone-800 shadow-sm outline-none ring-0 transition focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/15"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-stone-200 bg-white/80 p-1.5 shadow-sm">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === category
                  ? 'bg-[#172554] text-white shadow-[0_8px_18px_rgba(23,37,84,0.22)]'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-48 animate-pulse rounded-[22px] border border-stone-200 bg-white/80 shadow-sm"
              />
            ))}
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="rounded-[22px] border border-stone-200 bg-white/90 p-10 text-center shadow-sm">
            <p className="text-sm font-medium text-stone-900">
              No student organizations match "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="mt-3 rounded-lg bg-[#172554] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#1c2f72] cursor-pointer"
            >
              Reset Directory Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrgs.map((org) => {
              const stats = statsByCode[org.code];
              const approvedCount = stats?.approvedCount ?? 0;

              return (
                <button
                  key={org.code}
                  type="button"
                  onClick={() => onSelectOrg(org.code)}
                  className="group flex flex-col justify-between gap-5 rounded-[22px] border border-stone-200 bg-white/90 p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] cursor-pointer"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <OrgEmblem org={org} size="md" />
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-600">
                        {org.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-stone-900 transition-colors group-hover:text-[#1E3A8A]">
                        {org.shortName}
                      </h3>
                      <p className="mt-0.5 text-sm leading-snug text-stone-600 line-clamp-2">
                        {org.scope}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-3.5 text-xs text-stone-500">
                    <div className="truncate">
                      <span className="text-stone-400">President: </span>
                      <span className="font-medium text-stone-800">{org.president}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 font-medium text-stone-700 transition-colors group-hover:text-[#1E3A8A]">
                      <span className="tabular-nums">
                        {approvedCount} {approvedCount === 1 ? 'post' : 'posts'}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
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
