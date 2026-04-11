from pydantic import BaseModel
from typing import Optional

class RecipeBase(BaseModel):
    title: str
    instructions: str
    media_url: Optional[str] = None

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id: int
    class Config:
        orm_mode = True

class MemoryBase(BaseModel):
    user_name: str
    content: str
    media_url: Optional[str] = None

class MemoryCreate(MemoryBase):
    pass

class Memory(MemoryBase):
    id: int
    class Config:
        orm_mode = True
