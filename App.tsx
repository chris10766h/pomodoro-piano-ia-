
import React, { useState, useEffect } from 'react';
import Timer from './components/Timer';
import PianoCoach from './components/PianoCoach';
import { getInspirationalQuote } from './services/geminiService';
import { PIANO_ICON } from './constants';
import { ActiveTask } from './types';

const App: React.FC = () => {
  const [quote, setQuote] = useState<string | null>(null);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [activeTask, setActiveTask] = useState<ActiveTask | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const q = await getInspirationalQuote();
        setQuote(q);
      } catch (e) {
        setQuote("Donde fallan las palabras, la música habla.");
      }
    };
    fetchQuote();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[140px]"></div>
      </div>

      <nav className="relative z-10 border-b border-white/5 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-emerald-500">{PIANO_ICON}</div>
            <h1 className="text-lg font-serif font-bold tracking-tight">MelodyFocus <span className="text-slate-600 font-sans text-[10px] font-black tracking-widest ml-2 uppercase opacity-50">PRO</span></h1>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Logros Hoy: <span className="text-emerald-500 text-sm ml-1">{sessionsCompleted}</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Timer */}
        <div className="flex flex-col items-center justify-center space-y-12 lg:sticky lg:top-28">
          <div className="text-center space-y-3">
            <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
              Toma el <span className="text-emerald-500 italic">Control</span>
            </h2>
            <p className="text-slate-500 max-w-sm mx-auto text-[10px] uppercase tracking-[0.2em] font-black leading-relaxed">
              Selecciona un bloque en tu clase para iniciar el temporizador.
            </p>
          </div>

          <Timer 
            onSessionComplete={() => setSessionsCompleted(s => s + 1)} 
            externalTask={activeTask}
          />

          {quote && (
            <div className="px-10 py-6 border-t border-white/5 text-center">
               <p className="text-slate-500 italic text-[11px] font-medium leading-relaxed max-w-xs mx-auto">"{quote}"</p>
            </div>
          )}
        </div>

        {/* Right Column: Classes & Coach */}
        <div className="flex flex-col items-center">
          <PianoCoach onTaskSelect={(task) => setActiveTask({...task, label: task.label || 'Bloque'})} />
        </div>
      </main>

      <footer className="relative z-10 py-16 text-center">
        <div className="text-slate-700 text-[9px] uppercase tracking-[0.4em] font-black">
          MelodyFocus System &bull; Maestro Virtual v2.5
        </div>
      </footer>
    </div>
  );
};

export default App;
