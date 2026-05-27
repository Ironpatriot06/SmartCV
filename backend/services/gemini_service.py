"""
Gemini API wrapper with safe JSON extraction.

Gemini sometimes wraps JSON in markdown fences or adds preamble text;
parse_json_response handles that before Pydantic validation in tailoring_service.
"""

from __future__ import annotations

import asyncio
import json
import os
import re
from typing import Any

import google.generativeai as genai
from google.generativeai.types import GenerationConfig

DEFAULT_MODEL = "gemini-2.5-flash"

_JSON_FENCE_RE = re.compile(
    r"```(?:json)?\s*([\s\S]*?)\s*```",
    re.IGNORECASE,
)
_JSON_OBJECT_RE = re.compile(r"\{[\s\S]*\}")


def _configure_client() -> None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Add it to your environment or backend .env file."
        )
    genai.configure(api_key=api_key)


def parse_json_response(raw: str) -> dict[str, Any] | None:
    """
    Best-effort JSON extraction from model output.

    Fallback order: fenced block → first JSON object → full string parse.
    Returns None when no valid JSON object is found.
    """
    text = (raw or "").strip()
    if not text:
        return None

    fence_match = _JSON_FENCE_RE.search(text)
    if fence_match:
        text = fence_match.group(1).strip()

    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    object_match = _JSON_OBJECT_RE.search(text)
    if object_match:
        try:
            parsed = json.loads(object_match.group(0))
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            pass

    return None


def _generate_sync(prompt: str, model_name: str) -> str:
    try:
        _configure_client()
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(
            prompt,
            generation_config=GenerationConfig(
                temperature=0.3,
                response_mime_type="application/json",
            ),
        )
        return (response.text or "").strip()
    except RuntimeError:
        raise
    except Exception as exc:
        raise RuntimeError(f"Gemini request failed: {exc}") from exc


async def generate_json(
    prompt: str,
    *,
    model_name: str | None = None,
) -> dict[str, Any] | None:
    """Call Gemini asynchronously and return a parsed JSON object, or None on failure."""
    name = model_name or os.getenv("GEMINI_MODEL", DEFAULT_MODEL)
    raw = await asyncio.to_thread(_generate_sync, prompt, name)
    return parse_json_response(raw)
