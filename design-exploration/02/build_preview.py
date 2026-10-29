"""Build an offline UI study from the fictional report, without changing its generator."""

import base64
import html
import importlib.util
import io
import json
from pathlib import Path
import re

from fontTools import subset
from fontTools.ttLib import TTFont


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
spec = importlib.util.spec_from_file_location("report_renderer", ROOT / "scripts/render_report.py")
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
fixture = json.loads((ROOT / "examples/report.json").read_text(encoding="utf-8"))
data, _ = renderer.validate_report(fixture, ROOT / "examples")
template = (HERE / "template.html").read_text(encoding="utf-8")
baseline = (ROOT / "examples/report.html").read_text(encoding="utf-8")

# This study has a fixed fixture. Subset its fonts to keep the review artifact small.
# The production generator still embeds the complete fonts for arbitrary briefs.
text = template + json.dumps(data, ensure_ascii=False) + re.sub(r"@font-face\{[^}]+\}", "", baseline)
faces = []
for family, filename, weight in (("Fly Sans", "noto-sans.woff2", "400"),
                                  ("Fly Serif", "noto-serif.woff2", "700")):
    font = TTFont(ROOT / "assets/fonts" / filename)
    options = subset.Options()
    options.flavor = "woff2"
    sub = subset.Subsetter(options=options)
    sub.populate(text=text)
    sub.subset(font)
    buf = io.BytesIO()
    font.save(buf)
    encoded = base64.b64encode(buf.getvalue()).decode("ascii")
    faces.append(f'@font-face{{font-family:"{family}";font-weight:{weight};font-style:normal;'
                 f'font-display:swap;src:url(data:font/woff2;base64,{encoded}) format("woff2");}}')
icon = base64.b64encode((ROOT / "assets/favicon.svg").read_bytes()).decode("ascii")
slots = {"FONTS": "\n".join(faces), "ICON": f"data:image/svg+xml;base64,{icon}",
         "DATA": renderer.safe_json(data), "TITLE": html.escape(data["title"] + " · " + data["subtitle"])}
result = re.sub(r"__PREVIEW_(FONTS|ICON|DATA|TITLE)__", lambda m: slots[m[1]], template)
destination = HERE / "report.html"
destination.write_text(result, encoding="utf-8")
print(destination)
baseline = re.sub(r'@font-face\{[^}]+\}', '', baseline)
baseline = baseline.replace('<style>', '<style>\n' + slots['FONTS'], 1)
baseline = re.sub(r'(?m)^[ \t]+$', '', baseline)
(HERE / 'current.html').write_text(baseline, encoding='utf-8')
print(HERE / 'current.html')
