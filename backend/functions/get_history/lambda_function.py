"""
get_history/lambda_function.py
API Gateway: GET /history?userId=xxx&limit=20
Returns a list of past simulations for a user.
"""
import sys
sys.path.insert(0, "/var/task")
from shared.utils import ok, err, logger
from shared.dynamo_helper import get_user_history


def lambda_handler(event, context):
    params  = event.get("queryStringParameters") or {}
    user_id = params.get("userId", "demo-user")
    limit   = int(params.get("limit", 20))

    logger.info(f"get_history invoked user_id={user_id} limit={limit}")

    try:
        items = get_user_history(user_id, limit)
        simulations = [
            {
                "simulation_id": item.get("simulation_id"),
                "scenario":      item.get("scenario", ""),
                "status":        item.get("status", "UNKNOWN"),
                "created_at":    item.get("created_at", ""),
                "risk_scores":   [
                    u.get("riskScores", {}).get("overall")
                    for u in (item.get("result") or {}).get("universes", [])
                ],
            }
            for item in items
        ]
        return ok({"simulations": simulations})

    except Exception as e:
        logger.error(f"get_history failed: {e}")
        # Return empty list gracefully for demo
        return ok({"simulations": []})
