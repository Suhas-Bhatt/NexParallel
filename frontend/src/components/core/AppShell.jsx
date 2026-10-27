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
  const [menuOpen, setMenuOpen] = useState(false);

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
      <header className="glass border-b border-hyperblue/20 flex items-center justify-between px-4 sm:px-6 py-3 z-50 flex-shrink-0">
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <span className="font-display font-black text-cyan-neon text-sm tracking-widest flex-shrink-0">NEXUS</span>
          <span className="font-mono text-xs text-gray-600 tracking-wider hidden lg:block">REALITY ENGINE v1.0</span>
          <div className="w-px h-4 bg-hyperblue/30 hidden lg:block" />
          <nav className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `font-display text-xs tracking-widest pb-0.5 transition-colors duration-200 whitespace-nowrap ` +
                  (isActive
                    ? 'text-cyan-neon border-b border-cyan-neon'
                    : 'text-gray-500 hover:text-cyan-neon')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
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
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="md:hidden flex flex-col justify-center items-center gap-1 w-8 h-8 text-cyan-neon"
          >
            <span className={`block w-5 h-px bg-current transition-transform ${menuOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
            <span className={`block w-5 h-px bg-current transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-current transition-transform ${menuOpen ? '-rotate-45 -translate-y-[3px]' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav className="md:hidden glass border-b border-hyperblue/20 flex flex-col px-4 py-2 z-40 flex-shrink-0">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `font-display text-xs tracking-widest py-3 border-b border-hyperblue/10 last:border-b-0 transition-colors duration-200 ` +
                (isActive ? 'text-cyan-neon' : 'text-gray-500 hover:text-cyan-neon')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
