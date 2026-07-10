"""
parse_scenario/lambda_function.py
Step Functions State 1: Parse user scenario via Claude on Bedrock.
Input:  { simulation_id, scenario, user_id, created_at }
Output: { ...input, parsed: { event, businessContext, severity, affectedSystems, category } }
"""
import sys
sys.path.insert(0, "/var/task")
from shared.utils import validate_scenario, logger
from shared.bedrock_helper import call_nova_json
from shared.prompts import PARSE_SCENARIO_SYSTEM, parse_scenario_user


def lambda_handler(event, context):
    simulation_id = event.get("simulation_id")
    scenario      = event.get("scenario", "")

    logger.info(f"parse_scenario invoked simulation_id={simulation_id}")

    validation_error = validate_scenario(scenario)
    if validation_error:
        raise ValueError(validation_error)

    try:
        parsed = call_nova_json(
            PARSE_SCENARIO_SYSTEM,
            parse_scenario_user(scenario),
            max_tokens=1000,
        )

        # Ensure required fields with defaults
        result = {
            "event":           parsed.get("event", "unknown_event"),
            "businessContext": parsed.get("businessContext", "general"),
            "severity":        parsed.get("severity", "medium"),
            "affectedSystems": parsed.get("affectedSystems", []),
            "category":        parsed.get("category", "operations"),
        }

        logger.info(f"Scenario parsed event={result['event']} simulation_id={simulation_id}")
        return {**event, "parsed": result}

    except Exception as e:
        logger.error(f"parse_scenario failed: {e} simulation_id={simulation_id}")
        raise RuntimeError(f"Scenario parsing failed: {e}") from e
