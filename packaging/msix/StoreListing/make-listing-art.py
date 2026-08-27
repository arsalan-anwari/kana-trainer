#!/usr/bin/env python3
"""Regenerates the Partner Center listing images from the app icon and the showcase stills.

These are uploaded by hand on the store listing page. They are not part of the
msix, so the package build never runs this. Committed output is the source of
truth; this exists so the art can be rebuilt when the icon changes.

    python3 packaging/msix/StoreListing/make-listing-art.py
"""

import shutil
import sys
from pathlib import Path

from PIL import Image

CREAM = (247, 242, 231, 255)  # the app background, tauri.conf.json
ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent


def badge() -> Image.Image:
    """The app icon at 1024, with the corners the ios export flattened to white
    put back to transparent."""
    src = Image.open(ROOT / 'src-tauri/icons/ios/AppIcon-512@2x.png').convert('RGBA')
    mask = (
        Image.open(ROOT / 'src-tauri/icons/icon.png')
        .convert('RGBA')
        .getchannel('A')
        .resize(src.size, Image.LANCZOS)
    )

    # the outer edge of the badge is flat cream, so every pixel the mask does
    # not keep fully opaque is repainted cream first. that takes the white out
    # of the corners and out of the antialiased fringe along them.
    px, mp = src.load(), mask.load()
    for y in range(src.height):
        for x in range(src.width):
            if mp[x, y] < 255:
                px[x, y] = CREAM
    src.putalpha(mask)
    return src


def promo(icon: Image.Image, w: int, h: int, badge_px: int, name: str) -> None:
    canvas = Image.new('RGBA', (w, h), CREAM)
    scaled = icon.resize((badge_px, badge_px), Image.LANCZOS)
    canvas.alpha_composite(scaled, ((w - badge_px) // 2, (h - badge_px) // 2))
    canvas.convert('RGB').save(OUT / name)  # promo art is opaque, no alpha


# The screenshots on the listing, taken straight from the readme showcase so the
# store and the readme never drift apart. Partner Center takes up to nine.
DEMO = [
    '01_Setup_TextOnly.png',
    '06_Quiz_TextOnly_KanaRomaji.png',
    '08_Quiz_AudioText_Typing.png',
    '10_Quiz_TextAudio_Sounds.png',
    '12_Result_Splash.png',
    '13_Result_Score.png',
    '15_Reports_LastWeek.png',
    '20_Chart_Characters.png',
]


def demo() -> None:
    src = ROOT / 'docs/desktop'
    (OUT / 'Demo').mkdir(parents=True, exist_ok=True)
    for name in DEMO:
        if not (src / name).exists():
            sys.exit(f'missing screenshot {src / name}, run scripts/record-showcase.sh first')
        shutil.copyfile(src / name, OUT / 'Demo' / name)
        print(f'    {(OUT / "Demo" / name).relative_to(ROOT)}')


icon = badge()
icon.resize((300, 300), Image.LANCZOS).save(OUT / 'StoreLogo300x300.png')
promo(icon, 1080, 1080, 700, 'BoxArt1080x1080.png')
promo(icon, 720, 1080, 440, 'PosterArt720x1080.png')
demo()
