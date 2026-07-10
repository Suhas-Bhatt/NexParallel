"""
utils.py — Shared utilities for all Lambda functions.
Logger, response helpers, validation, sanitization.
"""
import json
import logging
import os
import re
import html
from datetime import datetime

# Structured logger (CloudWatch compatible)
logger = logging.getLogger("nexus")
logger.setLevel(os.environ.get("LOG_LEVEL", "INFO"))

if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        '{"level":"%(levelname)s","msg":"%(message)s","ts":"%(asctime)s","service":"nexus","version":"1.0.0"}'
    ))
    logger.addHandler(handler)


def log_structured(level, message, **kwargs):
    """Log structured data with additional context."""
    log_data = {
        "service": "nexus",
        "version": "1.0.0",
        "message": message,
        **kwargs
    }
    
    if level == "ERROR":
        logger.error(json.dumps(log_data))
    elif level == "WARNING":
        logger.warning(json.dumps(log_data))
    elif level == "INFO":
        logger.info(json.dumps(log_data))
    elif level == "DEBUG":
        logger.debug(json.dumps(log_data))


def log_function_start(function_name, **context):
    """Log function start with correlation context."""
    log_structured("INFO", f"Function started: {function_name}", 
                   function=function_name, 
                   phase="start",
                   **context)


def log_function_end(function_name, **context):
    """Log function end with correlation context."""
    log_structured("INFO", f"Function completed: {function_name}", 
                   function=function_name, 
                   phase="end",
                   **context)


def log_function_error(function_name, error, **context):
    """Log function error with correlation context."""
    log_structured("ERROR", f"Function failed: {function_name}", 
                   function=function_name, 
                   phase="error",
                   error_type=type(error).__name__,
                   error_message=str(error),
                   **context)


def get_correlation_id(event):
    """Extract or generate correlation ID from event."""
    # Try to get from headers
    headers = event.get('headers', {})
    correlation_id = headers.get('x-correlation-id') or headers.get('x-request-id')
    
    if correlation_id:
        return correlation_id
    
    # Try to get from body
    try:
        body = parse_body(event)
        correlation_id = body.get('correlationId')
    except:
        pass
    
    # Generate new one if not found
    if not correlation_id:
        import uuid
        correlation_id = str(uuid.uuid4())
    
    return correlation_id


def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,x-api-key",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    }


def ok(body, status=200):
    """Return a successful Lambda/API Gateway response."""
    return {"statusCode": status, "headers": cors_headers(), "body": json.dumps(body)}


def err(message, status=400):
    """Return an error Lambda/API Gateway response."""
    logger.error(message)
    return {"statusCode": status, "headers": cors_headers(), "body": json.dumps({"error": True, "message": message})}


def sanitize_input(text, max_length=500):
    """Sanitize user input by removing potentially harmful content."""
    if not isinstance(text, str):
        return ""
    
    # Remove HTML tags
    text = html.escape(text)
    
    # Remove potentially dangerous patterns
    dangerous_patterns = [
        r'<script.*?>.*?</script>',
        r'javascript:',
        r'vbscript:',
        r'onload\s*=',
        r'onerror\s*=',
        r'onclick\s*=',
        r'eval\s*\(',
        r'exec\s*\(',
        r'system\s*\(',
    ]
    
    for pattern in dangerous_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.DOTALL)
    
    # Limit length
    text = text[:max_length]
    
    return text.strip()


def validate_scenario(scenario):
    """Return error string or None if valid."""
    if not scenario or not isinstance(scenario, str):
        return "Scenario must be a non-empty string"
    
    scenario = scenario.strip()
    
    if len(scenario) < 10:
        return "Scenario too short (minimum 10 characters)"
    if len(scenario) > 500:
        return "Scenario too long (maximum 500 characters)"
    
    # Check for suspicious patterns
    suspicious_patterns = [
        r'<script',
        r'javascript:',
        r'vbscript:',
        r'eval\s*\(',
        r'exec\s*\(',
    ]
    
    for pattern in suspicious_patterns:
        if re.search(pattern, scenario, re.IGNORECASE):
            return "Scenario contains potentially dangerous content"
    
    return None


def validate_user_id(user_id):
    """Validate and sanitize user ID."""
    if not user_id or not isinstance(user_id, str):
        return "User ID must be a non-empty string"
    
    user_id = user_id.strip()
    
    # Allow alphanumeric, hyphens, underscores only
    if not re.match(r'^[a-zA-Z0-9_-]+$', user_id):
        return "User ID contains invalid characters"
    
    if len(user_id) > 50:
        return "User ID too long (maximum 50 characters)"
    
    return None


def validate_simulation_id(simulation_id):
    """Validate simulation ID format."""
    if not simulation_id or not isinstance(simulation_id, str):
        return "Simulation ID must be a non-empty string"
    
    # Check for UUID format
    uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    if not re.match(uuid_pattern, simulation_id, re.IGNORECASE):
        return "Invalid simulation ID format"
    
    return None


def parse_body(event):
    """Safely parse Lambda event body (handles string or dict)."""
    body = event.get("body", "{}")
    if isinstance(body, str):
        try:
            return json.loads(body)
        except json.JSONDecodeError:
            return {}
    return body or {}


def now_iso():
    return datetime.utcnow().isoformat() + "Z"
