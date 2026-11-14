import React, { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import type { OrganizationConfig } from '../config/org-config';
import { CAMPUS_HERO_IMAGE } from '../lib/mediaAssets';
import type { OrgStats } from '../types/portal';
import { OrgEmblem } from './OrgEmblem';

interface OrgDirectoryPageProps {
  organizations: OrganizationConfig[];
  statsByCode: Record<string, OrgStats>;
  loading: boolean;
  onSelectOrg: (orgCode: string) => void;
}

export function OrgDirectoryPage({
  organizations,
  statsByCode,
  loading,
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
        org.scope.toLowerCase().includes(q)
      );
    });
  }, [organizations, searchQuery]);

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <section className="relative h-[230px] overflow-hidden rounded-[24px] bg-stone-200 shadow-[0_20px_44px_rgba(15,23,42,0.16)] sm:h-[300px] lg:h-[360px]">
        <img
          src={CAMPUS_HERO_IMAGE}
          alt="Pateros Technological College main building entrance"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </section>

      <section id="org-directory" className="scroll-mt-24 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              Explore student organizations
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
              className="w-full rounded-2xl border border-stone-200 bg-white py-3.5 pl-11 pr-4 text-sm text-stone-800 shadow-[0_8px_24px_rgba(15,23,42,0.04)] outline-none transition focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-48 animate-pulse rounded-[22px] border border-stone-200 bg-white/80 shadow-sm"
              />
            ))}
          </div>
        ) : filteredOrgs.length === 0 ? (
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrgs.map((org) => {
              const stats = statsByCode[org.code];
              const approvedCount = stats?.approvedCount ?? 0;

              return (
                <button
                  key={org.code}
                  type="button"
                  onClick={() => onSelectOrg(org.code)}
                  className="group flex flex-col justify-between gap-4 rounded-[20px] border border-stone-200 bg-white/90 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] cursor-pointer"
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
