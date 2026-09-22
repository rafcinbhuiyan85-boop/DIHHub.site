import { initializeApp as initAdminApp, getApps as getAdminApps, cert as adminCert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, FieldValue as AdminFieldValue } from 'firebase-admin/firestore';
import { initializeApp as initClientApp, getApps as getClientApps, getApp as getClientApp } from 'firebase/app';
import { 
  getFirestore as getClientFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp as clientServerTimestamp 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let _filename = '';
let _dirname = '';
try {
  _filename = fileURLToPath(import.meta.url);
  _dirname = path.dirname(_filename);
} catch (e) {
  _filename = typeof __filename !== 'undefined' ? __filename : '';
  _dirname = typeof __dirname !== 'undefined' ? __dirname : '';
}

export interface PaynicornOrderData {
  orderId: string;
  merchant_order_no?: string;
  amount: number;
  usdAmount?: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | string;
  userId?: string | null;
  userEmail?: string | null;
  currency?: string;
  subject?: string;
  paymentUrl?: string | null;
  returnUrl?: string | null;
  notifyUrl?: string | null;
  tradeStatus?: string | null;
  tradeNo?: string | null;
  paidAt?: string | null;
  metadata?: any;
  webhookPayload?: any;
  createdAt?: any;
  updatedAt?: any;
}

// 1. Locate Firebase Configuration
function getFirebaseConfig(): any {
  const candidatePaths = [
    path.join(process.cwd(), 'firebase-applet-config.json'),
    path.join(process.cwd(), '../firebase-applet-config.json'),
    path.resolve(_dirname, '../../firebase-applet-config.json'),
    path.resolve(_dirname, '../../../firebase-applet-config.json'),
    path.resolve(_dirname, '../firebase-applet-config.json'),
    '/var/task/firebase-applet-config.json'
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      } catch (e) {
        console.error(`[FirebaseConfig] Error parsing ${p}:`, e);
      }
    }
  }
  return null;
}

const firebaseConfig = getFirebaseConfig();

// 2. Initialize Firebase Admin SDK
let adminDb: any = null;
let adminAvailable = false;

try {
  if (getAdminApps().length === 0) {
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_ADMIN_CREDENTIALS;
    if (serviceAccountEnv) {
      let serviceAccount: any = null;
      if (serviceAccountEnv.trim().startsWith('{')) {
        serviceAccount = JSON.parse(serviceAccountEnv);
      } else if (fs.existsSync(serviceAccountEnv)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountEnv, 'utf8'));
      }
      if (serviceAccount) {
        initAdminApp({
          credential: adminCert(serviceAccount),
          projectId: serviceAccount.project_id || firebaseConfig?.projectId
        });
      } else {
        initAdminApp({
          projectId: firebaseConfig?.projectId || 'daddy-here-33965'
        });
      }
    } else {
      initAdminApp({
        projectId: firebaseConfig?.projectId || 'daddy-here-33965'
      });
    }
  }

  adminDb = getAdminFirestore();
  adminAvailable = true;
  console.log('✅ [Firebase Admin SDK] Initialized successfully for Paynicorn orders.');
} catch (err: any) {
  console.warn('⚠️ [Firebase Admin SDK] Init notice:', err.message);
  adminAvailable = false;
}

// 3. Initialize Firebase Client Modular Firestore (Reliable fallback engine respecting firestore.rules)
let clientDb: any = null;
try {
  if (firebaseConfig) {
    const app = getClientApps().length > 0 ? getClientApp() : initClientApp(firebaseConfig);
    clientDb = firebaseConfig.firestoreDatabaseId 
      ? getClientFirestore(app, firebaseConfig.firestoreDatabaseId) 
      : getClientFirestore(app);
    console.log('✅ [Firebase Client SDK] Firestore ready for Paynicorn orders.');
  }
} catch (clientErr: any) {
  console.error('❌ [Firebase Client SDK] Firestore init failed:', clientErr.message);
}

// Helper to convert Firestore Timestamp / Date fields to standard ISO strings
export function serializeOrder(order: any): PaynicornOrderData {
  if (!order) return order;
  const result: any = { ...order };

  if (result.createdAt && typeof result.createdAt.toDate === 'function') {
    result.createdAt = result.createdAt.toDate().toISOString();
  } else if (result.createdAt instanceof Date) {
    result.createdAt = result.createdAt.toISOString();
  }

  if (result.updatedAt && typeof result.updatedAt.toDate === 'function') {
    result.updatedAt = result.updatedAt.toDate().toISOString();
  } else if (result.updatedAt instanceof Date) {
    result.updatedAt = result.updatedAt.toISOString();
  }

  return result as PaynicornOrderData;
}

/**
 * Save new order in the Firestore orders collection using orderId as the document ID
 * Fields: orderId, amount, status: 'PENDING', userId, createdAt (server timestamp), etc.
 */
