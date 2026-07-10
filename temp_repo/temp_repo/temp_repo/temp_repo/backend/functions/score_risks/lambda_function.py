"""
score_risks/lambda_function.py
Step Functions State 4: Aggregate, clamp, and sort risk scores.
No AI calls — pure Python math.
Input:  { simulation_id, universes: [...], parsed, dependency_graph, ... }
Output: { ...same, universes sorted A=highest risk, C=lowest risk }
"""
import sys
sys.path.insert(0, "/var/task")
from shared.utils import logger


def clamp(v):
    """Clamp a value to 0–100 integer."""
    try:
        return max(0, min(100, int(round(float(v)))))
    except (TypeError, ValueError):
        return 50


def lambda_handler(event, context):
    simulation_id = event.get("simulation_id")
    universes     = event.get("universes", [])

    logger.info(f"score_risks invoked count={len(universes)} simulation_id={simulation_id}")

    scored = []
    for u in universes:
        scores = u.get("riskScores", {})
        # Recalculate overall if needed
        dims = [scores.get("financial", 50), scores.get("operational", 50),
                scores.get("customer", 50), scores.get("infrastructure", 50)]
        overall = clamp(scores.get("overall") or (sum(dims) / len(dims)))

        scored.append({
            **u,
            "riskScores": {
                "financial":      clamp(scores.get("financial", 50)),
                "operational":    clamp(scores.get("operational", 50)),
                "customer":       clamp(scores.get("customer", 50)),
                "infrastructure": clamp(scores.get("infrastructure", 50)),
                "overall":        overall,
            },
        })

    # Sort highest → lowest risk, assign IDs A / B / C
    scored.sort(key=lambda u: u["riskScores"]["overall"], reverse=True)
    for i, u in enumerate(scored):
        u["id"] = ["A", "B", "C"][i]

    logger.info(f"Scores: {[(u['id'], u['riskScores']['overall']) for u in scored]}")
    return {**event, "universes": scored}
