import React from 'react';
import { CAMPUS_HERO_IMAGE } from '../lib/mediaAssets';
import aboutUsVideo from '../assets/images/About-us-video.mp4';
import ptcLogo from '../assets/images/ptc logo.png';
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
import { Volume2, VolumeX } from 'lucide-react';
import trusteeGeraldGermanImage from '../assets/images/trustee-gerald-german.png';
import trusteeYhonVenturaImage from '../assets/images/trustee-yhon-ventura.png';
import trusteeRobertSantosImage from '../assets/images/trustee-robert-santos.png';
import trusteeLuigiBacantoImage from '../assets/images/trustee-luigi-bacanto.png';
import trusteeCatherinePenaverdeImage from '../assets/images/trustee-catherine-penaverde.png';
import trusteeRolandoBaylonImage from '../assets/images/trustee-rolando-baylon.png';
import trusteeRaymundoArcegaImage from '../assets/images/trustee-raymundo-arcega.png';
import trusteeJulietaParasImage from '../assets/images/trustee-julieta-paras.png';

const landingImages = [
  { src: visionImage, alt: 'Pateros Technological College vision statement', trimEdge: true },
  { src: missionImage, alt: 'Pateros Technological College mission statement', trimEdge: true },
  { src: campusLifeImage, alt: 'Students at the entrance of Pateros Technological College', trimEdge: false },
  { src: studentLifeImage, alt: 'Close-up of a student wearing glasses on campus', trimEdge: false },
];

