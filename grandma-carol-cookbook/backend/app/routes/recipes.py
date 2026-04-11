from fastapi import APIRouter
from app import crud, schemas, database

router = APIRouter()
db = next(database.get_db())

@router.get("/")
def read_recipes(skip: int = 0, limit: int = 100):
    return crud.get_recipes(db, skip=skip, limit=limit)

@router.post("/")
def create_recipe(recipe: schemas.RecipeCreate):
    return crud.create_recipe(db, recipe)
