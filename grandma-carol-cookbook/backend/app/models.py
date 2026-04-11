from sqlalchemy import Column, Integer, String, Text
from app.database import Base

class Recipe(Base):
    __tablename__ = 'recipes'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    instructions = Column(Text)
    media_url = Column(String, nullable=True)

class Memory(Base):
    __tablename__ = 'memories'
    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String)
    content = Column(Text)
    media_url = Column(String, nullable=True)
