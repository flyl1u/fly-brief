from copy import deepcopy
import base64
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location("render_report", ROOT / "scripts" / "render_report.py")
renderer = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(renderer)


def minimal():
    return {
        "schema_version": 1,
        "title": "测试合作",
        "sources": [],
        "sections": {
            key: {"summary": {"text": "信息未明确，需要确认。", "kind": "unknown"}}
            for key in renderer.SECTION_KEYS
        },
    }


def sourced():
    data = minimal()
    data["sources"] = [{"id": "s1", "title": "brief", "location": "第 1 段", "excerpt": "必须真人出镜"}]
    data["sections"]["requirements"]["highlights"] = [
        {"text": "必须真人出镜", "kind": "required", "source_ids": ["s1"]}
    ]
    return data


class ReportTests(unittest.TestCase):
    def test_scheduled_deadlines_are_sourced_and_counted(self):
        raw = sourced()
        milestone = {"label": "交脚本", "text": "10.28 18:00 前", "datetime": "2026-10-28T18:00:00+08:00",
                     "kind": "required", "source_ids": ["s1"]}
        raw["sections"]["requirements"]["schedule"] = [milestone]
        data, _ = renderer.validate_report(raw, ROOT)
        self.assertEqual(data["sections"]["requirements"]["schedule"][0], milestone)
        for field, value in (("source_ids", []), ("label", ""), ("datetime", "2026-13-40")):
            broken = deepcopy(raw)
            broken["sections"]["requirements"]["schedule"][0][field] = value
            with self.subTest(field=field), self.assertRaises(renderer.ReportError):
                renderer.validate_report(broken, ROOT)
        milestone["text"] *= 60
        self.assertTrue(any("默认态" in warning for warning in renderer.validate_report(raw, ROOT)[1]))
        raw["sections"]["product"]["schedule"] = raw["sections"]["requirements"]["schedule"]
        with self.assertRaisesRegex(renderer.ReportError, "只能放在 requirements"):
            renderer.validate_report(raw, ROOT)

    def test_topic_previews_and_steps_validate_without_changing_legacy_data(self):
        raw = sourced()
        preview = {key: {"text": key, "kind": "suggestion"} for key in ("role", "materials", "output")}
        branch = {"title": "具体选题", "preview": preview,
                  "items": [{"label": "选题详情", "text": "保留人工检查。", "kind": "suggestion",
                             "steps": ["准备自己的口播。", "选片并校对字幕。"]}]}
        raw["sections"]["video"]["details"] = [branch]
        original = deepcopy(raw)
        renderer.validate_report(raw, ROOT)
        self.assertEqual(raw, original)
        for steps in ([], "一步", [""]):
            branch["items"][0]["steps"] = steps
            with self.subTest(steps=steps), self.assertRaises(renderer.ReportError):
                renderer.validate_report(raw, ROOT)
        branch["items"][0]["steps"] = ["校对字幕。"]
        preview["output"]["kind"] = "fact"
        with self.assertRaisesRegex(renderer.ReportError, "必须附来源"):
            renderer.validate_report(raw, ROOT)
        preview["output"]["source_ids"] = ["s1"]
        renderer.validate_report(raw, ROOT)
        del preview["role"]
        with self.assertRaisesRegex(renderer.ReportError, "role、materials、output"):
            renderer.validate_report(raw, ROOT)

    def test_new_visible_topic_fields_count_toward_reading_budget(self):
        raw = minimal()
        raw["sections"]["video"]["details"] = [{"title": "可比较的选题", "items": [{"text": "具体案例", "kind": "suggestion"}],
            "preview": {key: {"text": "选题比较内容" * 40, "kind": "suggestion"} for key in ("role", "materials", "output")}}]
        self.assertTrue(any("默认态" in warning for warning in renderer.validate_report(raw, ROOT)[1]))

    def test_compact_subtitle_note_and_requirement_labels_are_sourced(self):
        raw = sourced()
        raw["subtitle"] = "口播合作"
        raw["sections"]["product"]["note"] = {"text": "字幕仍需校对。", "kind": "fact", "source_ids": ["s1"]}
        raw["sections"]["requirements"]["highlights"][0]["label"] = "必拍"
        data, _ = renderer.validate_report(raw, ROOT)
        self.assertEqual(data["subtitle"], "口播合作")
        self.assertEqual(data["sections"]["requirements"]["highlights"][0]["label"], "必拍")
        del raw["sections"]["product"]["note"]["source_ids"]
        with self.assertRaisesRegex(renderer.ReportError, "必须附来源"):
            renderer.validate_report(raw, ROOT)

    def test_notes_count_toward_the_default_reading_budget(self):
        raw = minimal()
        raw["sections"]["product"]["note"] = {"text": "补充说明" * 120, "kind": "unknown"}
        _, warnings = renderer.validate_report(raw, ROOT)
        self.assertTrue(any("默认态" in warning for warning in warnings))

    def test_report_contains_offline_fonts_and_accepts_old_data(self):
        data, _ = renderer.validate_report(minimal(), ROOT)
        document = renderer.render_html(data)
        self.assertEqual(document.count("data:font/woff2;base64,"), 2)
        self.assertNotIn("__FLY_BRIEF_FONTS__", document)
        self.assertNotIn("fonts.googleapis.com", document)
        self.assertIn("font-src data:", document)
        icon = re.search(r'<link rel="icon" type="image/svg\+xml" href="([^"]+)"', document)[1]
        self.assertEqual(base64.b64decode(icon.split(",", 1)[1]), (ROOT / "assets" / "favicon.svg").read_bytes())
        self.assertIn(f'src="{icon}"', document)
        self.assertNotIn("__FLY_BRIEF_ICON__", document)

    def test_sparse_report_has_exactly_four_sections(self):
        data, warnings = renderer.validate_report(minimal(), ROOT)
        self.assertEqual(set(data["sections"]), set(renderer.SECTION_KEYS))
        self.assertEqual(warnings, [])
        for bad in ("missing", "extra"):
            raw = minimal()
            if bad == "missing":
                del raw["sections"]["product"]
            else:
                raw["sections"]["appendix"] = {}
            with self.subTest(bad=bad), self.assertRaises(renderer.ReportError):
                renderer.validate_report(raw, ROOT)

    def test_facts_and_obligations_need_real_source_ids(self):
        for kind in ("fact", "required", "conflict"):
            data = minimal()
            data["sections"]["product"]["summary"]["kind"] = kind
            with self.subTest(kind=kind), self.assertRaises(renderer.ReportError):
                renderer.validate_report(data, ROOT)
        data = sourced()
        data["sections"]["requirements"]["highlights"][0]["source_ids"] = ["invented"]
        with self.assertRaisesRegex(renderer.ReportError, "找不到来源"):
            renderer.validate_report(data, ROOT)

    def test_duplicate_sources_and_malformed_items_are_rejected(self):
        data = sourced()
        data["sources"].append(deepcopy(data["sources"][0]))
        with self.assertRaisesRegex(renderer.ReportError, "重复"):
            renderer.validate_report(data, ROOT)
        for malformed in (None, [], {"text": "x", "kind": []}, {"text": "", "kind": "unknown"}):
            data = minimal()
            data["sections"]["product"]["summary"] = malformed
            with self.subTest(malformed=malformed), self.assertRaises(renderer.ReportError):
                renderer.validate_report(data, ROOT)

    def test_urls_preserve_supplied_query_but_reject_executable_schemes(self):
        good = "https://example.org/watch?v=123&from=brand#t=10"
        self.assertEqual(renderer.web_url(good, "url"), good)
        for bad in ("javascript:alert(1)", "data:text/html,test", "file:///C:/test", "https:///oops",
                    "https://example.org\n/test", "https://example.org:bad/test", "//example.org", "https://example.org\\x"):
            with self.subTest(url=bad), self.assertRaises(renderer.ReportError):
                renderer.web_url(bad, "url")

    def test_unviewed_reference_cannot_claim_analysis(self):
        data = sourced()
        reference = {"title": "品牌参考", "url": "https://example.org/video", "status": "unviewed", "source_ids": ["s1"]}
        data["sections"]["video"]["references"] = [reference]
        renderer.validate_report(data, ROOT)
        reference["note"] = "借鉴视频的对比开场"
        with self.assertRaisesRegex(renderer.ReportError, "未查看"):
            renderer.validate_report(data, ROOT)
        reference["status"] = "viewed"
        renderer.validate_report(data, ROOT)
        del reference["note"]
        with self.assertRaises(renderer.ReportError):
            renderer.validate_report(data, ROOT)

    def test_relative_paths_resolve_without_mutating_input(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            source = base / "原始 brief.md"
            source.write_text("brief", encoding="utf-8")
            raw = sourced()
            raw["sources"][0]["path"] = source.name
            data, _ = renderer.validate_report(raw, base)
            self.assertEqual(data["sources"][0]["url"], source.as_uri())
            self.assertEqual(raw["sources"][0]["path"], source.name)
            self.assertNotIn("url", raw["sources"][0])
            source.unlink()
            with self.assertRaisesRegex(renderer.ReportError, "文件不存在"):
                renderer.validate_report(raw, base)

    def test_oversized_overview_warns_without_dropping_requirements(self):
        raw = sourced()
        raw["sections"]["requirements"]["highlights"] *= 70
        data, warnings = renderer.validate_report(raw, ROOT)
        self.assertTrue(warnings)
        self.assertEqual(len(data["sections"]["requirements"]["highlights"]), 70)

    def test_untrusted_text_cannot_escape_data_script_or_template(self):
        raw = minimal()
        payload = '</script><img src=x onerror=alert(1)>&\u2028__FLY_BRIEF_TITLE__'
        raw["title"] = "__FLY_BRIEF_DATA__"
        raw["sections"]["product"]["summary"]["text"] = payload
        data, _ = renderer.validate_report(raw, ROOT)
        document = renderer.render_html(data)
        embedded = re.search(r'<script id="report-data" type="application/json">(.*?)</script>', document, re.S)[1]
        self.assertNotIn("</script>", embedded)
        self.assertNotIn("<img", embedded)
        self.assertEqual(json.loads(embedded)["sections"]["product"]["summary"]["text"], payload)
        self.assertIn("<title>__FLY_BRIEF_DATA__</title>", document)

    def test_cli_check_write_and_source_overwrite_protection(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            source = base / "source.html"
            source.write_text("original source", encoding="utf-8")
            raw = sourced()
            raw["sources"][0]["path"] = source.name
            input_file = base / "report.json"
            input_file.write_text(json.dumps(raw, ensure_ascii=False), encoding="utf-8-sig")
            command = [sys.executable, str(ROOT / "scripts" / "render_report.py"), "--input", str(input_file)]
            checked = subprocess.run(command + ["--check"], capture_output=True)
            self.assertEqual(checked.returncode, 0, checked.stderr)
            output = base / "nested" / "report.html"
            built = subprocess.run(command + ["--output", str(output)], capture_output=True)
            self.assertEqual(built.returncode, 0, built.stderr)
            self.assertTrue(output.is_file())
            blocked = subprocess.run(command + ["--output", str(source)], capture_output=True)
            self.assertEqual(blocked.returncode, 1)
            self.assertEqual(source.read_text(encoding="utf-8"), "original source")


if __name__ == "__main__":
    unittest.main()
