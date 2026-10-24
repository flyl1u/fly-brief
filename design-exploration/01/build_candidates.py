"""Fill three independently designed HTML templates from one shared fixture."""

import html
import json
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parent
DATA = json.loads((ROOT / "content.json").read_text(encoding="utf-8"))
TOKEN = re.compile(r"\{\{([a-z_0-9]+)\}\}")
FONT_CSS = "\n".join((ROOT / "fonts" / f"{name}.css").read_text(encoding="utf-8")
                     for name in ("noto-sans", "noto-serif"))

for name in ("01-document", "02-workspace", "03-branches"):
    template = (ROOT / "templates" / f"{name}.html").read_text(encoding="utf-8")
    template = template.replace("/* FLY_BRIEF_FONTS */", FONT_CSS)
    unknown = set(TOKEN.findall(template)) - DATA.keys()
    if unknown:
        raise ValueError(f"{name}: unknown slots: {sorted(unknown)}")
    rendered = TOKEN.sub(lambda match: html.escape(DATA[match[1]], quote=True), template)
    destination = ROOT / f"{name}.html"
    destination.write_text(rendered, encoding="utf-8")
    print(destination)
