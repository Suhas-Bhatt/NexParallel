export const cytoscapeStyles = [
  { selector: 'node', style: {
    'background-color': '#0f1a35', 'border-width': 2, 'border-color': '#4078ff',
    'color': '#e8eeff', 'font-family': 'JetBrains Mono, monospace', 'font-size': '11px',
    'label': 'data(label)', 'text-valign': 'center', 'text-halign': 'center',
    'shape': 'roundrectangle', 'width': 'label', 'height': 'label',
    'padding': '12px', 'text-wrap': 'wrap', 'text-max-width': '120px'
  }},
  { selector: 'node.trigger', style: { 'border-color': '#00e5ff', 'border-width': 3, 'background-color': 'rgba(0,229,255,0.15)' }},
  { selector: 'node.failed',  style: { 'border-color': '#ff4466', 'border-width': 3, 'background-color': 'rgba(255,68,102,0.18)', 'color': '#ff4466' }},
  { selector: 'node.degraded',style: { 'border-color': '#ffb830', 'background-color': 'rgba(255,184,48,0.12)', 'color': '#ffb830' }},
  { selector: 'node.safe',    style: { 'border-color': '#00ff8c', 'background-color': 'rgba(0,255,140,0.1)', 'color': '#00ff8c' }},
  { selector: 'node:selected',style: { 'border-width': 4, 'border-color': '#a855f7' }},
  { selector: 'edge', style: {
    'line-color': '#2a3f6a', 'target-arrow-color': '#4078ff',
    'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'width': 1.5, 'opacity': 0.7
  }},
  { selector: 'edge.propagating', style: { 'line-color': '#ff4466', 'target-arrow-color': '#ff4466', 'width': 3, 'opacity': 1 }},
];

export const layoutConfigs = {
  dagre: { name: 'dagre', rankDir: 'TB', nodeSep: 60, rankSep: 80, animate: true, animationDuration: 600 },
  cola:  { name: 'cola', animate: true, animationDuration: 800, nodeSpacing: 40, maxSimulationTime: 2000 },
};
