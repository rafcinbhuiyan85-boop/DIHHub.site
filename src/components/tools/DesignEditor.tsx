import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { 
  Palette, Type, ImageIcon, Square, Circle, 
  Trash2, Download, Layers, CreditCard, FileText, 
  Award, Contact2, ZoomIn, ZoomOut, Move, LayoutDashboard,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, CaseSensitive,
  ChevronDown, Copy, Plus, Save
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAppSettings } from '@/src/hooks/useAppSettings';
import { logEvent, LogType } from '@/src/lib/logger';

interface DesignEditorProps {
  initialTemplateId?: string;
}

export default function DesignEditor({ initialTemplateId }: DesignEditorProps) {
  const { settings } = useAppSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.8);
  const [exportType, setExportType] = useState<'png' | 'jpeg'>('png');

  useEffect(() => {
    if (!canvasRef.current) return;

    let isDisposed = false;
    const targetTemplate = settings.templates.find(t => t.id === (initialTemplateId || '3')) || settings.templates[0];
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: targetTemplate ? targetTemplate.width : 595,
      height: targetTemplate ? targetTemplate.height : 842,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      allowTouchScrolling: true
    });

    fabricCanvas.on('selection:created', (e) => setSelectedObject(e.selected?.[0] || null));
    fabricCanvas.on('selection:updated', (e) => setSelectedObject(e.selected?.[0] || null));
    fabricCanvas.on('selection:cleared', () => setSelectedObject(null));

    setCanvas(fabricCanvas);

    // Load initial template with cleanup protection
    let timer: any;
    const initialTemplate = settings.templates.find(t => t.id === (initialTemplateId || '3')) || settings.templates[0];
    if (initialTemplate) {
      timer = setTimeout(() => {
        if (!isDisposed) {
          setFormat(fabricCanvas, initialTemplate);
        }
      }, 500);
    }

    return () => {
      isDisposed = true;
      clearTimeout(timer);
      fabricCanvas.dispose();
    };
  }, []);

  const setFormat = async (canvasInstance: fabric.Canvas | null, template: any) => {
    const targetCanvas = canvasInstance || canvas;
    if (!targetCanvas || (targetCanvas as any).disposed) return;
    
    targetCanvas.clear();
    targetCanvas.setDimensions({ width: template.width, height: template.height });
    targetCanvas.backgroundColor = '#ffffff';
    setActiveTemplate(template.name);
    
    // Add SVG elements individually for full customizability
    if (template.svg) {
      try {
        const { objects } = await fabric.loadSVGFromString(template.svg);
        objects.forEach(obj => {
          if (obj) {
            // Background branding should not be selectable or movable
            obj.set({ 
              selectable: false, 
              evented: false,
              lockMovementX: true,
              lockMovementY: true,
              lockScalingX: true,
              lockScalingY: true,
              lockRotation: true
            });
            targetCanvas.add(obj);
          }
        });
      } catch (err) {
        console.error('Error loading SVG:', err);
      }
    }

    // Add default editable elements based on category
    if (template.category === 'Letterhead') {
      const centerX = template.width / 2;
      const margin = 80;

      // Add clean, minimal default text that matches the reference positioning
      addText('COMPANY LOGO', { top: 165, left: centerX, originX: 'center', fontSize: 18, fontWeight: '900', fill: '#19134B', charSpacing: 400 }, targetCanvas);
      addText('Graphic Designer', { top: 190, left: centerX, originX: 'center', fontSize: 11, fill: '#59595B', italic: true, opacity: 0.8 }, targetCanvas);

      addText('Dear. Mrs Jane Smith', { top: 320, left: margin, fontSize: 14, fontWeight: 'bold', fill: '#19134B' }, targetCanvas);
      addText('Senior Executive', { top: 340, left: margin, fontSize: 10, fill: '#4E4D50', fontWeight: 'bold' }, targetCanvas);
      addText('Address goes here, Street, City, Country\ncontact@yourmail.com\n000-987-654-321', { top: 355, left: margin, fontSize: 9, fill: '#818082', lineHeight: 1.4 }, targetCanvas);
      
      const bodyText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.`;
      addText(bodyText, { top: 415, left: margin, width: 435, fontSize: 10, fill: '#30413B', lineHeight: 1.6, textAlign: 'justify' }, targetCanvas);

      addText('Rafcin Bhuiyan', { top: 680, left: margin, fontSize: 42, fill: '#EE495F', fontFamily: 'Brush Script MT, cursive', fontWeight: 'normal' }, targetCanvas);

      // Footer info over blue waves (White text)
      addText('username@email.com\nwww.websitename.com', { top: 800, left: centerX - 35, fontSize: 9, fill: '#FFFFFF', textAlign: 'right', originX: 'right', fontWeight: 'bold' }, targetCanvas);
      addText('+ 12 3456 8470 1205\n+ 12 5767 9470 1205', { top: 800, left: centerX + 35, fontSize: 9, fill: '#FFFFFF', textAlign: 'left', originX: 'left', fontWeight: 'bold' }, targetCanvas);
    } else if (template.category === 'NID') {
      if (template.id === 'nid-front') {
        const valuesX = 220;
        const baseY = 115;
        
        addText('রাফছিন ভূঁইয়া', { top: baseY + 22, left: valuesX, fontSize: 18, fontWeight: 'bold', fill: '#000000' }, targetCanvas);
        addText('RAFCIN BHUIYAN', { top: baseY + 58, left: valuesX + 65, fontSize: 17, fontWeight: 'bold', fill: '#000000' }, targetCanvas);
        addText('বারেক ভূঁইয়া', { top: baseY + 94, left: valuesX + 50, fontSize: 18, fontWeight: 'bold', fill: '#000000' }, targetCanvas);
        addText('লিপি বেগম', { top: baseY + 130, left: valuesX + 55, fontSize: 18, fontWeight: 'bold', fill: '#000000' }, targetCanvas);
        
        addText('02 Feb 2005', { top: baseY + 168, left: valuesX + 125, fontSize: 18, fontWeight: 'bold', fill: '#f42a41' }, targetCanvas);
        addText('5452564069', { top: baseY + 215, left: valuesX + 90, fontSize: 28, fontWeight: '900', fill: '#f42a41' }, targetCanvas);

        // Photo and Signature placeholders
        addText('PHOTO', { top: baseY + 60, left: 85, fontSize: 12, fill: '#999999', opacity: 0.5, originX: 'center' }, targetCanvas);
        addText('Rafcin', { top: baseY + 155, left: 85, fontSize: 20, fill: '#000000', fontFamily: 'Brush Script MT, cursive', originX: 'center' }, targetCanvas);
      } else {
        // Back
        addText('কালদাইল বড়পাড়া, কালদাইল', { top: 128, left: 240, fontSize: 13, fill: '#333333', fontWeight: 'bold' }, targetCanvas);
        addText('সাতগ্রাম - ১৬০৩, নরসিংদী সদর, নরসিংদী', { top: 152, left: 240, fontSize: 13, fill: '#333333', fontWeight: 'bold' }, targetCanvas);
        addText('A+', { top: 185, left: 215, fontSize: 18, fontWeight: 'bold', fill: '#f42a41' }, targetCanvas);
        addText('২১/০২/২০০৫', { top: 255, left: 420, fontSize: 13, fontWeight: '900', fill: '#000000' }, targetCanvas);
      }
    }
    
    targetCanvas.renderAll();
  };

  const addText = (textStr = 'Double click to edit', options: any = {}, canvasInstance?: fabric.Canvas) => {
    const targetCanvas = canvasInstance || canvas;
    if (!targetCanvas) return;
    const text = new fabric.IText(textStr, {
      left: 100,
      top: 100,
      fontFamily: 'Inter',
      fontSize: 24,
      fill: '#000000',
      ...options
    });
    targetCanvas.add(text);
    targetCanvas.setActiveObject(text);
    targetCanvas.renderAll();
  };

  const addRect = () => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 150,
      top: 150,
      fill: '#3b82f6',
      width: 150,
      height: 100,
      rx: 8,
      ry: 8,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const addCircle = () => {
    if (!canvas) return;
    const circle = new fabric.Circle({
      left: 200,
      top: 200,
      fill: '#6366f1',
      radius: 60,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      const img = await fabric.FabricImage.fromURL(result);
      img.scaleToWidth(200);
      canvas.add(img);
      canvas.centerObject(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    };
    reader.readAsDataURL(file);
  };

  const moveForward = () => {
    if (!canvas || !selectedObject) return;
    canvas.bringObjectForward(selectedObject);
  };

  const moveBackward = () => {
    if (!canvas || !selectedObject) return;
    canvas.sendObjectBackwards(selectedObject);
  };

  const bringToFront = () => {
    if (!canvas || !selectedObject) return;
    canvas.bringObjectToFront(selectedObject);
  };

  const sendToBack = () => {
    if (!canvas || !selectedObject) return;
    canvas.sendObjectToBack(selectedObject);
    // If there's a template background group, send it even further back
    const background = canvas.getObjects().find(obj => !obj.selectable);
    if (background) {
      canvas.sendObjectToBack(background);
    }
  };

  const deleteObject = () => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
  };

  const updateTextProp = (prop: string, value: any) => {
    if (!selectedObject || !(selectedObject instanceof fabric.IText)) return;
    selectedObject.set(prop as any, value);
    canvas?.renderAll();
  };

  const toggleTextBold = () => {
    if (!selectedObject || !(selectedObject instanceof fabric.IText)) return;
    const isBold = selectedObject.fontWeight === 'bold';
    updateTextProp('fontWeight', isBold ? 'normal' : 'bold');
  };

  const toggleTextItalic = () => {
    if (!selectedObject || !(selectedObject instanceof fabric.IText)) return;
    const isItalic = selectedObject.fontStyle === 'italic';
    updateTextProp('fontStyle', isItalic ? 'italic' : 'normal');
  };

  const setFormatAction = (template: any) => {
    setFormat(canvas, template);
  };

  useEffect(() => {
    if (!canvas) return;
    canvas.setZoom(zoom);
    canvas.renderAll();
  }, [zoom, canvas]);

  const exportCanvas = (format: 'png' | 'jpeg') => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({
      format: format,
      quality: 1,
      multiplier: 3, // High performance export
    });
    const a = document.createElement('a');
    a.href = dataURL;
    const templateId = initialTemplateId || (settings.templates.find(t => t.name === activeTemplate)?.id);
    a.download = `DIHTEMPLATE_Design_${activeTemplate || 'Project'}.${format}`;
    a.click();

    logEvent({
      type: (templateId && templateId.includes('nid')) ? LogType.NID_GENERATE : LogType.DESIGN_EXPORT,
      tool: 'Design Editor',
      details: { templateId: templateId || 'custom', format, templateName: activeTemplate }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      {/* Top Bar - Template Selector */}
      <div className="h-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-4 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-2 text-slate-400 shrink-0 border-r border-slate-200 dark:border-slate-800 pr-4">
          <Palette size={14} className="text-primary" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-100 italic">CREATIVE</span>
        </div>
        
        {settings.templates.length > 1 && (
          <div className="flex gap-2">
            {settings.templates.map(p => (
              <button 
                key={p.id}
                onClick={() => setFormatAction(p)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0",
                  activeTemplate === p.name 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {p.category.includes('ID') ? <CreditCard size={16} /> : <FileText size={16} />}
                {p.name}
              </button>
            ))}
            <button 
              onClick={() => {
                const current = settings.templates.find(t => t.name === activeTemplate);
                if (current) setFormat(canvas, current);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600 transition-all shrink-0"
            >
              <Save size={16} /> Reset
            </button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-3 shrink-0">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
             <button onClick={() => setExportType('png')} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all", exportType === 'png' ? "bg-white dark:bg-slate-900 shadow-sm text-slate-700 dark:text-slate-200" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}>
               PNG
             </button>
             <button onClick={() => setExportType('jpeg')} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all", exportType === 'jpeg' ? "bg-white dark:bg-slate-900 shadow-sm text-slate-700 dark:text-slate-200" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}>
               JPG
             </button>
          </div>
          <button 
            onClick={() => exportCanvas(exportType)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:translate-y-[-2px] active:translate-y-0 transition-all shadow-md shadow-primary/20"
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-12 md:w-14 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 gap-4 relative z-10 shrink-0">
          <div className="flex flex-col gap-3">
             <button onClick={() => addText()} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group relative">
                <Type size={20} />
                <span className="absolute left-16 bg-slate-900 text-white text-[10px] px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-50">Add Text</span>
             </button>
 
             <div className="relative group">
                <button className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                  <ImageIcon size={20} />
                </button>
                <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
             </div>
 
             <button onClick={addRect} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                <Square size={20} />
             </button>
 
             <button onClick={addCircle} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                <Circle size={20} />
             </button>
 
             <div className="w-8 h-px bg-slate-100 dark:bg-slate-800 my-1" />
             
             <button onClick={bringToFront} disabled={!selectedObject} title="Bring to Front" className="p-3 rounded-2xl text-slate-400 hover:text-primary hover:bg-blue-50 disabled:opacity-20 transition-colors">
                <Layers className="rotate-180 text-primary" size={18} />
             </button>
 
             <button onClick={moveForward} disabled={!selectedObject} title="Bring Forward" className="p-3 rounded-2xl text-slate-400 hover:text-primary hover:bg-blue-50 disabled:opacity-20 transition-colors">
                <Layers className="rotate-180" size={18} />
             </button>
             
             <button onClick={moveBackward} disabled={!selectedObject} title="Send Backward" className="p-3 rounded-2xl text-slate-400 hover:text-primary hover:bg-blue-50 disabled:opacity-20 transition-colors">
                <Layers size={18} />
             </button>
 
             <button onClick={sendToBack} disabled={!selectedObject} title="Send to Back" className="p-3 rounded-2xl text-slate-400 hover:text-primary hover:bg-blue-50 disabled:opacity-20 transition-colors">
                <Layers className="text-slate-600" size={18} />
             </button>
          </div>
 
          <div className="mt-auto flex flex-col gap-3">
             <button onClick={deleteObject} disabled={!selectedObject} className="p-3 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 disabled:opacity-20 transition-colors">
                <Trash2 size={20} />
             </button>
          </div>
        </div>

        {/* Central Edit Area */}
        <div className="flex-1 overflow-hidden bg-slate-100/50 dark:bg-slate-950 flex flex-col items-center justify-center relative scrollbar-hide">
          {/* Object Properties Toolbar (Floating) */}
          {selectedObject && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-6 flex items-center gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 backdrop-blur-md bg-white/90"
            >
              <div className="flex items-center px-1">
                 <input 
                    type="color" 
                    value={selectedObject.fill as string || '#000000'}
                    className="w-8 h-8 rounded-xl border-none cursor-pointer bg-transparent shadow-inner"
                    onChange={(e) => {
                      selectedObject.set('fill', e.target.value);
                      canvas?.renderAll();
                    }}
                  />
              </div>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
              
              {selectedObject instanceof fabric.IText && (
                <>
                  <div className="flex items-center gap-1">
                    <button onClick={toggleTextBold} className={cn("p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors", selectedObject.fontWeight === 'bold' && "bg-blue-50 text-blue-600 dark:bg-blue-900/20")}>
                      <Bold size={18} />
                    </button>
                    <button onClick={toggleTextItalic} className={cn("p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors", selectedObject.fontStyle === 'italic' && "bg-blue-50 text-blue-600 dark:bg-blue-900/20")}>
                      <Italic size={18} />
                    </button>
                  </div>
                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                  <div className="flex items-center gap-2 px-2">
                    <ChevronDown size={14} className="text-slate-400" />
                    <select 
                      value={selectedObject.fontFamily}
                      onChange={(e) => updateTextProp('fontFamily', e.target.value)}
                      className="bg-transparent text-xs font-bold border-none ring-0 outline-none pr-6 cursor-pointer"
                    >
                      <option value="Inter">Inter Sans</option>
                      <option value="Georgia">Georgia Serif</option>
                      <option value="Brush Script MT, cursive">Brush Script</option>
                      <option value="Monospace">JetBrains Mono</option>
                      <option value="Arial">Arial Standard</option>
                    </select>
                  </div>
                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      className="w-12 bg-transparent text-xs font-black text-center border-none focus:ring-0"
                      value={Math.round(selectedObject.fontSize || 24)}
                      onChange={(e) => updateTextProp('fontSize', parseInt(e.target.value) || 12)}
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}

          <div className="flex-1 w-full overflow-auto bg-slate-200 dark:bg-slate-900/50 p-4 md:p-8 flex items-start justify-center">
            <div className="relative group perspective-1000 my-4">
              <div className="absolute inset-0 bg-black/10 dark:bg-white/5 blur-3xl opacity-20 -z-10" />
              <div className="bg-white p-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-800">
                <canvas ref={canvasRef} />
              </div>
              
              {/* Guide markers (Only visible during hover/edit) */}
              <div className="absolute top-0 -left-6 bottom-0 w-px bg-primary/20 pointer-events-none" />
              <div className="absolute top-0 -right-6 bottom-0 w-px bg-primary/20 pointer-events-none" />
              <div className="absolute -top-6 left-0 right-0 h-px bg-primary/20 pointer-events-none" />
              <div className="absolute -bottom-6 left-0 right-0 h-px bg-primary/20 pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
