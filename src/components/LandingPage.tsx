import React from 'react';
import { CAMPUS_HERO_IMAGE } from '../lib/mediaAssets';
import campusLifeImage from '../assets/images/ptc-campus-life.png';
import missionImage from '../assets/images/ptc-mission.png';
import studentLifeImage from '../assets/images/ptc-student-life.png';
import visionImage from '../assets/images/ptc-vision.png';

const landingImages = [
  { src: visionImage, alt: 'Pateros Technological College vision statement' },
  { src: missionImage, alt: 'Pateros Technological College mission statement' },
  { src: campusLifeImage, alt: 'Students at the entrance of Pateros Technological College' },
  { src: studentLifeImage, alt: 'Close-up of a student wearing glasses on campus' },
];

export function LandingPage() {
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

      <section aria-label="About Pateros Technological College" className="space-y-4 sm:space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Campus and community
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            Pateros Technological College
          </h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {landingImages.map((image) => (
            <figure
              key={image.src}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-auto w-full"
                loading="lazy"
              />
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
