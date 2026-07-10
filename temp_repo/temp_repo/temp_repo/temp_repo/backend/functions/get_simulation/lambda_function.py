"""
get_simulation/lambda_function.py
API Gateway: GET /simulation/{id}
Returns status and result (if complete). Used for frontend polling.
"""
import sys
sys.path.insert(0, "/var/task")
from shared.utils import ok, err, logger
from shared.dynamo_helper import get_simulation


def lambda_handler(event, context):
    simulation_id = (event.get("pathParameters") or {}).get("id")
    if not simulation_id:
        return err("Missing simulation ID", 400)

    logger.info(f"get_simulation invoked simulation_id={simulation_id}")

    try:
        item = get_simulation(simulation_id)
        if not item:
            return err("Simulation not found", 404)

        return ok({
            "simulation_id": item["simulation_id"],
            "status":        item.get("status", "UNKNOWN"),
            "scenario":      item.get("scenario", ""),
            "created_at":    item.get("created_at", ""),
            "result":        item.get("result") if item.get("status") == "COMPLETE" else None,
            "error":         item.get("error") if item.get("status") == "ERROR" else None,
        })

    except Exception as e:
        logger.error(f"get_simulation failed: {e}")
        return err("Failed to retrieve simulation", 500)
