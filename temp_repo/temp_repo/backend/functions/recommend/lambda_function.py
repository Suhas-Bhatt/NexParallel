"""
recommend/lambda_function.py
Step Functions State 5: Generate AI recommendations from all 3 universe results.
Input:  { simulation_id, universes, parsed, dependency_graph }
Output: { ...same, recommendations, recommendedUniverse, aiReasoning }
"""
import sys
sys.path.insert(0, "/var/task")
from shared.utils import logger
from shared.bedrock_helper import call_nova_json
from shared.prompts import RECOMMEND_SYSTEM, recommend_user


def lambda_handler(event, context):
    simulation_id = event.get("simulation_id")
    universes     = event.get("universes", [])

    logger.info(f"recommend invoked simulation_id={simulation_id}")

    try:
        result = call_nova_json(
            RECOMMEND_SYSTEM,
            recommend_user(universes),
            max_tokens=2000,
        )

        recommendations = []
        for i, r in enumerate(result.get("recommendations", [])):
            recommendations.append({
                "rank":           r.get("rank", i + 1),
                "action":         r.get("action", "Take corrective action"),
                "rationale":      r.get("rationale", ""),
                "effort":         r.get("effort", "MEDIUM"),
                "timeline":       r.get("timeline", "Immediate"),
                "mitigatesRiskBy": r.get("mitigatesRiskBy", 0),
            })

        logger.info(f"Recommendations generated count={len(recommendations)} simulation_id={simulation_id}")

        return {
            **event,
            "recommendations":     recommendations,
            "recommendedUniverse": result.get("recommendedUniverse", "C"),
            "aiReasoning":         result.get("aiReasoning", "Based on simulation outcomes, Universe C is recommended."),
        }

    except Exception as e:
        logger.error(f"recommend failed: {e} simulation_id={simulation_id}")
        raise RuntimeError(f"Recommendation generation failed: {e}") from e
