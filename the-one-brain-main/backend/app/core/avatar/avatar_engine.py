from __future__ import annotations
from dataclasses import dataclass
from typing import Literal
from PIL import Image, ImageOps, ImageDraw, ImageFont
import io

Stage = Literal["Baby","Child","Teen","Adult","Mentor"]

@dataclass
class AvatarResult:
    png_bytes: bytes

class AvatarEngine:
    """
    MVP avatar composer:
    - takes 3 user-provided images
    - creates a private local collage (no external calls)
    - adds stage label overlay (hair/clothes would be layered in later versions)
    """
    def compose(self, stage: Stage, img1: bytes, img2: bytes, img3: bytes, size: int = 512) -> AvatarResult:
        imgs=[]
        for b in (img1,img2,img3):
            im = Image.open(io.BytesIO(b)).convert("RGBA")
            im = ImageOps.fit(im, (size, size), method=Image.Resampling.LANCZOS)
            imgs.append(im)

        canvas = Image.new("RGBA", (size, size), (10,10,10,255))
        # simple tri-slice collage
        canvas.paste(imgs[0].crop((0,0,size//2,size)), (0,0))
        canvas.paste(imgs[1].crop((size//2,0,size,size)), (size//2,0))
        # overlay third as circle
        circle = Image.new("L", (size//2, size//2), 0)
        d = ImageDraw.Draw(circle)
        d.ellipse((0,0,size//2-1,size//2-1), fill=255)
        third = imgs[2].resize((size//2, size//2), Image.Resampling.LANCZOS)
        third.putalpha(circle)
        canvas.paste(third, (size//4, size//4), third)

        draw = ImageDraw.Draw(canvas)
        label = f"THE ONE • {stage}"
        # default font
        draw.rectangle((0, size-52, size, size), fill=(0,0,0,170))
        draw.text((16, size-40), label, fill=(255,255,255,255))

        out=io.BytesIO()
        canvas.save(out, format="PNG")
        return AvatarResult(png_bytes=out.getvalue())
