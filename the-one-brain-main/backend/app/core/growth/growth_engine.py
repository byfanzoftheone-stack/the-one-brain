from __future__ import annotations
from dataclasses import dataclass
from typing import Literal

Stage = Literal["Baby","Child","Teen","Adult","Mentor"]

STAGE_ORDER: list[Stage] = ["Baby","Child","Teen","Adult","Mentor"]

@dataclass
class GrowthUpdate:
    xp_delta: int
    new_xp: int
    stage_before: Stage
    stage_after: Stage
    stage_progress: float  # 0-1 within current stage

class GrowthEngine:
    """
    Deterministic, explainable growth:
    - XP from healthy interactions
    - Stage changes based on XP thresholds
    """
    def __init__(self):
        # Tunable thresholds per stage (cumulative XP)
        self.thresholds = {
            "Baby": 0,
            "Child": 250,
            "Teen": 750,
            "Adult": 1750,
            "Mentor": 3500,
        }

    def _stage_for_xp(self, xp: int) -> Stage:
        # Highest stage whose threshold <= xp
        stage: Stage = "Baby"
        for s in STAGE_ORDER:
            if xp >= self.thresholds[s]:
                stage = s
        return stage

    def compute_xp_delta(self, user_text: str, safety_flags: list[str]) -> int:
        # Basic signal: length + reflection keywords; penalize if safety flags.
        t = user_text.strip()
        if not t:
            return 0
        base = min(30, max(5, len(t)//20))
        reflect = 0
        for kw in ["i learned", "i realized", "i feel", "my goal", "i want to", "i will"]:
            if kw in t.lower():
                reflect += 6
        penalty = 0
        if safety_flags:
            penalty = min(10, 2*len(safety_flags))
        return max(0, base + reflect - penalty)

    def apply(self, stage: Stage, xp: int, xp_delta: int) -> GrowthUpdate:
        before = stage
        new_xp = xp + xp_delta
        after = self._stage_for_xp(new_xp)

        # progress within stage
        cur_thr = self.thresholds[after]
        # next threshold
        next_stage = "Mentor"
        idx = STAGE_ORDER.index(after)
        if idx < len(STAGE_ORDER)-1:
            next_stage = STAGE_ORDER[idx+1]
            next_thr = self.thresholds[next_stage]
        else:
            next_thr = cur_thr + 1000

        denom = max(1, next_thr - cur_thr)
        progress = min(1.0, max(0.0, (new_xp - cur_thr) / denom))
        return GrowthUpdate(
            xp_delta=xp_delta,
            new_xp=new_xp,
            stage_before=before,
            stage_after=after,
            stage_progress=progress,
        )
