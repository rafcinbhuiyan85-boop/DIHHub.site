import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, PhoneOff, Mic, MicOff, Languages, ChevronRight, 
  MessageSquare, Send, RefreshCcw, Volume2, VolumeX, Sparkles, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  translatedText?: string;
  timestamp: string;
}

interface Character {
  id: string;
  name: string;
  avatar: string;
  description: string;
  voice: string;
  accent: string;
  color: string;
  greetings: {
    Bengali: string;
    English: string;
    Japanese: string;
  };
}

const characters: Character[] = [
  {
    id: 'minnie',
    name: 'Minnie Chan',
    avatar: '🌸',
    description: 'Sweet anime chibi character. Friendly, cheerful, and loves laughing ("Hehehe... Minnie-chan!")',
    voice: 'Sweet Female',
    accent: 'ja-JP',
    color: 'from-pink-500 to-rose-400',
    greetings: {
      Bengali: 'হাই! আমি মিনি চ্যান! কেমন আছো তুমি? (Hi! Ami Minnie chan!)',
      English: 'Hehehe! Hello, I am Minnie-Chan! So glad to talk to you!',
      Japanese: 'ミニちゃんです！お話しできてめちゃくちゃ嬉しいな！よろしくね！'
    }
  },
  {
    id: 'zephyr',
    name: 'Zephyr',
    avatar: '⚡',
    description: 'Energetic and cool Bengali tech guy. Talks casual "Dhakaiya" style, very youth-friendly and cool.',
    voice: 'Casual Male',
    accent: 'bn-BD',
    color: 'from-blue-500 to-cyan-400',
    greetings: {
      Bengali: 'আরে ভাই! কি অবস্থা? আমি জেফির। বলো আজকে কি কোপ হবে?',
      English: 'Hey there bro! Im Zephyr. Ready to code or talk about something cool?',
      Japanese: 'お疲れ！ゼファーです。今日も元気に雑談しようぜ！'
    }
  },
  {
    id: 'anika',
    name: 'Anika',
    avatar: '✨',
    description: 'Calm, gentle and extremely patient traditional Bengali guide. Warm, supportive companion.',
    voice: 'Soft Female',
    accent: 'bn-BD',
    color: 'from-amber-400 to-orange-500',
    greetings: {
      Bengali: 'নমস্কার, আমি অনিকা। আপনার সাথে কথা বলতে পেরে আমার খুব ভালো লাগছে। বলুন কেমন আছেন?',
      English: 'Hello, I am Anika. I am here to calmly chat and practice language with you.',
      Japanese: 'こんにちは、アニカです。ゆっくり優しくお話ししましょうね。'
    }
  },
  {
    id: 'siam',
    name: 'Siam',
    avatar: '👔',
    description: 'Polite, professional and intellectual gentleman. Perfect for interviews and formal practice.',
    voice: 'Formal Male',
    accent: 'bn-BD',
    color: 'from-indigo-600 to-violet-500',
    greetings: {
      Bengali: 'শুভ অপরাহ্ন, আমি সিয়াম। আজকের দিনটি কেমন কাটলো আপনার? কোনো নির্দিষ্ট বিষয়ে আলোচনা করতে চান?',
      English: 'Good day. I am Siam. I look forward to engaging in structured and intellectual discourse.',
      Japanese: 'こんにちは、シアムと申します。実りのある豊かなディスカッションをしましょう。'
    }
  }
];

