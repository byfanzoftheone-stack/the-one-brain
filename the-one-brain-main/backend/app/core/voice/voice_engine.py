from __future__ import annotations
from dataclasses import dataclass
from typing import Literal

Stage = Literal["Baby","Child","Teen","Adult","Mentor"]

@dataclass
class VoiceProfile:
    voice_style: str
    rate: float
    pitch: float

class VoiceEngine:
    """
    MVP: returns voice parameters for client-side Web Speech.
    Optional external TTS can be integrated later.
    """
    def profile_for_stage(self, stage: Stage) -> VoiceProfile:
        if stage == "Baby":
            return VoiceProfile(voice_style="gentle", rate=0.95, pitch=1.25)
        if stage == "Child":
            return VoiceProfile(voice_style="playful", rate=1.0, pitch=1.1)
        if stage == "Teen":
            return VoiceProfile(voice_style="peer", rate=1.05, pitch=1.0)
        if stage == "Adult":
            return VoiceProfile(voice_style="calm", rate=1.0, pitch=0.95)
        return VoiceProfile(voice_style="mentor", rate=0.98, pitch=0.9)
