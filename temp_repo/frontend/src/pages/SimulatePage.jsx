import React, { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import CommandBar from '../components/core/CommandBar.jsx';
import StatusTerminal from '../components/core/StatusTerminal.jsx';
import SimulationLoader from '../components/simulation/SimulationLoader.jsx';
import RiskDashboard from '../components/risk/RiskDashboard.jsx';
import DependencyGraph from '../components/graph/DependencyGraph.jsx';
import ReasoningPanel from '../components/ai/ReasoningPanel.jsx';
import { useSimulationStore } from '../store/simulationStore.js';
import { useAuthStore } from '../store/authStore.js';
import { startSimulation, pollSimulation } from '../api/simulate.js';
import { SimulationDirector } from '../three/SimulationDirector.js';

export default function SimulatePage() {
  const {
    phase, scenario, simulationResult,
    setPhase, setSimulationId, setSimulationResult, setSimError, resetSimulation, addTerminalLine
  } = useSimulationStore();

  const canvasRef  = useRef(null);
  const directorRef = useRef(null);
  const graphRef   = useRef(null);

  // Init Three.js
  useEffect(() => {
    if (!canvasRef.current) return;
    directorRef.current = new SimulationDirector(canvasRef.current);
    return () => directorRef.current?.destroy();
  }, []);

  // Build branches when result arrives
  useEffect(() => {
    if (!simulationResult || !directorRef.current) return;
    const universes = simulationResult.universes ?? [];
    universes.forEach((u, i) => directorRef.current.buildBranch(u.id, i, universes.length));
  }, [simulationResult]);

  const handleSimulate = async () => {
    resetSimulation();
    setPhase('loading');
    addTerminalLine('◈ Initiating NEXUS simulation pipeline...', 'info');
    addTerminalLine(`→ Scenario: "${scenario.substring(0, 60)}..."`, 'info');

    try {
      const { simulation_id } = await startSimulation(scenario);
      setSimulationId(simulation_id);
      addTerminalLine(`✓ Simulation ID: ${simulation_id}`, 'success');
      addTerminalLine('→ Step Functions: PARSING SCENARIO via Claude...', 'ai');
      setPhase('graphing');

      const result = await pollSimulation(simulation_id, (status) => {
        const msgs = {
          PARSING:    ['→ Bedrock Claude: Extracting entities...', 'ai'],
          GRAPHING:   ['→ Building dependency graph...', 'info'],
          SIMULATING: ['→ Parallel universes A/B/C generating...', 'ai'],
          SCORING:    ['→ Risk scoring engine active...', 'warning'],
        };
        if (msgs[status]) {
          addTerminalLine(...msgs[status]);
          if (status === 'SIMULATING') setPhase('simulating');
        }
      });

      setSimulationResult(result);
      setPhase('complete');
      addTerminalLine('✓ Simulation complete. All universes generated.', 'success');
      const universes = result.universes ?? [];
      universes.forEach((u) => {
        const colors = { A: 'error', B: 'warning', C: 'success' };
        addTerminalLine(`→ Universe ${u.id} risk: ${u.riskScores?.overall ?? 'N/A'}`, colors[u.id] ?? 'info');
      });
    } catch (e) {
      setPhase('error');
      setSimError(e.message);
      addTerminalLine(`✗ Error: ${e.message}`, 'error');
    }
  };

  const isLoading = phase !== 'idle' && phase !== 'complete' && phase !== 'error';
  const reasoning = simulationResult?.aiReasoning ?? '';

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left sidebar */}
      <aside className="w-80 flex-shrink-0 glass border-r border-hyperblue/20 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-hyperblue/20">
          <div className="font-mono text-xs text-gray-500 tracking-widest mb-3">// SCENARIO INPUT</div>
          <CommandBar onSimulate={handleSimulate} />
        </div>
        <div className="flex-1 overflow-hidden">
          <StatusTerminal />
        </div>
      </aside>

      {/* Main canvas area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 relative overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block" />
          <AnimatePresence>{isLoading && <SimulationLoader />}</AnimatePresence>
        </div>

        {phase === 'complete' && (
          <div className="h-72 border-t border-hyperblue/20 overflow-y-auto p-4">
            <RiskDashboard />
          </div>
        )}
      </div>

      {/* Right panel */}
      {phase === 'complete' && (
        <aside className="w-96 flex-shrink-0 glass border-l border-hyperblue/20 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-gray-500 tracking-widest">// DEPENDENCY GRAPH</span>
              <button
                onClick={() => graphRef.current?.runCascade('trigger-node')}
                className="font-mono text-xs text-danger hover:text-danger/80 transition-colors"
              >
                ▶ CASCADE
              </button>
            </div>
            <DependencyGraph ref={graphRef} height="240px" />
          </div>
          <div className="h-64 border-t border-hyperblue/20 p-3">
            <ReasoningPanel reasoningText={reasoning} />
          </div>
        </aside>
      )}
    </div>
  );
}
