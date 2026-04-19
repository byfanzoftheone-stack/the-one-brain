from fastapi import APIRouter
from pydantic import BaseModel
from sqlmodel import Session, select
from ..db.init_db import engine
from ..db.models import Companion

router = APIRouter()

class CreateCompanionReq(BaseModel):
    user_id: int
    name: str
    stage: str = "Baby"

@router.post("/create")
def create_companion(req: CreateCompanionReq):
    c = Companion(
        user_id=req.user_id,
        name=req.name.strip()[:60] or "The One",
        stage=req.stage,
        xp=0,
    )
    with Session(engine()) as s:
        s.add(c)
        s.commit()
        s.refresh(c)
    return {"companion": c}

@router.get("/{companion_id}")
def get_companion(companion_id: int):
    with Session(engine()) as s:
        c = s.get(Companion, companion_id)
    return {"companion": c}

class UpdateCompanionReq(BaseModel):
    stage: str | None = None
    xp: int | None = None
    name: str | None = None

@router.post("/{companion_id}/update")
def update_companion(companion_id: int, req: UpdateCompanionReq):
    with Session(engine()) as s:
        c = s.get(Companion, companion_id)
        if c is None:
            return {"error": "not_found"}
        if req.stage is not None:
            c.stage = req.stage
        if req.xp is not None:
            c.xp = int(req.xp)
        if req.name is not None:
            c.name = req.name.strip()[:60]
        s.add(c)
        s.commit()
        s.refresh(c)
        return {"companion": c}
