#!/usr/bin/env python3
"""Regenerate the Android adaptive-icon layers in src-tauri/icons/android."""

import sys
from math import hypot
from pathlib import Path
from typing import cast

from PIL import Image, ImageDraw

# Foreground canvas sizes per density, matching tauri-cli's icon.rs table.
FOREGROUND_SIZES = {
    "mdpi": 108,
    "hdpi": 162,
    "xhdpi": 216,
    "xxhdpi": 324,
    "xxxhdpi": 432,
}

# The guaranteed-visible circle is 66dp across on a 108dp foreground canvas.
SAFE_RADIUS = 33 / 108

# ic_launcher_round.png is drawn full bleed inside a circle of the icon's size.
ROUND_SIZES = {
    "mdpi": 48,
    "hdpi": 49,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}
SUPERSAMPLE = 8

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "src-tauri" / "icons" / "icon.png"
OUT = ROOT / "src-tauri" / "icons" / "android"


def load_artwork() -> Image.Image:
    im = Image.open(SOURCE).convert("RGBA")
    if im.width != im.height:
        sys.exit(f"{SOURCE} must be square, got {im.width}x{im.height}")
    return im


def fill_colour(im: Image.Image) -> tuple[int, int, int]:
    """The artwork's fill colour, sampled at its centre."""
    pixel = cast(tuple[int, int, int, int], im.getpixel((im.width // 2, im.height // 2)))
    return pixel[:3]


def content_radius(im: Image.Image) -> float:
    """Distance from centre to the furthest opaque pixel, as a fraction of half the canvas."""
    alpha = im.getchannel("A").tobytes()
    centre = (im.width - 1) / 2
    furthest = 0.0
    for y in range(im.height):
        row = y * im.width
        for x in range(im.width):
            if alpha[row + x] > 128:
                furthest = max(furthest, hypot(x - centre, y - centre))
    return furthest / centre


def flatten_transparent(im: Image.Image, colour: tuple[int, int, int]) -> Image.Image:
    """Gives fully transparent pixels the fill colour, so downscaling cannot bleed."""
    out = Image.new("RGBA", im.size, colour + (0,))
    out.paste(im, mask=im.getchannel("A").point([0] + [255] * 255))
    return out


def circle_mask(size: int) -> Image.Image:
    """An antialiased circle filling the whole canvas."""
    edge = size * SUPERSAMPLE
    big = Image.new("L", (edge, edge), 0)
    ImageDraw.Draw(big).ellipse((0, 0, edge - 1, edge - 1), fill=255)
    return big.resize((size, size), Image.Resampling.LANCZOS)


def write_background_colour(colour: tuple[int, int, int]) -> None:
    path = OUT / "values" / "ic_launcher_background.xml"
    path.parent.mkdir(parents=True, exist_ok=True)
    red, green, blue = colour
    hex_colour = f"#{red:02x}{green:02x}{blue:02x}"
    _ = path.write_text(f"""<?xml version="1.0" encoding="utf-8"?>
<resources>
  <color name="ic_launcher_background">{hex_colour}</color>
</resources>""")
    print(f"background colour {hex_colour} -> {path.relative_to(ROOT)}")


def main() -> None:
    artwork = load_artwork()
    colour = fill_colour(artwork)
    radius = content_radius(artwork)

    # shrink until the furthest corner of the artwork sits on the safe circle
    scale = 2 * SAFE_RADIUS / radius
    print(f"artwork extends to {radius:.3f} of its half-width; scaling to {scale:.1%} of the foreground canvas")

    flattened = flatten_transparent(artwork, colour)

    for density, canvas in FOREGROUND_SIZES.items():
        side = round(canvas * scale)
        layer = Image.new("RGBA", (canvas, canvas), colour + (0,))
        offset = (canvas - side) // 2
        artwork_scaled = flattened.resize((side, side), Image.Resampling.LANCZOS)
        layer.paste(artwork_scaled, (offset, offset))

        path = OUT / f"mipmap-{density}" / "ic_launcher_foreground.png"
        path.parent.mkdir(parents=True, exist_ok=True)
        layer.save(path)
        print(f"{path.relative_to(ROOT)}: {side}px artwork on {canvas}px canvas")

    for density, size in ROUND_SIZES.items():
        side = round(size / radius)
        icon = Image.new("RGBA", (size, size), colour + (255,))
        offset = (size - side) // 2
        icon.alpha_composite(flattened.resize((side, side), Image.Resampling.LANCZOS),
                             (offset, offset))
        icon.putalpha(circle_mask(size))

        path = OUT / f"mipmap-{density}" / "ic_launcher_round.png"
        icon.save(path)
        print(f"{path.relative_to(ROOT)}: {side}px artwork inscribed in {size}px circle")

    write_background_colour(colour)


if __name__ == "__main__":
    main()
