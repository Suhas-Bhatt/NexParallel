import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getHistory } from '../api/simulate.js';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getHistory()
      .then((data) => setSimulations(data.simulations ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="font-mono text-xs text-cyan-neon tracking-widest mb-2">// SIMULATION HISTORY</div>
        <h1 className="font-display font-bold text-2xl text-white mb-6">Past Simulations</h1>

        {loading && <div className="font-mono text-xs text-gray-500 animate-pulse">Loading history...</div>}
        {error   && <div className="font-mono text-xs text-danger">Error: {error}</div>}
        {!loading && simulations.length === 0 && (
          <div className="font-mono text-xs text-gray-600">No simulations yet. Run your first simulation.</div>
        )}

        <div className="space-y-3">
          {simulations.map((sim, i) => (
            <motion.button
              key={sim.simulation_id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => navigate('/simulate')}
              className="w-full glass rounded-xl p-4 text-left border border-hyperblue/20
                         hover:border-cyan-neon/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-mono text-xs text-gray-600 mb-1">
                    {new Date(sim.created_at).toLocaleString()} · ID: {sim.simulation_id?.substring(0, 8)}...
                  </div>
                  <p className="font-body text-sm text-white line-clamp-1">{sim.scenario}</p>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  {(sim.risk_scores ?? []).map((score, j) => (
                    <span key={j} className={`font-display text-xs px-2 py-1 rounded border
                      ${j === 0 ? 'text-danger border-danger/30' : j === 1 ? 'text-amber border-amber/30' : 'text-neongreen border-neongreen/30'}`}>
                      {score}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
