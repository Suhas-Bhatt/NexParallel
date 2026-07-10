import React from 'react';
import { motion } from 'framer-motion';
import { useSimulationStore } from '../../store/simulationStore.js';
import UniverseCard from '../simulation/UniverseCard.jsx';

export default function RiskDashboard() {
  const universes      = useSimulationStore((s) => s.getUniverses());
  const recommendations = useSimulationStore((s) => s.getRecommendations());

  return (
    <div className="space-y-4">
      <div className="font-mono text-xs text-gray-500 tracking-widest">// PARALLEL UNIVERSE OUTCOMES</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {universes.map((u, i) => (
          <UniverseCard key={u.id} universe={u} index={i} />
        ))}
      </div>

      {recommendations.length > 0 && (
        <div className="mt-4">
          <div className="font-mono text-xs text-gray-500 tracking-widest mb-3">// AI RECOMMENDATIONS</div>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="glass rounded-lg p-4 border border-violet/25"
              >
                <div className="flex items-start gap-3">
                  <span className="font-display text-xs text-violet mt-0.5">0{i + 1}</span>
                  <div>
                    <div className="font-body font-semibold text-white text-sm mb-1">{rec.action}</div>
                    <div className="font-mono text-xs text-gray-500">{rec.rationale}</div>
                    {rec.effort && (
                      <div className="mt-2 flex gap-3">
                        <span className="font-mono text-xs text-gray-600">
                          EFFORT: <span className="text-amber">{rec.effort}</span>
                        </span>
                        {rec.timeline && (
                          <span className="font-mono text-xs text-gray-600">
                            ETA: <span className="text-neongreen">{rec.timeline}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
