"""
simulate_universe/lambda_function.py
Step Functions Parallel State (runs 3x simultaneously).
Each invocation receives a different "mitigation" parameter:
  none    → Universe A (worst case)
  partial → Universe B (partial mitigation)
  optimal → Universe C (best case)
Input:  { simulation_id, parsed, dependency_graph, scenario, mitigation }
Output: { universe object with riskScores, impactMetrics, systemStates, etc. }
"""
import sys
sys.path.insert(0, "/var/task")
from shared.utils import logger
from shared.bedrock_helper import call_nova_json
from shared.prompts import SIMULATE_UNIVERSE_SYSTEM, simulate_universe_user

UNIVERSE_ID_MAP = {"none": "A", "partial": "B", "optimal": "C"}


def parse_int_resilient(val, default=50):
    if val is None:
        return default
    if isinstance(val, list):
        if len(val) > 0:
            val = val[0]
        else:
            return default
    try:
        return int(round(float(val)))
    except (ValueError, TypeError):
        return default


def lambda_handler(event, context):
    simulation_id    = event.get("simulation_id")
    parsed           = event.get("parsed", {})
    dependency_graph = event.get("dependency_graph", {})
    mitigation       = event.get("mitigation", "none")

    logger.info(f"simulate_universe invoked mitigation={mitigation} simulation_id={simulation_id}")

    if mitigation not in UNIVERSE_ID_MAP:
        raise ValueError(f"Invalid mitigation level: {mitigation}")

    try:
        universe = call_nova_json(
            SIMULATE_UNIVERSE_SYSTEM,
            simulate_universe_user(parsed, dependency_graph, mitigation),
            max_tokens=2000,
        )

        # Fill defaults to ensure consistent structure
        result = {
            "id":               universe.get("id", UNIVERSE_ID_MAP[mitigation]),
            "mitigationLevel":  mitigation,
            "narrativeSummary": universe.get("narrativeSummary", "Simulation outcome generated."),
            "timelineEvents":   universe.get("timelineEvents", []),
            "impactMetrics":    universe.get("impactMetrics", {}),
            "systemStates":     universe.get("systemStates", {}),
            "riskScores": {
                "financial":      parse_int_resilient(universe.get("riskScores", {}).get("financial"), 50),
                "operational":    parse_int_resilient(universe.get("riskScores", {}).get("operational"), 50),
                "customer":       parse_int_resilient(universe.get("riskScores", {}).get("customer"), 50),
                "infrastructure": parse_int_resilient(universe.get("riskScores", {}).get("infrastructure"), 50),
                "overall":        parse_int_resilient(universe.get("riskScores", {}).get("overall"), 50),
            },
        }

        logger.info(f"Universe simulated mitigation={mitigation} overall_risk={result['riskScores']['overall']}")
        return result

    except Exception as e:
        logger.error(f"simulate_universe failed mitigation={mitigation}: {e}")
        raise RuntimeError(f"Universe simulation ({mitigation}) failed: {e}") from e
