import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { createServer as createViteServer } from 'vite';
import {
  ORGANIZATIONS,
  CESSCA_ADMIN_EMAIL,
  CESSCA_ADMIN_NAME,
  getOrgByCode,
  getOrgByEmail,
} from './src/config/org-config.ts';
import { getCentralDb, getOrgDb, initializeAllDatabases } from './src/lib/turso.ts';
import type {
  AuthUser,
  OrganizationProfile,
  OrgPost,
  SubmissionQueueItem,
} from './src/types/portal.ts';

const PORT = Number(process.env.PORT || 3000);
const UPLOADS_DIR = path.resolve(process.cwd(), 'data', 'uploads');

interface AuthenticatedRequest extends Request {
  authUser?: AuthUser | null;
  authError?: string;
}

function getFirebaseAdminAuth() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is required to verify Firebase ID tokens.');
  }

  const rawAccount: unknown = JSON.parse(serviceAccountJson);
  if (typeof rawAccount !== 'object' || rawAccount === null) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain a service-account object.');
  }
  const accountFields = rawAccount as Record<string, unknown>;
  const projectId = process.env.FIREBASE_PROJECT_ID || accountFields.project_id;
  const clientEmail = accountFields.client_email;
  const privateKey = accountFields.private_key;
  if (
    typeof projectId !== 'string' ||
    typeof clientEmail !== 'string' ||
    typeof privateKey !== 'string'
  ) {
    throw new Error('Firebase service-account JSON is missing project_id, client_email, or private_key.');
  }

  const existingApp = getApps().find((app) => app.name === 'ptc-org-auth');
  const app =
    existingApp ??
    initializeApp(
      {
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        } satisfies ServiceAccount),
        projectId,
      },
      'ptc-org-auth'
    );
  return getAdminAuth(app);
}

async function resolveFirebaseUser(token: string): Promise<AuthUser | null> {
  const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);
  const email = decodedToken.email?.trim().toLowerCase();
  if (!email || !decodedToken.email_verified) return null;

  if (email === CESSCA_ADMIN_EMAIL.toLowerCase()) {
    return {
      uid: decodedToken.uid,
      email,
      displayName: CESSCA_ADMIN_NAME,
      role: 'cessca',
      orgCode: null,
    };
  }

  const org = getOrgByEmail(email);
  if (!org) return null;
  return {
    uid: decodedToken.uid,
    email: org.email,
    displayName: org.president,
    role: 'president',
    orgCode: org.code,
  };
}

async function resolveFirebaseAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    if (!token) {
      req.authUser = null;
      return next();
    }
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      req.authUser = null;
      req.authError = 'Firebase Admin authentication is not configured on the server.';
      return next();
    }
    req.authUser = await resolveFirebaseUser(token);
    return next();
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    req.authUser = null;
    return next();
  }
}

function mapRowToOrganizationProfile(
  row?: Record<string, unknown>
): OrganizationProfile {
  return {
    bannerDataUrl: row?.banner_data_url ? String(row.banner_data_url) : null,
    avatarDataUrl: row?.avatar_data_url ? String(row.avatar_data_url) : null,
  };
}

function mapRowToOrgPost(row: Record<string, unknown>, orgCode: string): OrgPost {
  const org = getOrgByCode(orgCode);
  return {
    id: String(row.id),
    letterRef: String(row.letter_ref),
    orgCode: String(row.org_code),
    orgShortName: org?.shortName ?? orgCode.toUpperCase(),
    orgFullName: org?.fullName ?? orgCode.toUpperCase(),
    authorName: String(row.author_name),
    title: String(row.title),
    eventDate: String(row.event_date),
    caption: String(row.caption),
    imageUrl: row.image_url ? String(row.image_url) : null,
    status: String(row.status) as OrgPost['status'],
    feedback: row.feedback ? String(row.feedback) : null,
    likesCount: Number(row.likes_count ?? 0),
    createdAt: String(row.created_at),
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : null,
  };
}

