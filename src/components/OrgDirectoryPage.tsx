import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, Search } from 'lucide-react';
import type { OrganizationConfig } from '../config/org-config';
import { CAMPUS_HERO_IMAGE } from '../lib/mediaAssets';
import type { OrgStats } from '../types/portal';
import { OrgEmblem } from './OrgEmblem';

interface OrgDirectoryPageProps {
  organizations: OrganizationConfig[];
  statsByCode: Record<string, OrgStats>;
  onSelectOrg: (orgCode: string) => void;
}

export function OrgDirectoryPage({
  organizations,
  statsByCode,
  onSelectOrg,
}: OrgDirectoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrgs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return organizations.filter((org) => {
      if (!q) return true;
      return (
        org.shortName.toLowerCase().includes(q) ||
        org.fullName.toLowerCase().includes(q) ||
        org.president.toLowerCase().includes(q) ||
        org.scope.toLowerCase().includes(q) ||
        org.aboutText?.toLowerCase().includes(q)
      );
    });
  }, [organizations, searchQuery]);

  return (
    <main className="portal-page-enter mx-auto max-w-7xl space-y-6 px-3 py-4 sm:space-y-8 sm:px-6 sm:py-8">
      <section className="relative isolate min-h-[340px] overflow-hidden rounded-[20px] bg-[#172554] shadow-[0_24px_54px_rgba(15,23,42,0.2)] sm:min-h-[440px] sm:rounded-[24px] lg:min-h-[480px]">
        <img
          src={CAMPUS_HERO_IMAGE}
          alt="Pateros Technological College main building entrance"
          referrerPolicy="no-referrer"
          className="portal-hero-drift absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#101c3c]/95 via-[#172554]/75 to-[#172554]/10"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#101c3c]/45 via-transparent to-transparent"
        />
        <div className="relative z-10 flex min-h-[340px] items-center px-5 py-8 sm:min-h-[440px] sm:px-10 sm:py-10 lg:min-h-[480px] lg:px-14">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find your people.
              <span className="mt-1 block text-blue-100">Shape your campus.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-5 text-blue-50/90 sm:mt-5 sm:text-base sm:leading-7">
              Discover the official PTC organizations, explore your interests, and find a community
              to grow with.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 sm:mt-7">
              <a
                href="#org-directory"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#172554] shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#172554] sm:px-5 sm:py-3 sm:text-sm"
              >
                Explore organizations
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-7 right-7 z-10 hidden rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white shadow-xl backdrop-blur-md lg:block">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold">{organizations.length}</span>
            <span className="text-xs font-medium text-blue-50">official organizations</span>
          </div>
          <p className="mt-1 text-xs text-blue-100/85">One campus. Many ways to belong.</p>
        </div>
      </section>

      <section id="org-directory" className="scroll-mt-20 space-y-4 sm:scroll-mt-24 sm:space-y-5">
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              Explore Student Organizations
            </h2>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, president, or interest"
              aria-label="Search student organizations"
              className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-3.5 text-sm text-stone-800 shadow-[0_8px_24px_rgba(15,23,42,0.04)] outline-none transition focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 sm:rounded-2xl sm:py-3.5 sm:pl-11 sm:pr-4"
            />
          </div>
        </div>

        {filteredOrgs.length === 0 ? (
          <div className="rounded-[20px] border border-stone-200 bg-white/90 p-7 text-center shadow-sm">
            <p className="text-sm font-medium text-stone-900">
              No student organizations match "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
              }}
              className="mt-3 rounded-lg bg-[#172554] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#1c2f72] cursor-pointer"
            >
              Reset Directory Filters
            </button>
          </div>
        ) : (
          <div className="portal-stagger grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrgs.map((org) => {
              const stats = statsByCode[org.code];
              const approvedCount = stats?.approvedCount ?? 0;

              return (
                <button
                  key={org.code}
                  type="button"
                  onClick={() => onSelectOrg(org.code)}
                  className="group flex flex-col justify-between gap-3 rounded-[18px] border border-stone-200 bg-white/90 p-3.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] cursor-pointer sm:gap-4 sm:rounded-[20px] sm:p-4"
                >
                  <div className="space-y-3.5">
                    <OrgEmblem org={org} size="md" imageUrl={stats?.avatarUrl} />

                    <div>
                      <h3 className="text-lg font-semibold text-stone-900 transition-colors group-hover:text-[#1E3A8A]">
                        {org.shortName}
                      </h3>
                      <p className="mt-0.5 text-sm leading-snug text-stone-600 line-clamp-2">
                        {org.fullName}
                      </p>
                      {org.aboutText && (
                        <p className="mt-1 text-xs leading-snug text-stone-500 line-clamp-2">
                          {org.aboutText}
                        </p>
                      )}
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
