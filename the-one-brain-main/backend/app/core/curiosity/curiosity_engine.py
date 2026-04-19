from __future__ import annotations
import random
from typing import Literal
from ..settings import settings

Stage = Literal["Baby","Child","Teen","Adult","Mentor"]

STAGE_BANK: dict[Stage, list[str]] = {
    "Baby": [
        "What is one small thing that made you feel safe today?",
        "What do you want your day to look like in one simple sentence?",
        "What’s one tiny win you can celebrate right now?",
    ],
    "Child": [
        "What did you learn today that you didn’t know yesterday?",
        "If you could practice one skill for 10 minutes, what would it be?",
        "What’s something you’re curious about, and what’s your best guess why it works that way?",
    ],
    "Teen": [
        "What’s a belief you have… and where did it come from?",
        "If your future self gave you one warning, what would it be?",
        "What’s one habit you know helps you—why do you think it’s hard to stay consistent?",
    ],
    "Adult": [
        "What outcome matters most to you this month—and what’s the first measurable step?",
        "Which boundary would protect your energy this week?",
        "What assumption might be costing you results right now?",
    ],
    "Mentor": [
        "What wisdom have you earned that you can turn into a system others can follow?",
        "Where can you lead with calm strength instead of urgency?",
        "What would it look like to make your values visible through daily actions?",
    ],
}

class CuriosityEngine:
    """
    Scientifically-inspired question generation (MVP):
    - Stage-specific question banks
    - Optional LLM enhancement if OPENAI_API_KEY exists
    """
    def __init__(self, seed: int | None = None):
        self._rng = random.Random(seed)

    def next_question(self, stage: Stage, context_hint: str = "") -> str:
        bank = STAGE_BANK.get(stage, STAGE_BANK["Adult"])
        q = self._rng.choice(bank)
        # Light personalization without profiling:
        if context_hint and len(context_hint) < 80:
            return f"{q} (Thinking about: {context_hint})"
        return q
