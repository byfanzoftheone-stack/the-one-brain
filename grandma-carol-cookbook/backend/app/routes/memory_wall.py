from fastapi import APIRouter
from app import crud, schemas, database

router = APIRouter()
db = next(database.get_db())

@router.get("/")
def read_memories(skip: int = 0, limit: int = 100):
    return crud.get_memories(db, skip=skip, limit=limit)

@router.post("/")
def create_memory(memory: schemas.MemoryCreate):
    return crud.create_memory(db, memory)
