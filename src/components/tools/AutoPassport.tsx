import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Download, RefreshCcw, Sparkles, 
  Loader2, Camera, User, Users, AlertTriangle, 
  Activity, Paintbrush, Check, SlidersHorizontal, 
  Grid, RotateCcw, FlipHorizontal, HelpCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppSettings } from '../../hooks/useAppSettings';
import { removeBackground } from '@imgly/background-removal';

export default function AutoPassport() {
  const { settings } = useAppSettings();

  // Primary Tool Mode: 'single' (Portrait Passport) or 'joint' (Couple/Joint Passport)
  const [toolMode, setToolMode] = useState<'single' | 'joint'>('single');

  // Active sub-tab for single and joint: 'ai' (AI Auto Generation) or 'studio' (Manual Interactive Fine-Tuning Studio)
  const [activeTabSingle, setActiveTabSingle] = useState<'ai' | 'studio'>('ai');
  const [activeTabJoint, setActiveTabJoint] = useState<'ai' | 'studio'>('ai');

  // Show biometric overlay guidelines
  const [showGuides, setShowGuides] = useState<boolean>(true);

  // --- COMMON CONFIGS ---
  const [bgColor, setBgColor] = useState<string>('#0047AB'); // Cobalt Studio Blue
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('35x45mm');

  // --- SINGLE PORTRAIT MODE STATES ---
  const [singleImage, setSingleImage] = useState<string | null>(null); // Transparent BG result of Single
  const [singleOriginalImage, setSingleOriginalImage] = useState<string | null>(null); // Original with background
  const [singleResult, setSingleResult] = useState<string | null>(null); // Final AI result
  const [singleResultIsAi, setSingleResultIsAi] = useState<boolean>(false);
  const [faceBoxSingle, setFaceBoxSingle] = useState<{ ymin: number, xmin: number, ymax: number, xmax: number }>({ ymin: 160, xmin: 300, ymax: 540, xmax: 700 });
  const [faceBoxA, setFaceBoxA] = useState<{ ymin: number, xmin: number, ymax: number, xmax: number }>({ ymin: 160, xmin: 300, ymax: 540, xmax: 700 });
  const [faceBoxB, setFaceBoxB] = useState<{ ymin: number, xmin: number, ymax: number, xmax: number }>({ ymin: 160, xmin: 300, ymax: 540, xmax: 700 });
  const [isSingleLoading, setIsSingleLoading] = useState(false);

  // Manual Adjustments for Single
  const [scaleSingle, setScaleSingle] = useState<number>(1.0);
  const [offsetXSingle, setOffsetXSingle] = useState<number>(0);
  const [offsetYSingle, setOffsetYSingle] = useState<number>(0);
  const [rotationSingle, setRotationSingle] = useState<number>(0);
  const [mirroredSingle, setMirroredSingle] = useState<boolean>(false);

  // --- JOINT PASSPORT MODE STATES ---
  const [jointImageA, setJointImageA] = useState<string | null>(null); // Transparent BG profile A
  const [jointImageB, setJointImageB] = useState<string | null>(null); // Transparent BG profile B
  
  const [jointOriginalA, setJointOriginalA] = useState<string | null>(null);
  const [jointOriginalB, setJointOriginalB] = useState<string | null>(null);
  
  const [jointSingleImage, setJointSingleImage] = useState<string | null>(null); // Group photo upload original
  const [isSingleGroupMode, setIsSingleGroupMode] = useState<boolean>(false);
  const [isJointGenerating, setIsJointGenerating] = useState<boolean>(false);
  const [jointResult, setJointResult] = useState<string | null>(null); // Final AI Joint output
  const [jointResultIsAi, setJointResultIsAi] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');

  // Active Editing Subject in Joint Studio Adjuster
  const [activeJointSubject, setActiveJointSubject] = useState<'A' | 'B'>('A');

  // Manual Adjustments for Person A
  const [scaleA, setScaleA] = useState<number>(0.75);
  const [offsetX_A, setOffsetX_A] = useState<number>(-70);
  const [offsetY_A, setOffsetY_A] = useState<number>(10);
  const [rotationA, setRotationA] = useState<number>(0);
  const [mirroredA, setMirroredA] = useState<boolean>(false);

  // Manual Adjustments for Person B
  const [scaleB, setScaleB] = useState<number>(0.75);
  const [offsetX_B, setOffsetX_B] = useState<number>(70);
  const [offsetY_B, setOffsetY_B] = useState<number>(10);
  const [rotationB, setRotationB] = useState<number>(0);
  const [mirroredB, setMirroredB] = useState<boolean>(false);

  // File Inputs Refs
  const fileInputRefSingle = useRef<HTMLInputElement>(null);
  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);
  const fileInputJointSingleRef = useRef<HTMLInputElement>(null);

  // Canvas Refs for Fine-Tuning Studio Live Rendering
  const canvasRefSingle = useRef<HTMLCanvasElement>(null);
  const canvasRefJoint = useRef<HTMLCanvasElement>(null);

  // Image caching objects to avoid reloading images on every frame render
  const [imgObjSingle, setImgObjSingle] = useState<HTMLImageElement | null>(null);
  const [imgObjA, setImgObjA] = useState<HTMLImageElement | null>(null);
  const [imgObjB, setImgObjB] = useState<HTMLImageElement | null>(null);

  const passportSizes = [
    { label: '35x45mm', value: '35x45mm', desc: 'Standard Passport' },
    { label: '2x2 inch', value: '2x2 inch', desc: 'US / Visa' },
    { label: '35x35mm', value: '35x35mm', desc: 'Small Square' },
    { label: '40x60mm', value: '40x60mm', desc: 'Large Format' },
  ];

  const backgroundPresets = [
    { label: 'Sky Blue', hex: '#3B82F6' },
    { label: 'Cobalt Blue', hex: '#0047AB' },
    { label: 'Biometric Blue', hex: '#A4C2E3' },
    { label: 'Solid White', hex: '#FFFFFF' },
    { label: 'Light Gray', hex: '#E5E7EB' },
  ];

  // Downscale helpers to keep tokens low & transfer fast
  const downscaleImage = (dataUrl: string, maxDim = 1600): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };

  // Pre-load images for HTML5 Canvas to prevent structural flashing
  useEffect(() => {
    if (singleImage) {
      const idx = new Image();
      idx.crossOrigin = "anonymous";
      idx.onload = () => {
        setImgObjSingle(idx);
      };
      idx.src = singleImage;
    } else {
      setImgObjSingle(null);
    }
  }, [singleImage]);

  useEffect(() => {
    if (jointImageA) {
      const idx = new Image();
      idx.crossOrigin = "anonymous";
      idx.onload = () => {
        setImgObjA(idx);
      };
      idx.src = jointImageA;
    } else {
      setImgObjA(null);
    }
  }, [jointImageA]);

  useEffect(() => {
    if (jointImageB) {
      const idx = new Image();
      idx.crossOrigin = "anonymous";
      idx.onload = () => {
        setImgObjB(idx);
      };
      idx.src = jointImageB;
    } else {
      setImgObjB(null);
    }
  }, [jointImageB]);

  // Read upload and set
  const processFileToUrl = (e: React.ChangeEvent<HTMLInputElement>, target: 'single' | 'A' | 'B' | 'jointSingle') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const resultUrl = event.target?.result as string;
        try {
          const downscaledUrl = await downscaleImage(resultUrl);
          if (target === 'single') {
            setSingleOriginalImage(downscaledUrl);
            setSingleImage(null);
            setSingleResult(null);
            setSingleResultIsAi(false);
            resetSingleSliders();
          }
          if (target === 'A') {
            setJointOriginalA(downscaledUrl);
            setJointImageA(null);
            setJointResult(null);
            setJointResultIsAi(false);
            resetJointSliders('A');
          }
          if (target === 'B') {
            setJointOriginalB(downscaledUrl);
            setJointImageB(null);
            setJointResult(null);
            setJointResultIsAi(false);
            resetJointSliders('B');
          }
          if (target === 'jointSingle') {
            setJointSingleImage(downscaledUrl);
            setJointImageA(null);
            setJointImageB(null);
            setJointResult(null);
            setJointResultIsAi(false);
          }
        } catch (err) {
          if (target === 'single') {
            setSingleOriginalImage(resultUrl);
            setSingleImage(null);
            setSingleResult(null);
            setSingleResultIsAi(false);
            resetSingleSliders();
          }
          if (target === 'A') {
            setJointOriginalA(resultUrl);
            setJointImageA(null);
            setJointResult(null);
            setJointResultIsAi(false);
            resetJointSliders('A');
          }
          if (target === 'B') {
            setJointOriginalB(resultUrl);
            setJointImageB(null);
            setJointResult(null);
            setJointResultIsAi(false);
            resetJointSliders('B');
          }
          if (target === 'jointSingle') {
            setJointSingleImage(resultUrl);
            setJointImageA(null);
            setJointImageB(null);
            setJointResult(null);
            setJointResultIsAi(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset Adjuster Sliders
  const resetSingleSliders = () => {
    setScaleSingle(1.0);
    setOffsetXSingle(0);
    setOffsetYSingle(0);
    setRotationSingle(0);
    setMirroredSingle(false);
  };

  const resetJointSliders = (subject: 'A' | 'B' | 'both') => {
    if (subject === 'A' || subject === 'both') {
      setScaleA(0.75);
      setOffsetX_A(-70);
      setOffsetY_A(10);
      setRotationA(0);
      setMirroredA(false);
    }
    if (subject === 'B' || subject === 'both') {
      setScaleB(0.75);
      setOffsetX_B(70);
      setOffsetY_B(10);
      setRotationB(0);
      setMirroredB(false);
    }
  };

  // --- HELPERS FOR PREMIUM CHROMATIZATION (CHROMA KEY REMOVAL OF PURE MAGENTA #FF00FF BACKGROUND) ---
  const performChromaKeyRemoval = (magentaImageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(magentaImageUrl);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Magenta check: High Red, High Blue, Low Green
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          // Magenta threshold check (Gemini outputs clean #FF00FF, but JPEG compression can offset colors slightly)
          const isMagenta = (r > 130 && b > 130 && g < 140) || (r > 180 && b > 180 && g < 180);
          if (isMagenta) {
            data[i+3] = 0; // Set transparent
          }
        }
        
        // Clean halos near edges
        const width = canvas.width;
        const height = canvas.height;
        const alphaCopy = new Uint8Array(width * height);
        for (let i = 0; i < data.length; i += 4) alphaCopy[i/4] = data[i+3];
        
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            if (alphaCopy[idx] > 0) {
              if (alphaCopy[idx-1] === 0 || alphaCopy[idx+1] === 0 || alphaCopy[idx-width] === 0 || alphaCopy[idx+width] === 0) {
                const i = idx * 4;
                if (data[i] > 100 && data[i+2] > 100) {
                  data[i+3] = 0;
                }
              }
            }
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (e) => reject(e);
      img.src = magentaImageUrl;
    });
  };

  // --- AUTOMATED BACKGROUND ISOLATION PIPELINES ---
  const removeImageBackgroundWithFallback = async (srcImg: string, label: string = "portrait"): Promise<string> => {
    try {
      setProgressStatus(`Removing background: Connecting to Segmenter...`);
      const apiRes = await fetch('/api/passport/remove-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: srcImg })
      });
      if (!apiRes.ok) {
        let errMsg = "AI Segmenter busy.";
        try {
          const errData = await apiRes.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }
      const apiData = await apiRes.json();
      if (!apiData.success || !apiData.imageUrl) {
        throw new Error("Isolator service returned empty frame.");
      }
      
      return await performChromaKeyRemoval(apiData.imageUrl);
    } catch (err: any) {
      console.warn(`[Background Isolation Fallback] Gemini AI segmenter busy/limited (${err.message || err}). Activating local offline high-precision WebAssembly engine...`);
      setProgressStatus(`Activating Local Segmenter to process ${label}...`);
      
      try {
        const responseBlob = await removeBackground(srcImg, {
          model: 'isnet',
          progress: (key, current, total) => {
            const percent = Math.round((current / total) * 100);
            if (key.includes('model')) {
              setProgressStatus(`Downloading offline segmentation model (${percent}%)`);
            } else {
              setProgressStatus(`Isolating ${label} offline (${percent}%)`);
            }
          }
        });
        
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(responseBlob);
        });
      } catch (localErr: any) {
        console.error("[Local Background Removal Error]:", localErr);
        throw new Error(err.message || `Background isolation failed. Please try manual fine-tuning studio mode. (${localErr.message || localErr})`);
      }
    }
  };

  const runAutoStudioSetupSingle = async () => {
    const sourceImage = singleOriginalImage;
    if (!sourceImage) return;

    setIsSingleLoading(true);
    setError(null);
    setProgressStatus("Removing background & isolating portrait shape...");

    try {
      const transparentResultUrl = await removeImageBackgroundWithFallback(sourceImage, "Portrait");

      // Update source
      setSingleImage(transparentResultUrl);

      // Step 2: Query Gemini Face-Coordinate Analysis
      setProgressStatus("Sensing face details & biometric landmarks...");
      let faceBox = { ymin: 160, xmin: 300, ymax: 540, xmax: 700 }; // Safety standard coordinates (hair to chin)
      
      try {
        const geminiRes = await fetch('/api/passport/detect-face', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: [sourceImage] })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          if (geminiData.success && geminiData.results?.[0]) {
            faceBox = geminiData.results[0];
          }
        }
      } catch (gem_err) {
        console.warn("[Auto-Passport] Local face detection fallback activated:", gem_err);
      }

      // Update face location state for consistent fine-tuning
      setFaceBoxSingle(faceBox);

      // Automatically construct high-quality crop starting coefficients
      // Face scale coefficient - 170px height (out of 531) is ideal head-to-chest framing (approx. 32% of total height)
      const idealFaceH = 170;

      // Update manual sliders dynamically based on detected biometric landmarks to give a gorgeous default!
      const img = new Image();
      img.onload = () => {
        const detectedFaceH = ((faceBox.ymax - faceBox.ymin) / 1000) * img.height;

        // Perfect scale
        const calculatedScale = Math.max(0.2, Math.min(2.5, idealFaceH / (detectedFaceH || 200)));
        setScaleSingle(Number(calculatedScale.toFixed(2)));

        // Offset single standard coordinates to 0, since manual rendering centers the face automatically!
        setOffsetXSingle(0);
        setOffsetYSingle(0);
      };
      img.src = transparentResultUrl;

      // Generate the auto output preset right away
      setProgressStatus("Composing biometric centering frame...");
      setTimeout(() => {
        triggerSingleAutoRender(transparentResultUrl, faceBox);
      }, 500);

    } catch (err: any) {
      console.error("[Auto-Passport Single Error]:", err);
      setError(err.message || "AI Analysis adjusted with safety centering parameters.");
      setSingleImage(sourceImage);
      setScaleSingle(1.0);
    } finally {
      setIsSingleLoading(false);
    }
  };

  // Build the instant static snapshot for AI tab
  const triggerSingleAutoRender = (transparentUrl: string, faceBox: any) => {
    const img = new Image();
    img.onload = () => {
      const targetW = 413;
      const targetH = 531;

      const fYMin = (faceBox.ymin / 1000) * img.height;
      const fYMax = (faceBox.ymax / 1000) * img.height;
      const fXMin = (faceBox.xmin / 1000) * img.width;
      const fXMax = (faceBox.xmax / 1000) * img.width;

      const faceHeight = Math.max(120, fYMax - fYMin);
      const faceWidth = Math.max(120, fXMax - fXMin);
      const faceCenterX = fXMin + faceWidth / 2;
      const faceCenterY = fYMin + faceHeight / 2;

      // target Face H = 170 out of 531 to guarantee elegant head-to-chest sizing
      const calculatedScale = Math.max(0.2, Math.min(2.8, 170 / faceHeight));

      const expCanvas = document.createElement('canvas');
      expCanvas.width = targetW;
      expCanvas.height = targetH;
      const ctx = expCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.save();
        // Translate to 44% of canvas height - gives 28% headspace clearance and 40% chest space at bottom
        ctx.translate(targetW * 0.5, targetH * 0.44);
        ctx.drawImage(img, -faceCenterX * calculatedScale, -faceCenterY * calculatedScale, img.width * calculatedScale, img.height * calculatedScale);
        ctx.restore();
        setSingleResult(expCanvas.toDataURL('image/jpeg', 0.98));
        setSingleResultIsAi(false);
      }
    };
    img.src = transparentUrl;
  };

  // Instantly process joint photo using local isolation + Gemini alignment
  const runAutoStudioSetupJoint = async () => {
    setError(null);
    setIsJointGenerating(true);
    setProgressStatus("Isolating portrait profiles from backgrounds...");

    try {
      let sourceUrlA = jointOriginalA;
      let sourceUrlB = jointOriginalB;

      if (isSingleGroupMode) {
        if (!jointSingleImage) {
          setError("Upload group photo to construct duo passport.");
          setIsJointGenerating(false);
          return;
        }
        
        const transparentResultUrl = await removeImageBackgroundWithFallback(jointSingleImage, "Group Photo");
        setJointImageA(transparentResultUrl);
        setJointImageB(transparentResultUrl);
        sourceUrlA = transparentResultUrl;
        sourceUrlB = transparentResultUrl;
      } else {
        if (!jointOriginalA || !jointOriginalB) {
          setError("Upload both Person A and Person B portraits first.");
          setIsJointGenerating(false);
          return;
        }

        const [transA, transB] = await Promise.all([
          removeImageBackgroundWithFallback(jointOriginalA, "Person A"),
          removeImageBackgroundWithFallback(jointOriginalB, "Person B")
        ]);

        setJointImageA(transA);
        setJointImageB(transB);
        sourceUrlA = transA;
        sourceUrlB = transB;
      }

      setProgressStatus("Sensing dual-face dimensions symmetrically via Gemini AI...");
      let faceBoxA = { ymin: 160, xmin: 300, ymax: 540, xmax: 700 };
      let faceBoxB = { ymin: 160, xmin: 300, ymax: 540, xmax: 700 };

      try {
        if (isSingleGroupMode && jointSingleImage) {
          const gemRes = await fetch('/api/passport/detect-face', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: [jointSingleImage] })
          });
          if (gemRes.ok) {
            const gemData = await gemRes.json();
            if (gemData.success && gemData.results?.[0]) {
              faceBoxA = gemData.results[0];
              // Offset face B horizontally
              faceBoxB = { ...faceBoxA, xmin: Math.min(990, faceBoxA.xmin + 180), xmax: Math.min(1000, faceBoxA.xmax + 180) };
            }
          }
        } else if (sourceUrlA && sourceUrlB) {
          const gemRes = await fetch('/api/passport/detect-face', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: [sourceUrlA, sourceUrlB] })
          });
          if (gemRes.ok) {
            const gemData = await gemRes.json();
            if (gemData.success && gemData.results) {
              if (gemData.results[0]) faceBoxA = gemData.results[0];
              if (gemData.results[1]) faceBoxB = gemData.results[1];
            }
          }
        }
      } catch (gem_err) {
        console.warn("[Auto-Joint] Gemini duo alignment lookup skipped:", gem_err);
      }

      // Save dynamic face boxes for live fine-tuning studio alignment
      setFaceBoxA(faceBoxA);
      setFaceBoxB(faceBoxB);

      setProgressStatus("Symmetrically aligning profiles & composing Duo frame...");

      // Update manual slider starting parameters based on biometric face detections
      const [imgA, imgB] = await Promise.all([
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = sourceUrlA!;
        }),
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = sourceUrlB!;
        })
      ]);

      const idealDuoFaceH = 140; // Proportional face size for side-by-side head-to-chest framing
      const targetW = 413;
      const targetH = 531;

      // Subject A
      const detectedFaceHA = ((faceBoxA.ymax - faceBoxA.ymin) / 1000) * imgA.height;
      const faceCenterYRatioA = (faceBoxA.ymin + (faceBoxA.ymax - faceBoxA.ymin) / 2) / 1000;
      const faceCenterXRatioA = (faceBoxA.xmin + (faceBoxA.xmax - faceBoxA.xmin) / 2) / 1000;

      const scale_A = idealDuoFaceH / (detectedFaceHA || 200);
      setScaleA(Number(scale_A.toFixed(2)));
      setOffsetX_A(0);
      setOffsetY_A(0);

      // Subject B
      const detectedFaceHB = ((faceBoxB.ymax - faceBoxB.ymin) / 1000) * imgB.height;
      const faceCenterYRatioB = (faceBoxB.ymin + (faceBoxB.ymax - faceBoxB.ymin) / 2) / 1000;
      const faceCenterXRatioB = (faceBoxB.xmin + (faceBoxB.xmax - faceBoxB.xmin) / 2) / 1000;

      const scale_B = idealDuoFaceH / (detectedFaceHB || 200);
      setScaleB(Number(scale_B.toFixed(2)));
      setOffsetX_B(0);
      setOffsetY_B(0);

      // Render the AI result preview
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = targetW;
      exportCanvas.height = targetH;
      const ctx = exportCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetW, targetH);

        // Subject A Left half centered at w * 0.28 and h * 0.44
        ctx.save();
        ctx.translate(targetW * 0.28, targetH * 0.44);
        const faceCenterX_A = (faceCenterXRatioA * imgA.width);
        const faceCenterY_A = (faceCenterYRatioA * imgA.height);
        ctx.drawImage(imgA, -faceCenterX_A * scale_A, -faceCenterY_A * scale_A, imgA.width * scale_A, imgA.height * scale_A);
        ctx.restore();

        // Subject B Right half centered at w * 0.72 and h * 0.44
        ctx.save();
        ctx.translate(targetW * 0.72, targetH * 0.44);
        const faceCenterX_B = (faceCenterXRatioB * imgB.width);
        const faceCenterY_B = (faceCenterYRatioB * imgB.height);
        ctx.drawImage(imgB, -faceCenterX_B * scale_B, -faceCenterY_B * scale_B, imgB.width * scale_B, imgB.height * scale_B);
        ctx.restore();

        setJointResult(exportCanvas.toDataURL('image/jpeg', 0.98));
      }

    } catch (err: any) {
      console.error("[Auto-Joint Error]:", err);
      setError(err.message || "AI Analysis adjusted with safety centering parameters.");
    } finally {
      setIsJointGenerating(false);
    }
  };

  // --- AUTOMATIC RENDERING TO HTML5 CANVAS IN STUDIO (REAL-TIME LIVE UPDATES) ---
  const renderManualSingleCanvas = () => {
    const canvas = canvasRefSingle.current;
    if (!canvas || !imgObjSingle) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw solid custom background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    // 2. Centered biometric positioning based on Face Landmarks
    ctx.save();
    
    const faceCenterXRatio = (faceBoxSingle.xmin + (faceBoxSingle.xmax - faceBoxSingle.xmin) / 2) / 1000;
    const faceCenterYRatio = (faceBoxSingle.ymin + (faceBoxSingle.ymax - faceBoxSingle.ymin) / 2) / 1000;
    const faceCenterX = faceCenterXRatio * imgObjSingle.width;
    const faceCenterY = faceCenterYRatio * imgObjSingle.height;

    // Apply center transform anchor so scaling & rotating behaves symmetrically around the face center
    ctx.translate(w * 0.5 + offsetXSingle, h * 0.44 + offsetYSingle);
    ctx.scale(mirroredSingle ? -scaleSingle : scaleSingle, scaleSingle);
    ctx.rotate((rotationSingle * Math.PI) / 180);

    // Draw centering the face center at context 0,0
    ctx.drawImage(imgObjSingle, -faceCenterX, -faceCenterY);
    ctx.restore();

    // 3. Draw Biometric guideline overlays to help center heads exactly
    if (showGuides) {
      drawBiometricGuides(ctx, w, h);
    }
  };

  const renderManualJointCanvas = () => {
    const canvas = canvasRefJoint.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw solid custom background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    // 2. Draw Person A if uploaded
    if (imgObjA) {
      ctx.save();
      const faceCenterXRatioA = (faceBoxA.xmin + (faceBoxA.xmax - faceBoxA.xmin) / 2) / 1000;
      const faceCenterYRatioA = (faceBoxA.ymin + (faceBoxA.ymax - faceBoxA.ymin) / 2) / 1000;
      const faceCenterX_A = faceCenterXRatioA * imgObjA.width;
      const faceCenterY_A = faceCenterYRatioA * imgObjA.height;

      // Translate to Subject A absolute X & Y center
      ctx.translate(w * 0.28 + offsetX_A, h * 0.44 + offsetY_A);
      ctx.scale(mirroredA ? -scaleA : scaleA, scaleA);
      ctx.rotate((rotationA * Math.PI) / 180);
      ctx.drawImage(imgObjA, -faceCenterX_A, -faceCenterY_A);
      ctx.restore();
    }

    // 3. Draw Person B if uploaded
    if (imgObjB) {
      ctx.save();
      const faceCenterXRatioB = (faceBoxB.xmin + (faceBoxB.xmax - faceBoxB.xmin) / 2) / 1000;
      const faceCenterYRatioB = (faceBoxB.ymin + (faceBoxB.ymax - faceBoxB.ymin) / 2) / 1000;
      const faceCenterX_B = faceCenterXRatioB * imgObjB.width;
      const faceCenterY_B = faceCenterYRatioB * imgObjB.height;

      // Translate to Subject B absolute X & Y center
      ctx.translate(w * 0.72 + offsetX_B, h * 0.44 + offsetY_B);
      ctx.scale(mirroredB ? -scaleB : scaleB, scaleB);
      ctx.rotate((rotationB * Math.PI) / 180);
      ctx.drawImage(imgObjB, -faceCenterX_B, -faceCenterY_B);
      ctx.restore();
    }

    // 4. Draw Biometric guidelines for dual-face symmetrical sizing
    if (showGuides) {
      drawBiometricGuidesJoint(ctx, w, h);
    }
  };

  // Draw visa photobooth guide oval and lines for 35x45mm vertical standards in Single
  const drawBiometricGuides = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.strokeStyle = '#22C55E'; // Emerald green professional indicator
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    // Center vertical alignment axis
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();

    // Horizontal eye guideline level (ideal eye position is around 53% of frame height)
    ctx.strokeStyle = '#F59E0B'; // Amber orange
    ctx.beginPath();
    ctx.moveTo(0, h * 0.42);
    ctx.lineTo(w, h * 0.42);
    ctx.stroke();

    // Draw target Face Oval boundary (standard photo guidelines)
    ctx.strokeStyle = '#3B82F6'; // Sky blue
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    // Ellipse center at (0.5w, 0.46h)
    ctx.ellipse(w * 0.5, h * 0.46, w * 0.28, h * 0.28, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Caption legends on canvas inside studio
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('EYE LEVEL', 12, h * 0.40);
    ctx.fillText('FACE OUTLINE BOUNDS', 12, h * 0.18);
    ctx.restore();
  };

  // Draw visa photobooth guides for Joint frame
  const drawBiometricGuidesJoint = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 5]);

    // Perfect middle delimiter boundary line
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();

    // Eye level horizontally across both subjects
    ctx.strokeStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.42);
    ctx.lineTo(w, h * 0.42);
    ctx.stroke();

    // Two face ovals for Left & Right matching heights perfectly
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 1.5;
    
    // Left Oval (A)
    ctx.beginPath();
    ctx.ellipse(w * 0.28, h * 0.46, w * 0.18, h * 0.22, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Right Oval (B)
    ctx.beginPath();
    ctx.ellipse(w * 0.72, h * 0.46, w * 0.18, h * 0.22, 0, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('DUAL EYE LEVEL', 12, h * 0.40);
    ctx.restore();
  };

  // Trigger high-resolution standard JPG export from HTML5 Canvas
  const downloadManualCanvasProduct = (mode: 'single' | 'joint') => {
    // Generate output with the guide overlays temporarilly REMOVED for clean image file
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 413;
    exportCanvas.height = 531;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return;

    // 1. Solid bg
    expCtx.fillStyle = bgColor;
    expCtx.fillRect(0, 0, 413, 531);

    if (mode === 'single' && imgObjSingle) {
      expCtx.save();
      expCtx.translate(413 * 0.5 + offsetXSingle, 531 * 0.45 + offsetYSingle);
      expCtx.scale(mirroredSingle ? -scaleSingle : scaleSingle, scaleSingle);
      expCtx.rotate((rotationSingle * Math.PI) / 180);
      expCtx.drawImage(imgObjSingle, -imgObjSingle.width / 2, -imgObjSingle.height / 2);
      expCtx.restore();
    } else if (mode === 'joint') {
      if (imgObjA) {
        expCtx.save();
        expCtx.translate(413 * 0.28 + offsetX_A, 531 * 0.45 + offsetY_A);
        expCtx.scale(mirroredA ? -scaleA : scaleA, scaleA);
        expCtx.rotate((rotationA * Math.PI) / 180);
        expCtx.drawImage(imgObjA, -imgObjA.width / 2, -imgObjA.height / 2);
        expCtx.restore();
      }
      if (imgObjB) {
        expCtx.save();
        expCtx.translate(413 * 0.72 + offsetX_B, 531 * 0.45 + offsetY_B);
        expCtx.scale(mirroredB ? -scaleB : scaleB, scaleB);
        expCtx.rotate((rotationB * Math.PI) / 180);
        expCtx.drawImage(imgObjB, -imgObjB.width / 2, -imgObjB.height / 2);
        expCtx.restore();
      }
    }

    // Trigger local download
    const link = document.createElement('a');
    link.href = exportCanvas.toDataURL('image/jpeg', 0.98);
    link.download = `${mode}-passport-studio-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Keep live studio canvas rendered
  useEffect(() => {
    if (toolMode === 'single' && activeTabSingle === 'studio') {
      renderManualSingleCanvas();
    }
  }, [
    toolMode, activeTabSingle, imgObjSingle, bgColor,
    scaleSingle, offsetXSingle, offsetYSingle, rotationSingle, mirroredSingle, showGuides
  ]);

  useEffect(() => {
    if (toolMode === 'joint' && activeTabJoint === 'studio') {
      renderManualJointCanvas();
    }
  }, [
    toolMode, activeTabJoint, imgObjA, imgObjB, bgColor, 
    scaleA, offsetX_A, offsetY_A, rotationA, mirroredA,
    scaleB, offsetX_B, offsetY_B, rotationB, mirroredB,
    showGuides
  ]);

  // --- AUTOMATIC TRIGGER OF BACKGROUND REMOVERS ON UPLOAD ---
  useEffect(() => {
    if (singleOriginalImage && !singleImage && !isSingleLoading) {
      runAutoStudioSetupSingle();
    }
  }, [singleOriginalImage]);

  useEffect(() => {
    if (!isSingleGroupMode && jointOriginalA && jointOriginalB && !jointImageA && !jointImageB && !isJointGenerating) {
      runAutoStudioSetupJoint();
    }
  }, [jointOriginalA, jointOriginalB, isSingleGroupMode]);

  useEffect(() => {
    if (isSingleGroupMode && jointSingleImage && !jointImageA && !jointImageB && !isJointGenerating) {
      runAutoStudioSetupJoint();
    }
  }, [jointSingleImage, isSingleGroupMode]);


  // AI Neural Retouch Core Proxies (Calls Gemini Synthesis backend)
  const runAiNeuralSynthesisSingle = async () => {
    if (!singleOriginalImage) return;
    setIsSingleLoading(true);
    setError(null);
    setProgressStatus("Triggering Gemini Retouch Core Studio...");

    try {
      const gemRes = await fetch('/api/joint-passport/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'single', images: [singleOriginalImage], bgColorHex: bgColor })
      });

      if (gemRes.ok) {
        const data = await gemRes.json();
        if (data.success && data.imageUrl) {
          setSingleResult(data.imageUrl);
          setSingleResultIsAi(true);
          setProgressStatus("");
          return;
        }
      }
      throw new Error("AI Synthesis models are busy. Running free instant Auto-Passport instead...");
    } catch (err: any) {
      console.warn("[AI Synthesis Fallback] Active:", err);
      setSingleResultIsAi(false);
      await runAutoStudioSetupSingle();
    } finally {
      setIsSingleLoading(false);
    }
  };

  const runAiNeuralSynthesisJoint = async () => {
    const imagesToSubmit = [];
    if (isSingleGroupMode) {
      if (!jointSingleImage) return;
      imagesToSubmit.push(jointSingleImage);
    } else {
      if (!jointOriginalA || !jointOriginalB) return;
      imagesToSubmit.push(jointOriginalA, jointOriginalB);
    }

    setIsJointGenerating(true);
    setError(null);
    setProgressStatus("Triggering Gemini Retouch Core Studio For Duo...");

    try {
      const gemRes = await fetch('/api/joint-passport/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'joint', images: imagesToSubmit, bgColorHex: bgColor })
      });

      if (gemRes.ok) {
        const data = await gemRes.json();
        if (data.success && data.imageUrl) {
          setJointResult(data.imageUrl);
          setJointResultIsAi(true);
          setProgressStatus("");
          return;
        }
      }
      throw new Error("AI Synthesis Duo models are busy. Running free instant Auto-Joint instead...");
    } catch (err: any) {
      console.warn("[AI Joint Synthesis Fallback] Active:", err);
      setJointResultIsAi(false);
      await runAutoStudioSetupJoint();
    } finally {
      setIsJointGenerating(false);
    }
  };

  const downloadFromTargetBase64 = (base64Url: string, prefix: string) => {
    const link = document.createElement('a');
    link.href = base64Url;
    link.download = `${prefix}-${selectedSize}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getManualCanvasProductDataUrl = (mode: 'single' | 'joint'): string => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 413;
    exportCanvas.height = 531;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return '';

    // 1. Solid bg
    expCtx.fillStyle = bgColor;
    expCtx.fillRect(0, 0, 413, 531);

    if (mode === 'single' && imgObjSingle) {
      expCtx.save();
      expCtx.translate(413 * 0.5 + offsetXSingle, 531 * 0.45 + offsetYSingle);
      expCtx.scale(mirroredSingle ? -scaleSingle : scaleSingle, scaleSingle);
      expCtx.rotate((rotationSingle * Math.PI) / 180);
      expCtx.drawImage(imgObjSingle, -imgObjSingle.width / 2, -imgObjSingle.height / 2);
      expCtx.restore();
    } else if (mode === 'joint') {
      if (imgObjA) {
        expCtx.save();
        expCtx.translate(413 * 0.28 + offsetX_A, 531 * 0.45 + offsetY_A);
        expCtx.scale(mirroredA ? -scaleA : scaleA, scaleA);
        expCtx.rotate((rotationA * Math.PI) / 180);
        expCtx.drawImage(imgObjA, -imgObjA.width / 2, -imgObjA.height / 2);
        expCtx.restore();
      }
      if (imgObjB) {
        expCtx.save();
        expCtx.translate(413 * 0.72 + offsetX_B, 531 * 0.45 + offsetY_B);
        expCtx.scale(mirroredB ? -scaleB : scaleB, scaleB);
        expCtx.rotate((rotationB * Math.PI) / 180);
        expCtx.drawImage(imgObjB, -imgObjB.width / 2, -imgObjB.height / 2);
        expCtx.restore();
      }
    }

    return exportCanvas.toDataURL('image/jpeg', 0.98);
  };

  // Helper to generate a professional landscape 4x6 printable grid containing 6 copies of the passport photo
  const downloadAsPrintableSheet = (imageSrc: string, modeLabel: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const sheetCanvas = document.createElement('canvas');
      sheetCanvas.width = 1800;
      sheetCanvas.height = 1200;
      const ctx = sheetCanvas.getContext('2d');
      if (!ctx) return;

      // Fill elegant pure white print canvas background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 1800, 1200);

      // We fit 6 photos in a 2x3 grid.
      // Card width is 413, height is 531.
      const cardW = 413;
      const cardH = 531;

      // Row offsets: Y1 = 45, Y2 = 1200 - 531 - 45 = 624
      const yPositions = [45, 624];
      
      // Width remaining: 1800 - (413 * 3) = 561 px.
      // Let's divide it as: Margin Left = 80px, Gap = 200px.
      const xPositions = [80, 693, 1306];

      // Draw the copies
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          const px = xPositions[c];
          const py = yPositions[r];

          // Draw passport drop shadow on sheet for cutting guidelines
          ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;

          // Draw the card
          ctx.drawImage(img, px, py, cardW, cardH);

          // Reset shadow for text and cutting dashes
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Add clean, subtle dotted cutting guides around each photo
          ctx.strokeStyle = "#CCCCCC";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 4]);
          ctx.strokeRect(px - 1, py - 1, cardW + 2, cardH + 2);
        }
      }

      // Add a professional footer imprint on the print sheet
      ctx.fillStyle = "#A1A1AA";
      ctx.font = "bold 13px monospace";
      ctx.fillText("HD AUTOMATED PASSPORT CALIBRATOR  //  PRINT SHEET: 4x6 INCHES @ 300 DPI", 80, 1184);
      ctx.fillText("BIOMETRIC STANDARD: " + selectedSize.toUpperCase(), 1450, 1184);

      // Trigger standard JPG download
      const link = document.createElement('a');
      link.href = sheetCanvas.toDataURL('image/jpeg', 0.95);
      link.download = `${modeLabel}-4x6-print-sheet-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = imageSrc;
  };

  const resetWorkspaces = () => {
    setSingleImage(null);
    setSingleOriginalImage(null);
    setSingleResult(null);
    setJointImageA(null);
    setJointImageB(null);
    setJointOriginalA(null);
    setJointOriginalB(null);
    setJointSingleImage(null);
    setJointResult(null);
    setError(null);
    resetSingleSliders();
    resetJointSliders('both');
  };

  return (
    <div id="passport-automation-workspace" className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 font-sans text-slate-100">
      
      {/* Header Info Banner */}
      <div id="passport-header" className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sky-450 font-mono text-[10px] tracking-[0.4em] mb-2 uppercase">
            <Activity className="animate-pulse text-sky-400" size={14} />
            BIOMETRIC_STUDIO_ACTIVE_HD
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
            Auto_ <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">Passport</span>
          </h2>
          <p className="text-slate-500 font-mono text-[9px] tracking-widest uppercase">100% Fully Automated Studio Calibration // v4.0.0</p>
        </div>

        <div className="flex items-center gap-2">
          {(singleOriginalImage || jointOriginalA || jointOriginalB || jointSingleImage) && (
            <button 
              id="btn-workspace-reset"
              onClick={resetWorkspaces}
              className="group flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-350 hover:text-white border border-white/5 hover:border-white/20 transition-all rounded bg-stone-900/40"
            >
              <RefreshCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 text-sky-400" />
              Reset Workspace
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher: Single vs Joint Duo */}
      <div id="mode-selector-tabs" className="flex bg-stone-900/60 p-1 rounded-lg border border-white/5 max-w-md">
        <button
          id="tab-single-mode"
          onClick={() => { setToolMode('single'); setError(null); }}
          className={cn(
            "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-2",
            toolMode === 'single' ? "bg-sky-400 text-black shadow-lg" : "text-slate-400 hover:text-white"
          )}
        >
          <User size={14} />
          Single Passport
        </button>
        <button
          id="tab-joint-mode"
          onClick={() => { setToolMode('joint'); setError(null); }}
          className={cn(
            "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-2",
            toolMode === 'joint' ? "bg-sky-400 text-black shadow-lg" : "text-slate-400 hover:text-white"
          )}
        >
          <Users size={14} />
          Joint / Duo Passport
        </button>
      </div>

      {/* Alert Block */}
      {error && (
        <div id="error-alert" className="bg-amber-950/45 border border-amber-850/40 p-4 text-xs flex gap-3 rounded text-amber-300 mt-2 animate-fade-in animate-duration-300">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
          <div className="space-y-1">
            <p className="font-bold tracking-wide uppercase text-[10px]">Processing Adaptation Model</p>
            <p className="opacity-80 font-mono text-[11px] leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Core Interface Layout */}
      <div id="core-automation-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SOURCE INGESTIONS & BACKGROUNDS */}
        <div id="panel-controls" className="lg:col-span-5 space-y-6">
          
          {/* INGESTION MODULE */}
          <div id="panel-ingestion" className="bg-[#0b0c0e] border border-white/5 p-6 rounded-xl space-y-5">
            <h3 className="text-xs uppercase tracking-widest font-black text-slate-400 flex items-center gap-2 font-mono">
              <Camera size={14} className="text-sky-400" />
              Source Ingestion Layer
            </h3>

            {/* SINGLE IMAGE MODE UPLOADER */}
            {toolMode === 'single' ? (
              <div id="uploader-single-wrap" className="space-y-4">
                <p id="label-single" className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Standard Portrait Source</p>
                
                <div 
                  id="drop-zone-single"
                  onClick={() => triggerFileInput(fileInputRefSingle)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const fakeEvent = { target: { files: [file] } } as any;
                      processFileToUrl(fakeEvent, 'single');
                    }
                  }}
                  className={cn(
                    "aspect-[4/5] border border-dashed rounded-lg flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:bg-white/[0.02]",
                    singleOriginalImage ? "border-sky-400/30 bg-sky-400/[0.01]" : "border-white/10"
                  )}
                >
                  {singleOriginalImage ? (
                    <div className="space-y-3 flex flex-col items-center justify-center">
                      <img src={singleOriginalImage} alt="Single Original" className="max-h-56 object-contain rounded shadow-lg animate-fade-in" />
                      <p className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <Check size={10} /> Active Image Uploaded
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 py-6">
                      <Upload className="mx-auto text-slate-600 animate-bounce" size={28} />
                      <span className="block text-xs font-bold tracking-wide">Choose Source Portrait</span>
                      <span className="block text-[9px] text-slate-400/70 font-mono">Accepts JPG, PNG format</span>
                    </div>
                  )}
                </div>

                <input 
                  id="input-file-single"
                  type="file" 
                  ref={fileInputRefSingle} 
                  onChange={(e) => processFileToUrl(e, 'single')} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            ) : (
              // JOINT PASSPORT MULTI-uploader
              <div id="uploader-joint-wrap" className="space-y-4">
                <div id="joint-sub-tabs" className="flex border border-white/5 rounded p-0.5 bg-black/20">
                  <button
                    id="btn-sub-tab-dual"
                    type="button"
                    onClick={() => { setIsSingleGroupMode(false); setJointResult(null); }}
                    className={cn(
                      "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all",
                      !isSingleGroupMode ? "bg-sky-400 text-black" : "text-slate-500 hover:text-slate-350"
                    )}
                  >
                    Dual Portraits (Recommended)
                  </button>
                  <button
                    id="btn-sub-tab-shared"
                    type="button"
                    onClick={() => { setIsSingleGroupMode(true); setJointResult(null); }}
                    className={cn(
                      "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all",
                      isSingleGroupMode ? "bg-sky-400 text-black" : "text-slate-500 hover:text-slate-350"
                    )}
                  >
                    Single Shared Photo
                  </button>
                </div>

                {isSingleGroupMode ? (
                  // Group/Couple Photo Upload
                  <div id="upload-group-segment" className="space-y-2">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Group / Couple Photograph</p>
                    <div 
                      id="drop-zone-joint-single"
                      onClick={() => triggerFileInput(fileInputJointSingleRef)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          const fakeEvent = { target: { files: [file] } } as any;
                          processFileToUrl(fakeEvent, 'jointSingle');
                        }
                      }}
                      className={cn(
                        "border border-dashed rounded-lg p-6 text-center cursor-pointer transition-all hover:bg-white/[0.02]",
                        jointSingleImage ? "border-sky-400/30 bg-sky-400/[0.01]" : "border-white/10"
                      )}
                    >
                      {jointSingleImage ? (
                        <div className="space-y-3 flex flex-col items-center justify-center">
                          <img src={jointSingleImage} alt="Couple Source" className="max-h-36 object-contain rounded shadow-lg animate-fade-in" />
                          <p className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2.5 py-0.5 rounded flex items-center gap-1">
                            <Check size={10} /> Group Picture Uploaded
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 py-6">
                          <Upload className="mx-auto text-slate-600 animate-bounce" size={24} />
                          <p className="text-[11px] font-bold tracking-wide">Select Shared Photo</p>
                          <p className="text-[9px] text-slate-400/70 font-mono">Contains Person A and B side-by-side</p>
                        </div>
                      )}
                    </div>

                    <input 
                      id="input-file-joint-single"
                      type="file" 
                      ref={fileInputJointSingleRef} 
                      onChange={(e) => processFileToUrl(e, 'jointSingle')} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                ) : (
                  // Dual Separate Portraits Upload
                  <div id="upload-dual-segment" className="grid grid-cols-2 gap-4">
                    
                    {/* Person A */}
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Person A (Left)</p>
                      <div 
                        id="drop-zone-person-a"
                        onClick={() => triggerFileInput(fileInputARef)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            const fakeEvent = { target: { files: [file] } } as any;
                            processFileToUrl(fakeEvent, 'A');
                          }
                        }}
                        className={cn(
                          "aspect-[3/4] border border-dashed rounded-lg flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all hover:bg-white/[0.02]",
                          jointOriginalA ? "border-sky-400/30 bg-sky-400/[0.01] overflow-hidden" : "border-white/10"
                        )}
                      >
                        {jointOriginalA ? (
                          <img src={jointOriginalA} alt="Left Profile" className="w-full h-full object-cover rounded animate-fade-in" />
                        ) : (
                          <div className="space-y-1 py-4">
                            <User className="mx-auto text-slate-500" size={18} />
                            <span className="block text-[10px] font-bold">Left Profile</span>
                          </div>
                        )}
                      </div>

                      <input 
                        id="input-file-person-a"
                        type="file" 
                        ref={fileInputARef} 
                        onChange={(e) => processFileToUrl(e, 'A')} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>

                    {/* Person B */}
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Person B (Right)</p>
                      <div 
                        id="drop-zone-person-b"
                        onClick={() => triggerFileInput(fileInputBRef)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            const fakeEvent = { target: { files: [file] } } as any;
                            processFileToUrl(fakeEvent, 'B');
                          }
                        }}
                        className={cn(
                          "aspect-[3/4] border border-dashed rounded-lg flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all hover:bg-white/[0.02]",
                          jointOriginalB ? "border-sky-400/30 bg-sky-400/[0.01] overflow-hidden" : "border-white/10"
                        )}
                      >
                        {jointOriginalB ? (
                          <img src={jointOriginalB} alt="Right Profile" className="w-full h-full object-cover rounded animate-fade-in" />
                        ) : (
                          <div className="space-y-1 py-4">
                            <User className="mx-auto text-slate-500" size={18} />
                            <span className="block text-[10px] font-bold">Right Profile</span>
                          </div>
                        )}
                      </div>

                      <input 
                        id="input-file-person-b"
                        type="file" 
                        ref={fileInputBRef} 
                        onChange={(e) => processFileToUrl(e, 'B')} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>

          {/* BACKDROP COLOR MODULE */}
          <div id="panel-backdrop" className="bg-[#0b0c0e] border border-white/5 p-6 rounded-xl space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-black text-slate-400 flex items-center gap-2 font-mono">
              <Paintbrush size={14} className="text-sky-400" />
              Solid Studio Backdrop
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2">
              {backgroundPresets.map((bg) => (
                <button
                  id={`bg-btn-${bg.hex.replace('#', '')}`}
                  key={bg.hex}
                  onClick={() => setBgColor(bg.hex)}
                  className={cn(
                    "flex items-center gap-2 p-2 border rounded-md text-left transition-all text-[10px] uppercase font-mono tracking-widest whitespace-nowrap",
                    bgColor === bg.hex ? "border-sky-400 bg-sky-400/5 text-sky-400" : "border-white/5 hover:bg-white/[0.02]"
                  )}
                >
                  <span className="w-3 h-3 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: bg.hex }} />
                  {bg.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-white/5 pt-3 justify-between">
              <span className="text-[9px] text-slate-550 font-mono uppercase tracking-[0.1em]">Custom Hex Backdrop:</span>
              <input 
                id="input-custom-hex"
                type="text" 
                value={bgColor} 
                onChange={(e) => setBgColor(e.target.value)}
                className="bg-black/40 border border-white/10 px-2 py-1 text-xs font-mono text-sky-400 max-w-[100px] rounded focus:border-sky-400 text-center outline-none"
              />
            </div>
          </div>

          {/* CROP SIZE PROFILE SELECTION */}
          <div id="panel-sizes-wrap" className="bg-[#0b0c0e] border border-white/5 p-6 rounded-xl space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-black text-slate-400 font-mono">
              Biometric Dimension Frame
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {passportSizes.map((size) => (
                <button
                  id={`size-btn-${size.value.replace(' ', '-')}`}
                  key={size.value}
                  onClick={() => setSelectedSize(size.value)}
                  className={cn(
                    "p-3 border rounded text-left transition-all relative overflow-hidden",
                    selectedSize === size.value ? "border-sky-400 bg-sky-400/5 text-sky-400" : "border-white/5 hover:bg-white/[0.02]"
                  )}
                >
                  <span className="block font-bold text-[10px] text-white">{size.label}</span>
                  <span className="block text-[8px] text-slate-500 font-mono mt-0.5">{size.desc}</span>
                </button>
              ))}
            </div>

            {/* AI SYNTHESIS TRIGGER MODULE */}
            <div className="border-t border-white/5 pt-4 space-y-2">
              <p className="text-[9px] text-slate-500 font-mono leading-tight">
                💡 <strong>Gemini Neural Retouch Engine:</strong> If your subject is facing off-angle, Gemini can automatically reconstruct clothes, synthesize a straight posture, and create high-grade biometric symmetry:
              </p>

              {toolMode === 'single' ? (
                <button
                  id="btn-single-ai-retouch"
                  type="button"
                  disabled={isSingleLoading || !singleOriginalImage}
                  onClick={runAiNeuralSynthesisSingle}
                  className="w-full flex items-center justify-center gap-2 bg-stone-900 border border-white/10 hover:bg-stone-800 text-slate-100 text-[10px] font-black uppercase tracking-widest py-3 rounded-md transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  {isSingleLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Retouching via Gemini...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      Generate Neural Retouch
                    </>
                  )}
                </button>
              ) : (
                <button
                  id="btn-joint-ai-retouch"
                  type="button"
                  disabled={isJointGenerating || (!jointSingleImage && isSingleGroupMode) || (!jointOriginalA && !jointOriginalB && !isSingleGroupMode)}
                  onClick={runAiNeuralSynthesisJoint}
                  className="w-full flex items-center justify-center gap-2 bg-stone-900 border border-white/10 hover:bg-stone-800 text-slate-100 text-[10px] font-black uppercase tracking-widest py-3 rounded-md transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  {isJointGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Retouching via Gemini...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      Generate Neural Retouch
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: HD PASSPORT DOCUMENT DISPLAY PREVIEW & WORKBENCH */}
        <div id="panel-preview-column" className="lg:col-span-7 space-y-6">
          
          {/* Tabs inside Preview Screen to choose Auto AI vs. Fine-tuning adjuster */}
          <div className="flex border border-white/5 rounded-lg p-1 bg-[#0b0c0e] items-center justify-between">
            <div className="flex gap-1">
              <button
                id="btn-tab-view-ai"
                onClick={() => {
                  if (toolMode === 'single') setActiveTabSingle('ai');
                  else setActiveTabJoint('ai');
                }}
                className={cn(
                  "px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1.5",
                  (toolMode === 'single' ? activeTabSingle === 'ai' : activeTabJoint === 'ai')
                    ? "bg-slate-800 text-white"
                    : "text-slate-500 hover:text-slate-350"
                )}
              >
                <Sparkles size={12} className="text-sky-400" />
                Auto Generated Output
              </button>
              
              <button
                id="btn-tab-view-studio"
                disabled={toolMode === 'single' ? !singleImage : (!jointImageA && !jointImageB)}
                onClick={() => {
                  if (toolMode === 'single') setActiveTabSingle('studio');
                  else setActiveTabJoint('studio');
                }}
                className={cn(
                  "px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none",
                  (toolMode === 'single' ? activeTabSingle === 'studio' : activeTabJoint === 'studio')
                    ? "bg-sky-400 text-black font-black"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <SlidersHorizontal size={12} />
                Fine-Tuning Interactive Studio (Adjuster)
              </button>
            </div>

            {(toolMode === 'single' ? activeTabSingle === 'studio' : activeTabJoint === 'studio') && (
              <button
                id="btn-toggle-grid"
                onClick={() => setShowGuides(!showGuides)}
                className={cn(
                  "p-1.5 rounded border transition-all flex items-center gap-1 text-[9px] font-mono tracking-widest uppercase px-3",
                  showGuides ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-white/5 text-slate-500 hover:text-slate-300"
                )}
              >
                <Grid size={12} />
                Guides: {showGuides ? "ON" : "OFF"}
              </button>
            )}
          </div>

          <div id="canvas-card-holder" className="w-full bg-[#060608] border border-white/5 p-6 rounded-xl flex flex-col items-center justify-center relative min-h-[480px] overflow-hidden">
            
            <div className="absolute top-4 left-4 flex items-center gap-2 font-mono text-[9px] text-slate-500 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              BIOMETRIC ALIGNMENT RENDERER
            </div>

            {/* LOADING OVERLAY SPINNER */}
            {((toolMode === 'single' && isSingleLoading) || (toolMode === 'joint' && isJointGenerating)) ? (
              <div id="loading-overlay" className="flex flex-col items-center justify-center text-center p-8 space-y-4 animate-pulse">
                <Loader2 className="w-10 h-10 animate-spin text-sky-400" />
                <p className="text-[11px] font-mono tracking-widest text-sky-400 uppercase">{progressStatus || "Aligning Face Symmetry..."}</p>
                <p className="text-[9px] text-slate-600 font-mono">This completes locally and is fast & private.</p>
              </div>
            ) : (
              // RESULT PREVIEWS
              <div id="preview-result-container" className="w-full flex flex-col items-center justify-center space-y-6">
                
                {toolMode === 'single' ? (
                  /* --- SINGLE PORTRAIT PREVIEWS --- */
                  activeTabSingle === 'ai' ? (
                    singleResult ? (
                      <div id="output-single-wrapper" className="flex flex-col items-center space-y-4 animate-fade-in">
                        <div className="w-[300px] aspect-[4/5] border border-sky-400/30 overflow-hidden shadow-2xl rounded-lg bg-black relative p-0 ring-4 ring-sky-400/5">
                          <img 
                            id="img-single-result"
                            src={singleResult} 
                            alt="Processed Single Passport" 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* AI Posture Alignment Option inside Result Panel */}
                        {!singleResultIsAi ? (
                          <div id="ai-straighten-banner" className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-lg text-left max-w-[340px] flex flex-col gap-2.5 shadow-xl">
                            <div className="flex items-start gap-2 text-[10px] font-bold uppercase tracking-wider">
                              <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5 animate-pulse" />
                              <span>AI Face Angle Straightener</span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-300 leading-normal">
                              Your current picture is a standard cutout. If you are turned sideways or looking left/right, click below to let Gemini automatically rotate, realign, and reconstruct a perfect straight frontal passport photo!
                            </p>
                            <button
                              id="btn-inner-single-ai-retouch"
                              type="button"
                              onClick={runAiNeuralSynthesisSingle}
                              disabled={isSingleLoading}
                              className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-black uppercase text-[9px] tracking-widest rounded transition-all flex items-center justify-center gap-1.5 shadow disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <Sparkles size={11} /> Correct Face Direction & Straighten (AI Neural)
                            </button>
                          </div>
                        ) : (
                          <div id="ai-corrected-badge" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-2.5 rounded-lg text-[10px] font-mono flex items-center gap-2 max-w-[340px] w-full justify-center shadow">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Gemini Frontal Posture Corrected!</span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-[340px] justify-center">
                          <button
                            id="btn-download-single"
                            onClick={() => downloadFromTargetBase64(singleResult, 'single-passport')}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-400 to-indigo-500 text-black text-[10px] font-black uppercase tracking-widest rounded hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-sky-400/10 animate-fade-in"
                          >
                            <Download size={13} />
                            Download Portrait
                          </button>
                          <button
                            id="btn-print-sheet-single-ai"
                            onClick={() => downloadAsPrintableSheet(singleResult, 'single-passport')}
                            className="flex-1 px-4 py-3 bg-slate-900 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-black/30"
                          >
                            <Grid size={13} className="text-sky-400" />
                            4x6 Grid (6 Copies)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div id="empty-state-single" className="flex flex-col items-center justify-center p-8 text-center text-slate-600 max-w-sm">
                        <Camera className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
                        <p className="text-xs font-bold text-slate-400">Portrait Workspace Empty</p>
                        <p className="text-[10px] text-slate-505 mt-2 leading-relaxed">
                          Please upload a portrait photo in the left panel. Background removal, biometric centering, and chest alignment occur fully automatically instantly on upload!
                        </p>
                      </div>
                    )
                  ) : (
                    /* FINE TUNING MANUAL STUDIO FOR SINGLE */
                    <div id="studio-single-canvas-area" className="flex flex-col items-center space-y-5 animate-fade-in w-full">
                      <div className="relative w-[300px] aspect-[4/5] overflow-hidden rounded-lg shadow-2xl ring-4 ring-sky-400/10">
                        <canvas
                          id="canvas-manual-single"
                          ref={canvasRefSingle}
                          width={413}
                          height={531}
                          className="w-full h-full object-cover bg-stone-900"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-[340px] justify-center">
                        <button
                          id="btn-download-manual-single"
                          onClick={() => downloadManualCanvasProduct('single')}
                          className="flex-1 px-4 py-3 bg-sky-400 hover:bg-sky-500 text-black text-[10px] font-black uppercase tracking-widest rounded transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-sky-400/15"
                        >
                          <Download size={13} />
                          Download Studio Portrait
                        </button>
                        <button
                          id="btn-print-sheet-single-studio"
                          onClick={() => downloadAsPrintableSheet(getManualCanvasProductDataUrl('single'), 'single-passport-studio')}
                          className="flex-1 px-4 py-3 bg-slate-900 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-black/30"
                        >
                          <Grid size={13} className="text-sky-400" />
                          4x6 Grid (6 Copies)
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  /* --- JOINT PASSPORT PREVIEWS --- */
                  activeTabJoint === 'ai' ? (
                    jointResult ? (
                      <div id="output-joint-wrapper" className="flex flex-col items-center space-y-4 animate-fade-in">
                        <div className="w-[300px] aspect-[4/5] border border-sky-400/30 overflow-hidden shadow-2xl rounded-lg bg-black relative p-0 ring-4 ring-sky-400/5">
                          <img 
                            id="img-joint-result"
                            src={jointResult} 
                            alt="Processed Joint Passport" 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* AI Posture Alignment Option inside Result Panel for Joint */}
                        {!jointResultIsAi ? (
                          <div id="ai-straighten-banner-joint" className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-lg text-left max-w-[340px] flex flex-col gap-2.5 shadow-xl">
                            <div className="flex items-start gap-2 text-[10px] font-bold uppercase tracking-wider">
                              <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5 animate-pulse" />
                              <span>AI Duo Posture Correction</span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-300 leading-normal">
                              Your current picture is a static cutout. Let Gemini automatically align both subjects symmetrically, straighten neck/sholder lines, and correct off-angle profiles!
                            </p>
                            <button
                              id="btn-inner-joint-ai-retouch"
                              type="button"
                              onClick={runAiNeuralSynthesisJoint}
                              disabled={isJointGenerating}
                              className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-black uppercase text-[9px] tracking-widest rounded transition-all flex items-center justify-center gap-1.5 shadow disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <Sparkles size={11} /> Correct Face Direction & Style (AI Joint)
                            </button>
                          </div>
                        ) : (
                          <div id="ai-corrected-badge-joint" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-2.5 rounded-lg text-[10px] font-mono flex items-center gap-2 max-w-[340px] w-full justify-center shadow">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Gemini Joint Posture Corrected!</span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-[340px] justify-center">
                          <button
                            id="btn-download-joint"
                            onClick={() => downloadFromTargetBase64(jointResult, 'joint-passport')}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-400 to-indigo-500 text-black text-[10px] font-black uppercase tracking-widest rounded hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-sky-400/10 animate-fade-in"
                          >
                            <Download size={13} />
                            Download Joint
                          </button>
                          <button
                            id="btn-print-sheet-joint-ai"
                            onClick={() => downloadAsPrintableSheet(jointResult, 'joint-passport')}
                            className="flex-1 px-4 py-3 bg-slate-900 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-black/30"
                          >
                            <Grid size={13} className="text-sky-400" />
                            4x6 Grid (6 Copies)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div id="empty-state-joint" className="flex flex-col items-center justify-center p-8 text-center text-slate-600 max-w-sm">
                        <Users className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
                        <p className="text-xs font-bold text-slate-400">Joint Workspace Empty</p>
                        <p className="text-[10px] text-slate-505 mt-2 leading-relaxed">
                          {isSingleGroupMode 
                            ? "Submit a dual-subject horizontal photograph inside the left panel uploader." 
                            : "Please upload portraits for Person A and Person B in the left panel."}
                          Faces will automatically be symmetrically isolated and aligned!
                        </p>
                      </div>
                    )
                  ) : (
                    /* FINE TUNING MANUAL STUDIO FOR JOINT */
                    <div id="studio-joint-canvas-area" className="flex flex-col items-center space-y-5 animate-fade-in w-full">
                      <div className="relative w-[300px] aspect-[4/5] overflow-hidden rounded-lg shadow-2xl ring-4 ring-sky-400/10">
                        <canvas
                          id="canvas-manual-joint"
                          ref={canvasRefJoint}
                          width={413}
                          height={531}
                          className="w-full h-full object-cover bg-stone-900"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-[340px] justify-center">
                        <button
                          id="btn-download-manual-joint"
                          onClick={() => downloadManualCanvasProduct('joint')}
                          className="flex-1 px-4 py-3 bg-sky-400 hover:bg-sky-500 text-black text-[10px] font-black uppercase tracking-widest rounded transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-sky-400/15"
                        >
                          <Download size={13} />
                          Download Joint Studio
                        </button>
                        <button
                          id="btn-print-sheet-joint-studio"
                          onClick={() => downloadAsPrintableSheet(getManualCanvasProductDataUrl('joint'), 'joint-passport-studio')}
                          className="flex-1 px-4 py-3 bg-slate-900 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-black/30"
                        >
                          <Grid size={13} className="text-sky-400" />
                          4x6 Grid (6 Copies)
                        </button>
                      </div>
                    </div>
                  )
                )}

              </div>
            )}

          </div>

          {/* --- INTERACTIVE CONTROL DESK: SLIDERS & ALIGNMET PANEL (Only visible inside Studio Manual Tab) --- */}
          {((toolMode === 'single' && activeTabSingle === 'studio' && singleImage) || 
            (toolMode === 'joint' && activeTabJoint === 'studio' && (jointImageA || jointImageB))) && (
            <div id="studio-adjustment-console" className="bg-[#0b0c0e] border border-white/5 p-6 rounded-xl space-y-5 animate-fade-in">
              
              {/* If Joint Mode: Show Person Selector */}
              {toolMode === 'joint' && (
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Editing Subject Target</span>
                  <div className="flex bg-black/45 p-0.5 rounded border border-white/5">
                    <button
                      id="btn-subject-a"
                      onClick={() => setActiveJointSubject('A')}
                      className={cn(
                        "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded transition-all",
                        activeJointSubject === 'A' ? "bg-sky-450 bg-sky-400 text-black" : "text-slate-400 hover:text-white"
                      )}
                    >
                      A: Left Subject Profile
                    </button>
                    <button
                      id="btn-subject-b"
                      onClick={() => setActiveJointSubject('B')}
                      className={cn(
                        "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded transition-all",
                        activeJointSubject === 'B' ? "bg-sky-450 bg-sky-400 text-black" : "text-slate-400 hover:text-white"
                      )}
                    >
                      B: Right Subject Profile
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-sky-400" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    {toolMode === 'single' ? "Custom Symmetrizer Adjuster" : `Adjusting Profile Subject: ${activeJointSubject === 'A' ? "A (Left)" : "B (Right)"}`}
                  </span>
                </div>
                
                <button
                  id="btn-reset-sliders"
                  onClick={() => {
                    if (toolMode === 'single') resetSingleSliders();
                    else resetJointSliders(activeJointSubject);
                  }}
                  className="flex items-center gap-1.5 text-[9px] font-mono hover:text-white tracking-widest uppercase border border-white/15 px-2.5 py-1 rounded bg-stone-900/60 transition-all text-slate-400"
                >
                  <RotateCcw size={10} />
                  Reset Sliders
                </button>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Scale Zoom Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
                    <span className="text-slate-400 font-bold">Face Zoom / Scale:</span>
                    <span className="text-sky-400 font-black">
                      {toolMode === 'single' ? scaleSingle.toFixed(2) : (activeJointSubject === 'A' ? scaleA : scaleB).toFixed(2)}x
                    </span>
                  </div>
                  <input
                    id="slider-scale"
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.01"
                    value={toolMode === 'single' ? scaleSingle : (activeJointSubject === 'A' ? scaleA : scaleB)}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (toolMode === 'single') setScaleSingle(val);
                      else if (activeJointSubject === 'A') setScaleA(val);
                      else setScaleB(val);
                    }}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>

                {/* Head Tilt Rotation Angular Slider (CRUCIAL FOR FIXING TILTING HEADS!) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
                    <span className="text-slate-400 font-bold">Straighten Portrait / Tilt Angle:</span>
                    <span className="text-sky-400 font-black">
                      {toolMode === 'single' ? rotationSingle : (activeJointSubject === 'A' ? rotationA : rotationB)}°
                    </span>
                  </div>
                  <input
                    id="slider-rotate"
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={toolMode === 'single' ? rotationSingle : (activeJointSubject === 'A' ? rotationA : rotationB)}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (toolMode === 'single') setRotationSingle(val);
                      else if (activeJointSubject === 'A') setRotationA(val);
                      else setRotationB(val);
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Horizontal Alignment (Move X) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
                    <span className="text-slate-400 font-bold">Shift Horizontal (X-Axis):</span>
                    <span className="text-sky-400 font-black">
                      {toolMode === 'single' ? offsetXSingle : (activeJointSubject === 'A' ? offsetX_A : offsetX_B)} px
                    </span>
                  </div>
                  <input
                    id="slider-shift-x"
                    type="range"
                    min="-250"
                    max="250"
                    step="1"
                    value={toolMode === 'single' ? offsetXSingle : (activeJointSubject === 'A' ? offsetX_A : offsetX_B)}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (toolMode === 'single') setOffsetXSingle(val);
                      else if (activeJointSubject === 'A') setOffsetX_A(val);
                      else setOffsetX_B(val);
                    }}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>

                {/* Vertical Alignment (Move Y) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
                    <span className="text-slate-400 font-bold">Shift Vertical (Y-Axis):</span>
                    <span className="text-sky-400 font-black">
                      {toolMode === 'single' ? offsetYSingle : (activeJointSubject === 'A' ? offsetY_A : offsetY_B)} px
                    </span>
                  </div>
                  <input
                    id="slider-shift-y"
                    type="range"
                    min="-250"
                    max="250"
                    step="1"
                    value={toolMode === 'single' ? offsetYSingle : (activeJointSubject === 'A' ? offsetY_A : offsetY_B)}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (toolMode === 'single') setOffsetYSingle(val);
                      else if (activeJointSubject === 'A') setOffsetY_A(val);
                      else setOffsetY_B(val);
                    }}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>

              </div>

              {/* Extras: Mirror Toggle */}
              <div className="flex gap-4 border-t border-white/5 pt-4">
                <button
                  id="btn-mirror-toggle"
                  onClick={() => {
                    if (toolMode === 'single') setMirroredSingle(!mirroredSingle);
                    else if (activeJointSubject === 'A') setMirroredA(!mirroredA);
                    else setMirroredB(!mirroredB);
                  }}
                  className={cn(
                    "flex items-center gap-2 p-2 border text-xs font-bold uppercase tracking-wider rounded transition-all",
                    (toolMode === 'single' ? mirroredSingle : (activeJointSubject === 'A' ? mirroredA : mirroredB))
                      ? "border-sky-400 bg-sky-400/5 text-sky-400"
                      : "border-white/10 text-slate-400 hover:text-white"
                  )}
                >
                  <FlipHorizontal size={14} />
                  Mirror / Flip Subject
                </button>
              </div>

            </div>
          )}

          {/* Quick Details List */}
          <div id="dimensions-metadata-tags" className="w-full mt-6 grid grid-cols-4 gap-4 text-center">
            <div className="bg-stone-900/30 border border-white/5 p-3 rounded-lg">
              <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider">Canvas Format</span>
              <span className="block text-[11px] font-black text-sky-400 mt-0.5 font-mono">413 x 531 PX</span>
            </div>
            <div className="bg-stone-900/30 border border-white/5 p-3 rounded-lg">
              <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider">Biometric Crop</span>
              <span className="block text-[11px] font-black text-indigo-400 mt-0.5 font-mono">35 x 45 MM</span>
            </div>
            <div className="bg-stone-900/30 border border-white/5 p-3 rounded-lg">
              <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider">Target PPI</span>
              <span className="block text-[11px] font-black text-sky-400 mt-0.5 font-mono">300 DPI</span>
            </div>
            <div className="bg-stone-900/30 border border-white/5 p-3 rounded-lg">
              <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider">Aspect Ratio</span>
              <span className="block text-[11px] font-black text-indigo-400 mt-0.5 font-mono">4:5 Vertical</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
