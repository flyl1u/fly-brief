# Fly Brief report

North star: 打开能复述合作，展开能开始构思视频。

## 当前状态 · 已选 01 白纸文档

用户选择：`01：选 01 白纸文档`。以 `design-exploration/01/01-document.html` 为正式模板的视觉基线。下文首版卡片布局及其评分为历史记录，不作为后续设计依据。真实 brief 测试继续延后。

当前固定要求：只呈现四个核心问题及其内容；不在正文放工具口号、使用教程、制作说明或重复的身份标签。来源、详情和必要状态以后通过固定模板中的轻量入口承载。演示数据的虚构性质在对比页与交付说明中明确，不占候选正文。

实施约束：纯白底、单列四行、左问题右答案、右端加号展开；桌面保留选定方向的 1056 px 阅读宽度和排版尺度，窄屏自然堆叠问题与答案。原文入口集中在页头，具体出处放在展开内容中。不恢复首版的品牌行、复制／全部展开工具条、页尾教程和彩色身份标签。固定模板由生成器填充，agent 不为每份 brief 改结构。

- A creator's private reading tool, not a dashboard or marketing page. The four questions are always the top-level navigation and content structure.
- Quiet ivory background, dark ink, one muted blue accent, and a readable Chinese system font. Color differentiates evidence types only where it aids interpretation.
- Use a compact 2 × 2 desktop overview with independently expanding panels; narrow screens use a single column. Open content should flow naturally, never inside a nested scroll box. Preserve other summaries when a panel expands.
- On narrow screens start with the cooperation title; omit the separate brand row and keep controls and any demonstration notice compact. Source buttons stay attached to the last few characters so they do not become isolated lines.
- Default content is short. Critical obligations cannot be collapsed, truncated or hidden in tooltips to fit a viewport. Reference video links belong in the fourth panel's default view.
- Show source excerpts on demand in a native dialog with keyboard close and focus return. No remote libraries, thumbnails, fonts or analytics; the HTML can be opened directly.
- Three restrained interaction cues: button press feedback, disclosure-arrow rotation, and source-dialog entrance. Respect reduced-motion settings. Reading never waits for an entrance animation.
- No additional summary module, invented brand claims, decorative charts, canvas panning, autoplay video, editing controls or backend.

Development sample content must be explicitly identified as fictional. Client output has no developer notes. QA evidence and results are recorded after implementation.

## Verification · 2026-10-24

- Skill structure validation passed, both in this repository and through the installed `fly-brief` directory junction. The installation points to this repository, so future Git-tracked fixes use the same source.
- Generator: 9 Python unit tests passed. Coverage includes missing sections, missing/invalid sources, duplicate IDs, malformed content, unsafe URLs, unviewed-reference claims, relative paths, preservation of long requirement lists, script escaping and protection against overwriting source files.
- Browser: 11 acceptance checks passed in a local, headless Microsoft Edge instance. The report was opened directly as `file://`, with no report-load network requests. Individual and global disclosure, keyboard operation, source text/location, focus restoration, actual clipboard copy, permission-denied copy fallback, preserved reference navigation, sparse content, 320/390 px layouts and reduced-motion styles were checked. The reference navigation used an intercepted local test response; the external sample video was not watched.
- Independent visual review: three rounds, 8 → 8 → 9 out of 10. Clarified the required on-screen manual subtitle correction, kept source controls with their sentences, removed redundant copy and compacted the mobile header. Preserve the four visible questions, the distinction between requirements and suggestions, visible filming obligations, reference entry and original-source access. Independent scores cover static screenshots; interaction checks above were performed separately.
- Final desktop/mobile screenshots have no console errors, horizontal overflow, failed images or style-lint findings. Button press, arrow rotation and source-dialog feedback are implemented. The screenshot probe's two animation warnings are intentionally retained: no entrance animation and no scroll narrative. Immediate readable content is the intended behavior of this tool.
- There is no real client brief in this repository. The fictional source and report are `examples/brief.md`, `examples/report.json` and `examples/report.html`. No full script, external publishing or client communication is part of the skill.

Tracked previews: `examples/preview-desktop.png`, `examples/preview-mobile.png`, `examples/preview-source.png`. Full local QA evidence, recordings and machine-readable results are under `.qa/final/` and `.qa/browser-final/` (ignored development artifacts).

To repeat generator checks: `python -m unittest discover -s tests -v`. To repeat optional browser checks with Playwright available in the host's module search path: `node tests/check_browser.cjs --browser-channel msedge`. Report generation itself only needs Python's standard library; Playwright and the skill validator's PyYAML are development dependencies.
