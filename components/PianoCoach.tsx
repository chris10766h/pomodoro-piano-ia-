
import React, { useState, useEffect } from 'react';
import { getPracticePlan } from '../services/geminiService';
import { PianoClass, PracticeStep, ActivityType, ActiveTask, TimerMode } from '../types';

interface PianoCoachProps {
  onTaskSelect: (task: ActiveTask) => void;
}

const PianoCoach: React.FC<PianoCoachProps> = ({ onTaskSelect }) => {
  const [classes, setClasses] = useState<PianoClass[]>(() => {
    const saved = localStorage.getItem('melodyfocus_classes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeClassId, setActiveClassId] = useState<string | null>(() => {
    return localStorage.getItem('melodyfocus_active_class_id');
  });

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [query, setQuery] = useState('');
  const [planDuration, setPlanDuration] = useState(30);

  const activeClass = classes.find(c => c.id === activeClassId);

  useEffect(() => {
    localStorage.setItem('melodyfocus_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    if (activeClassId) localStorage.setItem('melodyfocus_active_class_id', activeClassId);
  }, [activeClassId]);

  const handleGenerate = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const result = await getPracticePlan(query, planDuration);
      const newClass: PianoClass = {
        id: Date.now().toString(),
        name: query,
        totalDuration: planDuration,
        steps: result.steps as PracticeStep[],
        techniqueTip: result.techniqueTip
      };
      setClasses(prev => [newClass, ...prev]);
      setActiveClassId(newClass.id);
      setIsEditing(false);
      setQuery('');
    } catch (error) {
      console.error(error);
      alert("Error de IA. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const createManualClass = () => {
    const newClass: PianoClass = {
      id: Date.now().toString(),
      name: "Nueva Clase",
      totalDuration: 30,
      steps: [{ duration: "10", action: "Primer Bloque", description: "", type: "ESTUDIO" }],
      techniqueTip: "Mantén una buena postura."
    };
    setClasses(prev => [newClass, ...prev]);
    setActiveClassId(newClass.id);
    setIsEditing(true);
  };

  const deleteClass = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Eliminar esta clase?")) {
      const filtered = classes.filter(c => c.id !== id);
      setClasses(filtered);
      if (activeClassId === id) setActiveClassId(filtered[0]?.id || null);
    }
  };

  const updateActiveStep = (idx: number, field: keyof PracticeStep, value: string) => {
    if (!activeClass) return;
    const newClasses = [...classes];
    const classIdx = newClasses.findIndex(c => c.id === activeClassId);
    const newSteps = [...newClasses[classIdx].steps];
    newSteps[idx] = { ...newSteps[idx], [field]: value };
    newClasses[classIdx].steps = newSteps;
    setClasses(newClasses);
  };

  const addStep = () => {
    if (!activeClass) return;
    const newClasses = [...classes];
    const classIdx = newClasses.findIndex(c => c.id === activeClassId);
    newClasses[classIdx].steps.push({ duration: "5", action: "Nuevo bloque", description: "", type: "PRÁCTICA" });
    setClasses(newClasses);
  };

  const removeStep = (idx: number) => {
    if (!activeClass) return;
    const newClasses = [...classes];
    const classIdx = newClasses.findIndex(c => c.id === activeClassId);
    newClasses[classIdx].steps = newClasses[classIdx].steps.filter((_, i) => i !== idx);
    setClasses(newClasses);
  };

  const startTask = (step: PracticeStep) => {
    const mode = step.type === 'ESTUDIO' ? TimerMode.POMODORO : step.type === 'PRÁCTICA' ? TimerMode.PRACTICE : TimerMode.SHORT_BREAK;
    const durationSecs = (parseInt(step.duration) || 5) * 60;
    onTaskSelect({ duration: durationSecs, mode, label: step.action });
  };

  const getTypeColor = (type: ActivityType) => {
    switch(type) {
      case 'ESTUDIO': return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
      case 'PRÁCTICA': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
      case 'DESCANSO': return 'text-blue-500 border-blue-500/20 bg-blue-500/5';
    }
  };

  return (
    <div className="w-full max-w-xl space-y-6">
      {/* Selector de Clases */}
      <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800 backdrop-blur-md">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2">Mis Clases Guardadas</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={createManualClass}
            className="flex-shrink-0 w-32 h-20 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600 hover:text-emerald-500 hover:border-emerald-500/30 transition-all text-[10px] font-bold uppercase"
          >
            <span className="text-xl mb-1">+</span>
            Nueva Clase
          </button>
          {classes.map(c => (
            <button 
              key={c.id}
              onClick={() => setActiveClassId(c.id)}
              className={`flex-shrink-0 w-36 h-20 rounded-2xl p-3 text-left transition-all border relative group ${activeClassId === c.id ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              <div className="text-[10px] font-black uppercase truncate mb-1">{c.name}</div>
              <div className="text-[8px] opacity-70 font-bold">{c.steps.length} bloques • {c.totalDuration}m</div>
              <div 
                onClick={(e) => deleteClass(c.id, e)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Vista de Clase Activa / Generador */}
      <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm shadow-2xl min-h-[400px]">
        {!activeClass && !loading && (
          <div className="h-full flex flex-col items-center justify-center py-20 text-center">
            <div className="text-4xl mb-4">🎹</div>
            <h4 className="font-serif text-xl font-bold mb-2">Comienza tu práctica</h4>
            <p className="text-slate-500 text-xs max-w-xs mb-8">Escribe un objetivo para que la IA genere un plan o crea uno manualmente arriba.</p>
            <div className="w-full flex flex-col gap-2">
              <input 
                type="text" 
                value={query} 
                onChange={e => setQuery(e.target.value)}
                placeholder="Ej: Escalas mayores y Minueto en Sol"
                className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
              />
              <button 
                onClick={handleGenerate}
                disabled={!query || loading}
                className="bg-emerald-600 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-emerald-500 transition-all disabled:opacity-30"
              >
                {loading ? 'Generando...' : 'Generar Plan con IA'}
              </button>
            </div>
          </div>
        )}

        {activeClass && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {isEditing ? (
                  <input 
                    value={activeClass.name} 
                    onChange={e => {
                      const newClasses = [...classes];
                      newClasses.find(c => c.id === activeClassId)!.name = e.target.value;
                      setClasses(newClasses);
                    }}
                    className="w-full bg-transparent font-serif font-bold text-2xl border-b border-emerald-500/30 outline-none"
                  />
                ) : (
                  <h2 className="font-serif font-bold text-2xl text-white">{activeClass.name}</h2>
                )}
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{activeClass.totalDuration} MINUTOS DE CLASE</p>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`p-2 rounded-lg transition-colors ${isEditing ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 hover:text-white bg-slate-800'}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>

            <div className="space-y-3">
              {activeClass.steps.map((step, idx) => (
                <div key={idx} className={`group relative p-4 rounded-2xl border transition-all ${getTypeColor(step.type)}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={step.duration} 
                          onChange={e => updateActiveStep(idx, 'duration', e.target.value)}
                          className="w-10 bg-slate-900 rounded text-center text-[10px] font-bold py-1"
                        />
                      ) : (
                        <span className="font-mono font-bold text-[10px] opacity-70">{step.duration}m</span>
                      )}
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{step.type}</span>
                    </div>
                    {!isEditing && (
                      <button 
                        onClick={() => startTask(step)}
                        className="opacity-0 group-hover:opacity-100 bg-emerald-500 text-white p-2 rounded-full shadow-lg shadow-emerald-900/40 transition-all hover:scale-110"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
                      </button>
                    )}
                    {isEditing && (
                      <div className="flex gap-1">
                        <select 
                          value={step.type} 
                          onChange={e => updateActiveStep(idx, 'type', e.target.value)}
                          className="bg-slate-900 text-[8px] font-bold p-1 rounded border border-white/5"
                        >
                          <option value="ESTUDIO">ESTUDIO</option>
                          <option value="PRÁCTICA">PRÁCTICA</option>
                          <option value="DESCANSO">DESCANSO</option>
                        </select>
                        <button onClick={() => removeStep(idx)} className="text-red-500 p-1">×</button>
                      </div>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <input 
                        value={step.action} 
                        onChange={e => updateActiveStep(idx, 'action', e.target.value)}
                        className="w-full bg-slate-900/50 rounded px-2 py-1 text-xs text-white outline-none"
                        placeholder="Acción..."
                      />
                      <textarea 
                        value={step.description} 
                        onChange={e => updateActiveStep(idx, 'description', e.target.value)}
                        className="w-full bg-slate-900/50 rounded px-2 py-1 text-[10px] text-slate-400 outline-none resize-none"
                        rows={1}
                        placeholder="Descripción..."
                      />
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{step.action}</h4>
                      {step.description && <p className="text-[10px] opacity-60 leading-tight mt-1">{step.description}</p>}
                    </div>
                  )}
                </div>
              ))}
              
              {isEditing && (
                <button onClick={addStep} className="w-full py-3 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600 hover:text-emerald-500 text-[10px] font-bold uppercase tracking-widest transition-all">
                  + Añadir Bloque
                </button>
              )}
            </div>

            {!isEditing && activeClass.techniqueTip && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl">
                <p className="text-[10px] italic leading-relaxed text-emerald-100/70">
                  <span className="not-italic font-black text-emerald-500 mr-2 uppercase tracking-tighter">TIP DE CLASE:</span>
                  {activeClass.techniqueTip}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PianoCoach;
