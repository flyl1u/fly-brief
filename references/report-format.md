# Report data contract · version 1

`scripts/render_report.py` accepts a UTF-8 JSON object. It uses Python's standard library only. The template is self-contained; never put HTML markup in text fields.

## Root

| Field | Type | Meaning |
| --- | --- | --- |
| `schema_version` | integer | Always `1`. |
| `title` | nonempty string | Brief/report identity, e.g. `随剪 · 口播拆条合作`. |
| `subtitle` | string, optional | Cooperation topic appended to the browser tab title. No separate cooperation title row appears in the report body. Old reports with a combined title still work. |
| `context` | string, optional | Legacy metadata, retained for compatibility but not shown in the header. Put platform, dates and specifications in requirements. |
| `demo` | boolean, optional | Internal marker for fictional examples; retained in data, never rendered as a header label. |
| `sources` | array | Source records, each with a unique `id`. |
| `sections` | object | Exactly `product`, `promotion`, `requirements`, `video`, in that display order. |

## Source

`id`, `title`, `location`, `excerpt` are nonempty strings. `location` should be precise: page, paragraph, slide, image region or message timestamp. `excerpt` is a short verbatim extract, not a paraphrase. Use multiple source records for multiple passages in the same document.

Optional `url` is an existing HTTP(S) URL. Optional `path` is an existing local file, absolute or relative to the input JSON. Use one or neither, never both. Relative file paths are resolved during generation. The original file is not embedded. The excerpt remains readable if the original is later moved.

For pasted text without a file, omit `url` and `path`, and give a useful `title` and `location`. For conflicts use records for both claims and cite both; do not fabricate quotes for absent information.

## Each section

- `summary`: one content item, required.
- `note`: optional content item, one short supporting sentence. It needs its own kind and sources, under the same rules as any other item. It supplements the summary, not repeats it.
- `highlights`: optional array of content items, visible before expansion. Primarily for critical requirements and unresolved blockers. No hard count limit: do not hide obligations to fit a layout.
- `schedule`: optional array of content items, allowed in `requirements` only. Each needs a nonempty `label` (e.g. `交脚本`) and the normal kind/source fields. It appears as prominent delivery milestones before the other highlights.
- `details`: optional array of branches, each with `title` and nonempty `items` (content items). Group by questions users have, not by the original document order. In `video`, each branch expands independently; an optional `preview` object supplies the default comparison fields described below.
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

Content items may have a short `label`. Use it for highlights (`必拍`, `禁区`, `素材`), milestone actions, and detail fields (`导入什么`, `工具处理`, `你来决定`, `最后得到`). Do not repeat the label in `text`. If every item in a detail branch has a label, the template renders a definition list; otherwise it retains the branch title and bullet list. Legacy `时间` highlights remain readable without any automatic text stripping.

A schedule item may include an ISO `datetime`, e.g. `2026-10-28T18:00:00+08:00`. Its visible `text` is a concise sourced date, such as `10.28 18:00 前`. The template does not add a separate year/timezone line. Preserve the full date/timezone in the source excerpt and optional datetime. If a cross-year or cross-timezone distinction matters, include it in that milestone text.

Detail items may include a nonempty `steps` array of nonempty plain strings. The ordered steps inherit the parent item’s kind and source IDs; `text` remains required and supplies a short condition or qualification shown after the steps. Steps are not allowed on summaries, highlights, schedule or comparison fields.

The selected white-document template owns all layout and UI text, including the fixed brand masthead: the embedded paper-and-red-circle icon (direction 08) and `fly-brief` on the left, and the original-brief entry and Star link on the right. Brand and Star links target `https://github.com/flyl1u/fly-brief`; these are template assets, not report data fields. A single light-gray masthead rule is followed directly by the four questions. Do not add a visible cooperation title row; `title` and `subtitle` identify the browser tab, with an accessible nonvisual report heading. The agent fills data only; do not provide CSS/HTML or additional top-level sections. Internal `kind` is always retained, but routine fact/required tags are not repeated on screen. Suggestions and unresolved information are identified where needed. Individual citations appear in expanded details, with one overview source entry in the masthead. Reference videos remain visible before expansion. Unviewed state stays in data without a visible badge; genuine unavailability remains visible.

Summaries use regular weight, with larger promotion text and stronger milestone/mandatory-shot emphasis. Product and requirement details prefer short labeled fields. Unlabeled legacy items remain separate bullet entries. Never put literal bullet markers, HTML or CSS in the data. The overview budget does not cap necessary expanded explanations.

Inline source controls display `原文`, regardless of how many source IDs they contain. All IDs resolve to the exact passages. The dialog uses the document name as its heading.

In `video`, use a short summary and usually 2–3 distinct branches. Write the topic title directly in `branch.title`. Each branch may provide a `preview` object containing exactly `role`, `materials`, `output`; each value is a normal content item with its own text, kind and sources. It identifies the proposed creator perspective, materials to prepare and output to make. These fields and the topic title are counted toward the visible-content budget. Suggested scenarios use `kind: suggestion`; factual preview claims still require sources.

```json
"preview": {
  "role": {"text": "知识 / 教程博主", "kind": "suggestion"},
  "materials": {"text": "摄影长口播 + 真实评论", "kind": "suggestion"},
  "output": {"text": "一条逆光人像答疑短片", "kind": "suggestion"}
}
```

Write four `items` with `label` values `达人视角`, `推广功能`, `解决痛点`, `选题详情`. Use the final item’s `steps` for 2–4 concrete content-progression steps. These fields are backward-compatible version-1 extensions: sparse and legacy reports without them remain valid, with no invented comparison metadata.

The pain point identifies a person, the step they are stuck on and the consequence. Topic details name a case, its input materials, how the promoted features participate, what the output contains and how the video develops from problem to result. A feature name, “任务实测”, or “痛点 → 操作 → 结果” alone is not a concrete topic. Directions differ in audience, task, pain point or use of the output, not just feature name or presentation order. Features can be combined when the task calls for it; do not force one feature per direction.

Use `kind: suggestion` for proposed scenarios and topics. If the creator's identity is unknown, describe a proposed content perspective and explicitly mark any persona as a scenario, not a fact about the user. Cite source passages that constrain the feature choice where helpful; a suggestion label does not justify unsupported capabilities or invented results. Keep options within the brief; if only one is supported, explain the constraint. Detail is welcome at the topic-planning level, stopping before dialogue, shot-by-shot scripts or finished product copy. See `examples/report.json` for complete topic branches.

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

`status` is `viewed` (已查看), `unviewed` (未查看), or `unavailable` (无法访问). The page omits the `unviewed` badge while preserving this state in JSON; `unavailable` still shows an access warning. For `viewed`, provide `note` describing briefly what is worth borrowing, as an agent suggestion. For other statuses omit `note`; a description explicitly supplied by the brand belongs in a sourced detail item. A local reference path must exist, even if the agent has not watched it.

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
