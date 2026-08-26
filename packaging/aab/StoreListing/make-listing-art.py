#!/usr/bin/env python3
"""Regenerates the Google Play Console listing images from the icon and the demo shots.

Google Play Console rejects anything off spec, so every size here is fixed: a 512 icon, a
1024x500 feature graphic, phone shots at 1080x2160 and tablet shots at
1920x1080. The recorded shots are letterboxed onto cream rather than stretched,
so the app keeps its own aspect ratio.

    python3 packaging/aab/StoreListing/make-listing-art.py
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

CREAM = (247, 242, 231)  # the app background, tauri.conf.json
INK = (27, 25, 21)  # --foreground, src/app.css
MUTED = (110, 102, 87)  # --muted-foreground

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent

FONT_BOLD = '/usr/share/fonts/dejavu-sans-fonts/DejaVuSans-Bold.ttf'
FONT_REGULAR = '/usr/share/fonts/dejavu-sans-fonts/DejaVuSans.ttf'

# Eight per device type is the Google Play Console maximum, and these walk through the app in
# the same order the readme showcase does.
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
    """The あ glyph on its own, cropped out of the launcher icon."""
    icon = Image.open(ROOT / 'src-tauri/icons/icon.png').convert('RGBA')
    inset = int(icon.width * 0.18)
    inner = icon.crop((inset, inset, icon.width - inset, icon.height - inset))

    # the interior is cream, so anything appreciably darker than it is glyph
    flat = Image.new('RGB', inner.size, CREAM)
    flat.paste(inner, mask=inner.getchannel('A'))
    box = flat.convert('L').point(lambda v: 255 if v < 128 else 0).getbbox()
    if box is None:
        sys.exit('no glyph found in icon.png')

    glyph = Image.new('RGBA', inner.size, (0, 0, 0, 0))
    glyph.paste(inner, mask=inner.getchannel('A'))
    return glyph.crop(box)


def scaled_to(image: Image.Image, w: int, h: int) -> Image.Image:
    """image resized to fit inside w by h, keeping its aspect ratio."""
    factor = min(w / image.width, h / image.height)
    return image.resize(
        (max(1, round(image.width * factor)), max(1, round(image.height * factor))),
        Image.LANCZOS,
    )


def save(image: Image.Image, name: str) -> None:
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    # Google Play Console wants 24-bit png with no alpha on everything, which is what an RGB
    # image is. The shots are flat colour, so optimize earns its run time.
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

    # the wordmark sits to the right of the glyph, under a hairline rule, the
    # same paper and ink restraint the app uses instead of colour
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
shots(ROOT / 'docs/phone', 1080, 2160, 'Phone')
shots(ROOT / 'docs/desktop', 1920, 1080, 'Tablet')
