import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

let memoizedApp: any = null;

export default async function handler(req: any, res: any) {
  if (memoizedApp) {
    return memoizedApp(req, res);
  }

  const requireFn = createRequire(import.meta.url);
  
  // Resolve paths robustly
  let bundlePath = path.resolve(process.cwd(), 'dist/server.cjs');
  let filenameToUse = '';
  try {
    filenameToUse = fileURLToPath(import.meta.url);
  } catch (e) {
    // Fail-safe
  }

  const pathsToTry = [
    bundlePath,
    filenameToUse ? path.resolve(path.dirname(filenameToUse), '../dist/server.cjs') : null,
    filenameToUse ? path.resolve(path.dirname(filenameToUse), 'dist/server.cjs') : null,
    path.resolve(process.cwd(), '../dist/server.cjs'),
    '/var/task/dist/server.cjs'
  ].filter((p): p is string => !!p);

  let firstFoundPath = '';
  for (const p of pathsToTry) {
    if (fs.existsSync(p)) {
      firstFoundPath = p;
      break;
    }
  }

  let bundleError: any = null;

  if (firstFoundPath) {
    console.log('🔄 [Vercel API] Loading compiled production server bundle from:', firstFoundPath);
    try {
      const serverModule = requireFn(firstFoundPath);
      await serverModule.startServer();
      memoizedApp = serverModule.getApp();
      return memoizedApp(req, res);
    } catch (err: any) {
      console.error('❌ [Vercel API] Failed to load server from bundle:', err);
      bundleError = err;
    }
  } else {
    console.warn('⚠️ [Vercel API] Production server bundle not found at tried paths:', pathsToTry);
    bundleError = new Error(`Production server bundle file not found at tried paths: ${JSON.stringify(pathsToTry)}`);
  }

  console.log('🔄 [Vercel API] Loading from typescript source fallback...');
  try {
    const serverModule = await import('../server.ts');
    await serverModule.startServer();
    memoizedApp = serverModule.getApp();
    return memoizedApp(req, res);
  } catch (err: any) {
    console.error('❌ [Vercel API] Severe error loading from typescript source:', err);
    return res.status(500).json({
      error: 'Failed to bootstrap the backend server',
      details: String(err),
      bundleError: bundleError ? {
        message: bundleError.message,
        stack: bundleError.stack,
        code: bundleError.code
      } : null,
      fallbackError: {
        message: err.message,
        stack: err.stack
      }
    });
  }
}


