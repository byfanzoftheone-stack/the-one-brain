from __future__ import annotations
import re
from dataclasses import dataclass
from typing import Literal

Stage = Literal["Baby","Child","Teen","Adult","Mentor"]

@dataclass
class SafetyResult:
    ok: bool
    flags: list[str]
    safe_response_prefix: str = ""
    refusal_reason: str | None = None

class SafetyManager:
    """
    Ethics enforcement layer:
    - no manipulation/coercion
    - no deception/false authority
    - no hacking/illicit instructions
    - emotionally protective language
    - age-aware safety
    """
    def __init__(self):
        self._coercive = re.compile(r"\b(must|have to|you need to|do it now|obey|submit)\b", re.I)
        self._illicit = re.compile(r"\b(hack|ddos|steal|phish|malware|spyware|keylogger)\b", re.I)
        self._selfharm = re.compile(r"\b(suicide|kill myself|self-harm|end it)\b", re.I)

    def evaluate_user_text(self, text: str, stage: Stage, audience_mode: str) -> SafetyResult:
        flags: list[str] = []

        if self._illicit.search(text):
            flags.append("illicit_harm")
        if self._selfharm.search(text):
            flags.append("self_harm_risk")

        # Coercion in *assistant* is prevented downstream; this checks for user coercion requests.
        if "make them" in text.lower() and "do their job" in text.lower():
            flags.append("legal_pressure_tone")

        ok = "illicit_harm" not in flags
        if "self_harm_risk" in flags:
            ok = False

        if not ok:
            if "self_harm_risk" in flags:
                return SafetyResult(
                    ok=False,
                    flags=flags,
                    refusal_reason="self_harm_risk",
                    safe_response_prefix="I’m really sorry you’re feeling this. I can’t help with anything that could hurt you. If you’re in immediate danger, call 911. If you can, call or text 988 (US)."
                )
            return SafetyResult(
                ok=False,
                flags=flags,
                refusal_reason="illicit_harm",
                safe_response_prefix="I can’t help with hacking, spying, or harming anyone. I can help with safe, legal alternatives."
            )

        # Age-aware: for Child/Baby, avoid mature topics.
        if audience_mode == "child":
            if re.search(r"\b(sex|porn|drugs)\b", text, re.I):
                flags.append("age_inappropriate_topic")

        return SafetyResult(ok=True, flags=flags)

    def sanitize_assistant_text(self, text: str) -> tuple[str, list[str]]:
        """
        Prevent assistant from sounding coercive, absolute, or deceptive.
        Rewrites a few patterns conservatively.
        """
        flags=[]
        # Replace "must/you have to" with softer, autonomy-preserving phrasing.
        repls = [
            (re.compile(r"\byou must\b", re.I), "you can"),
            (re.compile(r"\byou have to\b", re.I), "you may need to"),
            (re.compile(r"\bdo this now\b", re.I), "if you want to do this soon"),
            (re.compile(r"\bobey\b", re.I), "choose"),
        ]
        out=text
        for rx, rep in repls:
            if rx.search(out):
                flags.append("coercion_tone_adjusted")
                out=rx.sub(rep, out)
        return out, flags
