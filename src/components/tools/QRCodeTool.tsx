import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';
import { QrCode, Download, Upload, Copy, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAppSettings } from '@/src/hooks/useAppSettings';

export default function QRCodeTool() {
  const { settings } = useAppSettings();
  const [activeTab, setActiveTab] = useState<'generate' | 'decode'>('generate');
  const [text, setText] = useState(settings.defaultQRUrl || 'https://dihtemplate.pro');
  const [decodedText, setDecodedText] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(decodedText || text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          setDecodedText(code.data);
        } else {
          setDecodedText('Could not find a valid QR code in this image.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrcode.png';
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-2 bg-slate-200 dark:bg-slate-800 p-0.5 rounded-2xl mb-6">
        <button
          onClick={() => setActiveTab('generate')}
          className={cn(
            "py-1.5 rounded-xl text-xs font-semibold transition-all",
            activeTab === 'generate' ? "bg-white dark:bg-slate-700 shadow-sm" : "hover:bg-white/50 dark:hover:bg-slate-700/50"
          )}
        >
          Generator
        </button>
        <button
          onClick={() => setActiveTab('decode')}
          className={cn(
            "py-1.5 rounded-xl text-xs font-semibold transition-all",
            activeTab === 'decode' ? "bg-white dark:bg-slate-700 shadow-sm" : "hover:bg-white/50 dark:hover:bg-slate-700/50"
          )}
        >
          Decoder
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-8">
        {activeTab === 'generate' ? (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5">Enter URL or Text</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-24 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  placeholder="Paste your link here..."
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCopy} className="btn-secondary flex-1 py-2.5 justify-center text-xs">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
                <button onClick={downloadQR} className="bg-primary hover:bg-blue-600 text-white flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs">
                  <Download size={16} /> Download PNG
                </button>
              </div>
            </div>
            <div className="w-full md:w-52 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-3xl p-5 border-2 border-dashed border-slate-200 dark:border-slate-700">
              <div className="bg-white p-3 rounded-2xl shadow-xl mb-3">
                <QRCodeSVG id="qr-svg" value={text} size={150} level="H" includeMargin={true} />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">Live Preview</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">Click to upload QR Image</p>
                <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP</p>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>

            {decodedText && (
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Decoded Result</h3>
                <p className="font-mono break-all">{decodedText}</p>
                <button onClick={handleCopy} className="flex items-center gap-2 text-primary font-semibold text-sm">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy to clipboard'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
