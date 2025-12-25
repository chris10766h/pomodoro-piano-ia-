
export enum TimerMode {
  POMODORO = 'POMODORO', // Estudio
  PRACTICE = 'PRACTICE', // Práctica
  SHORT_BREAK = 'SHORT_BREAK' // Descanso
}

export type ActivityType = 'ESTUDIO' | 'PRÁCTICA' | 'DESCANSO';

export interface PracticeStep {
  duration: string; // Ej: "10" (en minutos)
  action: string;
  description: string;
  type: ActivityType;
}

// Added PracticePlan interface to match the AI response schema and fix import error
export interface PracticePlan {
  title: string;
  steps: PracticeStep[];
  techniqueTip: string;
}

export interface PianoClass {
  id: string;
  name: string;
  totalDuration: number;
  steps: PracticeStep[];
  techniqueTip: string;
}

export interface ActiveTask {
  duration: number; // en segundos
  mode: TimerMode;
  label: string;
}
