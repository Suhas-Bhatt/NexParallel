import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSimulationStore } from '../store/simulationStore.js';

const PRESETS = [
  { label: 'RANSOMWARE ATTACK',  icon: '🛡', text: 'What happens if ransomware spreads through our cloud infrastructure?' },
  { label: 'PAYMENT FAILURE',    icon: '💳', text: 'What if our payment gateway fails during Black Friday sale?' },
  { label: 'KUBERNETES OUTAGE',  icon: '⎈', text: 'What if our Kubernetes cluster fails under 10x traffic load?' },
];

export default function LandingPage() {
  const navigate   = useNavigate();
  const setScenario = useSimulationStore((s) => s.setScenario);

  const handlePreset = (text) => {
    setScenario(text);
    navigate('/simulate');
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col items-center justify-center p-8 gap-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="font-mono text-xs text-cyan-neon tracking-[0.3em] mb-4">
          // AI PARALLEL UNIVERSE SIMULATOR
        </div>
        <h1 className="font-display font-black text-5xl md:text-7xl text-white tracking-tight leading-none mb-4">
          NEXUS<br /><span className="text-cyan-neon">REALITY</span><br />ENGINE
        </h1>
        <p className="font-body text-gray-400 text-lg max-w-xl mx-auto">
          Simulate alternate futures. Predict cascading failures. Recommend optimal actions.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        {PRESETS.map((p, i) => (
          <motion.button
            key={p.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
            onClick={() => handlePreset(p.text)}
            className="glass rounded-xl p-5 text-left border border-hyperblue/20
                       hover:border-cyan-neon/40 hover:shadow-neon-cyan transition-all duration-300"
          >
            <div className="text-2xl mb-3">{p.icon}</div>
            <div className="font-display text-xs text-cyan-neon tracking-widest mb-2">{p.label}</div>
            <p className="font-mono text-xs text-gray-500 line-clamp-2">{p.text}</p>
          </motion.button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <button
          onClick={() => navigate('/simulate')}
          className="font-display font-bold text-sm tracking-widest px-8 py-4
                     border border-cyan-neon text-cyan-neon rounded-lg
                     hover:bg-cyan-neon/10 hover:shadow-neon-cyan transition-all duration-300"
        >
          ◈ OPEN SIMULATOR
        </button>
      </motion.div>
    </div>
  );
}
