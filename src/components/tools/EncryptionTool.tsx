import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, Copy, Check, RotateCcw } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function EncryptionTool() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [copied, setCopied] = useState(false);

  const processText = () => {
    try {
      if (mode === 'encrypt') {
        setResult(btoa(text));
      } else {
        setResult(atob(text));
      }
    } catch (e) {
      setResult('Error: Invalid format for operation.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setText('');
    setResult('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Text Encryption</h2>
            <p className="text-slate-500 text-[10px]">Secure your data with Base64 encoding.</p>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl mb-4">
          <button
            onClick={() => { setMode('encrypt'); setResult(''); }}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all",
              mode === 'encrypt' ? "bg-white dark:bg-slate-700 shadow-sm" : ""
            )}
          >
            <Lock size={14} /> Encrypt
          </button>
          <button
            onClick={() => { setMode('decrypt'); setResult(''); }}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all",
              mode === 'decrypt' ? "bg-white dark:bg-slate-700 shadow-sm" : ""
            )}
          >
            <Unlock size={14} /> Decrypt
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5">Input Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-28 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              placeholder={mode === 'encrypt' ? "Enter text to encode..." : "Enter encoded text to decode..."}
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={processText}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-bold transition-all flex items-center justify-center gap-2 text-xs"
            >
              {mode === 'encrypt' ? <Lock size={16} /> : <Unlock size={16} />}
              {mode === 'encrypt' ? 'Encrypt Now' : 'Decrypt Now'}
            </button>
            <button 
              onClick={reset}
              className="px-5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {result && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-500">Output Result</label>
                <button onClick={handleCopy} className="text-indigo-600 font-bold text-sm flex items-center gap-1">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 break-all font-mono text-indigo-700 dark:text-indigo-300">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
