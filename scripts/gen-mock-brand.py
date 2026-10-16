#!/usr/bin/env python3
"""
Eduvo Mock brand assets (public/brand/*) with the real Eduvo mark — the same geometry and colour as
landing/favicon.svg and src/components/layout/brand.tsx: a #3D7BF0 rounded square (64 grid, rx 16)
with a white rounded diamond (24×24, rx 7, rotated 45° about the centre).

    python3 scripts/gen-mock-brand.py            # needs Pillow (PIL)

- favicon.svg              the exact vector mark
- favicon.ico              16/32/48
- icon-192/512.png         rounded mark on transparent
- apple-touch-icon.png     180, full bleed (iOS rounds the corners itself)
- icon-maskable-192/512    full bleed #3D7BF0, diamond scaled to 80 % so it stays in the safe zone
- logo-email.png, og-image*.png
                           only the mark tile is replaced in place (the wordmark / headline / card
                           pixels stay as they are). The tile box of each file is found by scanning,
                           so re-running the script is idempotent.
"""
import io
import os
import sys

from PIL import Image, ImageDraw

BLUE = (0x3D, 0x7B, 0xF0, 255)
WHITE = (255, 255, 255, 255)
SS = 8  # supersampling factor
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'brand')

SVG = ('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">'
       '<rect width="64" height="64" rx="16" fill="#3D7BF0"/>'
       '<rect x="20" y="20" width="24" height="24" rx="7" transform="rotate(45 32 32)" fill="#fff"/></svg>\n')


def mark(size, rounded=True, diamond_scale=1.0):
    """The mark rendered at `size` px (RGBA). rounded=False → full-bleed square (maskable / iOS)."""
    S = size * SS
    u = S / 64.0
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if rounded:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=16 * u, fill=BLUE)
    else:
        d.rectangle([0, 0, S - 1, S - 1], fill=BLUE)
    # diamond: draw an upright rounded square on its own layer, rotate 45° about the centre
    side, r = 24 * u * diamond_scale, 7 * u * diamond_scale
    layer = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle([S / 2 - side / 2, S / 2 - side / 2, S / 2 + side / 2, S / 2 + side / 2], radius=r, fill=WHITE)
    layer = layer.rotate(45, resample=Image.BICUBIC, center=(S / 2, S / 2))
    img.alpha_composite(layer)
    return img.resize((size, size), Image.LANCZOS)


def tile_box(im, x_range, bg_test):
    """First contiguous non-background block in the column band x_range → (x0, y0, x1, y1)."""
    w, h = im.size
    px = im.load()
    rows = [y for y in range(h) if any(not bg_test(px[x, y]) for x in range(*x_range))]
    if not rows:
        sys.exit('mark tile not found')
    y0 = y1 = rows[0]
    for y in rows[1:]:
        if y != y1 + 1:
            break
        y1 = y
    cols = [x for x in range(*x_range) if any(not bg_test(px[x, y]) for y in range(y0, y1 + 1))]
    return cols[0], y0, cols[-1], y1


def replace_tile(name, x_range, bg):
    path = os.path.join(OUT, name)
    im = Image.open(path).convert('RGBA')
    if bg is None:  # transparent background
        test = lambda p: p[3] == 0
        fill = (0, 0, 0, 0)
    else:
        test = lambda p: abs(p[0] - bg[0]) + abs(p[1] - bg[1]) + abs(p[2] - bg[2]) <= 12
        fill = bg + (255,)
    x0, y0, x1, y1 = tile_box(im, x_range, test)
    size = x1 - x0 + 1
    if y1 - y0 + 1 != size:
        sys.exit(f'{name}: tile is not square ({x0},{y0})-({x1},{y1})')
    ImageDraw.Draw(im).rectangle([x0, y0, x1, y1], fill=fill)
    im.alpha_composite(mark(size), (x0, y0))
    if bg is not None:
        im = im.convert('RGB')
    im.save(path, optimize=True)
    print(f'{name}: tile {size}px at ({x0},{y0})')


def save(img, name, rgb=False):
    (img.convert('RGB') if rgb else img).save(os.path.join(OUT, name), optimize=True)
    print(name)


def main():
    with open(os.path.join(OUT, 'favicon.svg'), 'w') as f:
        f.write(SVG)
    print('favicon.svg')
    # .ico: each size rendered on its own (not downscaled from one bitmap)
    frames = [mark(s) for s in (16, 32, 48)]
    buf = io.BytesIO()
    frames[2].save(buf, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)], append_images=frames[:2])
    with open(os.path.join(OUT, 'favicon.ico'), 'wb') as f:
        f.write(buf.getvalue())
    print('favicon.ico')
    save(mark(192), 'icon-192.png')
    save(mark(512), 'icon-512.png')
    save(mark(180, rounded=False), 'apple-touch-icon.png', rgb=True)
    save(mark(192, rounded=False, diamond_scale=0.8), 'icon-maskable-192.png', rgb=True)
    save(mark(512, rounded=False, diamond_scale=0.8), 'icon-maskable-512.png', rgb=True)
    replace_tile('logo-email.png', (0, 100), None)
    for n in ('og-image.png', 'og-image-en.png', 'og-image-uz.png', 'og-image-ru.png'):
        replace_tile(n, (60, 140), (232, 236, 243))


if __name__ == '__main__':
    main()