export async function createFirestoreOrder(orderData: PaynicornOrderData): Promise<PaynicornOrderData> {
  const { orderId } = orderData;
  if (!orderId) {
    throw new Error('orderId is required to create a Firestore order.');
  }

  // Try Admin SDK first if available
  if (adminAvailable && adminDb) {
    try {
      const docRef = adminDb.collection('orders').doc(orderId);
      const dataToSave = {
        ...orderData,
        orderId,
        amount: Number(orderData.amount) || 0,
        status: orderData.status || 'PENDING',
        userId: orderData.userId ?? null,
        userEmail: orderData.userEmail ?? null,
        createdAt: AdminFieldValue.serverTimestamp(),
        updatedAt: AdminFieldValue.serverTimestamp()
      };
      await docRef.set(dataToSave, { merge: true });
      console.log(`[Paynicorn Firestore] Saved Order #${orderId} using Firebase Admin SDK.`);
      return {
        ...orderData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (adminErr: any) {
      console.warn(`[Paynicorn Firestore] Admin SDK write fallback: ${adminErr.message}`);
      adminAvailable = false;
    }
  }

  // Fallback to Modular Client SDK
  if (clientDb) {
    const docRef = doc(clientDb, 'orders', orderId);
    const dataToSave = {
      ...orderData,
      orderId,
      amount: Number(orderData.amount) || 0,
      status: orderData.status || 'PENDING',
      userId: orderData.userId ?? null,
      userEmail: orderData.userEmail ?? null,
      createdAt: clientServerTimestamp(),
      updatedAt: clientServerTimestamp()
    };
    await setDoc(docRef, dataToSave, { merge: true });
    console.log(`[Paynicorn Firestore] Saved Order #${orderId} using Firebase Modular SDK.`);
    return {
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  throw new Error('Firestore is not available to create order.');
}

/**
 * Update an existing order document in Firestore by orderId.
 * Sets updatedAt to server timestamp.
 */
export async function updateFirestoreOrder(orderId: string, updates: Partial<PaynicornOrderData>): Promise<PaynicornOrderData | null> {
  if (!orderId) {
    throw new Error('orderId is required to update a Firestore order.');
  }

  // Try Admin SDK first
  if (adminAvailable && adminDb) {
    try {
      const docRef = adminDb.collection('orders').doc(orderId);
      const existing = await docRef.get();
      if (!existing.exists) {
        await docRef.set({
          orderId,
          ...updates,
          createdAt: AdminFieldValue.serverTimestamp(),
          updatedAt: AdminFieldValue.serverTimestamp()
        }, { merge: true });
      } else {
        await docRef.update({
          ...updates,
          updatedAt: AdminFieldValue.serverTimestamp()
        });
      }
      const updatedSnap = await docRef.get();
      return serializeOrder({ id: updatedSnap.id, ...updatedSnap.data() });
    } catch (adminErr: any) {
      console.warn(`[Paynicorn Firestore] Admin SDK update fallback: ${adminErr.message}`);
      adminAvailable = false;
    }
  }

  // Fallback to Modular Client SDK
  if (clientDb) {
    const docRef = doc(clientDb, 'orders', orderId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, {
        orderId,
        ...updates,
        createdAt: clientServerTimestamp(),
        updatedAt: clientServerTimestamp()
      }, { merge: true });
    } else {
      await updateDoc(docRef, {
        ...updates,
        updatedAt: clientServerTimestamp()
      });
    }
    const updatedSnap = await getDoc(docRef);
    return serializeOrder({ id: updatedSnap.id, ...updatedSnap.data() });
  }

  throw new Error('Firestore is not available to update order.');
}

/**
 * Query the order document directly from Firestore using orderId
 */
export async function getFirestoreOrder(orderId: string): Promise<PaynicornOrderData | null> {
  if (!orderId) return null;

  // Try Admin SDK first
  if (adminAvailable && adminDb) {
    try {
      const docRef = adminDb.collection('orders').doc(orderId);
      const snap = await docRef.get();
      if (snap.exists) {
        return serializeOrder({ id: snap.id, ...snap.data() });
      }
      return null;
    } catch (adminErr: any) {
      console.warn(`[Paynicorn Firestore] Admin SDK get fallback: ${adminErr.message}`);
      adminAvailable = false;
    }
  }

  // Fallback to Modular Client SDK
  if (clientDb) {
    const docRef = doc(clientDb, 'orders', orderId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return serializeOrder({ id: snap.id, ...snap.data() });
    }
    return null;
  }

  throw new Error('Firestore is not available to retrieve order.');
}

/**
 * Read any document from Firestore (e.g., site/settings)
 */
export async function getFirestoreDocument(collectionName: string, docId: string): Promise<any> {
  if (!collectionName || !docId) return null;

  // Try Admin SDK first
  if (adminAvailable && adminDb) {
    try {
      const snap = await adminDb.collection(collectionName).doc(docId).get();
      if (snap.exists) {
        return snap.data();
      }
      return null;
    } catch (adminErr: any) {
      adminAvailable = false;
    }
  }

  // Fallback to Modular Client SDK
  if (clientDb) {
    try {
      const docRef = doc(clientDb, collectionName, docId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (clientErr: any) {
      console.warn(`[Paynicorn Firestore] Error fetching document ${collectionName}/${docId}:`, clientErr.message);
    }
  }

  return null;
}
