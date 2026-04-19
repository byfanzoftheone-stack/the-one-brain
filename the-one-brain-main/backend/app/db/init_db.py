from sqlmodel import SQLModel, create_engine
from ..core.settings import settings

_engine = None

def engine():
    global _engine
    if _engine is None:
        _engine = create_engine(f"sqlite:///{settings.db_path}", connect_args={"check_same_thread": False})
    return _engine

def init_db():
    SQLModel.metadata.create_all(engine())