const partnerLinks = [
  { acronym: 'CHED', label: 'www.ched.gov.ph', href: 'https://ched.gov.ph/' },
  { acronym: 'PATEROS', label: 'www.pateros.gov.ph/', href: 'https://pateros.gov.ph/' },
  { acronym: 'ALCUCOA', label: 'www.alcucoa.org.ph', href: 'https://www.alcucoa.org.ph/' },
  { acronym: 'DepEd', label: 'www.deped.gov.ph', href: 'https://www.deped.gov.ph/' },
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

const boardOfTrustees: Array<{
  name: string;
  role: string;
  image?: string;
  cropScale?: number;
}> = [
  { name: 'Hon. Mayor Gerald German', role: 'Chairman of the Board', image: trusteeGeraldGermanImage, cropScale: 170 },
  { name: 'Dr. Analiza F. Arcega', role: 'College President', image: currentPresidentImage },
  { name: 'Ms. Angelus D.P. Ponce', role: 'Representative – Head (MPDO)', image: angelusPonceImage },
  { name: 'Mr. Yhon Miguel Ventura', role: 'SB Committee Chairman on Education', image: trusteeYhonVenturaImage, cropScale: 157 },
  { name: 'Mr. Robert Santos', role: 'Representative – Business Sector', image: trusteeRobertSantosImage, cropScale: 171 },
  { name: 'Mr. Luigi Bacanto', role: 'PTC Alumni', image: trusteeLuigiBacantoImage, cropScale: 133 },
  { name: 'Ms. Catherine Peñaverde', role: 'Faculty President', image: trusteeCatherinePenaverdeImage, cropScale: 161 },
  { name: 'Mr. Rolando S. Baylon', role: 'BOT – Secretary', image: trusteeRolandoBaylonImage, cropScale: 159 },
  { name: 'Mr. Elmer Perote', role: 'SSC President' },
  { name: 'Ms. Daisy Villanueva', role: 'NGO Representative Member', image: daisyVillanuevaImage },
  { name: 'Dr. Raymundo Arcega', role: 'ALCUCOA President', image: trusteeRaymundoArcegaImage, cropScale: 148 },
  { name: 'Dr. Julieta Paras', role: 'CHED Resource Person', image: trusteeJulietaParasImage, cropScale: 135 },
];

const boardOfTrusteeRows = [
  boardOfTrustees.slice(0, 1),
  boardOfTrustees.slice(1, 2),
  boardOfTrustees.slice(2, 4),
  boardOfTrustees.slice(4, 7),
  boardOfTrustees.slice(7, 10),
  boardOfTrustees.slice(10, 12),
];

function HymnVideo({ videoId, title }: { videoId: string; title: string }) {
  const playerContainerRef = React.useRef<HTMLDivElement>(null);
  const playerFrameRef = React.useRef<HTMLIFrameElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);

  React.useEffect(() => {
    const container = playerContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!isVisible) setIsMuted(true);
  }, [isVisible]);

  function sendPlayerCommand(command: 'mute' | 'unMute' | 'playVideo') {
    playerFrameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: command, args: [] }),
      'https://www.youtube-nocookie.com'
    );
  }

  function handleMuteToggle() {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sendPlayerCommand(nextMuted ? 'mute' : 'unMute');
    if (!nextMuted) sendPlayerCommand('playVideo');
  }

  const videoUrl = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
  videoUrl.search = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    enablejsapi: '1',
    playsinline: '1',
    rel: '0',
    origin: window.location.origin,
  }).toString();

  return (
    <div
      ref={playerContainerRef}
      className="mt-5 overflow-hidden rounded-xl"
    >
      {isVisible ? (
        <iframe
          ref={playerFrameRef}
          src={videoUrl.toString()}
          title={`${title} video`}
          allow="autoplay; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => {
            sendPlayerCommand('mute');
            sendPlayerCommand('playVideo');
          }}
          className="aspect-video w-full"
        />
      ) : (
        <div
          aria-label={`${title} video will play when visible`}
          className="flex aspect-video items-center justify-center text-sm text-white/60"
        >
          Video plays when you scroll here
        </div>
      )}
      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <span className="text-xs text-white/70">
          {isVisible ? 'Playing muted' : 'Autoplays when in view'}
        </span>
        <button
          type="button"
          onClick={handleMuteToggle}
          disabled={!isVisible}
          aria-label={isMuted ? `Unmute ${title}` : `Mute ${title}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </div>
  );
}

function AboutUsVideo() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [playbackBlocked, setPlaybackBlocked] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => setPlaybackBlocked(true));
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 shadow-lg">
      <video
        ref={videoRef}
        src={aboutUsVideo}
        autoPlay
        controls
        muted
        playsInline
        preload="metadata"
        aria-label="About Pateros Technological College video"
        onPlaying={() => setPlaybackBlocked(false)}
        className="aspect-video w-full bg-black object-contain"
      />
      {playbackBlocked && (
        <p className="px-3 py-2 text-center text-sm text-white/80">
          Select play to start the About PTC video.
        </p>
      )}
    </div>
  );
}

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
      {!scrollToAbout && (
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
      )}

      {showAbout && (
        <section
          id="about-ptc"
          aria-label="About Pateros Technological College"
          className="portal-stagger scroll-mt-24 space-y-4 sm:space-y-5"
        >
        {scrollToAbout && (
          <div className="relative flex min-h-64 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-emerald-950 px-5 py-8 text-center shadow-lg sm:min-h-80 sm:gap-4">
            <img
              src={CAMPUS_HERO_IMAGE}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
            />
            <div className="absolute inset-0 bg-emerald-950/60" />
            <img
              src={ptcLogo}
              alt="Pateros Technological College seal"
              className="relative z-10 h-24 w-24 object-contain drop-shadow-lg sm:h-32 sm:w-32"
            />
            <h1 className="relative z-10 max-w-3xl font-sans text-2xl font-extrabold uppercase tracking-wide text-white drop-shadow-[0_2px_3px_rgba(20,83,45,0.9)] sm:text-4xl">
              Pateros Technological College
            </h1>
          </div>
        )}
        <div>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            About PTC
          </h1>
        </div>
        <AboutUsVideo />
        <div className="mx-auto max-w-5xl space-y-5 px-3 text-base leading-8 text-white/90 sm:px-7">
          {ptcHistory.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <section aria-labelledby="ptc-president-heading" className="space-y-4">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-100">
              2017–Present
            </p>
            <h2
              id="ptc-president-heading"
              className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl"
            >
              THE PRESIDENT
            </h2>
          </div>
          <article className="mx-auto flex w-full max-w-md flex-col items-center gap-5 p-4 text-center sm:p-6">
            <figure className="flex w-full max-w-[320px] items-center justify-center overflow-hidden rounded-2xl">
              <img
                src={currentPresidentImage}
                alt="Dr. Analiza F. Arcega"
                className="portal-interactive-image max-h-[420px] w-full rounded-xl object-contain"
                loading="lazy"
              />
            </figure>
            <div>
              <h3 className="font-display text-2xl font-semibold text-white">
                Dr. Analiza F. Arcega
              </h3>
              <p className="mt-2 text-base leading-relaxed text-white/75">
                LPT, RGC, CSASS
              </p>
            </div>
          </article>
        </section>
        <section aria-labelledby="ptc-former-administrators-heading" className="space-y-4">
          <h2
            id="ptc-former-administrators-heading"
            className="text-center font-display text-2xl font-semibold text-white sm:text-3xl"
          >
            FORMER ADMINISTRATORS
          </h2>
          <div className="portal-stagger grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {formerAdministrators.map((administrator) => (
              <figure
                key={administrator.src}
                className="group aspect-[0.64] overflow-hidden rounded-xl"
              >
                <img
                  src={administrator.src}
                  alt={administrator.alt}
                  className="portal-interactive-image h-full w-full object-fill"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </section>
        <section
          aria-labelledby="ptc-core-values-heading"
          className="py-4 text-white"
        >
          <h2
            id="ptc-core-values-heading"
            className="text-center font-display text-2xl font-semibold sm:text-3xl"
          >
            CORE VALUES
          </h2>
          <ul className="portal-stagger mx-auto mt-5 w-fit list-disc space-y-1 pl-5 text-left text-base font-semibold sm:text-lg">
            <li>Responsibility</li>
            <li>Creativity</li>
            <li>Integrity</li>
            <li>Commitment</li>
            <li>Compassion</li>
            <li>Excellence</li>
            <li>Environment Concern</li>
          </ul>
        </section>
        <section aria-label="PTC hymns" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <article
              aria-labelledby="himno-ng-pateros-heading"
              className="px-3 py-4 text-center text-white/90 sm:px-5"
            >
              <h3
                id="himno-ng-pateros-heading"
                className="font-display text-xl font-semibold text-white sm:text-2xl"
              >
                Himno ng Pateros
              </h3>
              <HymnVideo videoId="043Qg3HSpZU" title="Himno ng Pateros" />
              <div className="mt-5 space-y-5 text-sm leading-7 sm:text-base">
                <p>
                  Bayan ng Pateros, ayon sa kasaysayan
                  <br />
                  Lahing magiting, kanyang pinagmulan
                  <br />
                  May sakahang lupa, may ilog na daluyan
                  <br />
                  Kinagisnang gawain ay pag-iitikan
                </p>
                <p>
                  <span className="font-semibold text-white">KORO</span>
                  <br />
                  Pateros, Pateros maunlad ang Bayan ko
                  <br />
                  Sa ekonomiya at yamang pantao
                  <br />
                  Nakikiisa ako sa mithi at prinsipyo
                  <br />
                  Pateros, Pateros isusulong
                </p>
                <p>
                  Aking lakas, sipag, talino at tiyaga
                  <br />
                  Puhunan ng lahat para sa paggawa
                  <br />
                  May dangal na taglay sa puso’t diwa
                  <br />
                  Mamamayan niya’y huwaran ng madla
                </p>
                <p>
                  <span className="font-semibold text-white">KORO 2X</span>
                  <br />
                  Pateros, Pateros maunlad ang Bayan ko
                  <br />
                  Sa ekonomiya at yamang pantao
                  <br />
                  Nakikiisa ako sa mithi at prinsipyo
                  <br />
                  Pateros, Pateros isusulong
                  <br />
                  Pateros, Pateros isusulong tagumpay mo
                </p>
              </div>
            </article>
            <article
              aria-labelledby="ptc-hymn-heading"
              className="px-3 py-4 text-center text-white/90 sm:px-5"
            >
              <h3
                id="ptc-hymn-heading"
                className="font-display text-xl font-semibold text-white sm:text-2xl"
              >
                PTC Hymn
              </h3>
              <HymnVideo videoId="cUjVz5y5w4k" title="PTC Hymn" />
              <div className="mt-5 space-y-5 text-sm leading-7 sm:text-base">
                <p>
                  <span className="font-semibold text-white">I</span>
                  <br />
                  Paaralan naming mahal
                  <br />
                  Ikaw ang aming patnubay
                  <br />
                  Tungo sa kinabukasan
                  <br />
                  Taglay ang karunungan
                </p>
                <p>
                  <span className="font-semibold text-white">(KORO)</span>
                  <br />
                  PTC ikaw ang ilaw
                  <br />
                  Salamat sa iyong aral
                  <br />
                  Pagmamahal sa iyo ay taglay
                  <br />
                  Sa alaala lagi ay buhay
                </p>
                <p>
                  <span className="font-semibold text-white">II</span>
                  <br />
                  PTC ikaw ang gabay
                  <br />
                  Simbolo ka ng tagumpay
                  <br />
                  Kabataan ito ang alay
                  <br />
                  Ligaya’y magulang ang kaakbay
                </p>
                <p>
                  <span className="font-semibold text-white">(Ulitin ang KORO)</span>
                </p>
              </div>
            </article>
          </div>
        </section>
        <div className="portal-stagger grid gap-4 sm:grid-cols-2 sm:gap-5">
          {landingImages.map((image) => (
            <figure
              key={image.src}
              className="group aspect-[1.4] overflow-hidden rounded-2xl"
            >
              <img
                src={image.src}
                alt={image.alt}
                className={`portal-interactive-image h-full w-full object-fill ${image.trimEdge ? 'scale-[1.02]' : ''}`}
                loading="lazy"
              />
            </figure>
          ))}
        </div>
        <section aria-labelledby="ptc-board-of-trustees-heading" className="space-y-5">
          <h2
            id="ptc-board-of-trustees-heading"
            className="text-center font-display text-2xl font-semibold text-white sm:text-3xl"
          >
            Board of Trustees
          </h2>
          {boardOfTrusteeRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="portal-stagger flex flex-wrap justify-center gap-3 sm:gap-4"
            >
              {row.map((trustee) => (
                <div
                  key={trustee.name}
                  className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
                >
                  <article className="flex h-full flex-col items-center p-4 text-center">
                    <div className="relative mb-3 h-28 w-28 shrink-0 overflow-hidden rounded-full border border-white/20">
                      {trustee.image ? (
                        <img
                          src={trustee.image}
                          alt={`Portrait of ${trustee.name}`}
                          className={
                            trustee.cropScale !== undefined
                              ? 'absolute left-1/2 top-[-5px] max-w-none -translate-x-1/2'
                              : 'absolute inset-0 h-full w-full object-cover object-top'
                          }
                          style={
                            trustee.cropScale !== undefined
                              ? { width: `${trustee.cropScale}%` }
                              : undefined
                          }
                          loading="lazy"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="flex h-full w-full items-center justify-center font-display text-3xl font-semibold text-white/80"
                        >
                          EP
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold leading-snug text-white sm:text-base">
                      {trustee.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-white/75 sm:text-sm">
                      {trustee.role}
                    </p>
                  </article>
                </div>
              ))}
            </div>
          ))}
        </section>
        {scrollToAbout && (
          <div className="relative flex min-h-64 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-emerald-950 px-5 py-8 text-center shadow-lg sm:min-h-80 sm:gap-4">
            <img
              src={CAMPUS_HERO_IMAGE}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
            />
            <div className="absolute inset-0 bg-emerald-950/60" />
            <img
              src={ptcLogo}
              alt="Pateros Technological College seal"
              className="relative z-10 h-24 w-24 object-contain drop-shadow-lg sm:h-32 sm:w-32"
            />
            <h1 className="relative z-10 max-w-3xl font-sans text-2xl font-extrabold uppercase tracking-wide text-white drop-shadow-[0_2px_3px_rgba(20,83,45,0.9)] sm:text-4xl">
              Pateros Technological College
            </h1>
          </div>
        )}
        <section aria-label="Partner institution websites" className="grid gap-3 sm:grid-cols-2">
          {partnerLinks.map((link) => (
            <a
              key={link.acronym}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 items-center gap-4 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white/90 shadow-sm backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 px-1 text-center text-[9px] font-extrabold leading-tight text-emerald-950"
              >
                {link.acronym}
              </span>
              <span className="min-w-0 break-all text-sm font-semibold sm:text-base">
                {link.label}
              </span>
            </a>
          ))}
        </section>
      </section>
      )}
    </main>
  );
}
