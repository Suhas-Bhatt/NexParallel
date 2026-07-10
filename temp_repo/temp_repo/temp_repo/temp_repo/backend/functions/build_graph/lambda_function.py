"""
build_graph/lambda_function.py
Step Functions State 2: Generate dependency graph via Claude.
Input:  { ...previous, parsed }
Output: { ...previous, dependency_graph: { nodes, edges, triggerNodeId } }
"""
import sys
sys.path.insert(0, "/var/task")
from shared.utils import logger
from shared.bedrock_helper import call_nova_json
from shared.prompts import BUILD_GRAPH_SYSTEM, build_graph_user


def lambda_handler(event, context):
    simulation_id = event.get("simulation_id")
    parsed        = event.get("parsed", {})

    logger.info(f"build_graph invoked simulation_id={simulation_id}")

    try:
        graph = call_nova_json(
            BUILD_GRAPH_SYSTEM,
            build_graph_user(parsed),
            max_tokens=1500,
        )

        nodes = graph.get("nodes", [])
        edges = graph.get("edges", [])

        if not nodes:
            raise ValueError("Claude returned an empty nodes list")

        # Ensure triggerNodeId exists in the node list
        trigger_id = graph.get("triggerNodeId")
        if trigger_id is None or not any(n["data"]["id"] == trigger_id for n in nodes):
            trigger_id = nodes[0]["data"]["id"]

        dependency_graph = {"nodes": nodes, "edges": edges, "triggerNodeId": trigger_id}

        logger.info(f"Graph built nodes={len(nodes)} edges={len(edges)} simulation_id={simulation_id}")
        return {**event, "dependency_graph": dependency_graph}

    except Exception as e:
        logger.error(f"build_graph failed: {e} simulation_id={simulation_id}")
        raise RuntimeError(f"Graph generation failed: {e}") from e
