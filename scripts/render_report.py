#!/usr/bin/env python3
"""Validate a Fly Brief JSON report and render one offline HTML file."""

from __future__ import annotations

import argparse
import base64
from copy import deepcopy
import html
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parent.parent
SECTION_KEYS = ("product", "promotion", "requirements", "video")
KINDS = {"fact", "required", "suggestion", "unknown", "conflict"}


class ReportError(ValueError):
    """A useful error for the author, without a Python traceback."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ReportError(message)


def string(value: object, location: str) -> str:
    require(isinstance(value, str) and bool(value.strip()), f"{location}: 需要非空文字")
    return value


def array(value: object, location: str) -> list:
    require(isinstance(value, list), f"{location}: 需要数组")
    return value


def web_url(value: object, location: str) -> str:
    value = string(value, location)
    require(not any(c.isspace() or ord(c) < 32 for c in value), f"{location}: URL 含空白或控制字符")
    require("\\" not in value, f"{location}: URL 不能含反斜杠")
    try:
        parsed = urlsplit(value)
        valid = parsed.scheme.lower() in {"http", "https"} and bool(parsed.hostname)
        parsed.port  # Reject malformed port numbers as well.
    except ValueError:
        valid = False
    require(valid, f"{location}: 只接受完整的 http(s) 链接；本地文件请使用 path")
    return value


def link_record(record: dict, location: str, base_dir: Path, *, mandatory: bool) -> None:
    has_url, has_path = "url" in record, "path" in record
    require(not (has_url and has_path), f"{location}: url 和 path 只能选一个")
    require(not mandatory or has_url or has_path, f"{location}: 缺少 url 或 path")
    if has_url:
        record["url"] = web_url(record["url"], f"{location}.url")
    if has_path:
        local = Path(string(record["path"], f"{location}.path"))
        local = (base_dir / local).resolve()
        require(local.is_file(), f"{location}.path: 文件不存在：{local}")
        record["url"] = local.as_uri()
        del record["path"]


def validate_report(raw: object, base_dir: Path) -> tuple[dict, list[str]]:
    """Return a normalized copy. The supplied report is never mutated."""
    require(isinstance(raw, dict), "报告根节点必须是对象")
    data = deepcopy(raw)
    require(type(data.get("schema_version")) is int and data["schema_version"] == 1,
            "schema_version 必须是整数 1")
    string(data.get("title"), "title")
    for field in ("subtitle", "context"):
        if field in data:
            string(data[field], field)
    if "demo" in data:
        require(type(data["demo"]) is bool, "demo 必须是布尔值")

    sources = array(data.get("sources"), "sources")
    source_ids: set[str] = set()
    for index, source in enumerate(sources):
        at = f"sources[{index}]"
        require(isinstance(source, dict), f"{at}: 需要对象")
        for key in ("id", "title", "location", "excerpt"):
            string(source.get(key), f"{at}.{key}")
        require(source["id"] not in source_ids, f"{at}: 重复的来源 ID：{source['id']}")
        source_ids.add(source["id"])
        link_record(source, at, base_dir, mandatory=False)

    def refs(record: dict, at: str, *, mandatory: bool = False) -> None:
        ids = array(record.get("source_ids", []), f"{at}.source_ids")
        require(not mandatory or bool(ids), f"{at}: 品牌信息、要求和参考必须附来源")
        for source_id in ids:
            string(source_id, f"{at}.source_ids")
            require(source_id in source_ids, f"{at}: 找不到来源 {source_id}")

    def item(record: object, at: str) -> None:
        require(isinstance(record, dict), f"{at}: 需要内容对象")
        string(record.get("text"), f"{at}.text")
        kind = record.get("kind")
        require(isinstance(kind, str) and kind in KINDS, f"{at}: kind 不在支持的五类中")
        refs(record, at, mandatory=kind in {"fact", "required", "conflict"})
        if "label" in record:
            string(record["label"], f"{at}.label")

    sections = data.get("sections")
    require(isinstance(sections, dict) and set(sections) == set(SECTION_KEYS),
            "sections 必须且只能包含 product、promotion、requirements、video")
    visible: list[str] = []
    for key in SECTION_KEYS:
        section = sections[key]
        at = f"sections.{key}"
        require(isinstance(section, dict), f"{at}: 需要对象")
        item(section.get("summary"), f"{at}.summary")
        visible.append(section["summary"]["text"])
        if "note" in section:
            item(section["note"], f"{at}.note")
            visible.append(section["note"]["text"])
        for index, highlight in enumerate(array(section.get("highlights", []), f"{at}.highlights")):
            item(highlight, f"{at}.highlights[{index}]")
            visible.append(highlight["text"])
        for index, branch in enumerate(array(section.get("details", []), f"{at}.details")):
            here = f"{at}.details[{index}]"
            require(isinstance(branch, dict), f"{here}: 需要对象")
            string(branch.get("title"), f"{here}.title")
            items = array(branch.get("items"), f"{here}.items")
            require(bool(items), f"{here}: 分支不能是空的")
            for row, content in enumerate(items):
                item(content, f"{here}.items[{row}]")
        references = array(section.get("references", []), f"{at}.references")
        require(key == "video" or not references, "参考视频只能放在 video 模块")
        for index, reference in enumerate(references):
            here = f"{at}.references[{index}]"
            require(isinstance(reference, dict), f"{here}: 需要对象")
            string(reference.get("title"), f"{here}.title")
            status = reference.get("status")
            require(isinstance(status, str) and status in {"viewed", "unviewed", "unavailable"},
                    f"{here}: 参考状态必须是 viewed、unviewed 或 unavailable")
            refs(reference, here, mandatory=True)
            link_record(reference, here, base_dir, mandatory=True)
            if status == "viewed":
                string(reference.get("note"), f"{here}.note")
            else:
                require(not reference.get("note"), f"{here}: 未查看的参考不能附借鉴分析")
            visible.append(reference["title"])

    visible_count = sum(len("".join(text.split())) for text in visible)
    warnings = []
    if visible_count > 380:
        warnings.append(f"默认态约 {visible_count} 字，建议再提炼；关键要求必须保留。")
    for key in SECTION_KEYS:
        for branch in sections[key].get("details", []):
            if any(len(part["text"]) > 180 for part in branch["items"]):
                warnings.append(f"{key} 的「{branch['title']}」有较长段落，建议拆成人话短句。")
    return data, warnings


def safe_json(data: dict) -> str:
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    for character, escaped in (("&", "\\u0026"), ("<", "\\u003c"), (">", "\\u003e"),
                               ("\u2028", "\\u2028"), ("\u2029", "\\u2029")):
        payload = payload.replace(character, escaped)
    return payload


def render_html(data: dict) -> str:
    template = (ROOT / "assets" / "report.html").read_text(encoding="utf-8")
    require(template.count("__FLY_BRIEF_DATA__") == 1, "模板缺少唯一的数据插入点")
    faces = []
    for family, filename, weight in (("Fly Sans", "noto-sans.woff2", "400"),
                                      ("Fly Serif", "noto-serif.woff2", "700")):
        encoded = base64.b64encode((ROOT / "assets" / "fonts" / filename).read_bytes()).decode("ascii")
        faces.append(f'@font-face{{font-family:"{family}";font-weight:{weight};font-style:normal;'
                     f'font-display:swap;src:url(data:font/woff2;base64,{encoded}) format("woff2");}}')
    title = data["title"] + (f" · {data['subtitle']}" if data.get("subtitle") else "")
    icon = base64.b64encode((ROOT / "assets" / "favicon.svg").read_bytes()).decode("ascii")
    replacements = {"TITLE": html.escape(title, quote=True), "DATA": safe_json(data),
                    "FONTS": "\n".join(faces), "ICON": f"data:image/svg+xml;base64,{icon}"}
    # A single pass keeps marker-like user text literal, never a second directive.
    return re.sub(r"__FLY_BRIEF_(TITLE|DATA|FONTS|ICON)__", lambda match: replacements[match[1]], template)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path, help="UTF-8 report JSON")
    parser.add_argument("--output", type=Path, help="Standalone HTML output")
    parser.add_argument("--check", action="store_true", help="Validate only; do not write files")
    args = parser.parse_args()
    if not args.check and not args.output:
        parser.error("生成报告需要 --output；仅验证请使用 --check")
    try:
        input_path = args.input.resolve()
        raw = json.loads(input_path.read_text(encoding="utf-8-sig"))
        data, warnings = validate_report(raw, input_path.parent)
        for warning in warnings:
            print(f"提示：{warning}", file=sys.stderr)
        if args.check:
            print("数据验证通过：四个模块及来源完整。")
            return 0
        output_path = args.output.resolve()
        require(output_path.suffix.lower() == ".html", "输出文件必须以 .html 结尾")
        protected = {input_path, ROOT / "assets" / "report.html", Path(__file__).resolve()}
        for source in raw["sources"] + raw["sections"]["video"].get("references", []):
            if "path" in source:
                protected.add((input_path.parent / source["path"]).resolve())
        require(output_path not in protected, "输出位置与输入、模板或来源文件相同，不能覆盖")
        document = render_html(data)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(document, encoding="utf-8")
        print(f"已生成：{output_path}")
        return 0
    except (OSError, ValueError, RecursionError) as error:
        print(f"无法生成报告：{error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
