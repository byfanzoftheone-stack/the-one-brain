from fastapi import FastAPI
from app.routes import recipes, memory_wall, users

app = FastAPI()

app.include_router(recipes.router, prefix="/recipes")
app.include_router(memory_wall.router, prefix="/memories")
app.include_router(users.router, prefix="/users")

@app.get("/")
def root():
    return {"status": "Grandma Carol Cookbook Backend Running"}
