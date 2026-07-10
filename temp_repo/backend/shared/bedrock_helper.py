
"""
bedrock_helper.py — Amazon Bedrock (Amazon Nova) integration.
Provides call_nova() and call_nova_json() helpers.
"""

import json
import os
import re
import boto3
from shared.utils import logger

MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")
REGION = os.environ.get("AWS_REGION_NAME", "us-east-1")

_client = boto3.client("bedrock-runtime", region_name=REGION)


def call_nova(system_prompt: str, user_message: str, max_tokens: int = 2000) -> str:
    """
    Send a request to Amazon Nova on Bedrock.
    Returns raw text response.
    Raises on Bedrock API errors.
    """

    payload = {
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "text": f"{system_prompt}\n\n{user_message}"
                    }
                ]
            }
        ],
        "inferenceConfig": {
            "max_new_tokens": max_tokens,
            "temperature": 0.7
        }
    }

    logger.info(f"Calling Bedrock model={MODEL_ID} tokens={max_tokens}")

    response = _client.invoke_model(
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=json.dumps(payload),
    )

    body = json.loads(response["body"].read())

    return body["output"]["message"]["content"][0]["text"]


def _strip_fences(text: str) -> str:
    """
    Remove markdown code fences from model response.
    """

    cleaned = re.sub(
        r"^```(?:json)?\n?",
        "",
        text.strip(),
        flags=re.MULTILINE,
    )

    cleaned = re.sub(
        r"\n?```$",
        "",
        cleaned.strip(),
        flags=re.MULTILINE,
    )

    return cleaned.strip()


def call_nova_json(
    system_prompt: str,
    user_message: str,
    max_tokens: int = 2000
) -> dict:
    """
    Call Nova and parse the response as JSON.

    Retries once with stricter instructions if JSON parsing fails.
    Raises ValueError if still invalid after retry.
    """

    text = call_nova(system_prompt, user_message, max_tokens)

    cleaned = _strip_fences(text)

    try:
        return json.loads(cleaned)

    except json.JSONDecodeError:

        logger.warning(
            "First JSON parse failed, retrying with stricter prompt"
        )

        retry_system = (
            system_prompt
            + "\n\nCRITICAL: Respond with ONLY valid JSON. "
              "No markdown, no prose, no explanation."
        )

        retry_text = call_nova(
            retry_system,
            user_message,
            max_tokens
        )

        retry_cleaned = _strip_fences(retry_text)

        try:
            return json.loads(retry_cleaned)

        except json.JSONDecodeError as e:
            raise ValueError(
                f"Nova returned invalid JSON after retry: {e}"
            ) from e