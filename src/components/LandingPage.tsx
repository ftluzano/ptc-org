import React from 'react';
import { CAMPUS_HERO_IMAGE } from '../lib/mediaAssets';
import currentPresidentImage from '../assets/images/ptc-president-analiza-arcega.png';
import angelusPonceImage from '../assets/images/ptc-administrator-angelus-ponce.png';
import daisyVillanuevaImage from '../assets/images/ptc-administrator-daisy-villanueva.png';
import estelitaDelacruzImage from '../assets/images/ptc-administrator-estelita-delacruz.png';
import rosalindaZambranoImage from '../assets/images/ptc-administrator-rosalinda-zambrano.png';
import susanMarceloImage from '../assets/images/ptc-administrator-susan-marcelo.png';
import godofredoMarceloImage from '../assets/images/ptc-administrator-godofredo-marcelo.png';
import campusLifeImage from '../assets/images/ptc-campus-life.png';
import missionImage from '../assets/images/ptc-mission.png';
import studentLifeImage from '../assets/images/ptc-student-life.png';
import visionImage from '../assets/images/ptc-vision.png';

const landingImages = [
  { src: visionImage, alt: 'Pateros Technological College vision statement', trimEdge: true },
  { src: missionImage, alt: 'Pateros Technological College mission statement', trimEdge: true },
  { src: campusLifeImage, alt: 'Students at the entrance of Pateros Technological College', trimEdge: false },
  { src: studentLifeImage, alt: 'Close-up of a student wearing glasses on campus', trimEdge: false },
];

const ptcHistory = [
  'Pateros Technological College (PTC) is a technical-vocational school established on January 29, 1993 by virtue of Municipal Ordinance No. 93-07. It started its operation on August 16, 1993, initially offering short term and two-year Associate in Computer Science, Computer Secretarial Science, and Computer Technology courses. Systematrix Computer Education and Services, Inc. (SCESI) became the partner group of PTC through Municipal Resolution No. 64 – 95 authorizing the Municipality of Pateros to sign a Memorandum of Agreement with SCESI.',
  'The partnership between PTC and SCESI ended in October, 1995. Keeping up with the goal to continue its technical-vocational advocacy, PTC forged another linkage, this time with the Technological University of the Philippines (TUP). On September 26, 1995, PTC became the recipient of the Adopt-A-School program of TUP through another Memorandum of Agreement. The linkage gave birth to the first four-year Bachelor of Computer Science program in the academic year 1997 – 1998. PTC also became TUP’s ally in the off-campus training of the latter’s undergraduate and graduate students.',
  'Because of the linkage, Pateros Technological College gained its institutional footing to stand on its own. This paved the way to offer ladderized scheme programs that lead to Baccalaureate Degrees. The Bachelor of Science in Education, Major in Information System and Minor in Mathematics was offered in SY 2006 – 2007. Then, the Certificate in Hotel and Restaurant Management leading to Bachelor of Science in Hospitality Management and Bachelor of Science in Office Administration were offered the following school year.',
];

const formerAdministrators = [
  {
    src: angelusPonceImage,
    alt: 'Ms. Angelus DP. Ponce, OIC Administrator, 2016–2017',
  },
  {
    src: daisyVillanuevaImage,
    alt: 'Ms. Daisy J. Villanueva, OIC Administrator, 2016',
  },
  {
    src: estelitaDelacruzImage,
    alt: 'Prof. Estelita Q. Delacruz, Administrator, 2011–2017',
  },
  {
    src: rosalindaZambranoImage,
    alt: 'Dr. Rosalinda S. Zambrano, Administrator, 2005–2010',
  },
  {
    src: susanMarceloImage,
    alt: 'Prof. Susan F. Marcelo, OIC Administrator, 2005',
  },
  {
    src: godofredoMarceloImage,
    alt: 'Mr. Godofredo R. Marcelo, Administrator, 1995–2005',
  },
];

interface LandingPageProps {
  showAbout?: boolean;
  scrollToAbout?: boolean;
}

export function LandingPage({ showAbout = false, scrollToAbout = false }: LandingPageProps) {
  React.useEffect(() => {
    if (!scrollToAbout) return;
    const frameId = window.requestAnimationFrame(() => {
      document.getElementById('about-ptc')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [scrollToAbout]);

  return (
    <main className="portal-page-enter mx-auto max-w-7xl space-y-6 px-3 py-4 sm:space-y-8 sm:px-6 sm:py-8">
      <section
        aria-label="Pateros Technological College campus"
        className="relative h-[260px] overflow-hidden rounded-[20px] bg-emerald-950 shadow-[0_24px_54px_rgba(15,23,42,0.18)] sm:h-[380px] sm:rounded-[24px] lg:h-[460px]"
      >
        <img
          src={CAMPUS_HERO_IMAGE}
          alt="Pateros Technological College campus banner"
          referrerPolicy="no-referrer"
          className="portal-hero-drift absolute inset-0 h-full w-full object-cover object-center"
        />
      </section>

      {showAbout && (
        <section
          id="about-ptc"
          aria-label="About Pateros Technological College"
          className="scroll-mt-24 space-y-4 sm:space-y-5"
        >
        <div>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            About PTC
          </h1>
        </div>
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-7 text-stone-700 shadow-sm sm:p-6">
          {ptcHistory.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <section aria-labelledby="ptc-president-heading" className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
              2017–Present
            </p>
            <h2
              id="ptc-president-heading"
              className="mt-1 font-display text-xl font-semibold text-stone-900 sm:text-2xl"
            >
              THE PRESIDENT
            </h2>
          </div>
          <article className="flex flex-col items-center gap-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:p-6">
            <figure className="flex w-full max-w-[280px] items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 p-2 shadow-md">
              <img
                src={currentPresidentImage}
                alt="Dr. Analiza F. Arcega"
                className="max-h-[360px] w-full rounded-xl object-contain"
                loading="lazy"
              />
            </figure>
            <div className="text-center sm:text-left">
              <h3 className="font-display text-xl font-semibold text-stone-900">
                Dr. Analiza F. Arcega
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                LPT, RGC, CSASS
              </p>
              <p className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                President · 2017–Present
              </p>
            </div>
          </article>
        </section>
        <section aria-labelledby="ptc-former-administrators-heading" className="space-y-4">
          <h2
            id="ptc-former-administrators-heading"
            className="text-center font-display text-xl font-semibold text-stone-900 sm:text-2xl"
          >
            Former Administrators
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
            {formerAdministrators.map((administrator) => (
              <figure
                key={administrator.src}
                className="self-start overflow-hidden rounded-xl border border-stone-200 bg-[#eeedff] shadow-sm"
              >
                <img
                  src={administrator.src}
                  alt={administrator.alt}
                  className="h-auto w-full"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </section>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {landingImages.map((image) => (
            <figure
              key={image.src}
              className="aspect-[1.4] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
            >
              <img
                src={image.src}
                alt={image.alt}
                className={`h-full w-full object-fill ${image.trimEdge ? 'scale-[1.02]' : ''}`}
                loading="lazy"
              />
            </figure>
          ))}
        </div>
      </section>
      )}
    </main>
  );
}
