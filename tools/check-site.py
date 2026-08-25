#!/usr/bin/env python3
"""Static checks for the GitHub Pages site."""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
pages = sorted(ROOT.rglob("*.html"))
errors = []
warnings = []

for page in pages:
    text = page.read_text(encoding="utf-8", errors="ignore")
    relative = page.relative_to(ROOT)
    if not re.search(r"<title>\s*[^<]+", text, re.I):
        errors.append(f"{relative}: missing <title>")
    if not re.search(r'<meta\s+name=["\']description["\']', text, re.I):
        warnings.append(f"{relative}: missing meta description")

    for attr, value in re.findall(r'\b(src|href)=["\']([^"\']+)', text, re.I):
        if not value.startswith("/"):
            continue
        path = unquote(urlsplit(value).path).lstrip("/")
        if not path:
            continue
        target = ROOT / path
        exists = target.exists() or (not target.suffix and (target / "index.html").exists())
        if not exists:
            errors.append(f"{relative}: missing local {attr} {value}")

    for anchor in re.findall(r'href=["\']([^"\']*#[^"\']*)["\']', text, re.I):
        path, fragment = anchor.split("#", 1)
        target_page = (ROOT / unquote(path.lstrip("/"))) if path else page
        if target_page.is_dir():
            target_page /= "index.html"
        if not target_page.exists():
            continue
        target_text = target_page.read_text(encoding="utf-8", errors="ignore")
        if fragment and not re.search(rf'(?:id|name)=["\']{re.escape(fragment)}["\']', target_text):
            warnings.append(f"{relative}: anchor not found {anchor}")

print(f"Checked {len(pages)} HTML pages")
for item in warnings:
    print("WARN", item)
for item in errors:
    print("ERROR", item)
if errors:
    sys.exit(1)
print("PASS: no missing local assets")
