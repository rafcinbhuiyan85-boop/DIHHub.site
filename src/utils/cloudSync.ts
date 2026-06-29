import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
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

let db: any = null;

export function getFirestoreDb(): any {
  if (db) return db;
  try {
    const candidatePaths = [
      path.join(process.cwd(), 'firebase-applet-config.json'),
      path.join(process.cwd(), '../firebase-applet-config.json'),
      path.resolve(_dirname, '../../firebase-applet-config.json'),
      path.resolve(_dirname, '../../../firebase-applet-config.json'),
      path.resolve(_dirname, '../firebase-applet-config.json'),
      '/var/task/firebase-applet-config.json'
    ];
    
    let configPath = '';
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        configPath = p;
        break;
      }
    }
    
    if (!configPath) {
      console.log('⚠️ [CloudSync] firebase-applet-config.json not found in any standard path. Offline fallback mode active.');
      return null;
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = firebaseConfig.firestoreDatabaseId 
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
      : getFirestore(app);
    console.log('✅ [CloudSync] Connected to Firestore (using ' + configPath + ') for resilient cloud backup.');
    return db;
  } catch (error) {
    console.error('❌ [CloudSync] Failed to initialize Firebase:', error);
    return null;
  }
}

// Map a filename to a Firestore collection
function getCollectionName(filePath: string): string {
  const base = path.basename(filePath);
  if (base === 'users.json') return 'dih_v3_users';
  if (base === 'settings.json') return 'dih_v3_settings';
  if (base === 'store.json') return 'dih_v3_store';
  if (base === 'logs.json') return 'dih_v3_logs';
  if (base === 'migrations.json') return 'dih_v3_migrations';
  if (base === 'hostinger_data.json') return 'dih_v3_hostinger';
  if (base === 'smm-services.json') return 'dih_v3_smm_services';
  if (base === 'smm-orders.json') return 'dih_v3_smm_orders';
  if (base === 'smm-deposits.json') return 'dih_v3_smm_deposits';
  if (base === 'smm-providers.json') return 'dih_v3_smm_providers';
  if (base === 'bachelor-point.json') return 'dih_v3_bachelor_point';
  return 'dih_v3_unknown';
}

/**
 * Perform a two-way sync between a local JSON file and its Firestore collection.
 * This helper ensures that:
 * 1. Missing items in local files are fetched from the cloud.
 * 2. Missing items in the cloud are uploaded from local files.
 * 3. Standard collections are merged based on unique ID field.
 * 4. Single-document objects (like settings.json) resolve automatically.
 */
export async function syncFileWithCloud(filePath: string, defaultVal: any = []): Promise<any> {
  const firestoreDb = getFirestoreDb();
  if (!firestoreDb) return loadLocalData(filePath, defaultVal);

  const collectionName = getCollectionName(filePath);
  const isSingleDoc = collectionName === 'dih_v3_settings' || collectionName === 'dih_v3_bachelor_point' || collectionName === 'dih_v3_hostinger';
  
  try {
    const localData = loadLocalData(filePath, defaultVal);

    if (isSingleDoc) {
      // Single Document Sync (like settings.json)
      const docRef = doc(firestoreDb, collectionName, 'app_config');
      const docSnap = await getDoc(docRef);

      // Also read the user's specific 'site/settings' document for external toggle updates compatibility
      const siteDocRef = doc(firestoreDb, 'site', 'settings');
      let siteData: any = null;
      try {
        const siteSnap = await getDoc(siteDocRef);
        if (siteSnap.exists()) {
          siteData = siteSnap.data();
          console.log('📥 [CloudSync] Read site/settings document from Firestore for configuration sync:', siteData);
        }
      } catch (siteErr) {
        console.error('⚠️ [CloudSync] Could not read from site/settings:', siteErr);
      }

      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        if (siteData) {
          // Merge specific fields from site/settings into the settings
          if (siteData.liveVisibility !== undefined) {
            cloudData.enableLiveUserCounter = !!siteData.liveVisibility;
          }
          if (siteData.disabledTools !== undefined) {
            cloudData.disabledTools = siteData.disabledTools;
          }
          if (siteData.upcomingTools !== undefined) {
            cloudData.upcomingTools = siteData.upcomingTools;
          }
          if (siteData.visibleTools !== undefined) {
            cloudData.visibleTools = siteData.visibleTools;
          }
        }

        // ALWAYS PREFER CLOUD ON STARTUP TO AVOID OVERWRITING FROM CONTAINER EPHEMERAL FILESYSTEM!
        console.log(`📥 [CloudSync] Restored single doc ${collectionName} settings from Cloud!`);
        saveLocalData(filePath, cloudData);
        return cloudData;
      } else if (localData && Object.keys(localData).length > 0) {
        if (siteData) {
          if (siteData.liveVisibility !== undefined) {
            localData.enableLiveUserCounter = !!siteData.liveVisibility;
          }
          if (siteData.disabledTools !== undefined) {
            localData.disabledTools = siteData.disabledTools;
          }
          if (siteData.upcomingTools !== undefined) {
            localData.upcomingTools = siteData.upcomingTools;
          }
          if (siteData.visibleTools !== undefined) {
            localData.visibleTools = siteData.visibleTools;
          }
        }
        // Upload local to cloud if cloud does not exist
        await setDoc(docRef, localData);
        return localData;
      }
      return localData;
    } else {
      // Array Sync (users, store, logs, etc.)
      const colRef = collection(firestoreDb, collectionName);
      const querySnapshot = await getDocs(colRef);
      
      const cloudItems: any[] = [];
      querySnapshot.forEach((doc) => {
        cloudItems.push({ id: doc.id, ...doc.data() });
      });

      // ALWAYS PREFER CLOUD ON STARTUP TO AVOID OVERWRITING FROM CONTAINER EPHEMERAL FILESYSTEM!
      if (cloudItems.length > 0) {
        console.log(`📥 [CloudSync] Restored ${collectionName} from Cloud (count: ${cloudItems.length})`);
        saveLocalData(filePath, cloudItems);
        return cloudItems;
      } else if (Array.isArray(localData) && localData.length > 0) {
        // Upload initial local data to cloud if cloud is empty
        console.log(`📤 [CloudSync] Seeding empty Cloud ${collectionName} with local data (count: ${localData.length})`);
        for (const item of localData) {
          if (!item.id) {
            item.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
          }
          const strId = String(item.id);
          const docRef = doc(firestoreDb, collectionName, strId);
          await setDoc(docRef, item);
        }
        return localData;
      }
      return localData;
    }
  } catch (error) {
    console.error(`❌ [CloudSync] Detailed error syncing ${collectionName}:`, error);
    return loadLocalData(filePath, defaultVal);
  }
}

