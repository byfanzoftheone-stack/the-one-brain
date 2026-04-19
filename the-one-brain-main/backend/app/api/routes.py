from fastapi import APIRouter
from .routes_user import router as user_router
from .routes_companion import router as companion_router
from .routes_chat import router as chat_router
from .routes_memory import router as memory_router
from .routes_avatar import router as avatar_router

router = APIRouter()
router.include_router(user_router, prefix="/user", tags=["user"])
router.include_router(companion_router, prefix="/companion", tags=["companion"])
router.include_router(chat_router, prefix="/chat", tags=["chat"])
router.include_router(memory_router, prefix="/memory", tags=["memory"])
router.include_router(avatar_router, prefix="/avatar", tags=["avatar"])
