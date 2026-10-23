import app, { startServer } from '../server.ts';

let initialized = false;

export default async function handler(req: any, res: any) {
  if (!initialized) {
    try {
      await startServer();
    } catch (err) {
      console.warn('Vercel serverless startup notice:', err);
    }
    initialized = true;
  }

  // Normalize URL if Vercel rewrite alters query or stripped route prefix
  if (req.url && req.url.includes('?')) {
    const [pathPart, queryPart] = req.url.split('?');
    if ((pathPart === '/api' || pathPart === '/' || pathPart === '') && queryPart && !queryPart.includes('=')) {
      req.url = `/api/${queryPart}`;
    }
  }

  return app(req, res);
}

