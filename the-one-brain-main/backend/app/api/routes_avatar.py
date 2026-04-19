from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from ..core.avatar.avatar_engine import AvatarEngine

router = APIRouter()
engine = AvatarEngine()

@router.post("/compose")
async def compose(
    stage: str = Form(...),
    img1: UploadFile = File(...),
    img2: UploadFile = File(...),
    img3: UploadFile = File(...),
):
    b1 = await img1.read()
    b2 = await img2.read()
    b3 = await img3.read()
    res = engine.compose(stage=stage, img1=b1, img2=b2, img3=b3)
    return Response(content=res.png_bytes, media_type="image/png")
