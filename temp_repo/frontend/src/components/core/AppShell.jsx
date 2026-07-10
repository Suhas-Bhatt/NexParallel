import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useSimulationStore } from '../../store/simulationStore.js';
import { useAuthStore } from '../../store/authStore.js';

const navLinks = [
  { to: '/',         label: 'NEXUS' },
  { to: '/simulate', label: 'SIMULATE' },
  { to: '/history',  label: 'HISTORY' },
  { to: '/graph',    label: 'GRAPH' },
];

export default function AppShell({ children }) {
  const phase = useSimulationStore((s) => s.phase);
  const user  = useAuthStore((s) => s.user);
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const phaseColor =
    phase === 'complete' ? 'bg-neongreen animate-glow'
    : phase !== 'idle'   ? 'bg-amber animate-pulse'
    : 'bg-hyperblue/40';

  return (
    <div className="flex flex-col h-screen bg-void grid-bg overflow-hidden">
      {/* Scan line */}
      <div className="scan-line" aria-hidden="true" />

      {/* Top HUD */}
      <header className="glass border-b border-hyperblue/20 flex items-center justify-between px-6 py-3 z-50 flex-shrink-0">
        <div className="flex items-center gap-5">
          <span className="font-display font-black text-cyan-neon text-sm tracking-widest">NEXUS</span>
          <span className="font-mono text-xs text-gray-600 tracking-wider hidden md:block">REALITY ENGINE v1.0</span>
          <div className="w-px h-4 bg-hyperblue/30 hidden md:block" />
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `font-display text-xs tracking-widest pb-0.5 transition-colors duration-200 ` +
                (isActive
                  ? 'text-cyan-neon border-b border-cyan-neon'
                  : 'text-gray-500 hover:text-cyan-neon')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${phaseColor}`} />
            <span className="font-mono text-xs text-gray-500 uppercase tracking-widest hidden sm:block">
              {phase}
            </span>
          </div>
          <span className="font-mono text-xs text-gray-600 hidden md:block">{time}</span>
          {user && (
            <span className="font-mono text-xs text-cyan-neon/70 hidden lg:block">{user.email}</span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
