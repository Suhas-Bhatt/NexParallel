import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useSimulationStore } from '../../store/simulationStore.js';
import { cytoscapeStyles, layoutConfigs } from '../../cytoscape/graphStyles.js';
import { animateCascade, applyUniverseState } from '../../cytoscape/animateFailure.js';

const DependencyGraph = forwardRef(function DependencyGraph({ height = '100%' }, ref) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const graphData = useSimulationStore((s) => s.getGraphData());

  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    let cy;
    (async () => {
      const [Cytoscape, dagre] = await Promise.all([
        import('cytoscape').then((m) => m.default),
        import('cytoscape-dagre').then((m) => m.default),
      ]);
      Cytoscape.use(dagre);

      cy = Cytoscape({
        container: containerRef.current,
        elements: { nodes: graphData.nodes, edges: graphData.edges },
        style: cytoscapeStyles,
        layout: layoutConfigs.dagre,
        userZoomingEnabled: true,
        userPanningEnabled: true,
        minZoom: 0.3,
        maxZoom: 3,
      });

      cy.on('mouseover', 'node', (e) => {
        e.target.animate({ style: { 'border-width': 4 } }, { duration: 150 });
      });
      cy.on('mouseout', 'node', (e) => {
        e.target.animate({ style: { 'border-width': 2 } }, { duration: 150 });
      });

      cyRef.current = cy;
    })();

    return () => { if (cyRef.current) { cyRef.current.destroy(); cyRef.current = null; } };
  }, [graphData]);

  useImperativeHandle(ref, () => ({
    runCascade: (sourceId) => {
      if (cyRef.current) animateCascade(cyRef.current, sourceId);
    },
    switchLayout: (name) => {
      if (cyRef.current) cyRef.current.layout(layoutConfigs[name] ?? layoutConfigs.dagre).run();
    },
    applyUniverse: (id, states) => {
      if (cyRef.current) applyUniverseState(cyRef.current, id, states);
    },
  }));

  return <div ref={containerRef} style={{ height, width: '100%' }} className="rounded-xl overflow-hidden" />;
});

export default DependencyGraph;
