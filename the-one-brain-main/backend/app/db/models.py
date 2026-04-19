from __future__ import annotations
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    display_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Companion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    name: str
    stage: str  # Baby|Child|Teen|Adult|Mentor
    xp: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Memory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    companion_id: int = Field(index=True)
    kind: str  # "fact"|"preference"|"moment"|"goal"|"boundary"
    content: str
    importance: int = 1  # 1-5
    tags: str = ""       # comma separated
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Interaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    companion_id: int = Field(index=True)
    user_text: str
    assistant_text: str
    curiosity_question: str
    safety_flags: str = ""  # comma separated
    xp_delta: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
