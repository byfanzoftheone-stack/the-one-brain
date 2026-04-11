#!/bin/bash

ROOT="grandma-carol-cookbook"

# Create folder structure
mkdir -p $ROOT/backend/app/routes
mkdir -p $ROOT/frontend/pages/recipes
mkdir -p $ROOT/frontend/components
mkdir -p $ROOT/frontend/styles
mkdir -p $ROOT/frontend/utils
mkdir -p $ROOT/system-md

# --- Backend Files ---
cat > $ROOT/backend/app/main.py <<EOL
from fastapi import FastAPI
from app.routes import recipes, memory_wall, users

app = FastAPI()

app.include_router(recipes.router, prefix="/recipes")
app.include_router(memory_wall.router, prefix="/memories")
app.include_router(users.router, prefix="/users")

@app.get("/")
def root():
    return {"status": "Grandma Carol Cookbook Backend Running"}
EOL

cat > $ROOT/backend/app/models.py <<EOL
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
EOL

cat > $ROOT/backend/app/schemas.py <<EOL
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
EOL

cat > $ROOT/backend/app/database.py <<EOL
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv('NEON_DATABASE_URL', 'sqlite:///./test.db')

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
EOL

cat > $ROOT/backend/app/crud.py <<EOL
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
EOL

cat > $ROOT/backend/app/routes/recipes.py <<EOL
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
EOL

cat > $ROOT/backend/app/routes/memory_wall.py <<EOL
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
EOL

cat > $ROOT/backend/app/routes/users.py <<EOL
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_users():
    return [{"name": "Grandchild1"}, {"name": "Grandchild2"}]
EOL

echo -e "fastapi\nuvicorn\nsqlalchemy\npydantic" > $ROOT/backend/requirements.txt

# --- Frontend Files ---
cat > $ROOT/frontend/pages/index.tsx <<EOL
import Link from 'next/link'

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Grandma Carol Cookbook</h1>
      <Link href="/recipes">Recipes</Link><br/>
      <Link href="/memory-wall">Memory Wall</Link>
    </div>
  )
}
EOL

cat > $ROOT/frontend/pages/recipes/[id].tsx <<EOL
export default function RecipeDetail() {
  return <div>Recipe Detail Page</div>
}
EOL

cat > $ROOT/frontend/pages/upload.tsx <<EOL
export default function Upload() {
  return <div>Upload Recipe or Memory</div>
}
EOL

cat > $ROOT/frontend/pages/memory-wall.tsx <<EOL
export default function MemoryWall() {
  return <div>Memory Wall Page</div>
}
EOL

cat > $ROOT/frontend/pages/profile.tsx <<EOL
export default function Profile() {
  return <div>User Profile Page</div>
}
EOL

cat > $ROOT/frontend/pages/_app.tsx <<EOL
import '../styles/globals.css'

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
EOL

cat > $ROOT/frontend/components/RecipeCard.tsx <<EOL
export default function RecipeCard() { return <div>RecipeCard</div> }
EOL

cat > $ROOT/frontend/components/MemoryCard.tsx <<EOL
export default function MemoryCard() { return <div>MemoryCard</div> }
EOL

cat > $ROOT/frontend/components/Navbar.tsx <<EOL
export default function Navbar() { return <div>Navbar</div> }
EOL

cat > $ROOT/frontend/components/MediaUpload.tsx <<EOL
export default function MediaUpload() { return <div>MediaUpload Component</div> }
EOL

cat > $ROOT/frontend/styles/globals.css <<EOL
@tailwind base;
@tailwind components;
@tailwind utilities;
EOL

cat > $ROOT/frontend/utils/api.ts <<EOL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
EOL

cat > $ROOT/frontend/tailwind.config.js <<EOL
module.exports = { content: ['./pages/**/*.{js,ts,jsx,tsx}','./components/**/*.{js,ts,jsx,tsx}'], theme: { extend: {} }, plugins: [], }
EOL

cat > $ROOT/frontend/package.json <<EOL
{
  "name": "grandma-carol-cookbook-frontend",
  "version": "1.0.0",
  "scripts": { "dev": "next dev", "build": "next build", "start": "next start" },
  "dependencies": { "next": "latest", "react": "latest", "react-dom": "latest", "tailwindcss": "latest" }
}
EOL

# --- System MD and README ---
cat > $ROOT/system-md/SYSTEM.md <<EOL
# System MD content
Tracks folder structure, features, and legacy rules.
EOL

cat > $ROOT/system-md/NOTES.md <<EOL
# Future Notes
List features to add later.
EOL

cat > $ROOT/README.md <<EOL
# Grandma Carol Cookbook

Backend: FastAPI
Frontend: Next.js + Tailwind
Deploy backend to Railway, frontend to Vercel
EOL

# --- Create zip ---
zip -r ${ROOT}.zip $ROOT

echo "✅ Zip created: ${ROOT}.zip"