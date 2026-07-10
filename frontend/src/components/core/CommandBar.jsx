import React, { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore.js';

const PRESETS = [
  "What happens if ransomware spreads through our cloud infrastructure?",
  "What if our payment gateway fails during Black Friday sale?",
  "What if our Kubernetes cluster fails under 10x traffic load?",
];

export default function CommandBar({ onSimulate }) {
  const { phase, scenario, setScenario, simError } = useSimulationStore();
  const [value, setValue] = useState(scenario);

  const handleInput = (e) => {
    setValue(e.target.value);
    setScenario(e.target.value);
  };

  const handleSubmit = () => {
    if (!value.trim() || phase !== 'idle') return;
    setScenario(value.trim());
    onSimulate();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <textarea
          value={value}
          onChange={handleInput}
          placeholder="Describe your scenario... e.g. What if our payment gateway fails?"
          rows={3}
          disabled={phase !== 'idle'}
          maxLength={500}
          className="w-full glass rounded-lg px-4 py-3 font-mono text-sm text-white
                     placeholder-gray-600 resize-none border border-hyperblue/20
                     focus:outline-none focus:border-cyan-neon/60 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
        />
        <div className="absolute bottom-3 right-3 font-mono text-xs text-gray-600">
          {value.length}/500
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => { setValue(p); setScenario(p); }}
            title={p}
            className="font-mono text-xs px-3 py-1.5 rounded border border-hyperblue/20
                       text-gray-500 hover:text-cyan-neon hover:border-cyan-neon/40
                       transition-colors truncate max-w-[160px]"
          >
            PRESET {i + 1}
          </button>
        ))}
      </div>

      {simError && (
        <div className="text-danger font-mono text-xs p-3 border border-danger/30 rounded-lg bg-danger/5">
          ⚠ {simError}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!value.trim() || phase !== 'idle'}
        className="w-full py-3 px-6 font-display font-bold text-sm tracking-widest
                   bg-transparent border border-cyan-neon text-cyan-neon rounded-lg
                   hover:bg-cyan-neon/10 hover:shadow-neon-cyan transition-all duration-300
                   disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        {phase === 'idle' ? '◈ INITIATE SIMULATION' : '◈ SIMULATING...'}
      </button>
    </div>
  );
}
