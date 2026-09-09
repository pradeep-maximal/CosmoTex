"""Regenerate assets/img/ from source photos.

Usage:
    python -m pip install Pillow
    python tools/optimize-images.py

Put source photos in tools/source-images/ using the target slug as the filename,
e.g. tools/source-images/showroom-product-wall.jpg  ->  assets/img/showroom-product-wall-*.webp + .jpg

Client logos: prefix the filename with "logo-", e.g. tools/source-images/logo-client-rootote.png
"""
import os
from PIL import Image, ImageEnhance, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "source-images")
OUT = os.path.normpath(os.path.join(HERE, "..", "assets", "img"))
WIDTHS = [480, 960, 1440, 1920]
JPG_W = 1440

os.makedirs(OUT, exist_ok=True)

if not os.path.isdir(SRC):
    raise SystemExit(f"Create {SRC} and put source photos in it (named by target slug).")


def grade(im):
    im = ImageEnhance.Color(im).enhance(0.96)
    im = ImageEnhance.Contrast(im).enhance(1.04)
    return im


for fname in sorted(os.listdir(SRC)):
    stem, ext = os.path.splitext(fname)
    if ext.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
        continue
    path = os.path.join(SRC, fname)

    if stem.startswith("logo-"):
        slug = stem[len("logo-"):]
        im = Image.open(path).convert("RGBA")
        im = ImageOps.contain(im, (600, 400), Image.LANCZOS)
        im.save(os.path.join(OUT, f"{slug}.png"), "PNG", optimize=True)
        print(f"logo  {slug}  {im.size}")
        continue

    slug = stem
    im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    im = grade(im)
    ow, oh = im.size
    for w in WIDTHS:
        if w > ow:
            continue
        h = round(oh * w / ow)
        im.resize((w, h), Image.LANCZOS).save(
            os.path.join(OUT, f"{slug}-{w}.webp"), "WEBP", quality=74, method=6)
    jw = min(JPG_W, ow)
    im.resize((jw, round(oh * jw / ow)), Image.LANCZOS).save(
        os.path.join(OUT, f"{slug}.jpg"), "JPEG", quality=78, optimize=True, progressive=True)
    print(f"photo {slug}  {ow}x{oh}")

print("done")
