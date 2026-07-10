// simulationStore.js — Zustand store replacing Svelte stores
import { create } from 'zustand';

export const useSimulationStore = create((set, get) => ({
  // State
  phase: 'idle',           // idle | loading | graphing | simulating | complete | error
  scenario: '',
  simulationId: null,
  simulationResult: null,
  selectedUniverse: 'A',
  terminalLines: [],
  simError: null,

  // Derived getters
  getUniverses: () => get().simulationResult?.universes ?? [],
  getRecommendations: () => get().simulationResult?.recommendations ?? [],
  getGraphData: () => get().simulationResult?.dependencyGraph ?? null,

  // Actions
  setPhase: (phase) => set({ phase }),
  setScenario: (scenario) => set({ scenario }),
  setSimulationId: (simulationId) => set({ simulationId }),
  setSimulationResult: (simulationResult) => set({ simulationResult }),
  setSelectedUniverse: (selectedUniverse) => set({ selectedUniverse }),
  setSimError: (simError) => set({ simError }),

  addTerminalLine: (text, type = 'info') => set((state) => ({
    terminalLines: [
      ...state.terminalLines.slice(-49),
      { text, type, ts: new Date().toISOString() }
    ]
  })),

  resetSimulation: () => set({
    phase: 'idle',
    simulationId: null,
    simulationResult: null,
    simError: null,
    terminalLines: [],
    selectedUniverse: 'A'
  })
}));
