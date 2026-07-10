"""
dynamo_helper.py — DynamoDB operations using boto3.
All functions are synchronous (Lambda is single-threaded).
Robustly handles Float/Decimal conversions to prevent boto3 and JSON serialization errors.
"""
import os
from decimal import Decimal
import boto3
from boto3.dynamodb.conditions import Key

TABLE_NAME = os.environ.get("DYNAMODB_TABLE", "nexus-simulations")

# Use resource API (higher-level, handles marshalling automatically)
_dynamodb = boto3.resource("dynamodb", region_name=os.environ.get("AWS_REGION_NAME", "us-east-1"))
_table = _dynamodb.Table(TABLE_NAME)


def convert_floats_to_decimals(obj):
    """Recursively convert float types to Decimal for DynamoDB storage."""
    if isinstance(obj, float):
        # Convert via string to avoid binary floating-point precision noise
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {k: convert_floats_to_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_floats_to_decimals(x) for x in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_floats_to_decimals(x) for x in obj)
    return obj


def convert_decimals_to_floats(obj):
    """Recursively convert Decimal types back to float/int for JSON serialization safety."""
    if isinstance(obj, Decimal):
        # If it represents an integer, convert to int, otherwise float
        if obj % 1 == 0:
            return int(obj)
        return float(obj)
    elif isinstance(obj, dict):
        return {k: convert_decimals_to_floats(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_decimals_to_floats(x) for x in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_decimals_to_floats(x) for x in obj)
    return obj


def put_simulation(item: dict) -> None:
    """Create or replace a simulation record with float safety."""
    clean_item = convert_floats_to_decimals(item)
    _table.put_item(Item=clean_item)


def get_simulation(simulation_id: str) -> dict | None:
    """Get a simulation by primary key. Returns None if not found, with Decimal-to-float safety."""
    res = _table.get_item(Key={"simulation_id": simulation_id})
    item = res.get("Item")
    if item:
        return convert_decimals_to_floats(item)
    return None


def update_simulation(simulation_id: str, updates: dict) -> None:
    """Update specific fields of a simulation record with float safety."""
    clean_updates = convert_floats_to_decimals(updates)
    update_expr = "SET " + ", ".join(f"#{k} = :{k}" for k in clean_updates)
    expr_names  = {f"#{k}": k for k in clean_updates}
    expr_values = {f":{k}": v for k, v in clean_updates.items()}

    _table.update_item(
        Key={"simulation_id": simulation_id},
        UpdateExpression=update_expr,
        ExpressionAttributeNames=expr_names,
        ExpressionAttributeValues=expr_values,
    )


def get_user_history(user_id: str, limit: int = 20) -> list:
    """Query simulations for a user, newest first, with Decimal-to-float safety."""
    try:
        res = _table.query(
            IndexName="userId-createdAt-index",
            KeyConditionExpression=Key("user_id").eq(user_id),
            ScanIndexForward=False,
            Limit=limit,
        )
        items = res.get("Items", [])
        return [convert_decimals_to_floats(item) for item in items]
    except Exception as e:
        print(f"WARNING: GSI query failed, falling back to Scan: {e}")
        # Table Scan fallback (safe for all DynamoDB environments and missing indexes)
        try:
            res = _table.scan()
            items = res.get("Items", [])
            filtered = [item for item in items if item.get("user_id") == user_id]
            filtered.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            return [convert_decimals_to_floats(item) for item in filtered[:limit]]
        except Exception as scan_err:
            print(f"ERROR: DynamoDB scan failed: {scan_err}")
            return []
