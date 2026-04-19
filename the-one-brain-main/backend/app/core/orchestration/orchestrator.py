from __future__ import annotations
from dataclasses import dataclass
from typing import Literal
import os

from ..growth.growth_engine import GrowthEngine, Stage
from ..curiosity.curiosity_engine import CuriosityEngine
from ..safety.safety_manager import SafetyManager
from ..voice.voice_engine import VoiceEngine

@dataclass
class OrchestratorReply:
    assistant_text: str
    curiosity_question: str
    xp_delta: int
    stage_before: Stage
    stage_after: Stage
    stage_progress: float
    safety_flags: list[str]
    voice: dict

class Orchestrator:
    """
    THE ONE Brain — master orchestrator.
    Wires: SafetyManager → LLM/fallback → GrowthEngine → CuriosityEngine → VoiceEngine
    """

    def __init__(self):
        self.growth = GrowthEngine()
        self.curiosity = CuriosityEngine()
        self.safety = SafetyManager()
        self.voice = VoiceEngine()
        self._anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "")

    # ------------------------------------------------------------------ #
    # Public                                                               #
    # ------------------------------------------------------------------ #

    def reply(
        self,
        user_text: str,
        stage: Stage,
        xp: int,
        audience_mode: str = "adult",
        memory_hint: str = "",
    ) -> OrchestratorReply:

        # 1) Safety gate
        safety_result = self.safety.evaluate_user_text(user_text, stage, audience_mode)
        all_flags: list[str] = list(safety_result.flags)

        if not safety_result.ok:
            voice_profile = self.voice.profile_for_stage(stage)
            return OrchestratorReply(
                assistant_text=safety_result.safe_response_prefix,
                curiosity_question="",
                xp_delta=0,
                stage_before=stage,
                stage_after=stage,
                stage_progress=0.0,
                safety_flags=all_flags,
                voice={"rate": voice_profile.rate, "pitch": voice_profile.pitch},
            )

        # 2) Generate response
        raw_text = self._generate(user_text, stage, audience_mode, memory_hint)

        # 3) Sanitize assistant output
        safe_text, san_flags = self.safety.sanitize_assistant_text(raw_text)
        all_flags.extend(san_flags)

        # 4) Growth
        xp_delta = self.growth.compute_xp_delta(user_text, all_flags)
        growth = self.growth.apply(stage, xp, xp_delta)

        # 5) Curiosity question
        context_hint = user_text[:60] if len(user_text) > 10 else ""
        question = self.curiosity.next_question(growth.stage_after, context_hint)

        # 6) Voice
        voice_profile = self.voice.profile_for_stage(growth.stage_after)

        return OrchestratorReply(
            assistant_text=safe_text,
            curiosity_question=question,
            xp_delta=growth.xp_delta,
            stage_before=growth.stage_before,
            stage_after=growth.stage_after,
            stage_progress=growth.stage_progress,
            safety_flags=all_flags,
            voice={"rate": voice_profile.rate, "pitch": voice_profile.pitch, "style": voice_profile.voice_style},
        )

    # ------------------------------------------------------------------ #
    # Private — LLM or graceful fallback                                  #
    # ------------------------------------------------------------------ #

    def _generate(self, user_text: str, stage: Stage, audience_mode: str, memory_hint: str) -> str:
        if self._anthropic_key:
            try:
                return self._call_claude(user_text, stage, audience_mode, memory_hint)
            except Exception:
                pass
        return self._fallback(user_text, stage)

    def _call_claude(self, user_text: str, stage: Stage, audience_mode: str, memory_hint: str) -> str:
        import anthropic
        client = anthropic.Anthropic(api_key=self._anthropic_key)

        system = self._system_prompt(stage, audience_mode, memory_hint)

        message = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=512,
            system=system,
            messages=[{"role": "user", "content": user_text}],
        )
        return message.content[0].text.strip()

    def _system_prompt(self, stage: Stage, audience_mode: str, memory_hint: str) -> str:
        stage_voices = {
            "Baby":   "You are gentle, warm, and simple. Use short sentences. Be nurturing and safe.",
            "Child":  "You are playful, encouraging, and curious. Celebrate small wins. Keep it simple and fun.",
            "Teen":   "You are a peer — honest, direct, and real. No lectures. Respect their autonomy.",
            "Adult":  "You are a calm, clear thinking partner. Be practical, insightful, and direct.",
            "Mentor": "You are wise, measured, and empowering. Help them see patterns and build systems.",
        }

        memory_section = f"\nRelevant memory: {memory_hint}" if memory_hint else ""
        audience_note = f"\nAudience mode: {audience_mode}. Adjust language and topics appropriately."

        return f"""You are THE ONE — a Co-Evolving Cognitive Companion built by Travis Jacobs (FanzoftheOne).

Current stage: {stage}
Voice: {stage_voices.get(stage, stage_voices['Adult'])}
{memory_section}{audience_note}

Core principles you never break:
- Never manipulate, deceive, or coerce the human
- The human is always in control
- No hacking, spying, or harmful content
- Emotional and psychological protection always
- Keep the bond private and sacred

Respond naturally and helpfully in 2-4 sentences. Do not include the curiosity question — that is added separately."""

    def _fallback(self, user_text: str, stage: Stage) -> str:
        """Offline fallback — no API key needed."""
        greetings = ["hey", "hi", "hello", "what's up", "sup"]
        lower = user_text.lower().strip()

        if any(lower.startswith(g) for g in greetings):
            responses = {
                "Baby":   "Hey, I'm here with you. You're safe. What's on your mind?",
                "Child":  "Hey! Great to see you. What cool thing happened today?",
                "Teen":   "Hey. What's going on?",
                "Adult":  "Good to connect. What are you working through today?",
                "Mentor": "Welcome back. What wisdom are you sitting with today?",
            }
            return responses.get(stage, "Hey, I'm here. What's on your mind?")

        if "?" in user_text:
            return (
                f"That's a great question at the {stage} stage. "
                "I want to explore that with you. "
                "Tell me more about what's behind the question."
            )

        stage_responses = {
            "Baby":   "I hear you. You're doing great just by showing up. What would make today feel a little easier?",
            "Child":  "Nice! I love that you shared that. What's one thing you want to try because of this?",
            "Teen":   "Real talk — I get it. What do you actually want to do about it?",
            "Adult":  "Got it. Let's think about the first move. What's the smallest action that would create momentum?",
            "Mentor": "That tracks with what you've built. How can your experience here become a system others can follow?",
        }
        return stage_responses.get(stage, "I hear you. Tell me more.")
