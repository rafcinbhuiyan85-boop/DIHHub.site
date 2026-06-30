import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { saveToCloud } from './src/utils/cloudSync.ts';

const SMMGenUrl = 'https://smmgen.com/api/v2';
const SMMGenKey = 'f5846f314bba6ed87b2c025b2ef73790';
const SMMGenProviderId = 2;
const MarkupMultiplier = 1.17; // 17% profit markup

const DATA_DIR = path.join(process.cwd(), 'data');
const SMM_SERVICES_FILE = path.join(DATA_DIR, 'smm-services.json');

async function run() {
  console.log("🚀 [SMMGen Importer] Starting SMMGen import with 17% profit markup...");
  
  try {
    const params = new URLSearchParams();
    params.append('key', SMMGenKey);
    params.append('action', 'services');

    console.log(`🌐 [SMMGen Importer] Fetching live services list from ${SMMGenUrl}...`);
    const response = await axios.post(SMMGenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 20000
    });

    const rawData = response.data;
    if (!rawData) {
      throw new Error("Empty response from SMMGen.");
    }

    if (rawData.error) {
      throw new Error(`SMMGen API Error: ${rawData.error}`);
    }

    let rawServices: any[] = [];
    if (Array.isArray(rawData)) {
      rawServices = rawData;
    } else if (rawData && typeof rawData === 'object') {
      const foundArray = Object.values(rawData).find(v => Array.isArray(v));
      if (foundArray) {
        rawServices = foundArray as any[];
      } else {
        const keys = Object.keys(rawData);
        if (keys.length > 0 && typeof rawData[keys[0]] === 'object') {
          rawServices = Object.entries(rawData).map(([id, sObj]: [string, any]) => ({
            service: id,
            ...sObj
          }));
        }
      }
    }

    if (rawServices.length === 0) {
      throw new Error("No SMMGen services parsed from response.");
    }

    console.log(`✨ [SMMGen Importer] Parsed ${rawServices.length} raw services. Mapping to our SMM schema...`);

    const mappedServices = rawServices.map((svc: any, idx: number) => {
      const origSvcId = parseInt(svc.service || svc.id || svc.service_id) || (20000 + idx);
      const uniqueId = 20000 + origSvcId; // Prefix with 20000 range for SMMGen
      
      const nameVal = (svc.name || svc.title || svc.service_name || svc.label || `Service #${origSvcId}`).toString().trim();
      const catVal = (svc.category || svc.group || svc.cat || svc.service_category || svc.section || "Others").toString().trim();
      
      let rateStr = String(svc.rate || svc.price || svc.charge || svc.cost || "0.0").trim();
      rateStr = rateStr.replace(/[^0-9.]/g, '');
      const origRate = parseFloat(rateStr) || 0.0;
      
      // Calculate active price with 17% profit markup
      const finalPrice = parseFloat((origRate * MarkupMultiplier).toFixed(4));

      let minStr = String(svc.min || svc.min_quantity || svc.min_qty || "50").trim();
      minStr = minStr.replace(/[^0-9]/g, '');
      const minVal = parseInt(minStr) || 50;

      let maxStr = String(svc.max || svc.max_quantity || svc.max_qty || "100000").trim();
      maxStr = maxStr.replace(/[^0-9]/g, '');
      const maxVal = parseInt(maxStr) || 100000;

      const descVal = svc.desc || svc.description || "Live directly connected service from SMMGen package.";
      
      // Smart Refill Extractor
      let refillStatus = "No Refill";
      const hasNoRefillWord = /no[n\s-]*refill|without\s*refill/i.test(nameVal);

      if (!hasNoRefillWord) {
        if (svc.refill !== undefined && svc.refill !== null) {
          const r = svc.refill;
          if (r === true || r === 1 || r === '1' || r === 'true' || r === 'Yes' || r === 'yes') {
            refillStatus = "Yes (Refill)";
          } else if (r === false || r === 0 || r === '0' || r === 'false' || r === 'No' || r === 'no') {
            refillStatus = "No Refill";
          } else {
            refillStatus = String(r).trim();
            if (/^\d+$/.test(refillStatus)) {
              refillStatus = `${refillStatus}D Refill`;
            }
          }
        }

        if (refillStatus === "No Refill" || refillStatus === "Yes (Refill)") {
          const lifetimeMatch = /lifetime/i.test(nameVal);
          const daysMatch = nameVal.match(/(\d+)\s*(?:days?|d)\s*refill/i) || 
                            nameVal.match(/refill\s*(?:button|guarantee)?\s*(\d+)\s*days?/i) ||
                            nameVal.match(/r(\d{2,3})(?:\D|$)/i) ||
                            nameVal.match(/(\d+)\s*d\s*refill/i);
          
          if (lifetimeMatch) {
            refillStatus = "Lifetime Refill";
          } else if (daysMatch) {
            refillStatus = `${daysMatch[1]}D Refill`;
          } else if (/refill/i.test(nameVal)) {
            refillStatus = "Refill Supported";
          }
        }
      }

      let avgTimeVal = "";
      if (svc.average_time !== undefined && svc.average_time !== null && svc.average_time !== "0" && svc.average_time !== 0 && String(svc.average_time).trim() !== "") {
        const avgMinutes = parseInt(String(svc.average_time).trim());
        if (!isNaN(avgMinutes) && avgMinutes > 0) {
          if (avgMinutes < 60) {
            avgTimeVal = `${avgMinutes} minutes`;
          } else {
            const hrs = (avgMinutes / 60).toFixed(1);
            avgTimeVal = `${hrs.endsWith('.0') ? parseInt(hrs) : hrs} hours`;
          }
        }
      }

      return {
        id: uniqueId,
        name: nameVal,
        category: catVal,
        price: finalPrice,
        originalPrice: origRate,
        min: minVal,
        max: maxVal,
        desc: descVal,
        time: avgTimeVal || svc.time || svc.speed || svc.delivery || "0-24 hours",
        quality: svc.quality || svc.class || svc.tier || svc.type || "Standard",
        refill: refillStatus,
        providerId: SMMGenProviderId,
        providerServiceId: origSvcId
      };
    });

    console.log(`🧹 [SMMGen Importer] Deleting all old SMM services from ${SMM_SERVICES_FILE}...`);
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // Write the new SMMGen services to the local services file
    fs.writeFileSync(SMM_SERVICES_FILE, JSON.stringify(mappedServices, null, 2));
    console.log(`💾 [SMMGen Importer] Wrote ${mappedServices.length} SMMGen services to local file.`);

    // Upload to Firestore for permanent syncing
    console.log(`☁️ [SMMGen Importer] Backing up and syncing all ${mappedServices.length} SMMGen services to Firestore cloud...`);
    await saveToCloud(SMM_SERVICES_FILE, mappedServices);
    console.log(`✅ [SMMGen Importer] Finished cloud database sync successfully! All services are active.`);
    process.exit(0);
    
  } catch (err: any) {
    console.error("❌ [SMMGen Importer] Fatal error during import:", err.message);
    process.exit(1);
  }
}

run();
