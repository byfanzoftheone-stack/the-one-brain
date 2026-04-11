from sqlalchemy.orm import Session
from app import models, schemas

def create_recipe(db: Session, recipe: schemas.RecipeCreate):
    db_recipe = models.Recipe(**recipe.dict())
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

def get_recipes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Recipe).offset(skip).limit(limit).all()

def create_memory(db: Session, memory: schemas.MemoryCreate):
    db_memory = models.Memory(**memory.dict())
    db.add(db_memory)
    db.commit()
    db.refresh(db_memory)
    return db_memory

def get_memories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Memory).offset(skip).limit(limit).all()
