"""
orchestrator/lambda_function.py
API Gateway entry point: POST /simulate
Validates input, creates DynamoDB record, starts Step Functions execution.
"""
import json
import os
import uuid
import time
import boto3
from shared.utils import ok, err, validate_scenario, parse_body, now_iso, logger

sfn = boto3.client("stepfunctions", region_name=os.environ.get("AWS_REGION_NAME", "us-east-1"))

import sys
sys.path.insert(0, "/var/task")
from shared.dynamo_helper import put_simulation


def lambda_handler(event, context):
    # Handle CORS preflight
    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return ok({"ok": True})

    logger.info("orchestrator invoked")
    body = parse_body(event)
    scenario = body.get("scenario", "").strip()
    user_id  = body.get("userId", "demo-user")

    # Validate
    validation_error = validate_scenario(scenario)
    if validation_error:
        return err(validation_error, 400)

    simulation_id = str(uuid.uuid4())
    created_at    = now_iso()
    ttl           = int(time.time()) + 30 * 24 * 60 * 60  # 30 days

    try:
        # Save initial PENDING record to DynamoDB
        put_simulation({
            "simulation_id": simulation_id,
            "user_id":       user_id,
            "scenario":      scenario,
            "status":        "PENDING",
            "created_at":    created_at,
            "ttl":           ttl,
        })

        # Start Step Functions execution
        sfn.start_execution(
            stateMachineArn=os.environ["STEP_FUNCTION_ARN"],
            name=f"nexus-{simulation_id}",
            input=json.dumps({
                "simulation_id": simulation_id,
                "scenario":      scenario,
                "user_id":       user_id,
                "created_at":    created_at,
            }),
        )

        logger.info(f"Simulation started simulation_id={simulation_id}")
        return ok({"simulation_id": simulation_id, "status": "PENDING"}, 202)

    except Exception as e:
        logger.error(f"Orchestrator failed: {e}")
        return err(f"Failed to start simulation: {str(e)}", 500)
