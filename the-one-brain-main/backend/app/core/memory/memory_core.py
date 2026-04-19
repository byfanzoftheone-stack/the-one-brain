from __future__ import annotations
import re
from dataclasses import dataclass
from sqlmodel import Session, select
from ...db.init_db import engine
from ...db.models import Memory

@dataclass
class MemoryHit:
    id: int
    content: str
    score: float
    kind: str
    tags: str

def _tokenize(s: str) -> set[str]:
    s = s.lower()
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    toks = [t for t in s.split() if len(t) > 2]
    return set(toks)

class MemoryCore:
    """
    Local-first, private by default.
    MVP 'semantic' search uses token overlap + importance weight.
    """
    def add(self, user_id: int, companion_id: int, kind: str, content: str, importance: int = 1, tags: str = "") -> Memory:
        mem = Memory(
            user_id=user_id,
            companion_id=companion_id,
            kind=kind,
            content=content.strip(),
            importance=max(1, min(5, int(importance))),
            tags=tags.strip(),
        )
        with Session(engine()) as s:
            s.add(mem)
            s.commit()
            s.refresh(mem)
        return mem

    def search(self, user_id: int, companion_id: int, query: str, limit: int = 8) -> list[MemoryHit]:
        q_tokens = _tokenize(query)
        if not q_tokens:
            return []
        with Session(engine()) as s:
            rows = s.exec(
                select(Memory).where(Memory.user_id==user_id, Memory.companion_id==companion_id).order_by(Memory.created_at.desc())
            ).all()

        hits: list[MemoryHit] = []
        for m in rows:
            m_tokens = _tokenize(m.content + " " + (m.tags or ""))
            overlap = len(q_tokens & m_tokens)
            if overlap == 0:
                continue
            score = overlap * (1.0 + 0.25*(m.importance-1))
            hits.append(MemoryHit(id=m.id or 0, content=m.content, score=score, kind=m.kind, tags=m.tags))
        hits.sort(key=lambda h: h.score, reverse=True)
        return hits[:limit]
