import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSimulationStore } from '../../store/simulationStore.js';

const COLOR_MAP = {
  A: { border: 'neon-border-red',   text: 'text-danger',     bar: 'bg-danger',    bg: 'from-danger/5' },
  B: { border: 'neon-border-amber', text: 'text-amber',      bar: 'bg-amber',     bg: 'from-amber/5' },
  C: { border: 'neon-border-green', text: 'text-neongreen',  bar: 'bg-neongreen', bg: 'from-neongreen/5' },
};

function AnimatedCounter({ target }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    let start = null;
    const duration = 1500;
    const tick = (now) => {
      if (!start) start = now;
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      ref.current.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <span ref={ref}>0</span>;
}

export default function UniverseCard({ universe, index }) {
  const { selectedUniverse, setSelectedUniverse } = useSimulationStore();
  const c = COLOR_MAP[universe.id] ?? COLOR_MAP.A;
  const isSelected = selectedUniverse === universe.id;

  const overallScore = universe.riskScores?.overall ??
    Math.round(Object.values(universe.riskScores ?? {}).reduce((a, b) => a + b, 0) /
    Math.max(Object.values(universe.riskScores ?? {}).length, 1));

  return (
    <motion.button
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => setSelectedUniverse(universe.id)}
      className={`glass rounded-xl p-5 text-left w-full cursor-pointer transition-all duration-300
                  bg-gradient-to-br ${c.bg} to-transparent ${c.border}
                  ${isSelected ? 'ring-2 ring-cyan-neon/60 scale-[1.02]' : 'hover:scale-[1.01]'}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-mono text-xs text-gray-500 tracking-widest mb-1">UNIVERSE {universe.id}</div>
          <div className="font-display font-bold text-white text-sm tracking-wide">
            {(universe.mitigationLevel ?? '').toUpperCase()} MITIGATION
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs text-gray-500 mb-0.5">RISK</div>
          <div className={`font-display font-black text-3xl ${c.text}`}>
            <AnimatedCounter target={overallScore} />
          </div>
        </div>
      </div>

      <p className="font-body text-xs text-gray-400 mb-4 line-clamp-2">
        {universe.narrativeSummary ?? ''}
      </p>

      {/* Risk bars */}
      <div className="space-y-2">
        {Object.entries(universe.riskScores ?? {}).filter(([k]) => k !== 'overall').map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="font-mono text-xs text-gray-600 w-24 flex-shrink-0">{key.toUpperCase()}</span>
            <div className="flex-1 h-1 bg-hyperblue/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${c.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${val}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
              />
            </div>
            <span className={`font-mono text-xs ${c.text} w-8 text-right`}>{val}</span>
          </div>
        ))}
      </div>

      {/* Impact metrics */}
      {universe.impactMetrics && (
        <div className="mt-4 pt-3 border-t border-hyperblue/20 grid grid-cols-2 gap-2">
          {Object.entries(universe.impactMetrics).map(([k, v]) => (
            <div key={k}>
              <div className="font-mono text-xs text-gray-600">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
              <div className={`font-mono text-xs ${c.text} font-medium`}>{v}</div>
            </div>
          ))}
        </div>
      )}
    </motion.button>
  );
}
