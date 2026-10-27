import React, { useRef, useState } from 'react';
import DependencyGraph from '../components/graph/DependencyGraph.jsx';
import { useSimulationStore } from '../store/simulationStore.js';

const LAYOUTS = ['dagre', 'cola'];

export default function GraphPage() {
  const graphData = useSimulationStore((s) => s.getGraphData());
  const graphRef  = useRef(null);
  const [layout, setLayout] = useState('dagre');

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs text-cyan-neon tracking-widest mb-1">
            // DEPENDENCY GRAPH ANALYSIS
          </div>
          <p className="font-body text-gray-500 text-sm">
            {graphData ? 'Viewing dependency graph for current simulation' : 'Run a simulation to view graph'}
          </p>
        </div>

        {graphData && (
          <div className="flex gap-2">
            {LAYOUTS.map((l) => (
              <button
                key={l}
                onClick={() => { setLayout(l); graphRef.current?.switchLayout(l); }}
                className={`font-mono text-xs px-3 py-1.5 rounded border transition-colors
                  ${layout === l ? 'border-cyan-neon text-cyan-neon' : 'border-hyperblue/20 text-gray-500 hover:text-cyan-neon'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
            <button
              onClick={() => graphRef.current?.runCascade('trigger-node')}
              className="font-mono text-xs px-3 py-1.5 rounded border border-danger/40
                         text-danger hover:bg-danger/10 transition-colors"
            >
              ▶ CASCADE
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 glass rounded-xl overflow-hidden border border-hyperblue/20">
        {graphData ? (
          <DependencyGraph ref={graphRef} height="100%" />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="font-mono text-xs text-gray-600">No graph data. Run a simulation first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
