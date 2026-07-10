const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function animateCascade(cy, sourceId, ms = 600) {
  cy.elements().removeClass('failed degraded safe propagating trigger');
  cy.getElementById(sourceId).addClass('failed trigger');
  const visited = new Set([sourceId]);
  const queue = [sourceId];
  while (queue.length) {
    const cur = queue.shift();
    for (const node of cy.getElementById(cur).successors('node')) {
      const nid = node.id();
      if (visited.has(nid)) continue;
      visited.add(nid); queue.push(nid);
      await delay(ms);
      cy.edges(`[source="${cur}"][target="${nid}"]`).addClass('propagating');
      node.addClass('failed');
      node.animate({ style: { 'border-width': 5 } }, { duration: 200,
        complete: () => node.animate({ style: { 'border-width': 3 } }, { duration: 200 }) });
    }
  }
}

export function applyUniverseState(cy, universeId, systemStates) {
  cy.elements().removeClass('failed degraded safe propagating trigger');
  Object.entries(systemStates).forEach(([nodeId, state]) => {
    const el = cy.getElementById(nodeId);
    if (el.length) el.addClass(state);
  });
}
