from fastapi import APIRouter
from pydantic import BaseModel
from ..core.memory.memory_core import MemoryCore

router = APIRouter()
memory = MemoryCore()

class AddMemoryReq(BaseModel):
    user_id: int
    companion_id: int
    kind: str
    content: str
    importance: int = 1
    tags: str = ""

@router.post("/add")
def add(req: AddMemoryReq):
    m = memory.add(req.user_id, req.companion_id, req.kind, req.content, req.importance, req.tags)
    return {"memory": m}

class SearchReq(BaseModel):
    user_id: int
    companion_id: int
    query: str
    limit: int = 8

@router.post("/search")
def search(req: SearchReq):
    hits = memory.search(req.user_id, req.companion_id, req.query, req.limit)
    return {"hits": [h.__dict__ for h in hits]}
