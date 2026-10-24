# Report data contract · version 1

`scripts/render_report.py` accepts a UTF-8 JSON object. It uses Python's standard library only. The template is self-contained; never put HTML markup in text fields.

## Root

| Field | Type | Meaning |
| --- | --- | --- |
| `schema_version` | integer | Always `1`. |
| `title` | nonempty string | Brief/report identity, e.g. `随剪 · 口播拆条合作`. |
| `context` | string, optional | Short known context such as platform and content format. Do not invent it. |
| `demo` | boolean, optional | `true` for fictional developer examples. An explicit notice appears. |
| `sources` | array | Source records, each with a unique `id`. |
| `sections` | object | Exactly `product`, `promotion`, `requirements`, `video`, in that display order. |

## Source

`id`, `title`, `location`, `excerpt` are nonempty strings. `location` should be precise: page, paragraph, slide, image region or message timestamp. `excerpt` is a short verbatim extract, not a paraphrase. Use multiple source records for multiple passages in the same document.

Optional `url` is an existing HTTP(S) URL. Optional `path` is an existing local file, absolute or relative to the input JSON. Use one or neither, never both. Relative file paths are resolved during generation. The original file is not embedded. The excerpt remains readable if the original is later moved.

For pasted text without a file, omit `url` and `path`, and give a useful `title` and `location`. For conflicts use records for both claims and cite both; do not fabricate quotes for absent information.

## Each section

- `summary`: one content item, required.
- `highlights`: optional array of content items, visible before expansion. Primarily for critical requirements and unresolved blockers. No hard count limit: do not hide obligations to fit a layout.
- `details`: optional array of branches, each with `title` and nonempty `items` (content items). Group by questions users have, not by the original document order.
- `references`: optional array, allowed in `video` only. Every reference entry is visible before expansion.

### Content item

```json
{
  "text": "品牌要求真人出镜，必须演示字幕人工校对。",
  "kind": "required",
  "source_ids": ["brief-shooting"]
}
```

`kind` is one of:

| Value | Display | Use |
| --- | --- | --- |
| `fact` | 品牌信息 | Information in source materials, including explicitly attributed brand claims. |
| `required` | 品牌要求 | An actual obligation or prohibition stated by the brand. |
| `suggestion` | 创作建议 | Agent interpretation, recommendations or suggested ways to explain a feature. |
| `unknown` | 待确认 | Missing information or an unresolved question. |
| `conflict` | 有冲突 | Incompatible source statements, citing the relevant passages. |

Every `fact`, `required` or `conflict` item needs at least one valid source ID. `source_ids` may be omitted for suggestions and unknowns. Do not use `suggestion` to evade sourcing a factual assertion. Source buttons open the exact excerpts in a native dialog.

### Video reference

```json
{
  "title": "品牌提供的口播演示参考",
  "url": "https://example.com/a-real-supplied-reference",
  "status": "unviewed",
  "source_ids": ["brief-reference"]
}
```

`title`, `url`, `status`, `source_ids` are required; IDs must resolve. This URL is illustrative, not an actual reference to ship. Production reports preserve supplied URLs exactly. Local videos use `path` instead of `url`. No autoplaying iframe or remotely loaded thumbnail is needed.

`status` is `viewed` (已查看), `unviewed` (未查看), or `unavailable` (无法访问). For `viewed`, provide `note` describing briefly what is worth borrowing, as an agent suggestion. For other statuses omit `note`; a description explicitly supplied by the brand belongs in a sourced detail item. A local reference path must exist, even if the agent has not watched it.

## Minimal object

```json
{
  "schema_version": 1,
  "title": "合作 brief",
  "sources": [],
  "sections": {
    "product": {"summary": {"text": "未提供可识别的产品介绍。", "kind": "unknown"}},
    "promotion": {"summary": {"text": "主推功能未明确，需要品牌确认。", "kind": "unknown"}},
    "requirements": {"summary": {"text": "交付与限制未提供，需确认后安排拍摄。", "kind": "unknown"}},
    "video": {"summary": {"text": "建议先确认产品和主推功能，再确定演示任务。", "kind": "suggestion"}}
  }
}
```

This is a valid sparse report for a readable but incomplete brief, not permission to make a report when no material was read. A complete fictional sample and its raw brief are in `examples/`.
