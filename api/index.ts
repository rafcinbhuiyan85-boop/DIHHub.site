import 'dotenv/config';
import 'express';
import 'cors';
import 'multer';
import 'axios';
import '@google/genai';
import 'firebase/app';
import 'firebase/firestore';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// @ts-ignore
import * as serverModule from '../dist/server.cjs';

let memoizedApp: any = null;

export default async function handler(req: any, res: any) {
  if (memoizedApp) {
    return memoizedApp(req, res);
  }

  try {
    console.log('🔄 [Vercel API] Loading from statically linked production server bundle...');
    const serverModuleAny = serverModule as any;
    await serverModuleAny.startServer();
    memoizedApp = serverModuleAny.getApp();
    return memoizedApp(req, res);
  } catch (err: any) {
    console.error('❌ [Vercel API] Failed to run server from static import:', err);
    
    // Fallback to dynamic requiring
    let dynamicError: any = null;
    try {
      const requireFn = createRequire(import.meta.url);
      let bundlePath = path.resolve(process.cwd(), 'dist/server.cjs');
      let filenameToUse = '';
      try {
        filenameToUse = fileURLToPath(import.meta.url);
      } catch (e) {}

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

      if (firstFoundPath) {
        console.log('🔄 [Vercel API] Falling back to requiring found path:', firstFoundPath);
        const serverModuleFallback = requireFn(firstFoundPath);
        await serverModuleFallback.startServer();
        memoizedApp = serverModuleFallback.getApp();
        return memoizedApp(req, res);
      } else {
        dynamicError = new Error(`No bundle found at tried paths: ${JSON.stringify(pathsToTry)}`);
      }
    } catch (fallbackErr: any) {
      console.error('❌ [Vercel API] Fallback require failed:', fallbackErr);
      dynamicError = fallbackErr;
    }
    
    return res.status(500).json({
      error: 'Failed to bootstrap the backend server',
      details: String(err),
      staticImportError: {
        message: err.message,
        stack: err.stack
      },
      dynamicError: dynamicError ? {
        message: dynamicError.message,
        stack: dynamicError.stack
      } : null,
      cwd: process.cwd(),
      env: process.env.NODE_ENV
    });
  }
}


