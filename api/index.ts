import 'dotenv/config';
import { startServer, getApp } from '../server.ts';

let memoizedApp: any = null;

export default async function handler(req: any, res: any) {
  if (!memoizedApp) {
    console.log('🔄 [Vercel API] Initializing high-availability backend server...');
    await startServer();
    memoizedApp = getApp();
  }
  
  return memoizedApp(req, res);
}


