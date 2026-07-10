import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '../../store/simulationStore.js';

export default function ReasoningPanel({ reasoningText = '' }) {
  const phase = useSimulationStore((s) => s.phase);
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!reasoningText) return;
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      if (i < reasoningText.length) {
        setDisplayed((d) => d + reasoningText[i++]);
      } else {
        clearInterval(id);
      }
    }, 18);
    return () => clearInterval(id);
  }, [reasoningText]);

  return (
    <div className="glass rounded-xl p-4 border border-violet/25 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className={`w-2 h-2 rounded-full bg-violet ${phase === 'complete' ? 'animate-glow' : 'opacity-40'}`} />
        <span className="font-display text-xs text-violet tracking-widest">AI REASONING ENGINE</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {!displayed ? (
          <p className="font-mono text-xs text-gray-600">_ Awaiting simulation result...</p>
        ) : (
          <p className="font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
            {displayed}
            <span className="animate-blink text-cyan-neon">▋</span>
          </p>
        )}
      </div>
    </div>
  );
}
