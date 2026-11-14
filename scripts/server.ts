import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { createApiApp } from '../src/server/api-app.ts';

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  const app = await createApiApp();

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

startServer().catch((error: unknown) => {
  console.error('Fatal startup error:', error);
  process.exit(1);
});
