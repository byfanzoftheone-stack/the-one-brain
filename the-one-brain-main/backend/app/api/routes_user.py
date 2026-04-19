from fastapi import APIRouter
from pydantic import BaseModel
from sqlmodel import Session
from ..db.init_db import engine
from ..db.models import User

router = APIRouter()

class CreateUserReq(BaseModel):
    display_name: str

@router.post("/create")
def create_user(req: CreateUserReq):
    u = User(display_name=req.display_name.strip()[:80])
    with Session(engine()) as s:
        s.add(u)
        s.commit()
        s.refresh(u)
    return {"user": u}
