"""Regenerates the Partner Center listing images from the app icon and the showcase stills.

    python3 tools/listing-art-msix.py
"""

import os
import sys
from pathlib import Path

from PIL import Image

CREAM = (247, 242, 231, 255)  # the app background, tauri.conf.json
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'packaging/msix/StoreListing'


def badge() -> Image.Image:
    """The app icon at 1024, with the white corners of the ios export made transparent."""
    src = Image.open(ROOT / 'src-tauri/icons/ios/AppIcon-512@2x.png').convert('RGBA')
    mask = (
        Image.open(ROOT / 'src-tauri/icons/icon.png')
        .convert('RGBA')
        .getchannel('A')
        .resize(src.size, Image.Resampling.LANCZOS)
    )

    # repaint every pixel the mask does not keep fully opaque as cream
    out = Image.new('RGBA', src.size, CREAM)
    out.paste(src, mask=mask.point([0] * 255 + [255]))
    out.putalpha(mask)
    return out


def promo(icon: Image.Image, w: int, h: int, badge_px: int, name: str) -> None:
    canvas = Image.new('RGBA', (w, h), CREAM)
    scaled = icon.resize((badge_px, badge_px), Image.Resampling.LANCZOS)
    canvas.alpha_composite(scaled, ((w - badge_px) // 2, (h - badge_px) // 2))
    canvas.convert('RGB').save(OUT / name)  # promo art is opaque, no alpha


# The listing screenshots, taken from the readme showcase. Partner Center takes up to nine.
DEMO = [
    '01_Setup_TextOnly.png',
    '06_Quiz_TextOnly_KanaRomaji.png',
    '08_Quiz_AudioText_Typing.png',
    '10_Quiz_TextAudio_Sounds.png',
    '12_Result_Splash.png',
    '13_Result_Score.png',
    '15_Reports_LastWeek.png',
    '20_Chart_Characters.png',
    '22_Setup_Language.png',
]


def demo() -> None:
    """Symlinks the listing screenshots to the readme stills."""
    src = ROOT / 'packaging/repo/desktop'
    out = OUT / 'Demo'
    out.mkdir(parents=True, exist_ok=True)
    for name in DEMO:
        if not (src / name).exists():
            sys.exit(f'missing screenshot {src / name}, run scripts/record.sh --showcase first')
        link = out / name
        target = os.path.relpath(src / name, out)
        if link.is_symlink() and os.readlink(link) == target:
            continue
        link.unlink(missing_ok=True)
        link.symlink_to(target)
        print(f'    {link.relative_to(ROOT)} -> {target}')


icon = badge()
icon.resize((300, 300), Image.Resampling.LANCZOS).save(OUT / 'StoreLogo300x300.png')
promo(icon, 1080, 1080, 700, 'BoxArt1080x1080.png')
promo(icon, 720, 1080, 440, 'PosterArt720x1080.png')
demo()
