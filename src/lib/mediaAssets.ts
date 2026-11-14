import campusBannerImg from '../assets/images/ptc image.png';

export const CAMPUS_HERO_IMAGE = campusBannerImg;

export function resolvePostImageUrl(imageUrl?: string | null): string | null {
  return imageUrl && !imageUrl.startsWith('seed:') ? imageUrl : null;
}
