from fastapi import APIRouter
from pydantic import BaseModel
from sqlmodel import Session
from ..db.init_db import engine
from ..db.models import Companion, Interaction
from ..core.orchestration.orchestrator import Orchestrator
from ..core.memory.memory_core import MemoryCore

router = APIRouter()
orch = Orchestrator()
memory = MemoryCore()

class ChatReq(BaseModel):
    user_id: int
    companion_id: int
    user_text: str
    audience_mode: str = "adult"  # child|teen|adult|senior

@router.post("/reply")
def reply(req: ChatReq):
    with Session(engine()) as s:
        c = s.get(Companion, req.companion_id)
        if c is None:
            return {"error": "companion_not_found"}
        # memory hint: search top memory for a few words
        hint = ""
        hits = memory.search(req.user_id, req.companion_id, req.user_text, limit=1)
        if hits:
            hint = hits[0].content[:80]

        r = orch.reply(user_text=req.user_text, stage=c.stage, xp=c.xp, audience_mode=req.audience_mode, memory_hint=hint)

        # persist interaction
        it = Interaction(
            user_id=req.user_id,
            companion_id=req.companion_id,
            user_text=req.user_text,
            assistant_text=r.assistant_text,
            curiosity_question=r.curiosity_question,
            safety_flags=",".join(r.safety_flags),
            xp_delta=r.xp_delta,
        )
        # update companion growth
        c.xp = c.xp + r.xp_delta
        c.stage = r.stage_after

        s.add(it)
        s.add(c)
        s.commit()
        s.refresh(c)
        s.refresh(it)

    return {
        "reply": {
            "assistant_text": r.assistant_text,
            "curiosity_question": r.curiosity_question,
            "xp_delta": r.xp_delta,
            "stage_after": r.stage_after,
            "stage_progress": r.stage_progress,
            "safety_flags": r.safety_flags,
            "voice": r.voice,
        },
        "companion": c,
        "interaction": it,
    }
