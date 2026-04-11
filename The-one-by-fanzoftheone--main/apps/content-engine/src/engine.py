"""
Content Engine — AI Video Pipeline
Script → Image → Voice → Video

Set these env vars to activate each stage:
  ANTHROPIC_API_KEY    — Claude scripting
  DEEPSEEK_API_KEY     — DeepSeek scripting (fallback)
  ELEVENLABS_API_KEY   — Voice synthesis
  LEONARDO_API_KEY     — Image generation

Without keys, runs in simulation mode so you can test the pipeline.
"""
import os
import json
import logging
import urllib.request
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger("ContentEngine")

PROFILES_PATH = Path(__file__).parent / "profiles.json"
PROFILES      = json.loads(PROFILES_PATH.read_text())

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

# ── Stage 1: Script Generation ────────────────────────────────────────────
def generate_script(topic: str, avatar: str, duration_seconds: int = 30) -> dict:
    """Generate a script using Claude or DeepSeek."""
    profile  = PROFILES["avatars"].get(avatar, PROFILES["avatars"]["the_fixer"])
    archetype = profile["archetype"]
    word_count = duration_seconds * 2.5  # ~150 words per minute

    prompt = f"""You are writing a {duration_seconds}-second video script for the "{archetype}" avatar.
Topic: {topic}
Word count: ~{int(word_count)} words
Style: {profile['voice']['tone']}
Format: Return ONLY the spoken script, no stage directions."""

    # Try Claude
    key = os.getenv("ANTHROPIC_API_KEY", "")
    if key:
        try:
            body = json.dumps({
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 512,
                "messages": [{"role": "user", "content": prompt}]
            }).encode()
            req = urllib.request.Request(
                "https://api.anthropic.com/v1/messages", data=body,
                headers={"x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.loads(r.read())
                return {"script": data["content"][0]["text"], "provider": "claude", "avatar": avatar}
        except Exception as e:
            logger.warning(f"Claude failed: {e}")

    # Try DeepSeek
    key = os.getenv("DEEPSEEK_API_KEY", "")
    if key:
        try:
            body = json.dumps({
                "model": "deepseek-chat",
                "messages": [{"role": "system", "content": f"You are the {archetype}."}, {"role": "user", "content": prompt}]
            }).encode()
            req = urllib.request.Request(
                "https://api.deepseek.com/v1/chat/completions", data=body,
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.loads(r.read())
                return {"script": data["choices"][0]["message"]["content"], "provider": "deepseek", "avatar": avatar}
        except Exception as e:
            logger.warning(f"DeepSeek failed: {e}")

    # Simulation fallback
    return {
        "script": f"[SIMULATION] {archetype} speaking about: {topic}. This is where your AI-generated script appears.",
        "provider": "simulation",
        "avatar": avatar
    }

# ── Stage 2: Voice Synthesis ──────────────────────────────────────────────
def synthesize_voice(script: str, avatar: str, output_path: str = "/tmp/voice.mp3") -> dict:
    """Synthesize voice using ElevenLabs."""
    profile      = PROFILES["avatars"].get(avatar, PROFILES["avatars"]["the_fixer"])
    voice_config = profile["voice"]
    key          = os.getenv("ELEVENLABS_API_KEY", "")

    if not key:
        logger.info("[SIMULATION] Voice synthesis — set ELEVENLABS_API_KEY to activate")
        return {"status": "simulated", "path": output_path, "provider": "simulation"}

    try:
        voice_id = os.getenv(f"ELEVENLABS_VOICE_{avatar.upper()}", "21m00Tcm4TlvDq8ikWAM")
        body     = json.dumps({
            "text": script,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {"stability": voice_config["stability"], "similarity_boost": voice_config["similarity_boost"]}
        }).encode()
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}", data=body,
            headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"}
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            Path(output_path).write_bytes(r.read())
        return {"status": "ok", "path": output_path, "provider": "elevenlabs"}
    except Exception as e:
        logger.error(f"Voice synthesis failed: {e}")
        return {"status": "error", "error": str(e)}

# ── Stage 3: Image Generation ─────────────────────────────────────────────
def generate_image(topic: str, avatar: str, output_path: str = "/tmp/thumbnail.jpg") -> dict:
    """Generate image using Leonardo.ai."""
    profile = PROFILES["avatars"].get(avatar, PROFILES["avatars"]["the_fixer"])
    prompt  = f"{profile['visual_prompt']} Context: {topic}"
    key     = os.getenv("LEONARDO_API_KEY", "")

    if not key:
        logger.info("[SIMULATION] Image generation — set LEONARDO_API_KEY to activate")
        return {"status": "simulated", "path": output_path, "provider": "simulation", "prompt": prompt}

    try:
        body = json.dumps({"prompt": prompt, "num_images": 1, "width": 1024, "height": 576}).encode()
        req  = urllib.request.Request(
            "https://cloud.leonardo.ai/api/rest/v1/generations", data=body,
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read())
        return {"status": "ok", "generation_id": data.get("sdGenerationJob", {}).get("generationId"), "provider": "leonardo"}
    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        return {"status": "error", "error": str(e)}

# ── Full Pipeline ─────────────────────────────────────────────────────────
def run_pipeline(topic: str, avatar: str = "the_fixer", duration: int = 30) -> dict:
    """Run the full content pipeline end to end."""
    logger.info(f"Pipeline starting: topic='{topic}' avatar={avatar}")
    result = {"topic": topic, "avatar": avatar, "started_at": _now(), "stages": {}}

    # Stage 1: Script
    script_result = generate_script(topic, avatar, duration)
    result["stages"]["script"] = script_result

    # Stage 2: Voice
    voice_result  = synthesize_voice(script_result["script"], avatar)
    result["stages"]["voice"] = voice_result

    # Stage 3: Image
    image_result  = generate_image(topic, avatar)
    result["stages"]["image"] = image_result

    result["completed_at"] = _now()
    result["status"] = "completed"
    logger.info(f"Pipeline complete for: {topic}")
    return result
