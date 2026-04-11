from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_users():
    return [{"name": "Grandchild1"}, {"name": "Grandchild2"}]
