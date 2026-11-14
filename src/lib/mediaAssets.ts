import campusBannerImg from '../assets/images/ptc_campus_banner_1794670267437.jpg';
import techHackathonImg from '../assets/images/event_tech_hackathon_1794670267342.jpg';
import sportsIntramuralsImg from '../assets/images/event_sports_intramurals_1794670268031.jpg';
import studentCouncilImg from '../assets/images/event_student_council_1794670268205.jpg';
import campusPressImg from '../assets/images/event_campus_press_1794670268727.jpg';

const SEED_IMAGE_MAP: Record<string, string> = {
  'seed:campus_banner': campusBannerImg,
  'seed:tech_hackathon': techHackathonImg,
  'seed:sports_intramurals': sportsIntramuralsImg,
  'seed:student_council': studentCouncilImg,
  'seed:campus_press': campusPressImg,
};

export const CAMPUS_HERO_IMAGE = campusBannerImg;

export function resolvePostImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  if (SEED_IMAGE_MAP[imageUrl]) {
    return SEED_IMAGE_MAP[imageUrl];
  }
  return imageUrl;
}
