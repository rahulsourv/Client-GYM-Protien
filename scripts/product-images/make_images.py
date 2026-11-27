"""Builds transparent product images from the photos in public/assets/sample_images.

Run from the frontend folder:  python scripts/product-images/make_images.py
Needs:  pip install "rembg[cpu]" pillow   (downloads the u2net model on first run)

Every product photo is cut out with rembg, then the holes the model leaves in
white or gold labels are filled, so only the background around the pack is
removed. The Platinum Whey poster is cropped to the tub first.
"""

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[2]
SAMPLES = ROOT / "public/assets/sample_images"
OUT = ROOT / "public/assets/products"


def photo(time):
    return f"WhatsApp Image 2026-11-26 at {time}.jpeg"


# output name → (sample file, optional crop box)
SOURCES = {
    "bcaa-2-1-1": (photo("6.26.24 PM"), None),
    "mix-seeds-nuts-protein": (photo("6.26.41 PM"), None),
    "eaa-bcaa": (photo("6.26.26 PM"), None),
    "isolate-whey": (photo("6.26.30 PM"), None),
    "chicken-protein": (photo("6.26.31 PM"), None),
    "cow-milk-protein-isolate": (photo("6.26.32 PM"), None),
    "albumin-protein": (photo("6.26.33 PM"), None),
    "creatine-monohydrate": (photo("6.26.34 PM"), None),
    "glutamine": (photo("6.26.35 PM"), None),
    "gold-standard-whey": (photo("6.26.36 PM"), None),
    "yeast-protein-whey": (photo("6.26.37 PM"), None),
    "goat-meat-protein": (photo("6.26.38 PM"), None),
    "performance-whey": (photo("6.26.40 PM (1)"), None),
    "platinum-whey-protein": (photo("6.26.40 PM"), (255, 425, 770, 1065)),
    "pro-enzyme-whey-protein": ("image.png", None),
}


def fill_holes(mask):
    """Keep only the background reachable from the image edges."""
    w, h = mask.size
    px = mask.load()
    out = Image.new("L", (w, h), 255)
    op = out.load()
    seen = bytearray(w * h)
    queue = deque()
    for x in range(w):
        queue.extend([(x, 0), (x, h - 1)])
    for y in range(h):
        queue.extend([(0, y), (w - 1, y)])
    while queue:
        x, y = queue.popleft()
        i = y * w + x
        if seen[i] or px[x, y]:
            continue
        seen[i] = 1
        op[x, y] = 0
        if x > 0: queue.append((x - 1, y))
        if x < w - 1: queue.append((x + 1, y))
        if y > 0: queue.append((x, y - 1))
        if y < h - 1: queue.append((x, y + 1))
    return out


def cut_out(im, session):
    mask = remove(im, session=session, only_mask=True)
    mask = mask.point(lambda a: 255 if a > 25 else 0)
    mask = mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    mask = fill_holes(mask).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert("RGBA")
    out.putalpha(mask)
    return out


def trim(im, pad=12):
    box = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    im = im.crop(box)
    canvas = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    canvas.paste(im, (pad, pad))
    return canvas


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    session = new_session("u2net")
    for name, (file, crop) in SOURCES.items():
        im = Image.open(SAMPLES / file).convert("RGB")
        if crop:
            im = im.crop(crop)
        trim(cut_out(im, session)).save(OUT / f"{name}.png", optimize=True)
        print("wrote", OUT / f"{name}.png")


if __name__ == "__main__":
    main()
