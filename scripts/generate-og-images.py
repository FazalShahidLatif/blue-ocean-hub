#!/usr/bin/env python3
"""
Generate a branded Open Graph / hero image for every published article.

Design contract (matches the site's own palette in src/index.css):
  ocean-950 #0a192f  -> background base
  ocean-900 #112240  -> background end
  cyan      #64ffda  -> accent, category label
  gold      #d4af37  -> rule under the category label
  white                -> headline

Output: public/og-image/<slug>.jpg  (1200x630, JPEG q=88)

Run:  python scripts/generate-og-images.py
"""
import os, re, sys, textwrap, json, glob

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "og-image")

W, H = 1200, 630
BG_TOP = (10, 25, 47)      # #0a192f
BG_BOTTOM = (17, 34, 64)   # #112240
CYAN = (100, 255, 218)     # #64ffda
GOLD = (212, 175, 55)      # #d4af37
WHITE = (255, 255, 255)
MUTED = (148, 163, 184)    # slate-400

FONT_DIR = "C:/Windows/Fonts"
FONT_REG = os.path.join(FONT_DIR, "arial.ttf")
FONT_BOLD = os.path.join(FONT_DIR, "arialbd.ttf")

MARGIN_X = 96
MARGIN_TOP = 78
MARGIN_BOTTOM = 84
ACCENT_W = 8
MAX_TEXT_W = W - (MARGIN_X * 2) - ACCENT_W - 28


def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


def wrap(draw, text, font, max_w):
    """Greedy word wrap that respects the pixel width of the current font."""
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def fit_font(draw, text, start_size, min_size, font_path, max_w, max_lines):
    """Shrink the headline until it fits in max_lines."""
    size = start_size
    while size > min_size:
        font = load_font(font_path, size)
        lines = wrap(draw, text, font, max_w)
        if len(lines) <= max_lines:
            return font, lines
        size -= 2
    font = load_font(font_path, min_size)
    return font, wrap(draw, text, font, max_w)


def gradient(w, h, top, bottom):
    base = Image.new("RGB", (1, h))
    px = base.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        px[0, y] = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
    return base.resize((w, h))


def clean_category(cat):
    return (cat or "Financial Intelligence").strip().upper()


def render(slug, title, category):
    img = gradient(W, H, BG_TOP, BG_BOTTOM).convert("RGB")
    d = ImageDraw.Draw(img)

    # accent bar
    d.rectangle([0, 0, ACCENT_W, H], fill=CYAN)

    # faint diagonal texture: a couple of translucent bands
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.polygon([(W - 420, 0), (W, 0), (W, 260), (W - 260, 0)], fill=(100, 255, 218, 10))
    od.polygon([(W - 260, H), (W, H - 180), (W, H)], fill=(212, 175, 55, 12))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    d = ImageDraw.Draw(img)

    x = MARGIN_X
    y = MARGIN_TOP

    # category label
    cat = clean_category(category)
    f_cat = load_font(FONT_BOLD, 25)
    d.text((x, y), cat, font=f_cat, fill=CYAN)
    cat_w = int(d.textlength(cat, font=f_cat))
    y += 34
    d.rectangle([x, y, x + min(cat_w, 320), y + 3], fill=GOLD)
    y += 30

    # headline
    f_head, lines = fit_font(d, title, start_size=62, min_size=34,
                             font_path=FONT_BOLD, max_w=MAX_TEXT_W, max_lines=4)
    line_h = int(f_head.size * 1.16)
    for ln in lines:
        d.text((x, y), ln, font=f_head, fill=WHITE)
        y += line_h

    # footer
    f_foot = load_font(FONT_BOLD, 24)
    f_foot_reg = load_font(FONT_REG, 22)
    fy = H - MARGIN_BOTTOM
    d.text((x, fy), "BLUE OCEAN HUB", font=f_foot, fill=WHITE)
    dom = "blueoceanhub.info"
    dw = int(d.textlength(dom, font=f_foot_reg))
    d.text((W - MARGIN_X - dw, fy + 2), dom, font=f_foot_reg, fill=MUTED)

    return img


def save(img, rel_path):
    out = os.path.join(OUT_DIR, rel_path)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img.save(out, "JPEG", quality=88, optimize=True, progressive=True)


def gen_articles():
    idx = os.path.join(ROOT, "src", "data", "article-index.ts")
    src = open(idx, encoding="utf-8").read()
    entries = re.findall(
        r'id:\s*"([^"]+)",\s*\n\s*postType:\s*"article",\s*\n\s*title:\s*"([^"]*)",'
        r'.*?category:\s*"([^"]*)"',
        src, re.S)
    if not entries:
        print("ERROR: no articles parsed from", idx)
        sys.exit(1)
    n = 0
    for slug, title, cat in entries:
        title = title.replace('\\"', '"').strip()
        if not title:
            continue
        save(render(slug, title, cat), f"{slug}.jpg")
        n += 1
    return n


def gen_hubs():
    src = open(os.path.join(ROOT, "src", "data", "categories.ts"), encoding="utf-8").read()
    entries = re.findall(
        r'id:\s*"([^"]+)",\s*\n\s*title:\s*"([^"]*)",.*?seoTitle:\s*"([^"]*)",'
        r'.*?seoDescription:\s*"([^"]*)"', src, re.S)
    n = 0
    for cid, title, seo_title, desc in entries:
        headline = (seo_title or title or cid).strip()
        cat = (title or cid).split("—")[0].strip()
        save(render(cid, headline, cat), f"{cid}.jpg")
        n += 1
    return n


def gen_pages():
    src = open(os.path.join(ROOT, "src", "data", "legal.ts"), encoding="utf-8").read()
    entries = re.findall(
        r'id:\s*"([^"]+)",\s*\n\s*postType:\s*\'page\',\s*\n\s*title:\s*"([^"]*)",'
        r'.*?category:\s*"([^"]*)"', src, re.S)
    n = 0
    for pid, title, cat in entries:
        save(render(pid, (title or pid).strip(), cat or "Blue Ocean Hub"), f"page/{pid}.jpg")
        n += 1
    # The toolkit is rendered separately from legal.ts, so it needs its own.
    save(render("toolkit", "Blue Ocean Toolkit", "Calculators"), "toolkit.jpg")
    return n + 1


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    a = gen_articles()
    h = gen_hubs()
    p = gen_pages()
    total = sum(os.path.getsize(os.path.join(dp, f))
                for dp, _, fs in os.walk(OUT_DIR) for f in fs if f.endswith(".jpg"))
    count = sum(len([f for f in fs if f.endswith('.jpg')]) for _, _, fs in os.walk(OUT_DIR))
    print(f"Generated {a} article + {h} hub + {p} page images "
          f"({count} total) in {OUT_DIR}")
    print(f"Total size: {total/1024/1024:.1f} MB  (avg {total/max(count,1)/1024:.0f} KB)")


if __name__ == "__main__":
    main()
