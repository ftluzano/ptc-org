import { createClient, type Client } from '@libsql/client';
import fs from 'node:fs';
import path from 'node:path';
import { ORGANIZATIONS, getOrgByCode } from '../config/org-config.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const ORG_DB_DIR = path.join(DATA_DIR, 'orgs');

const orgClients = new Map<string, Client>();
let centralClient: Client | null = null;

function ensureDataDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ORG_DB_DIR)) {
    fs.mkdirSync(ORG_DB_DIR, { recursive: true });
  }
}

/**
 * Dynamic Turso / libSQL Client Helper
 * Resolves dedicated Turso credentials from environment variables (TURSO_DATABASE_URL_<CODE>)
 * or provisions an isolated 1-to-1 local SQLite database file per organization.
 */
export function getOrgDb(orgCode: string): Client {
  const org = getOrgByCode(orgCode);
  if (!org) {
    throw new Error(`Unknown organization code: ${orgCode}`);
  }

  const cached = orgClients.get(org.code);
  if (cached) return cached;

  ensureDataDirs();

  const envUrl = process.env[org.envUrlKey];
  const envToken = process.env[org.envTokenKey];

  const client = envUrl
    ? createClient({
        url: envUrl,
        authToken: envToken || undefined,
      })
    : createClient({
        url: `file:${path.join(ORG_DB_DIR, `org_${org.code}.db`)}`,
      });

  orgClients.set(org.code, client);
  return client;
}

/**
 * Central CESSCA Administration & Global Moderation Queue Client
 */
export function getCentralDb(): Client {
  if (centralClient) return centralClient;

  ensureDataDirs();

  const envUrl = process.env.TURSO_DATABASE_URL_CESSCA;
  const envToken = process.env.TURSO_AUTH_TOKEN_CESSCA;

  centralClient = envUrl
    ? createClient({
        url: envUrl,
        authToken: envToken || undefined,
      })
    : createClient({
        url: `file:${path.join(DATA_DIR, 'cessca_central.db')}`,
      });

  return centralClient;
}

interface SeedEntry {
  id: string;
  letterRef: string;
  orgCode: string;
  title: string;
  eventDate: string;
  caption: string;
  imageUrl: string | null;
  status: 'approved' | 'pending' | 'rejected';
  feedback: string | null;
  likesCount: number;
  createdAt: string;
  reviewedAt: string | null;
}

const INITIAL_SEED_POSTS: SeedEntry[] = [
  {
    id: 'post_ssc_001',
    letterRef: 'LTR-2026-0101',
    orgCode: 'ssc',
    title: 'PTC General Student Assembly & Campus Charter Forum',
    eventDate: '2026-11-21',
    caption:
      'All undergraduate officers and block representatives are invited to the First Semester General Assembly at the Main Auditorium. We will present the student welfare budget, updated campus facility schedules, and open-floor Q&A with student council committees.',
    imageUrl: 'seed:student_council',
    status: 'approved',
    feedback: 'Approved for campus-wide bulletin and SSC official feed.',
    likesCount: 48,
    createdAt: '2026-11-10T09:15:00.000Z',
    reviewedAt: '2026-11-10T11:30:00.000Z',
  },
  {
    id: 'post_jpcs_001',
    letterRef: 'LTR-2026-0102',
    orgCode: 'jpcs',
    title: 'PTC CodeSprint 2026: Collegiate Web & Systems Hackathon',
    eventDate: '2026-11-28',
    caption:
      'Registration is officially open for teams of 3 to 4 BSIT and BSCS students! Build practical civic and campus productivity tools during our 8-hour sprint at Computing Lab 2. Mentors, snacks, and certificates of participation will be provided.',
    imageUrl: 'seed:tech_hackathon',
    status: 'approved',
    feedback: 'Cleared by CESSCA. Lab reservation confirmed.',
    likesCount: 64,
    createdAt: '2026-11-11T14:20:00.000Z',
    reviewedAt: '2026-11-11T16:05:00.000Z',
  },
  {
    id: 'post_athletes_001',
    letterRef: 'LTR-2026-0103',
    orgCode: 'athletes',
    title: '2026 Intramural Basketball & Volleyball Opening Tip-Off',
    eventDate: '2026-12-04',
    caption:
      'Lace up and represent your department! The PTC Intramural Games kick off at 8:00 AM in the Covered Court with the Parade of Athletes followed by Men’s Basketball and Women’s Volleyball elimination matches. Bring your department colors!',
    imageUrl: 'seed:sports_intramurals',
    status: 'approved',
    feedback: 'Approved. Coordinate marshals with CESSCA athletics desk.',
    likesCount: 82,
    createdAt: '2026-11-12T08:45:00.000Z',
    reviewedAt: '2026-11-12T10:15:00.000Z',
  },
  {
    id: 'post_plumage_001',
    letterRef: 'LTR-2026-0104',
    orgCode: 'plumage',
    title: 'Call for Contributors: The Plumage Folio & Literary Issue',
    eventDate: '2026-11-25',
    caption:
      'The Plumage editorial board is accepting news features, photojournalism essays, poetry, and editorial cartoons for our mid-semester broadsheet release. Drop by Press Room 104 or submit drafts before November 25.',
    imageUrl: 'seed:campus_press',
    status: 'approved',
    feedback: 'Approved for publication.',
    likesCount: 37,
    createdAt: '2026-11-12T15:10:00.000Z',
    reviewedAt: '2026-11-12T17:00:00.000Z',
  },
  {
    id: 'post_image_001',
    letterRef: 'LTR-2026-0105',
    orgCode: 'image',
    title: 'Typography & Layout Systems Workshop for Student Creatives',
    eventDate: '2026-11-30',
    caption:
      'Learn how to craft clean publication posters, event visual identities, and accessible UI prototypes with IMAGE officers. Open to all PTC students interested in digital media and graphic design.',
    imageUrl: 'seed:campus_banner',
    status: 'approved',
    feedback: 'Approved.',
    likesCount: 29,
    createdAt: '2026-11-13T10:00:00.000Z',
    reviewedAt: '2026-11-13T11:45:00.000Z',
  },
  {
    id: 'post_jpcs_pending_002',
    letterRef: 'LTR-2026-0106',
    orgCode: 'jpcs',
    title: 'Git & Collaborative DevOps Peer Study Session',
    eventDate: '2026-12-06',
    caption:
      'Requesting approval to host an afternoon hands-on workshop covering pull requests, branching workflows, and SQLite/Turso deployment fundamentals for second-year IT students.',
    imageUrl: 'seed:tech_hackathon',
    status: 'pending',
    feedback: null,
    likesCount: 0,
    createdAt: '2026-11-14T06:20:00.000Z',
    reviewedAt: null,
  },
  {
    id: 'post_dlc_pending_001',
    letterRef: 'LTR-2026-0107',
    orgCode: 'dlc',
    title: 'Inter-Department Parliamentary Debate Exhibition',
    eventDate: '2026-12-09',
    caption:
      'The Debate and Leadership Club submits this event letter for the upcoming British Parliamentary format exhibition match on digital literacy and youth civic participation.',
    imageUrl: 'seed:student_council',
    status: 'pending',
    feedback: null,
    likesCount: 0,
    createdAt: '2026-11-14T06:45:00.000Z',
    reviewedAt: null,
  },
  {
    id: 'post_chambers_pending_001',
    letterRef: 'LTR-2026-0108',
    orgCode: 'chambers',
    title: 'Winter Acoustic Evening & Chorale Recital',
    eventDate: '2026-12-15',
    caption:
      'PTC Chambers requests clearance for an evening acoustic showcase at the Campus Courtyard featuring classical choral arrangements and student soloists.',
    imageUrl: 'seed:campus_banner',
    status: 'pending',
    feedback: null,
    likesCount: 0,
    createdAt: '2026-11-14T07:05:00.000Z',
    reviewedAt: null,
  },
];