/**
 * Save data to Firestore asynchronously. 
 * This is called in background when standard client mutations happen.
 */
export async function saveToCloud(filePath: string, data: any): Promise<void> {
  const firestoreDb = getFirestoreDb();
  if (!firestoreDb) return;

  const collectionName = getCollectionName(filePath);
  const isSingleDoc = collectionName === 'dih_v3_settings' || collectionName === 'dih_v3_bachelor_point' || collectionName === 'dih_v3_hostinger';

  try {
    if (isSingleDoc) {
      const docRef = doc(firestoreDb, collectionName, 'app_config');
      await setDoc(docRef, data);

      // Direct mirroring to site/settings in Firestore to allow compatibility with external toggle controls
      if (collectionName === 'dih_v3_settings') {
        const siteDocRef = doc(firestoreDb, 'site', 'settings');
        const siteUpdates: Record<string, any> = {};
        if (data.enableLiveUserCounter !== undefined) {
          siteUpdates.liveVisibility = !!data.enableLiveUserCounter;
        }
        if (data.disabledTools !== undefined) {
          siteUpdates.disabledTools = data.disabledTools;
        }
        if (data.upcomingTools !== undefined) {
          siteUpdates.upcomingTools = data.upcomingTools;
        }
        if (data.visibleTools !== undefined) {
          siteUpdates.visibleTools = data.visibleTools;
        }
        
        await setDoc(siteDocRef, siteUpdates, { merge: true });
        console.log('✅ [CloudSync] Site settings synchronized successfully to site/settings in Firestore.');
      }
    } else if (Array.isArray(data)) {
      // Syncing an array. First, get list of current cloud items to determine deletions
      const colRef = collection(firestoreDb, collectionName);
      const querySnapshot = await getDocs(colRef);
      const cloudIds: string[] = [];
      querySnapshot.forEach((doc) => {
        cloudIds.push(doc.id);
      });

      const localIds = new Set(data.map(item => item && item.id ? String(item.id) : '').filter(Boolean));

      // 1. Delete items from cloud that are NOT in local array anymore
      const deletePromises: Promise<any>[] = [];
      for (const cid of cloudIds) {
        if (!localIds.has(String(cid))) {
          const docRef = doc(firestoreDb, collectionName, String(cid));
          deletePromises.push(deleteDoc(docRef));
        }
      }

      // Chunk array helper for parallelizing writes safely without overloading connection limit
      const chunkArray = <T>(arr: T[], size: number): T[][] => {
        const chunks: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
          chunks.push(arr.slice(i, i + size));
        }
        return chunks;
      };

      if (deletePromises.length > 0) {
        console.log(`🗑️ [CloudSync] Initiating parallel deletion of ${deletePromises.length} items from ${collectionName}...`);
        const deleteChunks = chunkArray(deletePromises, 80);
        for (const chunk of deleteChunks) {
          await Promise.all(chunk);
        }
        console.log(`✅ [CloudSync] Deleted stale items from cloud collection: ${collectionName}`);
      }

      // 2. Upload/update local items to cloud in parallel chunks
      const uploadPromises: Promise<any>[] = [];
      for (const item of data) {
        if (item && item.id) {
          const docRef = doc(firestoreDb, collectionName, String(item.id));
          uploadPromises.push(setDoc(docRef, item));
        }
      }

      if (uploadPromises.length > 0) {
        console.log(`📤 [CloudSync] Uploading ${uploadPromises.length} items to cloud collection ${collectionName} in parallel chunks...`);
        const uploadChunks = chunkArray(uploadPromises, 80);
        let chunkIndex = 0;
        for (const chunk of uploadChunks) {
          chunkIndex++;
          await Promise.all(chunk);
          if (chunkIndex % 5 === 0 || chunkIndex === uploadChunks.length) {
            console.log(`📈 [CloudSync] Uploaded progress: ${chunkIndex}/${uploadChunks.length} chunks for ${collectionName}`);
          }
        }
        console.log(`✅ [CloudSync] Successfully synchronized all ${uploadPromises.length} items to cloud collection: ${collectionName}`);
      }
    }
  } catch (error) {
    console.error(`❌ [CloudSync] Failed to save update to cloud for ${collectionName}:`, error);
  }
}

// Standard file system fallbacks
function loadLocalData(file: string, defaultVal: any) {
  if (!fs.existsSync(file)) return defaultVal;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return defaultVal;
  }
}

function saveLocalData(file: string, data: any) {
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Local write failed:", e);
  }
}
