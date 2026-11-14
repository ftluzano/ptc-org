import campusBannerImg from '../assets/images/ptc image.png';

const SEED_IMAGE_MAP: Record<string, string | null> = {
  'seed:campus_banner': campusBannerImg,
  'seed:tech_hackathon': null,
  'seed:sports_intramurals': null,
  'seed:student_council': null,
  'seed:campus_press': null,
};

export const CAMPUS_HERO_IMAGE = campusBannerImg;

export function resolvePostImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  if (Object.hasOwn(SEED_IMAGE_MAP, imageUrl)) {
    return SEED_IMAGE_MAP[imageUrl];
  }
  return imageUrl;
}