let initialized = false;

export async function initializeAllDatabases() {
  if (initialized) return;

  const central = getCentralDb();
  await central.execute(`
    CREATE TABLE IF NOT EXISTS cessca_queue (
      id TEXT PRIMARY KEY,
      letter_ref TEXT NOT NULL,
      org_code TEXT NOT NULL,
      org_short_name TEXT NOT NULL,
      org_full_name TEXT NOT NULL,
      president_name TEXT NOT NULL,
      title TEXT NOT NULL,
      event_date TEXT NOT NULL,
      caption TEXT NOT NULL,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      feedback TEXT,
      submitted_at TEXT NOT NULL,
      reviewed_at TEXT,
      reviewed_by TEXT
    )
  `);

  await central.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      uid TEXT NOT NULL,
      email TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL,
      org_code TEXT,
      created_at TEXT NOT NULL
    )
  `);

  for (const org of ORGANIZATIONS) {
    const db = getOrgDb(org.code);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        letter_ref TEXT NOT NULL,
        org_code TEXT NOT NULL,
        author_name TEXT NOT NULL,
        title TEXT NOT NULL,
        event_date TEXT NOT NULL,
        caption TEXT NOT NULL,
        image_url TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        feedback TEXT,
        likes_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        reviewed_at TEXT
      )
    `);
  }

  // Seed initial realistic PTC announcements only if central queue is completely empty
  const existingCountResult = await central.execute('SELECT COUNT(*) as cnt FROM cessca_queue');
  const existingCount = Number(existingCountResult.rows[0]?.cnt ?? 0);

  if (existingCount === 0) {
    for (const item of INITIAL_SEED_POSTS) {
      const org = getOrgByCode(item.orgCode);
      if (!org) continue;

      const orgDb = getOrgDb(org.code);
      await orgDb.execute({
        sql: `INSERT OR IGNORE INTO posts (
          id, letter_ref, org_code, author_name, title, event_date, caption, image_url, status, feedback, likes_count, created_at, reviewed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          item.id,
          item.letterRef,
          org.code,
          org.president,
          item.title,
          item.eventDate,
          item.caption,
          item.imageUrl,
          item.status,
          item.feedback,
          item.likesCount,
          item.createdAt,
          item.reviewedAt,
        ],
      });

      await central.execute({
        sql: `INSERT OR IGNORE INTO cessca_queue (
          id, letter_ref, org_code, org_short_name, org_full_name, president_name, title, event_date, caption, image_url, status, feedback, submitted_at, reviewed_at, reviewed_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          item.id,
          item.letterRef,
          org.code,
          org.shortName,
          org.fullName,
          org.president,
          item.title,
          item.eventDate,
          item.caption,
          item.imageUrl,
          item.status,
          item.feedback,
          item.createdAt,
          item.reviewedAt,
          item.status === 'approved' ? 'CESSCA Super Administrator' : null,
        ],
      });
    }
  }

  initialized = true;
}
