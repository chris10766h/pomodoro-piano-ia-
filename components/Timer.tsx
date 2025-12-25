
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, ActiveTask } from '../types';
import { TIMER_CONFIG } from '../constants';

interface TimerProps {
  onSessionComplete: () => void;
  externalTask?: ActiveTask | null;
}

const Timer: React.FC<TimerProps> = ({ onSessionComplete, externalTask }) => {
  const [mode, setMode] = useState<TimerMode>(TimerMode.POMODORO);
  const [isActive, setIsActive] = useState(false);
  const [isAlarming, setIsAlarming] = useState(false);
  
  const getSavedDuration = (m: TimerMode) => {
    const saved = localStorage.getItem(`melodyfocus_dur_${m}`);
    if (saved) return parseInt(saved, 10) * 60;
    return m === TimerMode.SHORT_BREAK ? TIMER_CONFIG.SHORT_BREAK : TIMER_CONFIG.POMODORO;
  };

  const [timeLeft, setTimeLeft] = useState(getSavedDuration(mode));
  const [initialTime, setInitialTime] = useState(getSavedDuration(mode));
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmTimeoutRef = useRef<number | null>(null);

  // Sincronización con tarea externa del plan
  useEffect(() => {
    if (externalTask) {
      setMode(externalTask.mode);
      setTimeLeft(externalTask.duration);
      setInitialTime(externalTask.duration);
      setIsActive(true); // Auto-iniciar al seleccionar un bloque
      stopAlarm();
    }
  }, [externalTask]);

  useEffect(() => {
    if (!externalTask) {
      const dur = getSavedDuration(mode);
      setTimeLeft(dur);
      setInitialTime(dur);
      setIsActive(false);
      stopAlarm();
    }
  }, [mode]);

  const stopAlarm = useCallback(() => {
    setIsAlarming(false);
    if (alarmTimeoutRef.current) {
      window.clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  }, []);

  const startAlarmSound = useCallback(() => {
    stopAlarm();
    setIsAlarming(true);
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    for (let i = 0; i < 10; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(mode === TimerMode.SHORT_BREAK ? 220 : 440, now + i);
      gain.gain.setValueAtTime(0, now + i);
      gain.gain.linearRampToValueAtTime(0.05, now + i + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + i + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i);
      osc.stop(now + i + 0.6);
    }
    alarmTimeoutRef.current = window.setTimeout(() => setIsAlarming(false), 10000);
  }, [stopAlarm, mode]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      startAlarmSound();
      if (Notification.permission === 'granted') {
        new Notification("MelodyFocus", { body: "¡Bloque completado!", silent: true });
      }
      onSessionComplete();
    }
    return () => interval && clearInterval(interval);
  }, [isActive, timeLeft, onSessionComplete, startAlarmSound]);

  const toggleTimer = () => {
    if (!isActive && Notification.permission === 'default') Notification.requestPermission();
    if (isActive) stopAlarm();
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { mins, secs: secs.toString().padStart(2, '0') };
  };

  const timeParts = formatTime(timeLeft);
  const progress = (timeLeft / initialTime) * 100;

  const getModeColor = () => {
    switch(mode) {
      case TimerMode.POMODORO: return 'stroke-amber-500';
      case TimerMode.PRACTICE: return 'stroke-emerald-500';
      case TimerMode.SHORT_BREAK: return 'stroke-blue-500';
      default: return 'stroke-amber-500';
    }
  };

  return (
    <div className="flex flex-col items-center bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-md">
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {(['ESTUDIO', 'PRÁCTICA', 'DESCANSO'] as const).map((m) => {
          const timerM = m === 'ESTUDIO' ? TimerMode.POMODORO : m === 'PRÁCTICA' ? TimerMode.PRACTICE : TimerMode.SHORT_BREAK;
          return (
            <button 
              key={m}
              onClick={() => setMode(timerM)} 
              className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all ${mode === timerM ? 'bg-white text-slate-900' : 'text-slate-500 border border-slate-800 hover:border-slate-600'}`}
            >
              {m}
            </button>
          );
        })}
      </div>

      <div className="relative w-52 h-52 flex flex-col items-center justify-center mb-8">
        <svg className={`absolute w-full h-full -rotate-90 ${isAlarming ? 'animate-pulse' : ''}`}>
          <circle cx="104" cy="104" r="98" className="stroke-slate-800 fill-none" strokeWidth="4" />
          <circle
            cx="104" cy="104" r="98"
            className={`fill-none transition-all duration-1000 ${isAlarming ? 'stroke-red-500' : getModeColor()}`}
            strokeWidth="4"
            strokeDasharray={615}
            strokeDashoffset={615 * (1 - (isNaN(progress) ? 0 : progress) / 100)}
            strokeLinecap="round"
          />
        </svg>
        <div className="z-10 flex flex-col items-center">
          {externalTask && <span className="text-[8px] font-black uppercase text-emerald-500 mb-1 tracking-widest">{externalTask.label}</span>}
          <div className="flex items-baseline font-serif font-bold text-6xl tracking-tighter">
            <span>{timeParts.mins}</span>
            <span className="text-slate-600 text-3xl mx-1">:</span>
            <span className="text-3xl text-slate-500">{timeParts.secs}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full gap-2">
        {isAlarming && (
          <button onClick={stopAlarm} className="w-full py-3 bg-red-500 text-white rounded-xl font-bold animate-bounce">DETENER ALARMA</button>
        )}
        <button onClick={toggleTimer} className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${isActive ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'}`}>
          {isActive ? 'Pausar' : 'Iniciar'}
        </button>
        <button onClick={() => { setTimeLeft(initialTime); setIsActive(false); stopAlarm(); }} className="w-full py-2 text-[10px] text-slate-600 hover:text-slate-400 uppercase font-bold tracking-widest">
          Reiniciar
        </button>
      </div>
    </div>
  );
};

export default Timer;