function mapRowToQueueItem(row: Record<string, unknown>): SubmissionQueueItem {
  return {
    id: String(row.id),
    letterRef: String(row.letter_ref),
    orgCode: String(row.org_code),
    orgShortName: String(row.org_short_name),
    orgFullName: String(row.org_full_name),
    presidentName: String(row.president_name),
    title: String(row.title),
    eventDate: String(row.event_date),
    caption: String(row.caption),
    imageUrl: row.image_url ? String(row.image_url) : null,
    status: String(row.status) as SubmissionQueueItem['status'],
    feedback: row.feedback ? String(row.feedback) : null,
    submittedAt: String(row.submitted_at),
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : null,
    reviewedBy: row.reviewed_by ? String(row.reviewed_by) : null,
  };
}

async function startServer() {
  await initializeAllDatabases();
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));
  app.use(resolveFirebaseAuth);

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Auth: Resolve the Firebase account to an allow-listed portal role.
  app.get('/api/auth/me', (req: AuthenticatedRequest, res) => {
    if (req.authError) {
      return res.status(503).json({ user: null, error: req.authError });
    }
    res.json({ user: req.authUser ?? null });
  });

  // Upload event image (accepts base64 data URL from FileReader)
  app.post('/api/upload', async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.authUser || (req.authUser.role !== 'president' && req.authUser.role !== 'cessca')) {
        return res.status(403).json({ error: 'Only authenticated organization officers may upload media.' });
      }
      const dataUrl = String(req.body?.dataUrl ?? '');
      const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/);
      if (!match) {
        return res.status(400).json({ error: 'Invalid image format. Please upload a PNG, JPG, or WebP image.' });
      }
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.byteLength > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'Image must be 5 MB or smaller.' });
      }
      const filename = `event_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${ext}`;
      fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
      return res.json({ url: `/uploads/${filename}` });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Failed to upload image.' });
    }
  });

  // List all 12 organizations with live counts from their isolated libSQL databases
  app.get('/api/organizations', async (_req: Request, res: Response) => {
    try {
      const organizations = await Promise.all(
        ORGANIZATIONS.map(async (org) => {
          const db = getOrgDb(org.code);
          const approvedRes = await db.execute(
            "SELECT COUNT(*) as cnt, MAX(created_at) as latest FROM posts WHERE status = 'approved'"
          );
          const pendingRes = await db.execute(
            "SELECT COUNT(*) as cnt FROM posts WHERE status = 'pending'"
          );
          return {
            ...org,
            approvedCount: Number(approvedRes.rows[0]?.cnt ?? 0),
            pendingCount: Number(pendingRes.rows[0]?.cnt ?? 0),
            latestPostAt: approvedRes.rows[0]?.latest ? String(approvedRes.rows[0].latest) : null,
          };
        })
      );
      return res.json({ organizations });
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      return res.status(500).json({ error: 'Failed to load organizations.' });
    }
  });

  // Global approved feed across all 12 isolated organization databases
  app.get('/api/feed', async (req: Request, res: Response) => {
    try {
      const orgFilter = String(req.query.org ?? '').trim().toLowerCase();
      const targetOrgs = orgFilter
        ? ORGANIZATIONS.filter((o) => o.code === orgFilter)
        : ORGANIZATIONS;

      const allPosts: OrgPost[] = [];
      for (const org of targetOrgs) {
        const db = getOrgDb(org.code);
        const result = await db.execute(
          "SELECT * FROM posts WHERE status = 'approved' ORDER BY created_at DESC"
        );
        for (const row of result.rows) {
          allPosts.push(mapRowToOrgPost(row as unknown as Record<string, unknown>, org.code));
        }
      }

      allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.json({ posts: allPosts });
    } catch (error) {
      console.error('Failed to load global feed:', error);
      return res.status(500).json({ error: 'Failed to load global feed.' });
    }
  });

  // Public approved posts for a specific organization
  app.get('/api/organizations/:code/posts', async (req: Request, res: Response) => {
    try {
      const org = getOrgByCode(String(req.params.code));
      if (!org) {
        return res.status(404).json({ error: 'Organization not found.' });
      }
      const db = getOrgDb(org.code);
      const result = await db.execute(
        "SELECT * FROM posts WHERE status = 'approved' ORDER BY created_at DESC"
      );
      const posts = result.rows.map((row) =>
        mapRowToOrgPost(row as unknown as Record<string, unknown>, org.code)
      );
      return res.json({ organization: org, posts });
    } catch (error) {
      console.error('Failed to load organization posts:', error);
      return res.status(500).json({ error: 'Failed to load organization posts.' });
    }
  });

  app.get('/api/organizations/:code/profile', async (req: Request, res: Response) => {
    try {
      const org = getOrgByCode(String(req.params.code));
      if (!org) {
        return res.status(404).json({ error: 'Organization not found.' });
      }

      const db = getOrgDb(org.code);
      const result = await db.execute(
        'SELECT banner_data_url, avatar_data_url FROM organization_profile WHERE id = 1'
      );
      const row = result.rows[0] as unknown as Record<string, unknown> | undefined;
      return res.json({ profile: mapRowToOrganizationProfile(row) });
    } catch (error) {
      console.error('Failed to load organization profile:', error);
      return res.status(500).json({ error: 'Failed to load organization profile.' });
    }
  });

  app.put(
    '/api/organizations/:code/profile/:asset',
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const org = getOrgByCode(String(req.params.code));
        if (!org) {
          return res.status(404).json({ error: 'Organization not found.' });
        }

        const user = req.authUser;
        if (!user) {
          return res.status(401).json({ error: 'Please sign in as an organization officer.' });
        }
        if (user.role !== 'president' || user.orgCode !== org.code) {
          return res.status(403).json({ error: 'Only this organization’s officer can edit its profile.' });
        }

        const asset = String(req.params.asset);
        const column =
          asset === 'banner'
            ? 'banner_data_url'
            : asset === 'avatar'
              ? 'avatar_data_url'
              : null;
        if (!column) {
          return res.status(404).json({ error: 'Profile image type not found.' });
        }

        const dataUrl: unknown = req.body?.dataUrl;
        if (dataUrl !== null && typeof dataUrl !== 'string') {
          return res.status(400).json({ error: 'Provide an image data URL or null to remove it.' });
        }
        if (typeof dataUrl === 'string') {
          const match = dataUrl.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
          if (!match) {
            return res.status(400).json({ error: 'Use a PNG, JPEG, or WebP image.' });
          }
          const imageBytes = Buffer.from(match[2], 'base64');
          if (
            imageBytes.byteLength === 0 ||
            imageBytes.byteLength > 5 * 1024 * 1024 ||
            imageBytes.toString('base64') !== match[2]
          ) {
            return res.status(400).json({ error: 'Image must be valid and 5 MB or smaller.' });
          }
        }

        const db = getOrgDb(org.code);
        await db.execute({
          sql: `INSERT INTO organization_profile (id, ${column}, updated_at)
                VALUES (1, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                  ${column} = excluded.${column},
                  updated_at = excluded.updated_at`,
          args: [dataUrl, new Date().toISOString()],
        });
        const result = await db.execute(
          'SELECT banner_data_url, avatar_data_url FROM organization_profile WHERE id = 1'
        );
        const row = result.rows[0] as unknown as Record<string, unknown> | undefined;
        return res.json({ profile: mapRowToOrganizationProfile(row) });
      } catch (error) {
        console.error('Failed to update organization profile:', error);
        return res.status(500).json({ error: 'Failed to update organization profile.' });
      }
    }
  );

  // Officer-only: View all submissions (pending, approved, rejected) for their assigned org
  app.get('/api/organizations/:code/submissions', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const org = getOrgByCode(String(req.params.code));
      if (!org) {
        return res.status(404).json({ error: 'Organization not found.' });
      }
      const user = req.authUser;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required.' });
      }
      if (user.role !== 'cessca' && (user.role !== 'president' || user.orgCode !== org.code)) {
        return res.status(403).json({
          error: `Access restricted strictly to ${org.shortName} officer (${org.president}) or CESSCA.`,
        });
      }

      const db = getOrgDb(org.code);
      const result = await db.execute('SELECT * FROM posts ORDER BY created_at DESC');
      const submissions = result.rows.map((row) =>
        mapRowToOrgPost(row as unknown as Record<string, unknown>, org.code)
      );
      return res.json({ submissions });
    } catch (error) {
      console.error('Failed to load submissions:', error);
      return res.status(500).json({ error: 'Failed to load submissions.' });
    }
  });

  // Officer-only: Submit new event post as Pending Letter/Request to CESSCA
  app.post('/api/organizations/:code/posts', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const org = getOrgByCode(String(req.params.code));
      if (!org) {
        return res.status(404).json({ error: 'Organization not found.' });
      }
      const user = req.authUser;
      if (!user) {
        return res.status(401).json({ error: 'Please sign in as an organization officer to submit posts.' });
      }
      if (user.role !== 'president' || user.orgCode !== org.code) {
        return res.status(403).json({
          error: `Only ${org.president} (${org.shortName}) can submit event requests for this organization.`,
        });
      }

      const title = String(req.body?.title ?? '').trim();
      const eventDate = String(req.body?.eventDate ?? '').trim();
      const caption = String(req.body?.caption ?? '').trim();
      const imageUrl = req.body?.imageUrl ? String(req.body.imageUrl).trim() : null;

      if (!title || title.length < 3 || title.length > 160) {
        return res.status(400).json({ error: 'Event title must be between 3 and 160 characters.' });
      }
      if (!eventDate) {
        return res.status(400).json({ error: 'Event date is required.' });
      }
      if (!caption || caption.length < 10 || caption.length > 3000) {
        return res.status(400).json({ error: 'Caption must be between 10 and 3000 characters.' });
      }

      const id = `post_${org.code}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const letterRef = `LTR-2026-${randomNum}`;
      const now = new Date().toISOString();

      // 1. Save into the organization's dedicated libSQL database with status: 'pending'
      const orgDb = getOrgDb(org.code);
      await orgDb.execute({
        sql: `INSERT INTO posts (
          id, letter_ref, org_code, author_name, title, event_date, caption, image_url, status, feedback, likes_count, created_at, reviewed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, 0, ?, NULL)`,
        args: [id, letterRef, org.code, org.president, title, eventDate, caption, imageUrl, now],
      });

      // 2. Queue reference into the central CESSCA moderation database
      const centralDb = getCentralDb();
      await centralDb.execute({
        sql: `INSERT INTO cessca_queue (
          id, letter_ref, org_code, org_short_name, org_full_name, president_name, title, event_date, caption, image_url, status, feedback, submitted_at, reviewed_at, reviewed_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, ?, NULL, NULL)`,
        args: [
          id,
          letterRef,
          org.code,
          org.shortName,
          org.fullName,
          org.president,
          title,
          eventDate,
          caption,
          imageUrl,
          now,
        ],
      });

      return res.status(201).json({
        post: {
          id,
          letterRef,
          orgCode: org.code,
          orgShortName: org.shortName,
          orgFullName: org.fullName,
          authorName: org.president,
          title,
          eventDate,
          caption,
          imageUrl,
          status: 'pending',
          feedback: null,
          likesCount: 0,
          createdAt: now,
          reviewedAt: null,
        } satisfies OrgPost,
      });
    } catch (error) {
      console.error('Failed to submit post:', error);
      return res.status(500).json({ error: 'Failed to submit event letter.' });
    }
  });

  // Officer-only: Withdraw/delete a pending or rejected post
  app.delete('/api/organizations/:code/posts/:postId', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const org = getOrgByCode(String(req.params.code));
      if (!org) {
        return res.status(404).json({ error: 'Organization not found.' });
      }
      const user = req.authUser;
      if (!user || (user.role !== 'cessca' && (user.role !== 'president' || user.orgCode !== org.code))) {
        return res.status(403).json({ error: 'Unauthorized to remove this submission.' });
      }

      const postId = String(req.params.postId);
      const orgDb = getOrgDb(org.code);
      await orgDb.execute({ sql: 'DELETE FROM posts WHERE id = ?', args: [postId] });

      const centralDb = getCentralDb();
      await centralDb.execute({ sql: 'DELETE FROM cessca_queue WHERE id = ?', args: [postId] });

      return res.json({ ok: true });
    } catch (error) {
      console.error('Failed to delete post:', error);
      return res.status(500).json({ error: 'Failed to delete submission.' });
    }
  });

  // Public reaction toggle on approved posts
  app.post('/api/posts/:orgCode/:postId/like', async (req: Request, res: Response) => {
    try {
      const org = getOrgByCode(String(req.params.orgCode));
      if (!org) {
        return res.status(404).json({ error: 'Organization not found.' });
      }
      const delta = req.body?.unlike ? -1 : 1;
      const orgDb = getOrgDb(org.code);
      await orgDb.execute({
        sql: `UPDATE posts
              SET likes_count = MAX(0, likes_count + ?)
              WHERE id = ? AND status = 'approved'`,
        args: [delta, String(req.params.postId)],
      });
      const updated = await orgDb.execute({
        sql: 'SELECT likes_count FROM posts WHERE id = ? LIMIT 1',
        args: [String(req.params.postId)],
      });
      return res.json({ likesCount: Number(updated.rows[0]?.likes_count ?? 0) });
    } catch (error) {
      console.error('Like error:', error);
      return res.status(500).json({ error: 'Failed to update reaction.' });
    }
  });

  // CESSCA Super Admin: List incoming submission queue across all 12 organizations
  app.get('/api/cessca/queue', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.authUser;
      if (!user || user.role !== 'cessca') {
        return res.status(403).json({ error: 'CESSCA Super Administrator privileges required.' });
      }

      const statusFilter = String(req.query.status ?? '').trim().toLowerCase();
      const central = getCentralDb();
      const result =
        statusFilter && statusFilter !== 'all'
          ? await central.execute({
              sql: 'SELECT * FROM cessca_queue WHERE status = ? ORDER BY submitted_at DESC',
              args: [statusFilter],
            })
          : await central.execute('SELECT * FROM cessca_queue ORDER BY submitted_at DESC');

      const items = result.rows.map((row) =>
        mapRowToQueueItem(row as unknown as Record<string, unknown>)
      );
      return res.json({ items });
    } catch (error) {
      console.error('Failed to load CESSCA queue:', error);
      return res.status(500).json({ error: 'Failed to load CESSCA moderation queue.' });
    }
  });

  // CESSCA Super Admin: Approve or Reject a submission letter
  app.post('/api/cessca/review/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.authUser;
      if (!user || user.role !== 'cessca') {
        return res.status(403).json({ error: 'CESSCA Super Administrator privileges required.' });
      }

      const id = String(req.params.id);
      const action = String(req.body?.action ?? '').trim().toLowerCase();
      const feedback = String(req.body?.feedback ?? '').trim();

      if (action !== 'approve' && action !== 'reject') {
        return res.status(400).json({ error: 'Action must be either approve or reject.' });
      }
      if (action === 'reject' && feedback.length < 4) {
        return res.status(400).json({ error: 'Please provide clear feedback when rejecting a submission.' });
      }

      const central = getCentralDb();
      const existing = await central.execute({
        sql: 'SELECT * FROM cessca_queue WHERE id = ? LIMIT 1',
        args: [id],
      });

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Submission letter not found.' });
      }

      const orgCode = String(existing.rows[0].org_code);
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      const now = new Date().toISOString();
      const resolvedFeedback =
        feedback || (action === 'approve' ? 'Approved by CESSCA for publication.' : null);

      // Update central CESSCA moderation record
      await central.execute({
        sql: `UPDATE cessca_queue
              SET status = ?, feedback = ?, reviewed_at = ?, reviewed_by = ?
              WHERE id = ?`,
        args: [newStatus, resolvedFeedback, now, user.displayName, id],
      });

      // Synchronously update the organization's isolated 1-to-1 libSQL database
      const orgDb = getOrgDb(orgCode);
      await orgDb.execute({
        sql: `UPDATE posts
              SET status = ?, feedback = ?, reviewed_at = ?
              WHERE id = ?`,
        args: [newStatus, resolvedFeedback, now, id],
      });

      const updated = await central.execute({
        sql: 'SELECT * FROM cessca_queue WHERE id = ? LIMIT 1',
        args: [id],
      });

      return res.json({
        item: mapRowToQueueItem(updated.rows[0] as unknown as Record<string, unknown>),
      });
    } catch (error) {
      console.error('Review error:', error);
      return res.status(500).json({ error: 'Failed to process review decision.' });
    }
  });

  // Vite dev middleware or static dist serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PTC Student Organizations Portal listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
