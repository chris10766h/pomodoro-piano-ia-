
import React from 'react';

export const PIANO_SESSION_SEGMENTS = [
  { name: 'Técnica', duration: 5 * 60, color: '#f59e0b' },
  { name: 'Independencia', duration: 5 * 60, color: '#3b82f6' },
  { name: 'Repertorio', duration: 5 * 60, color: '#10b981' },
];

export const TIMER_CONFIG = {
  POMODORO: 15 * 60, // Total 15 minutos según pedido
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60,
};

export const PIANO_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="M2 16h20" />
    <path d="M6 16v4" />
    <path d="M10 16v4" />
    <path d="M14 16v4" />
    <path d="M18 16v4" />
    <path d="M11 4v8" />
    <path d="M15 4v8" />
    <path d="M7 4v8" />
  </svg>
);
