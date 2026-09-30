"""
Pull the two embedded images out of the original single-file mock-up.

Usage (from the repo root):
    python3 tools/extract-images.py path/to/original-mockup.html

Writes:
    assets/hero-texture.png   (the background behind the hero copy)
    assets/engine.jpg         (the aircraft engine photo)
"""
import base64
import re
import sys
from pathlib import Path

if len(sys.argv) != 2:
    sys.exit("Usage: python3 tools/extract-images.py original-mockup.html")

html = Path(sys.argv[1]).read_text(encoding="utf-8", errors="ignore")
found = re.findall(r"data:image/(png|jpeg);base64,([A-Za-z0-9+/=\s]+)", html)
names = {"png": "hero-texture.png", "jpeg": "engine.jpg"}
out = Path(__file__).resolve().parent.parent / "assets"
out.mkdir(exist_ok=True)

written = set()
for kind, data in found:
    name = names[kind]
    if name in written:
        continue
    (out / name).write_bytes(base64.b64decode(re.sub(r"\s", "", data)))
    written.add(name)
    print(f"wrote assets/{name} ({(out / name).stat().st_size // 1024} KB)")

missing = set(names.values()) - written
if missing:
    sys.exit("Not found in source: " + ", ".join(sorted(missing)))
