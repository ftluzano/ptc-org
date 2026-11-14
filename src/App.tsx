import React, { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ORGANIZATIONS, getOrgByCode } from './config/org-config';
import { AuthProvider } from './hooks/useAuth';
import type { AuthUser, OrgStats } from './types/portal';
import { TopBar, type ActiveRoute } from './components/TopBar';
import { OrgDirectoryPage } from './components/OrgDirectoryPage';
import { OrgProfilePage } from './components/OrgProfilePage';
import { GlobalFeedPage } from './components/GlobalFeedPage';
import { CesscaAdminPage } from './components/CesscaAdminPage';
import { LoginModal } from './components/LoginModal';

function parseRouteFromLocation(): ActiveRoute {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  if (pathname === '/feed') {
    return { page: 'feed' };
  }
  if (pathname === '/cessca') {
    return { page: 'cessca' };
  }
  if (pathname.startsWith('/org/')) {
    const code = pathname.slice(5);
    const org = getOrgByCode(code);
    if (org) {
      return { page: 'org', orgCode: org.code };
    }
  }
  return { page: 'directory' };
}

function routeToPath(route: ActiveRoute): string {
  switch (route.page) {
    case 'directory':
      return '/';
    case 'org':
      return `/org/${route.orgCode}`;
    case 'feed':
      return '/feed';
    case 'cessca':
      return '/cessca';
  }
}

function PortalShell() {
  const [route, setRoute] = useState<ActiveRoute>(() => parseRouteFromLocation());
  const [statsByCode, setStatsByCode] = useState<Record<string, OrgStats>>({});
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ imageUrl: string; caption: string } | null>(null);

  const navigate = useCallback((nextRoute: ActiveRoute) => {
    setRoute(nextRoute);
    const targetPath = routeToPath(nextRoute);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    function handlePopState() {
      setRoute(parseRouteFromLocation());
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchOrgStats = useCallback(async () => {
    try {
      const res = await fetch('/api/organizations');
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, OrgStats> = {};
        for (const org of data.organizations ?? []) {
          map[org.code] = {
            orgCode: org.code,
            approvedCount: org.approvedCount,
            pendingCount: org.pendingCount,
            latestPostAt: org.latestPostAt,
          };
        }
        setStatsByCode(map);
      }
    } finally {
      setLoadingOrgs(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrgStats();
  }, [fetchOrgStats]);

  function handleAuthenticated(user: AuthUser) {
    if (user.role === 'cessca') {
      navigate({ page: 'cessca' });
    } else if (user.role === 'president' && user.orgCode) {
      navigate({ page: 'org', orgCode: user.orgCode });
    }
  }

  const activeOrg = route.page === 'org' ? getOrgByCode(route.orgCode) : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2] text-stone-900">
      <TopBar
        route={route}
        onNavigate={navigate}
        onOpenLogin={() => setLoginOpen(true)}
      />

      <div className="flex-1">
        {route.page === 'directory' && (
          <OrgDirectoryPage
            organizations={ORGANIZATIONS}
            statsByCode={statsByCode}
            loading={loadingOrgs}
            onSelectOrg={(code) => navigate({ page: 'org', orgCode: code })}
            onOpenGlobalFeed={() => navigate({ page: 'feed' })}
          />
        )}

        {route.page === 'org' && activeOrg && (
          <OrgProfilePage
            org={activeOrg}
            onBackToDirectory={() => navigate({ page: 'directory' })}
            onSelectOrg={(code) => navigate({ page: 'org', orgCode: code })}
            onOpenLogin={() => setLoginOpen(true)}
            onOpenLightbox={(imageUrl, caption) => setLightbox({ imageUrl, caption })}
            onPostsMutated={() => void fetchOrgStats()}
          />
        )}

        {route.page === 'feed' && (
          <GlobalFeedPage
            onBackToDirectory={() => navigate({ page: 'directory' })}
            onSelectOrg={(code) => navigate({ page: 'org', orgCode: code })}
            onOpenLightbox={(imageUrl, caption) => setLightbox({ imageUrl, caption })}
          />
        )}

        {route.page === 'cessca' && (
          <CesscaAdminPage
            onSelectOrg={(code) => navigate({ page: 'org', orgCode: code })}
            onOpenLogin={() => setLoginOpen(true)}
            onOpenLightbox={(imageUrl, caption) => setLightbox({ imageUrl, caption })}
            onReviewCompleted={() => void fetchOrgStats()}
          />
        )}
      </div>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

      {/* Full-resolution Image Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/85 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl w-full bg-stone-900 rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              aria-label="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightbox.imageUrl}
              alt={lightbox.caption}
              referrerPolicy="no-referrer"
              className="w-full max-h-[80vh] object-contain bg-black"
            />
            <div className="px-5 py-3 text-sm text-stone-200 border-t border-stone-800">
              {lightbox.caption}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PortalShell />
    </AuthProvider>
  );
}
