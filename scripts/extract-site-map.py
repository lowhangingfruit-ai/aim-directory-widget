#!/usr/bin/env python3
"""Pull the CFA site map out of AIM's Canva PDF.

Writes the base plan into public/cfa/ and prints the marker coordinates for
lib/cfaMap.ts. Safe to run twice: it overwrites its own outputs and touches
nothing else.

    python3 scripts/extract-site-map.py ~/Downloads/"CFA Site Map.pdf"

Page 1 is the Phase One legend (A-M), page 2 is Phase Two (1-14). Both pages
carry the same base image, so only one copy is written.

Known disagreements between the PDF and AIM's published copy on
agriculturalinstitute.org/cfa, which lib/cfaMap.ts resolves in favour of the
website. Raise them with AIM rather than only fixing them here:

  - "PAY LOONEY GREENHOUSE" (item 7): the /cfa page names the donor Pat Looney.
  - "JAMES P. WILLIAMS CHILDRENS LEARNING GARDEN" (item 5): missing apostrophe.
  - "PUBLIC RESTROOMS BUILDING #3 HYDRATION STATION" (item 11): two features
    run together with no conjunction.
"""

import hashlib
import pathlib
import subprocess
import sys

import pymupdf

# the legend panel, in PDF points on a 1440x810 page. Letters and numbers
# inside it are legend rows, not map markers.
LEGEND_BOX = (20, 20, 530, 500)
PHASE_KEYS = [list("ABCDEFGHIJKLM"), [str(n) for n in range(1, 15)]]

OUT_DIR = pathlib.Path(__file__).resolve().parent.parent / "public" / "cfa"


def marker_points(page, keys):
    """Marker centres as percentages of the page, deduped and ordered by key."""
    width, height = page.rect.width, page.rect.height
    found = {k: [] for k in keys}
    for x0, y0, x1, y1, text, *_ in page.get_text("words"):
        if text not in found:
            continue
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        if LEGEND_BOX[0] <= cx <= LEGEND_BOX[2] and LEGEND_BOX[1] <= cy <= LEGEND_BOX[3]:
            continue
        point = (round(cx / width * 100, 2), round(cy / height * 100, 2))
        # Canva paints some glyphs twice; identical centres are one marker
        if point not in found[text]:
            found[text].append(point)
    return found


def page_crop(page, source_width, source_height):
    """The part of the base image the PDF page actually shows, in source pixels.

    Canva places the plan larger than the page: it overhangs the trim on the
    left, right and bottom. Marker coordinates are measured against the page, so
    the exported art has to be cropped to the page frame or every marker lands
    off by the overhang.
    """
    box = page.get_image_info()[0]["bbox"]
    per_point_x = source_width / (box[2] - box[0])
    per_point_y = source_height / (box[3] - box[1])
    return (
        round((page.rect.x0 - box[0]) * per_point_x),
        round((page.rect.y0 - box[1]) * per_point_y),
        round(page.rect.width * per_point_x),
        round(page.rect.height * per_point_y),
    )


def write_base_image(doc):
    xref = doc[0].get_images(full=True)[0][0]
    image = doc.extract_image(xref)
    digests = set()
    for page in doc:
        ref = page.get_images(full=True)[0][0]
        digests.add(hashlib.md5(doc.extract_image(ref)["image"]).hexdigest())
    if len(digests) > 1:
        print("! pages no longer share one base image: check the plan art", file=sys.stderr)

    x, y, w, h = page_crop(doc[0], image["width"], image["height"])
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    source = OUT_DIR / "source.jpg"
    source.write_bytes(image["image"])
    # full detail for deep zoom, plus a small first paint. cwebp crops before it
    # resizes, so the small one is the same frame at lower resolution.
    for name, width, quality in ((("site-plan.webp"), 0, 82), ("site-plan-1600.webp", 1600, 72)):
        args = ["cwebp", "-quiet", "-q", str(quality), "-crop", str(x), str(y), str(w), str(h)]
        if width:
            args += ["-resize", str(width), "0"]
        subprocess.run(args + [str(source), "-o", str(OUT_DIR / name)], check=True)
    source.unlink()
    print(f"cropped {image['width']}x{image['height']} to {w}x{h} at ({x}, {y})")
    return w, h


def main():
    if len(sys.argv) < 2:
        sys.exit(f"usage: {sys.argv[0]} <CFA Site Map.pdf>")
    doc = pymupdf.open(sys.argv[1])
    if doc.page_count != 2:
        print(f"! expected 2 pages, got {doc.page_count}", file=sys.stderr)

    w, h = write_base_image(doc)
    print(f"wrote {OUT_DIR}/site-plan.webp and site-plan-1600.webp at {w}x{h}")
    print(f"set PLAN.width/height in lib/cfaMap.ts to {w}/{h}\n")

    for index, keys in enumerate(PHASE_KEYS[: doc.page_count]):
        found = marker_points(doc[index], keys)
        print(f"// page {index + 1}: {sum(len(v) for v in found.values())} markers")
        for key in keys:
            points = found[key]
            if not points:
                print(f"//   {key}: MISSING from the plan")
                continue
            rendered = ", ".join(f"{{ x: {x}, y: {y} }}" for x, y in points)
            print(f"  {{ key: '{key}', label: '...', points: [{rendered}] }},")
        print()


if __name__ == "__main__":
    main()
