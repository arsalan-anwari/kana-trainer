#!/usr/bin/env python3
"""Regenerates the Google Play Console listing images from the icon and the demo shots.

    python3 tools/listing-art-aab.py
"""

import json
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

CREAM = (247, 242, 231)  # the app background, tauri.conf.json
INK = (27, 25, 21)  # --foreground, src/app.css
MUTED = (110, 102, 87)  # --muted-foreground

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'packaging/aab/StoreListing'
TAG = 'v' + json.loads((ROOT / 'package.json').read_text())['version'].replace('.', '-')

FONT_BOLD = '/usr/share/fonts/dejavu-sans-fonts/DejaVuSans-Bold.ttf'
FONT_REGULAR = '/usr/share/fonts/dejavu-sans-fonts/DejaVuSans.ttf'

# Up to eight shots per device type, in the readme showcase order.
SHOTS = [
    '01_Setup_TextOnly.png',
    '04_Setup_Alphabets.png',
    '06_Quiz_TextOnly_KanaRomaji.png',
    '08_Quiz_AudioText_Typing.png',
    '10_Quiz_TextAudio_Sounds.png',
    '13_Result_Score.png',
    '15_Reports_LastWeek.png',
    '20_Chart_Characters.png',
]


def mark() -> Image.Image:
    """Crops the あ glyph out of the launcher icon."""
    icon = Image.open(ROOT / 'src-tauri/icons/icon.png').convert('RGBA')
    inset = int(icon.width * 0.18)
    inner = icon.crop((inset, inset, icon.width - inset, icon.height - inset))

    # anything appreciably darker than the cream interior is glyph
    flat = Image.new('RGB', inner.size, CREAM)
    flat.paste(inner, mask=inner.getchannel('A'))
    box = flat.convert('L').point([255] * 128 + [0] * 128).getbbox()
    if box is None:
        sys.exit('no glyph found in icon.png')

    glyph = Image.new('RGBA', inner.size, (0, 0, 0, 0))
    glyph.paste(inner, mask=inner.getchannel('A'))
    return glyph.crop(box)


def scaled_to(image: Image.Image, w: int, h: int) -> Image.Image:
    """Resizes an image to fit inside w by h, keeping its aspect ratio."""
    factor = min(w / image.width, h / image.height)
    return image.resize(
        (max(1, round(image.width * factor)), max(1, round(image.height * factor))),
        Image.Resampling.LANCZOS,
    )


def speckle(image: Image.Image) -> None:
    """Nudges four pixels in each corner somewhere between cream and white.

    The Play Console dedups uploads by image hash and refuses anything it has
    seen before, so every run has to produce pixels it has not hashed yet.
    """
    pixels = image.load()
    w, h = image.size
    for cx, cy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        for _ in range(4):
            x = cx + random.randint(0, 31) * (1 if cx == 0 else -1)
            y = cy + random.randint(0, 31) * (1 if cy == 0 else -1)
            pixels[x, y] = tuple(random.randint(channel, 255) for channel in CREAM)


def save(image: Image.Image, name: str) -> None:
    speckle(image)
    path = OUT / name
    path = path.with_name(f'{path.stem}_{TAG}{path.suffix}')
    path.parent.mkdir(parents=True, exist_ok=True)
    # Google Play Console wants 24-bit png with no alpha
    image.save(path, 'PNG', optimize=True)
    print(f'    {path.relative_to(ROOT)}  {image.width}x{image.height}')


def icon(glyph: Image.Image) -> None:
    canvas = Image.new('RGB', (512, 512), CREAM)
    art = scaled_to(glyph, round(512 * 0.58), round(512 * 0.58))
    canvas.paste(art, ((512 - art.width) // 2, (512 - art.height) // 2), art)
    save(canvas, 'Icon512x512.png')


def feature_graphic(glyph: Image.Image) -> None:
    w, h = 1024, 500
    canvas = Image.new('RGB', (w, h), CREAM)
    draw = ImageDraw.Draw(canvas)

    art = scaled_to(glyph, round(h * 0.52), round(h * 0.52))
    left = 96
    canvas.paste(art, (left, (h - art.height) // 2), art)

    # wordmark to the right of the glyph, under a hairline rule
    text = left + art.width + 80
    draw.text((text, 176), 'Kana Trainer', font=ImageFont.truetype(FONT_BOLD, 76), fill=INK)
    draw.line((text, 274, text + 300, 274), fill=INK, width=3)
    draw.text(
        (text, 300),
        'Hiragana and katakana practice,\nin cream paper and black ink.',
        font=ImageFont.truetype(FONT_REGULAR, 33),
        fill=MUTED,
        spacing=12,
    )
    save(canvas, 'FeatureGraphic1024x500.png')


def shots(src: Path, w: int, h: int, folder: str) -> None:
    for index, name in enumerate(SHOTS, start=1):
        path = src / name
        if not path.exists():
            sys.exit(f'missing screenshot {path}')
        art = scaled_to(Image.open(path).convert('RGB'), w, h)
        canvas = Image.new('RGB', (w, h), CREAM)
        canvas.paste(art, ((w - art.width) // 2, (h - art.height) // 2))
        save(canvas, f'{folder}/{index:02d}_{path.stem}.png')


glyph = mark()
icon(glyph)
feature_graphic(glyph)
shots(ROOT / 'packaging/repo/phone', 1080, 2160, 'Phone')
shots(ROOT / 'packaging/repo/desktop', 1920, 1080, 'Tablet')
