export type OrgCategory =
  | 'Governance & Media'
  | 'Technology & Academics'
  | 'Business & Leadership'
  | 'Athletics & Arts';

export interface OrganizationConfig {
  code: string;
  shortName: string;
  fullName: string;
  aboutText?: string;
  president: string;
  scope: string;
  category: OrgCategory;
  email: string;
  envUrlKey: string;
  envTokenKey: string;
  uidEnvKey: string;
  accentColor: string;
  foundedYear: string;
  officeLocation: string;
  mission: string;
}

export const CESSCA_ADMIN_EMAIL = 'cessca.admin@ptc.edu.ph';
export const CESSCA_ADMIN_NAME = 'CESSCA Super Administrator';

export const ORGANIZATIONS: OrganizationConfig[] = [
  {
    code: 'ssc',
    shortName: 'SSC',
    fullName: 'Supreme Student Council',
    president: 'Shane Pol',
    scope: 'Supreme Student Council',
    category: 'Governance & Media',
    email: 'shane.pol@ptc.edu.ph',
    envUrlKey: 'TURSO_DATABASE_URL_SSC',
    envTokenKey: 'TURSO_AUTH_TOKEN_SSC',
    uidEnvKey: 'OFFICER_UID_SSC',
    accentColor: '#1E3A8A',
    foundedYear: '1993',
    officeLocation: 'Student Center, Room 201',
    mission:
      'The highest governing student body of Pateros Technological College, championing student welfare, transparent campus governance, and institutional initiatives.',
  },
  {
    code: 'plumage',
    shortName: 'Plumage',
    fullName: 'The Plumage Student Publication',
    president: 'Nicole Sam Francisco',
    scope: 'Student Publication / Media',
    category: 'Governance & Media',
    email: 'nicole.francisco@ptc.edu.ph',
    envUrlKey: 'TURSO_DATABASE_URL_PLUMAGE',
    envTokenKey: 'TURSO_AUTH_TOKEN_PLUMAGE',
    uidEnvKey: 'OFFICER_UID_PLUMAGE',
    accentColor: '#7C2D12',
    foundedYear: '1996',
    officeLocation: 'Academic Wing, Press Room 104',
    mission:
      'The official student publication and campus media arm of PTC, dedicated to fearless campus journalism, literary craft, and visual storytelling.',
  },
  {
    code: 'image',
    shortName: 'IMAGE',
    fullName: 'Information Technology & Graphics Guild',
    president: 'Gab',
    scope: 'Information Technology / Graphics Guild',
    category: 'Technology & Academics',
    email: 'gab@ptc.edu.ph',
    envUrlKey: 'TURSO_DATABASE_URL_IMAGE',
    envTokenKey: 'TURSO_AUTH_TOKEN_IMAGE',
    uidEnvKey: 'OFFICER_UID_IMAGE',
    accentColor: '#0F766E',
    foundedYear: '2008',
    officeLocation: 'IT Innovation Lab, 3rd Floor',
    mission:
      'Empowering PTC creatives and technologists through multimedia design, UI/UX workshops, digital illustration, and campus visual production.',
  },
  {
    code: 'athletes',
    shortName: 'Athletes',
    fullName: 'PTC Sports & Athletics Organization',
    president: 'Leonard Bertulfo',
    scope: 'Sports and Athletics Organization',
    category: 'Athletics & Arts',
    email: 'leonard.bertulfo@ptc.edu.ph',
    envUrlKey: 'TURSO_DATABASE_URL_ATHLETES',
    envTokenKey: 'TURSO_AUTH_TOKEN_ATHLETES',
    uidEnvKey: 'OFFICER_UID_ATHLETES',
    accentColor: '#B45309',
    foundedYear: '2001',
    officeLocation: 'PTC Covered Court Annex',
    mission:
      'Uniting student-athletes across varsity disciplines, organizing annual intramurals, and fostering sportsmanship and athletic excellence.',
  },
  {
    code: 'jpasaps',
    shortName: 'JPASAPS',
    fullName: 'Junior Philippine Association of Administrative Professionals and Secretaries',
    president: 'Ethel Tangente',
    scope: 'Junior Philippine Association of Administrative Professionals and Secretaries',
    category: 'Business & Leadership',
    email: 'ethel.tangente@ptc.edu.ph',
    envUrlKey: 'TURSO_DATABASE_URL_JPASAPS',
    envTokenKey: 'TURSO_AUTH_TOKEN_JPASAPS',
    uidEnvKey: 'OFFICER_UID_JPASAPS',
    accentColor: '#4338CA',
    foundedYear: '2005',
    officeLocation: 'Office Administration Hall, Room 108',
    mission:
      'Preparing future administrative professionals with executive communication training, organizational leadership seminars, and industry readiness.',
  },
  {
    code: 'jpcs',
    shortName: 'JPCS',
    fullName: 'Junior Philippine Computer Society',
    president: 'Hersy M. Baluyos',
    scope: 'Junior Philippine Computer Society',
    category: 'Technology & Academics',
    email: 'hersy.baluyos@ptc.edu.ph',
    envUrlKey: 'TURSO_DATABASE_URL_JPCS',
    envTokenKey: 'TURSO_AUTH_TOKEN_JPCS',
    uidEnvKey: 'OFFICER_UID_JPCS',
    accentColor: '#1D4ED8',
    foundedYear: '2004',
    officeLocation: 'Computing Studies Hub, Lab 2',
    mission:
      'The official PTC student chapter advancing software engineering, competitive programming, hackathons, and technical peer mentorship.',
  },
  {
    code: 'pmo',
    shortName: 'PMO',
    fullName: 'Peer Mentors Organization',
    president: 'Mark Rabara',
    scope: 'Peer facilitators / Peer Mentors Organization',
    category: 'Business & Leadership',
    email: 'mark.rabara@ptc.edu.ph',
    envUrlKey: 'TURSO_DATABASE_URL_PMO',
    envTokenKey: 'TURSO_AUTH_TOKEN_PMO',
    uidEnvKey: 'OFFICER_UID_PMO',
    accentColor: '#047857',
    foundedYear: '2011',
    officeLocation: 'Guidance & Counseling Center',
    mission:
      'Supporting student well-being, academic transition for freshmen, and mental health advocacy through trained peer facilitation.',
  },
  {
    code: 'sfhre',
    shortName: 'SFHRE',
    fullName: 'Society of Future Human Resource Educators',
    president: 'Andrea Marie S. Armenta',
    scope: 'Society of Future Human Resource Educators',
    category: 'Business & Leadership',
    email: 'andrea.armenta@ptc.edu.ph',
    envUrlKey: 'TURSO_DATABASE_URL_SFHRE',
    envTokenKey: 'TURSO_AUTH_TOKEN_SFHRE',
    uidEnvKey: 'OFFICER_UID_SFHRE',
    accentColor: '#9A3412',
    foundedYear: '2012',
    officeLocation: 'Business & Education Wing, Room 205',
    mission:
      'Cultivating ethical people-management leaders and human resource practitioners through career clinics and talent symposiums.',
  },
  {
    code: 'gifted',
    shortName: 'Gifted',
    fullName: 'Gifted Academic & Special Interest Guild',
    president: 'Dars Corbes',
    scope: 'Academic / Special Interest Guild',
    category: 'Technology & Academics',
    email: 'dars.corbes@ptc.edu.ph',
    envUrlKey: 'TURSO_DATABASE_URL_GIFTED',
    envTokenKey: 'TURSO_AUTH_TOKEN_GIFTED',
    uidEnvKey: 'OFFICER_UID_GIFTED',
    accentColor: '#6D28D9',
    foundedYear: '2014',
    officeLocation: 'College Library Commons',
    mission:
      'Nurturing scholarly inquiry, quiz bee teams, interdisciplinary research circles, and academic mentorship across PTC departments.',
  },
  {
    code: 'ug',
    shortName: 'U.G',
    fullName: 'Undergraduate General Organization',
    president: 'John Carlo De Vera',
    scope: 'Undergraduate / General Organization',
    category: 'Governance & Media',
    email: 'johncarlo.devera@ptc.edu.ph',
    envUrlKey: 'TURSO_DATABASE_URL_UG',
    envTokenKey: 'TURSO_AUTH_TOKEN_UG',
    uidEnvKey: 'OFFICER_UID_UG',
    accentColor: '#374151',
    foundedYear: '2007',
    officeLocation: 'Student Center, Room 102',
    mission:
      'Connecting undergraduate cohorts across programs through community outreach, campus-wide fellowship, and civic volunteerism.',
  },
  {
    code: 'chambers',
    shortName: 'Chambers',
    fullName: 'Chambers Chorale & Performing Arts',
    president: 'Princess Charlene Longcop',
    scope: 'Chorale / Performing Arts',
    category: 'Athletics & Arts',
    email: 'princess.longcop@ptc.edu.ph',
    envUrlKey: 'TURSO_DATABASE_URL_CHAMBERS',
    envTokenKey: 'TURSO_AUTH_TOKEN_CHAMBERS',
    uidEnvKey: 'OFFICER_UID_CHAMBERS',
    accentColor: '#9F1239',
    foundedYear: '2002',
    officeLocation: 'Cultural Arts Studio, 2nd Floor',
    mission:
      'Representing PTC in choral harmonies, theater showcases, and cultural arts festivals throughout Metro Manila.',
  },
  {
    code: 'dlc',
    shortName: 'DLC',
    fullName: 'Debate and Leadership Club',
    president: 'Juztine Reyes',
    scope: 'Debate and Leadership Club',
    category: 'Business & Leadership',
    email: 'juztine.reyes@ptc.edu.ph',
    envUrlKey: 'TURSO_DATABASE_URL_DLC',
    envTokenKey: 'TURSO_AUTH_TOKEN_DLC',
    uidEnvKey: 'OFFICER_UID_DLC',
    accentColor: '#1E40AF',
    foundedYear: '2015',
    officeLocation: 'Humanities Seminar Room 302',
    mission:
      'Sharpening critical argumentation, parliamentary debate, and principled public speaking for tomorrow’s civic leaders.',
  },
];

export function getOrgByCode(code: string): OrganizationConfig | undefined {
  const normalized = code.trim().toLowerCase().replace(/\./g, '');
  return ORGANIZATIONS.find(
    (org) => org.code.toLowerCase() === normalized || org.shortName.toLowerCase().replace(/\./g, '') === normalized
  );
}

export function getOrgByEmail(email: string): OrganizationConfig | undefined {
  const normalized = email.trim().toLowerCase();
  return ORGANIZATIONS.find((org) => org.email.toLowerCase() === normalized);
}
