"""
generate_report/lambda_function.py
API Gateway: POST /report
Reads simulation result, uploads JSON to S3, returns presigned URL.
"""
import os
import sys
import json
import boto3
sys.path.insert(0, "/var/task")
from shared.utils import ok, err, parse_body, now_iso, logger
from shared.dynamo_helper import get_simulation

BUCKET = os.environ.get("S3_BUCKET", "nexus-reportz")
REGION = os.environ.get("AWS_REGION_NAME", "us-east-1")

s3 = boto3.client("s3", region_name=REGION)


def lambda_handler(event, context):
    body          = parse_body(event)
    simulation_id = body.get("simulationId") or body.get("simulation_id")

    if not simulation_id:
        return err("Missing simulationId", 400)

    logger.info(f"generate_report invoked simulation_id={simulation_id}")

    try:
        item = get_simulation(simulation_id)
        if not item:
            return err("Simulation not found", 404)
        if item.get("status") != "COMPLETE":
            return err("Simulation not yet complete", 409)

        report_key = f"reports/{simulation_id}/report.json"
        report = {
            "simulation_id": simulation_id,
            "generated_at":  now_iso(),
            "scenario":      item.get("scenario", ""),
            **item.get("result", {}),
        }

        # Upload to S3
        s3.put_object(
            Bucket=BUCKET,
            Key=report_key,
            Body=json.dumps(report, indent=2, default=str),
            ContentType="application/json",
        )

        # Generate presigned download URL (valid 1 hour)
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": BUCKET, "Key": report_key},
            ExpiresIn=3600,
        )

        logger.info(f"Report generated report_key={report_key}")
        return ok({"report_url": url, "report_key": report_key})

    except Exception as e:
        logger.error(f"generate_report failed: {e}")
        return err(f"Failed to generate report: {str(e)}", 500)
