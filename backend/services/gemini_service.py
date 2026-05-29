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
import urllib.error
import urllib.request
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
    api_key = _require_api_key()
    genai.configure(api_key=api_key)


def _require_api_key() -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Add it to your environment or backend .env file."
        )
    return api_key


def _use_rest() -> bool:
    return os.getenv("GEMINI_USE_REST", "true").lower() in {"1", "true", "yes"}


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


def _generate_sync_rest(prompt: str, model_name: str, timeout_seconds: float) -> str:
    api_key = _require_api_key()
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model_name}:generateContent?key={api_key}"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "responseMimeType": "application/json",
        },
    }
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            raw = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"Gemini request failed: HTTP {exc.code} {exc.reason}. {body}"
        ) from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Gemini request failed: {exc.reason}") from exc

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError("Gemini response was not valid JSON.") from exc

    candidates = parsed.get("candidates") or []
    if not candidates:
        raise RuntimeError("Gemini response contained no candidates.")
    content = candidates[0].get("content") if isinstance(candidates[0], dict) else None
    parts = content.get("parts") if isinstance(content, dict) else None
    if not isinstance(parts, list):
        raise RuntimeError("Gemini response contained no text parts.")
    text = "".join(part.get("text", "") for part in parts if isinstance(part, dict))
    return text.strip()


def _generate_sync(prompt: str, model_name: str, timeout_seconds: float) -> str:
    if _use_rest():
        return _generate_sync_rest(prompt, model_name, timeout_seconds)
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
    timeout_seconds = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "60"))
    try:
        raw = await asyncio.wait_for(
            asyncio.to_thread(_generate_sync, prompt, name, timeout_seconds),
            timeout=timeout_seconds,
        )
    except asyncio.TimeoutError as exc:
        raise RuntimeError(
            f"Gemini request timed out after {timeout_seconds:.0f}s."
        ) from exc
    return parse_json_response(raw)
