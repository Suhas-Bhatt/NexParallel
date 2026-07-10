"""
finalizer/lambda_function.py
Step Functions final state: Save complete result to DynamoDB, publish SNS.
Also handles ERROR state if called with status=ERROR.
"""
import os
import json
import sys
import boto3
sys.path.insert(0, "/var/task")
from shared.utils import logger, now_iso
from shared.dynamo_helper import update_simulation

sns = boto3.client("sns", region_name=os.environ.get("AWS_REGION_NAME", "us-east-1"))


def lambda_handler(event, context):
    simulation_id = event.get("simulation_id")
    status        = event.get("status", "COMPLETE")

    logger.info(f"finalizer invoked simulation_id={simulation_id} status={status}")

    if status == "ERROR":
        update_simulation(simulation_id, {
            "status":       "ERROR",
            "error":        str(event.get("error", "Unknown error")),
            "completed_at": now_iso(),
        })
        return {"success": False, "simulation_id": simulation_id}

    # Package the full result
    result = {
        "universes":           event.get("universes", []),
        "recommendations":     event.get("recommendations", []),
        "dependency_graph":    event.get("dependency_graph", {}),
        "ai_reasoning":        event.get("aiReasoning", ""),
        "recommended_universe": event.get("recommendedUniverse", "C"),
        "parsed":              event.get("parsed", {}),
    }

    try:
        update_simulation(simulation_id, {
            "status":       "COMPLETE",
            "result":       result,
            "completed_at": now_iso(),
        })

        # Optional SNS notification
        topic_arn = os.environ.get("SNS_TOPIC_ARN")
        if topic_arn:
            try:
                scenario = event.get("scenario", "")
                ai_reasoning = event.get("aiReasoning", "No summary reasoning generated.")
                recommended_universe_id = event.get("recommendedUniverse", "C")
                
                # Locate the best/recommended universe details
                universes = event.get("universes", [])
                best_universe = next((u for u in universes if u.get("id") == recommended_universe_id), None)
                if not best_universe and universes:
                    best_universe = universes[-1]
                
                best_universe_summary = "N/A"
                best_universe_risk = "N/A"
                best_universe_downtime = "N/A"
                best_universe_revenue = "N/A"
                best_universe_users = "N/A"
                
                if best_universe:
                    best_universe_summary = best_universe.get("narrativeSummary", "N/A")
                    best_universe_risk = best_universe.get("riskScores", {}).get("overall", "N/A")
                    impacts = best_universe.get("impactMetrics", {})
                    best_universe_downtime = impacts.get("downtime", "N/A")
                    best_universe_revenue = impacts.get("revenueImpact", "N/A")
                    best_universe_users = impacts.get("affectedUsers", "N/A")

                recommendations = event.get("recommendations", [])
                formatted_recs = ""
                for idx, rec in enumerate(recommendations[:3], 1):
                    action = rec.get("action", "N/A")
                    effort = rec.get("effort", "N/A")
                    timeline = rec.get("timeline", "N/A")
                    formatted_recs += f"{idx}. {action}\n   (Effort: {effort} | Timeline: {timeline})\n\n"
                if not formatted_recs:
                    formatted_recs = "No recommendations generated.\n"

                sns_body = (
                    "==================================================\n"
                    "NEXUS REALITY ENGINE - SIMULATION REPORT COMPLETE\n"
                    "==================================================\n"
                    f"Simulation ID: {simulation_id}\n"
                    f"Scenario Analyzed:\n"
                    f"\"{scenario}\"\n\n"
                    "--------------------------------------------------\n"
                    f"🏆 RECOMMENDED PATH: UNIVERSE {recommended_universe_id} (OPTIMAL)\n"
                    "--------------------------------------------------\n"
                    f"Narrative Summary:\n"
                    f"{best_universe_summary}\n\n"
                    f"Mitigated Risk Level: {best_universe_risk}%\n"
                    f"Expected Downtime: {best_universe_downtime}\n"
                    f"Revenue Threat: {best_universe_revenue}\n"
                    f"Affected Customers: {best_universe_users}\n\n"
                    "--------------------------------------------------\n"
                    "🤖 STRATEGIC AI ADVISOR INSIGHT:\n"
                    "--------------------------------------------------\n"
                    f"{ai_reasoning}\n\n"
                    "--------------------------------------------------\n"
                    "📋 TOP ACTION RECOMMENDATIONS:\n"
                    "--------------------------------------------------\n"
                    f"{formatted_recs}"
                    "==================================================\n"
                    "Generated automatically by NEXUS Reality Engine v1.0\n"
                    "==================================================\n"
                )

                sns.publish(
                    TopicArn=topic_arn,
                    Subject=f"NEXUS Alert: Simulation Complete ({simulation_id[:8]})",
                    Message=sns_body,
                )
            except Exception as sns_err:
                logger.warning(f"SNS publish failed (non-fatal): {sns_err}")

        logger.info(f"Simulation finalized simulation_id={simulation_id}")
        return {"success": True, "simulation_id": simulation_id}

    except Exception as e:
        logger.error(f"finalizer failed: {e} simulation_id={simulation_id}")
        # Attempt to mark as error
        try:
            update_simulation(simulation_id, {
                "status": "ERROR", "error": str(e), "completed_at": now_iso()
            })
        except Exception:
            pass
        raise