export default function TenminAI() {
  const [activeTab, setActiveTab] = useState<'call' | 'chat'>('call');
  const [selectedChar, setSelectedChar] = useState<Character>(characters[0]);
  const [selectedLang, setSelectedLang] = useState<'Bengali' | 'English' | 'Japanese'>('Bengali');
  const [inCall, setInCall] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'muted'>('idle');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Audio state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioWaves, setAudioWaves] = useState<number[]>([15, 20, 15, 15, 30, 15]);

  // Speech Recognition & Synthesis references
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const waveIntervalRef = useRef<any>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    
    // Auto-scroll messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    return () => {
      stopSpeaking();
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    };
  }, [messages]);

  // Simulate speaking waves
  const startWaveAnimation = () => {
    if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    waveIntervalRef.current = setInterval(() => {
      setAudioWaves(Array.from({ length: 16 }, () => Math.floor(Math.random() * 65) + 5));
    }, 100);
  };

  const stopWaveAnimation = () => {
    if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    setAudioWaves([15, 20, 15, 15, 30, 20, 15, 15, 25, 15]);
  };

  // Speaks out a text using High Quality Google TTS with Fallback to Browser Speech Synthesis
  const speakText = (text: string) => {
    // Stop any existing speaking or audio
    stopSpeaking();
    
    setIsSpeaking(true);
    setCallStatus('speaking');
    startWaveAnimation();

    // Map language to target language code for Google TTS
    let langCode = 'bn';
    if (selectedLang === 'Japanese') {
      langCode = 'ja';
    } else if (selectedLang === 'English') {
      langCode = 'en';
    }

    try {
      // Create HTML5 Audio with standard high-quality Google TTS link
      const encodedText = encodeURIComponent(text);
      // Using google translate synthesis proxy for premium native flow
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;
      
      const audio = new Audio(url);
      audioRef.current = audio;

      // Adjust rates based on characters (playbackRate works nicely on HTML5 Audio!)
      if (selectedChar.id === 'minnie') {
        audio.playbackRate = 1.05; // sweet & bubbly
      } else if (selectedChar.id === 'zephyr') {
        audio.playbackRate = 1.15; // fast cool street talk
      } else if (selectedChar.id === 'anika') {
        audio.playbackRate = 0.88; // gentle and slow Bengali
      } else {
        audio.playbackRate = 0.95; // Siam: professional and standard
      }

      audio.onended = () => {
        setIsSpeaking(false);
        setCallStatus(inCall && !isMuted ? 'listening' : 'idle');
        stopWaveAnimation();
        
        // Auto-restart recognition if call is active
        if (inCall && !isMuted) {
          startListening();
        }
      };

      audio.onerror = (e) => {
        console.warn('Google TTS streaming failed, falling back to Web SpeechSynthesis.', e);
        fallbackSpeakText(text);
      };

      audio.play().catch(err => {
        console.warn('Audio play failed, falling back to Web SpeechSynthesis.', err);
        fallbackSpeakText(text);
      });

    } catch (err) {
      console.warn('Failed to initialize Audio player, falling back to Web SpeechSynthesis.', err);
      fallbackSpeakText(text);
    }
  };

  // Speaks out a text using local browser Speech Synthesis as a fallback
  const fallbackSpeakText = (text: string) => {
    if (!synthRef.current) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Direct language setup
    if (selectedLang === 'Bengali') {
      utterance.lang = 'bn-BD';
    } else if (selectedLang === 'Japanese') {
      utterance.lang = 'ja-JP';
    } else {
      utterance.lang = 'en-US';
    }

    // Try finding a matching native voice
    const voices = synthRef.current.getVoices();
    let matchingVoice = null;
    
    if (selectedLang === 'Bengali') {
      matchingVoice = voices.find(v => v.lang.includes('bn'));
    } else if (selectedLang === 'Japanese') {
      matchingVoice = voices.find(v => v.lang.includes('ja-JP'));
    } else {
      matchingVoice = voices.find(v => v.lang.includes('en'));
    }

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    // Adjust rate and pitch based on character
    if (selectedChar.id === 'minnie') {
      utterance.pitch = 1.4;
      utterance.rate = 1.05;
    } else if (selectedChar.id === 'zephyr') {
      utterance.pitch = 0.95;
      utterance.rate = 1.1;
    } else if (selectedChar.id === 'anika') {
      utterance.pitch = 1.1;
      utterance.rate = 0.85;
    } else { // siam
      utterance.pitch = 0.85;
      utterance.rate = 0.9;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setCallStatus(inCall && !isMuted ? 'listening' : 'idle');
      stopWaveAnimation();
      
      // Auto-restart recognition if call is active
      if (inCall && !isMuted) {
        startListening();
      }
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setIsSpeaking(false);
      setCallStatus(inCall && !isMuted ? 'listening' : 'idle');
      stopWaveAnimation();
    };

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    stopWaveAnimation();
  };

  // Start call
  const handleStartCall = () => {
    setInCall(true);
    setCallStatus('connecting');
    const startMsg = selectedChar.greetings[selectedLang];
    
    setTimeout(() => {
      setCallStatus('speaking');
      // Append initial greeting
      const newMsg: Message = {
        id: 'greet_init',
        role: 'model',
        text: startMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([newMsg]);
      speakText(startMsg);
    }, 1500);
  };

  // End call
  const handleEndCall = () => {
    stopSpeaking();
    stopListening();
    setInCall(false);
    setCallStatus('idle');
    setMessages([]);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      stopListening();
      setCallStatus('muted');
    } else {
      setCallStatus('listening');
      startListening();
    }
  };

  // Speech Recognition (Web Speech API)
  const startListening = () => {
    if (isSpeaking || isMuted) return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setError("Speech recognition is not fully supported in this browser. You can type instead!");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      
      if (selectedLang === 'Bengali') {
        rec.lang = 'bn-BD';
      } else if (selectedLang === 'Japanese') {
        rec.lang = 'ja-JP';
      } else {
        rec.lang = 'en-US';
      }

      rec.onstart = () => {
        setCallStatus('listening');
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          sendUserMessage(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (inCall && !isMuted && !isSpeaking) {
          // Automatic recovery/loop
          setTimeout(() => startListening(), 800);
        }
      };

      rec.onend = () => {
        if (inCall && !isMuted && !isSpeaking && callStatus === 'listening') {
          // Keep loop alive
          startListening();
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
  };

  // Submit User Message (Voice or typed)
  const sendUserMessage = async (text: string) => {
    if (!text.trim()) return;

    stopSpeaking();
    stopListening();
    setCallStatus('connecting');

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');

    try {
      // Map history
      const histMap = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/gemini/tenmin-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: selectedChar.id,
          language: selectedLang,
          message: text,
          history: histMap
        })
      });

      if (!res.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await res.json();
      if (data.success && data.text) {
        const modelMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, modelMsg]);
        speakText(data.text);
      } else {
        throw new Error(data.error || 'Failed to generate response');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred. Please make sure your Gemini API Key is configured in Settings > Secrets.");
      setCallStatus('idle');
    }
  };

  // Switch character
  const handleCharChange = (char: Character) => {
    setSelectedChar(char);
    if (inCall) {
      handleEndCall();
    }
  };

  // Switch language
  const handleLangChange = (lang: 'Bengali' | 'English' | 'Japanese') => {
    setSelectedLang(lang);
    if (inCall) {
      handleEndCall();
    }
  };

  return (
    <div id="tenmin-ai-tool" className="bg-slate-950/40 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-2xl max-w-4xl mx-auto text-white">
      {/* Visual background gloss */}
      <div className={`absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br ${selectedChar.color} opacity-15 rounded-full blur-[100px] pointer-events-none transition-all duration-1000`} />
      <div className={`absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tr ${selectedChar.color} opacity-15 rounded-full blur-[100px] pointer-events-none transition-all duration-1000`} />
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-pink-500/20 text-pink-400 font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-pink-500/30 flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Language Practice
            </span>
            <span className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-indigo-300 font-extrabold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-indigo-500/20">
              Instantly Active
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            DIH 10MIN AI
          </h2>
          <p className="text-xs text-slate-400 font-medium max-w-md">
            Interactive phone call assistant styled like 10Min.ai. Perfect for quick conversational Bengali (Bangla), Japanese, or English practice!
          </p>
        </div>

        {/* Interface switch tabs */}
        <div className="flex bg-slate-900 border border-slate-800/80 p-0.5 rounded-xl self-start md:self-center">
          <button 
            onClick={() => setActiveTab('call')}
            className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'call' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Voice Call
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Chat Sandbox
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-extrabold text-rose-400 block mb-1">Configuration Error</span>
            <span className="text-slate-300 leading-relaxed">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-[10px] text-slate-400 hover:text-white uppercase font-black tracking-widest pl-2">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* CHARACTER DIRECTORY Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-1.5 select-none">
              <Languages className="w-3.5 h-3.5 text-primary" /> Target Language
            </h3>
            <div className="flex flex-col gap-1.5">
              {(['Bengali', 'English', 'Japanese'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => handleLangChange(lang)}
                  className={`w-full flex items-center justify-between p-2 px-3.5 rounded-xl border transition-all text-xs font-extrabold ${selectedLang === lang ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'bg-slate-950/20 border-slate-800/60 hover:bg-slate-800/30 text-slate-400'}`}
                >
                  <span>{lang === 'Bengali' ? 'Bangla (বাংলা) 🇧🇩' : lang === 'English' ? 'English (🇺🇸)' : 'Japanese (日本語) 🇯🇵'}</span>
                  {selectedLang === lang && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
                </button>
              ))}
            </div>
            {selectedLang === 'Bengali' && (
              <p className="text-[10px] text-emerald-400 font-semibold mt-2.5 flex items-center gap-1">
                ✨ Selected language supports colloquial Bengali speech synthesis!
              </p>
            )}
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-3 select-none">
              Select AI Character
            </h3>
            <div className="space-y-2">
              {characters.map(char => {
                const isSelected = selectedChar.id === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => handleCharChange(char)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden ${isSelected ? 'bg-slate-800/80 border-slate-700 shadow-lg scale-[1.01]' : 'border-slate-800/40 bg-slate-950/30 hover:border-slate-800 hover:bg-slate-900/40'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${char.color} flex items-center justify-center text-xl shadow-inner`}>
                        {char.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-black text-sm">{char.name}</span>
                          <span className="text-[9px] text-slate-500 font-extrabold tracking-wider">{char.voice.toUpperCase()}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug">{char.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* INTERACTION AREA Panel */}
        <div className="lg:col-span-8 flex flex-col min-h-[420px] md:min-h-[480px] bg-slate-950/60 border border-slate-800/80 rounded-3xl overflow-hidden relative">
          
          {activeTab === 'call' ? (
            // VOICE CALL INTERFACE (10Min Premium Look)
            <div className="flex-1 flex flex-col items-center justify-between p-6 relative">
              
              {/* Top info badge */}
              <div className="w-full flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${inCall ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">
                    {callStatus === 'connecting' ? 'CONNECTING...' : callStatus === 'listening' ? 'LISTENING / SPEAK NOW' : callStatus === 'speaking' ? 'AI SPEAKING...' : callStatus === 'muted' ? 'CALL MUTED' : 'READY TO PRACTICE'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                  Character: <span className="text-slate-300 font-black">{selectedChar.name}</span>
                </div>
              </div>

              {/* Pulsing Glowing AI Orb/Bubble */}
              <div className="my-auto flex flex-col items-center justify-center relative">
                
                {/* Core animated glow behind orb */}
                <div className={`absolute w-36 h-36 rounded-full bg-gradient-to-tr ${selectedChar.color} transition-all duration-700 blur-2xl ${inCall ? 'opacity-30 scale-125' : 'opacity-10'}`} />
                
                {/* Glowing breathing circle */}
                <motion.button 
                  onClick={inCall ? handleEndCall : handleStartCall}
                  animate={inCall && callStatus === 'listening' ? { scale: [1, 1.05, 1], rotate: [0, 180, 360] } : inCall && callStatus === 'speaking' ? { scale: [1, 1.08, 0.98, 1.05, 1] } : {}}
                  transition={inCall ? { repeat: Infinity, duration: callStatus === 'speaking' ? 2 : 5, ease: 'easeInOut' } : {}}
                  className={`w-28 h-28 rounded-full bg-gradient-to-tr ${selectedChar.color} p-0.5 shadow-2xl relative flex items-center justify-center transition-all duration-1000 active:scale-95 z-10 cursor-pointer overflow-hidden border border-white/20`}
                >
                  <div className="absolute inset-0 bg-slate-950 rounded-full scale-[0.98] flex flex-col items-center justify-center p-4">
                    <span className="text-3xl filter drop-shadow-md">{selectedChar.avatar}</span>
                    <span className="text-[10px] mt-1.5 font-black uppercase tracking-widest text-slate-400 group-hover:text-white">
                      {inCall ? 'IN CALL' : 'CALL'}
                    </span>
                  </div>
                </motion.button>

                {/* Simulated Audio Waveform visualization */}
                {inCall && (
                  <div className="flex items-center gap-1.5 h-16 mt-6">
                    {audioWaves.map((waveHeight, idx) => (
                      <motion.div
                        key={idx}
                        animate={{ height: waveHeight }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className={`w-1 rounded-full bg-gradient-to-b ${selectedChar.color} opacity-80`}
                        style={{ height: '10px' }}
                      />
                    ))}
                  </div>
                )}

                {/* Subtitles / Chat preview on screen */}
                {messages.length > 0 && (
                  <div className="mt-5 text-center px-6 max-w-md bg-slate-900/60 border border-slate-800/50 p-3 rounded-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
                    <span className="text-[9px] font-black tracking-widest text-indigo-400 uppercase block mb-1">
                      {messages[messages.length - 1].role === 'user' ? 'YOU SAID' : selectedChar.name}
                    </span>
                    <p className="text-sm font-semibold tracking-wide leading-relaxed text-slate-200">
                      {messages[messages.length - 1].text}
                    </p>
                  </div>
                )}
              </div>

              {/* Call Control Center Panel */}
              <div className="w-full flex items-center justify-center gap-3 mt-auto pt-4 border-t border-slate-800/40">
                {inCall ? (
                  <>
                    <button
                      onClick={handleToggleMute}
                      className={`p-3.5 rounded-full border transition-all ${isMuted ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                      title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={handleEndCall}
                      className="bg-rose-500 hover:bg-rose-600 transition-colors p-4 rounded-full border border-rose-400 text-white shadow-lg shadow-rose-500/20 px-8 flex items-center gap-2 text-xs font-black uppercase tracking-wider"
                    >
                      <PhoneOff className="w-4 h-4" /> Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleStartCall}
                    className={`bg-indigo-600 hover:bg-indigo-500 transition-all p-4 rounded-full border border-indigo-500 text-white shadow-lg shadow-indigo-600/30 px-10 flex items-center gap-2.5 text-xs font-black uppercase tracking-wider`}
                  >
                    <Phone className="w-4 h-4 animate-bounce" /> Start Practice Call
                  </button>
                )}
              </div>

            </div>
          ) : (
            // MULTIMODAL CHAT SANDBOX INTERFACE
            <div className="flex-1 flex flex-col h-full">
              
              {/* Transcript Chat Log */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[340px] md:max-h-[380px]">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 select-none">
                    <MessageSquare className="w-12 h-12 mb-3 text-slate-700" />
                    <p className="text-xs font-extrabold uppercase tracking-widest mb-1">Sandbox Conversation Log</p>
                    <p className="text-[11px] font-medium text-slate-600 max-w-xs">Send a text message or speak to begin translation logging.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isUser = m.role === 'user';
                    return (
                      <div
                        key={m.id}
                        className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedChar.color} flex items-center justify-center text-md shadow`}>
                            {selectedChar.avatar}
                          </div>
                        )}
                        <div className={`max-w-[75%] p-3.5 rounded-2xl border ${isUser ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none' : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none'}`}>
                          <p className="text-xs leading-relaxed font-semibold tracking-wide break-words">{m.text}</p>
                          <div className="flex items-center justify-between gap-4 mt-2 border-t border-white/5 pt-1.5">
                            <span className="text-[8px] opacity-40 font-bold uppercase">{isUser ? 'You' : selectedChar.name}</span>
                            <span className="text-[8px] opacity-40 font-semibold">{m.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Text Input panel */}
              <form 
                onSubmit={(e) => { e.preventDefault(); sendUserMessage(chatInput); }}
                className="w-full flex items-center gap-2 p-3.5 border-t border-slate-800/60 bg-slate-950 mt-auto"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Type and send to ${selectedChar.name}...`}
                  className="flex-1 bg-slate-900 text-xs font-semibold rounded-xl px-4 py-3 text-white border border-slate-800 focus:outline-none focus:border-indigo-500/80 transition-all placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className={`p-3.5 rounded-xl border flex items-center justify-center transition-all ${chatInput.trim() ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-lg active:scale-95' : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'}`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          )}

        </div>

      </div>

      <div className="mt-5 text-center text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
        <span>PRO-TIP: Make sure you have allowed microphone permission in your browser if you want to speak.</span>
      </div>
    </div>
  );
}
