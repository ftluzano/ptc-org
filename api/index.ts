import type { Request, Response } from 'express';
import { createApiApp } from '../src/server/api-app.ts';

let apiAppPromise: ReturnType<typeof createApiApp> | undefined;

export default async function handler(req: Request, res: Response) {
  try {
    apiAppPromise ??= createApiApp();
    const apiApp = await apiAppPromise;

    const requestUrl = new URL(req.url || '/', 'http://localhost');
    const capturedPath = req.query.path;
    const pathSegments = Array.isArray(capturedPath)
      ? capturedPath.filter((segment): segment is string => typeof segment === 'string')
      : typeof capturedPath === 'string'
        ? capturedPath.split('/').filter(Boolean)
        : [];

    if (pathSegments.length > 0) {
      requestUrl.pathname = `/api/${pathSegments.map(encodeURIComponent).join('/')}`;
      requestUrl.searchParams.delete('path');
    } else {
      requestUrl.pathname = '/api';
    }

    req.url = `${requestUrl.pathname}${requestUrl.search}`;
    apiApp(req, res);
  } catch (error) {
    console.error('Failed to initialize portal API:', error);
    res.status(500).json({ error: 'Portal API could not be initialized.' });
  }
}
