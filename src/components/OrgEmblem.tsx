import React from 'react';
import type { OrganizationConfig } from '../config/org-config';

interface OrgEmblemProps {
  org: Pick<OrganizationConfig, 'code' | 'shortName' | 'accentColor'>;
  size?: 'sm' | 'md' | 'lg';
}

export function OrgEmblem({ org, size = 'md' }: OrgEmblemProps) {
  const monogram =
    org.shortName.length <= 4
      ? org.shortName.toUpperCase()
      : org.shortName.slice(0, 2).toUpperCase();

  const dimensions =
    size === 'sm'
      ? 'w-9 h-9 text-[11px] rounded-lg'
      : size === 'lg'
        ? 'w-20 h-20 text-xl rounded-xl border-4 border-white shadow-sm'
        : 'w-12 h-12 text-xs rounded-lg';

  return (
    <div
      className={`${dimensions} shrink-0 flex items-center justify-center font-mono font-semibold tracking-tight text-white select-none`}
      style={{ backgroundColor: org.accentColor }}
      aria-hidden="true"
    >
      {monogram}
    </div>
  );
}
