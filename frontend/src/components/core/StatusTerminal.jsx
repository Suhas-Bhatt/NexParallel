import React, { useEffect, useRef } from 'react';
import { useSimulationStore } from '../../store/simulationStore.js';

const TYPE_COLORS = {
  info:    'text-cyan-neon/80',
  success: 'text-neongreen',
  warning: 'text-amber',
  error:   'text-danger',
  ai:      'text-violet',
};

export default function StatusTerminal() {
  const { phase, terminalLines } = useSimulationStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  const isRunning = phase !== 'idle' && phase !== 'complete' && phase !== 'error';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-hyperblue/20 flex-shrink-0">
        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-neongreen animate-pulse' : 'bg-hyperblue/30'}`} />
        <span className="font-display text-xs text-gray-500 tracking-widest">SIMULATION TERMINAL</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs">
        {terminalLines.length === 0 ? (
          <p className="text-gray-700">_ Awaiting scenario input...</p>
        ) : (
          terminalLines.map((line, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-gray-700 flex-shrink-0">
                {new Date(line.ts).toLocaleTimeString()}
              </span>
              <span className={TYPE_COLORS[line.type] ?? 'text-gray-400'}>{line.text}</span>
            </div>
          ))
        )}
        {isRunning && (
          <span className="text-cyan-neon animate-blink">▋</span>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
