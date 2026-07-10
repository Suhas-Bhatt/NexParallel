import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSimulationStore } from '../../store/simulationStore.js';

const PHASES = {
  loading:    { label: 'PARSING SCENARIO',              pct: 15 },
  graphing:   { label: 'BUILDING DEPENDENCY GRAPH',     pct: 40 },
  simulating: { label: 'SIMULATING PARALLEL UNIVERSES', pct: 75 },
  scoring:    { label: 'CALCULATING RISK SCORES',       pct: 90 },
  complete:   { label: 'SIMULATION COMPLETE',           pct: 100 },
};

export default function SimulationLoader() {
  const phase = useSimulationStore((s) => s.phase);
  const current = PHASES[phase] ?? PHASES.loading;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-void/90 backdrop-blur-sm"
    >
      {/* Pulsing origin dot */}
      <div className="relative mb-10">
        <div className="w-6 h-6 rounded-full bg-cyan-neon animate-ping absolute inset-0 opacity-40" />
        <div className="w-6 h-6 rounded-full bg-cyan-neon relative" />
      </div>

      <motion.div
        key={current.label}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-xs tracking-[0.3em] text-cyan-neon mb-3 text-center"
      >
        {current.label}
      </motion.div>

      {/* Progress bar */}
      <div className="w-80 h-0.5 bg-hyperblue/20 rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-neon to-violet rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${current.pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Universe indicators */}
      <div className="flex gap-6">
        {[
          { id: 'A', color: 'border-danger text-danger/60' },
          { id: 'B', color: 'border-amber text-amber/60' },
          { id: 'C', color: 'border-neongreen text-neongreen/60' }
        ].map(({ id, color }, i) => (
          <div key={id} className="flex flex-col items-center gap-1.5">
            <motion.div
              animate={phase === 'simulating' ? { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              className={`w-3 h-3 rounded-full border-2 ${color.split(' ')[0]}`}
            />
            <span className={`font-mono text-xs ${color.split(' ')[1]}`}>U-{id}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
