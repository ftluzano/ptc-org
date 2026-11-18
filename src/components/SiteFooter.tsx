import { CAMPUS_HERO_IMAGE } from '../lib/mediaAssets';
import { ORGANIZATIONS, type OrganizationConfig } from '../config/org-config';

const PTC_CONTACT_EMAIL = 'ptc@paterostechnologicalcollege.edu.ph';

interface SiteFooterProps {
  organization?: OrganizationConfig;
}

export function SiteFooter({ organization }: SiteFooterProps) {
  const organizationsToShow = (organization ? [organization] : ORGANIZATIONS).filter(
    (org): org is OrganizationConfig & { facebookUrl: string } => Boolean(org.facebookUrl)
  );

  return (
    <footer className="relative mt-8 overflow-hidden border-t border-white/10 bg-emerald-950">
      <img
        src={CAMPUS_HERO_IMAGE}
        alt=""
        aria-hidden="true"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-25"
      />
      <div className="absolute inset-0 bg-emerald-950/75" />
      <div className="relative mx-auto grid max-w-7xl gap-6 px-4 py-8 text-center sm:grid-cols-2 sm:px-6 sm:text-left">
        <section aria-labelledby="footer-contact-heading">
          <h2
            id="footer-contact-heading"
            className="font-display text-xl font-bold text-white"
          >
            Contact Us
          </h2>
          <p className="mt-2 text-sm text-white/80">Email:</p>
          <a
            href={`mailto:${PTC_CONTACT_EMAIL}`}
            className="break-all text-sm font-medium text-white underline decoration-white/50 underline-offset-4 hover:text-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
          >
            {PTC_CONTACT_EMAIL}
          </a>
        </section>
        <section aria-labelledby="footer-follow-heading">
          <h2
            id="footer-follow-heading"
            className="font-display text-xl font-bold text-white"
          >
            Follow Us
          </h2>
          {organizationsToShow.length > 0 ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {organizationsToShow.map((org) => (
                <a
                  key={org.code}
                  href={org.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${org.shortName} on Facebook`}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-left text-white/90 transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white"
                  >
                    f
                  </span>
                  <span className="min-w-0 truncate text-sm font-semibold">
                    {org.shortName}
                  </span>
                </a>
              ))}
            </div>
          ) : organization ? (
            <p className="mt-2 text-sm text-white/80">
              {organization.shortName} Facebook link will be added here.
            </p>
          ) : null}
          {!organization && (
            <p className="mt-3 text-xs text-white/70">
              Organization officers can update their Facebook page link from their profile page.
            </p>
          )}
        </section>
      </div>
    </footer>
  );
}
