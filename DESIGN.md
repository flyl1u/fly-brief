# Fly Brief report

North star: 打开能复述合作，展开能开始构思视频。

## 当前状态 · 01 白纸文档与 04 层层读清图标

用户选择：`01：选 01 白纸文档`。以 `design-exploration/01/01-document.html` 为正式模板的视觉基线。下文首版卡片布局及其评分为历史记录，不作为后续设计依据。真实 brief 测试已用于迭代通用规则，客户材料只保留在本地忽略目录。

当前固定要求：正文只呈现四个核心问题及其内容；不放工具口号、使用教程、制作说明或重复的身份标签。来源、详情和必要状态通过固定模板中的轻量入口承载。按用户批注，合作标题不显示“演示”和单独的平台标签；虚构性质保留在样例材料和说明中。

2026-10-28 用户确认：采用 `design-exploration/favicon-01/icons/04.svg`「层层读清」，新增固定页头，左侧为图标 + `fly-brief`，右侧为「觉得还不错？去点颗star」和星星；两处链接均指向 fly-brief 仓库。图标源文件为 `assets/favicon.svg`，生成器内嵌到单文件报告，同时用作 favicon。

本轮排版取舍（Agent 推断，按用户授权处理双黑线问题）：品牌栏下仅留一条 `--line` 浅灰分隔线；移除合作标题下的黑线，用留白区分标题与第一问。缩减原顶部空白以容纳品牌栏，保留原来的正文阅读宽度和字号。窄屏保留全部 Star 文案，必要时自然换行；打印时隐藏品牌栏，保留合作标题和正文。

实施约束：纯白底、单列四行、左问题右答案、右端加号展开；桌面保留选定方向的 1056 px 阅读宽度和排版尺度，窄屏自然堆叠问题与答案。原文入口集中在合作标题区，具体出处放在展开内容中。品牌仅使用固定页头，不追加额外品牌行、复制／全部展开工具条、页尾教程和彩色身份标签。固定模板由生成器填充，agent 不为每份 brief 改结构。

- A creator's private reading tool, not a dashboard or marketing page. The four questions are always the top-level navigation and content structure.
- Pure white document, black text, gray secondary text and thin structural rules. No panel containers or tinted page background. The fixed, compact brand masthead is followed by the report title and four rows. The selected preview in `design-exploration/01/01-document.html` remains the body-layout baseline; `assets/report.html` owns the current header.
- Four document rows with left-aligned questions and answers; 1056 px reading width on desktop. Each plus independently opens details under its answer. Narrow screens stack question and answer. Reading follows the document; there is no nested reading scrollbar.
- The fixed brand masthead contains the selected icon, `fly-brief` and the Star link. The report title area below contains only product/title, optional cooperation subtitle and the original-brief entry, without a bottom rule. No demonstration marker or separate platform label, as requested in the browser annotations. No toolbar or tutorial footer. Sources are beside the report title and in expanded details, not appended repeatedly to default summaries.
- Default content is short. Critical obligations cannot be collapsed, truncated or hidden in tooltips to fit a viewport. Reference video links belong in the fourth panel's default view.
- Show source excerpts on demand in a native dialog with keyboard close and focus return. Noto Sans SC and Noto Serif SC are embedded from local, licensed WOFF2 assets. Opening the standalone report requires no remote libraries, images, fonts or analytics.
- All four summaries use regular weight. Expanded headings are bold; each capability occupies its own list item with a round bullet. Explain inputs, processing, outputs, concrete uses and relevant conditions without inventing unsupported behavior. The default reading budget does not constrain necessary expanded detail.
- Inline citations read `[原文]`. The dialog emphasizes the source document name, followed by the secondary location and normal-weight excerpt; no generic heading competes with the source name.
- The video section offers 2–3 concrete topic choices. Each heading is a topic title; four items cover creator perspective, promoted features, a specific pain point, and topic details (case, materials, feature use, output and video progression). Options differ in the task or intended use, not just feature names or presentation order. Unknown identities are marked as proposed scenarios. It stops before dialogue, shot-by-shot scripts or finished content.
- Three restrained interaction cues: button press feedback, plus-to-minus transition and source-dialog entrance. Respect reduced-motion settings. Reading never waits for an entrance animation.
- No additional summary module, invented brand claims, decorative charts, canvas panning, autoplay video, editing controls or backend.

Development sample content must be explicitly identified as fictional. Client output has no developer notes. QA evidence and results are recorded after implementation.

Current readability validation: 12 Python tests, skill validation and 17 browser checks pass. The brand-header update was also checked on the user-designated private report: its data remained identical, the embedded icon loaded offline, all four disclosures and source dialogs worked, and the masthead was omitted in print. Desktop and phone states were compared before and after; 1440, 768, 390 and 320 px report layouts have no horizontal overflow or masthead overlap. At 320 px the Star invitation wraps into two complete phrases. This was a focused self-review of the header; no independent whole-page review was run. The fictional previews are regenerated from the fixed template; real client artifacts and QA screenshots remain in ignored local output and `.qa/brand-header/`. This validates structure and interaction, not the actual behavior of any promoted product.

## Historical verification · initial card layout

- Skill structure validation passed, both in this repository and through the installed `fly-brief` directory junction. The installation points to this repository, so future Git-tracked fixes use the same source.
- Generator: 9 Python unit tests passed. Coverage includes missing sections, missing/invalid sources, duplicate IDs, malformed content, unsafe URLs, unviewed-reference claims, relative paths, preservation of long requirement lists, script escaping and protection against overwriting source files.
- Browser: 11 acceptance checks passed in a local, headless Microsoft Edge instance. The report was opened directly as `file://`, with no report-load network requests. Individual and global disclosure, keyboard operation, source text/location, focus restoration, actual clipboard copy, permission-denied copy fallback, preserved reference navigation, sparse content, 320/390 px layouts and reduced-motion styles were checked. The reference navigation used an intercepted local test response; the external sample video was not watched.
- Independent visual review: three rounds, 8 → 8 → 9 out of 10. Clarified the required on-screen manual subtitle correction, kept source controls with their sentences, removed redundant copy and compacted the mobile header. Preserve the four visible questions, the distinction between requirements and suggestions, visible filming obligations, reference entry and original-source access. Independent scores cover static screenshots; interaction checks above were performed separately.
- Final desktop/mobile screenshots have no console errors, horizontal overflow, failed images or style-lint findings. Button press, arrow rotation and source-dialog feedback are implemented. The screenshot probe's two animation warnings are intentionally retained: no entrance animation and no scroll narrative. Immediate readable content is the intended behavior of this tool.
- There is no real client brief in this repository. The fictional source and report are `examples/brief.md`, `examples/report.json` and `examples/report.html`. No full script, external publishing or client communication is part of the skill.

Tracked previews: `examples/preview-desktop.png`, `examples/preview-mobile.png`, `examples/preview-source.png`. Full local QA evidence, recordings and machine-readable results are under `.qa/final/` and `.qa/browser-final/` (ignored development artifacts).

To repeat generator checks: `python -m unittest discover -s tests -v`. To repeat optional browser checks with Playwright available in the host's module search path: `node tests/check_browser.cjs --browser-channel msedge`. Report generation itself only needs Python's standard library; Playwright and the skill validator's PyYAML are development dependencies.

## White-document implementation · 2026-10-24

- Fixed template selected by the user and connected to `scripts/render_report.py`. Added optional subtitle, section note and short highlight labels while keeping version-1 reports compatible. Kind/source data are retained without repeating fact/requirement identity labels in the default view.
- The agent fills JSON only. Skill instructions prohibit per-brief styling, extra introductory modules, brand mastheads, help paragraphs and the discarded copy/expand-all toolbar. Sources have one global entry and precise citations in expanded content.
- Default fixture now uses the selected candidate's concise wording. Complete obligations remain in the requirements row or its detail branches. A requirement for owned/authorized footage and full date/time context is explicit; the external reference remains marked unviewed.
- 12 generator tests passed. The 13 browser checks passed in three consecutive runs and again after final phone-layout polish. Coverage includes actual offline font loading, four visible desktop answers, independent disclosures with mouse/keyboard, exact source passages and focus restoration, reference navigation, 320/390/768 px layouts, reduced motion, print-state restoration, sparse data, long names, uncommon Chinese and inert untrusted markup.
- The preview is still fictional. Reference navigation was intercepted locally during testing; no claim is made about having watched the sample video or tested a real brand brief. Runtime dependencies remain Python's standard library only.
- Independent visual review: 8 → 9 out of 10 over two rounds. Improved short phone line endings, kept time-zone text intact, aligned inline citations and removed the redundant pending label under an already-explicit confirmation heading. Scores apply to static appearance; interaction behavior was checked separately. The only remaining observation was minor citation-to-sentence spacing, with no new functional or visual issue; the review stopping criterion was met.
- Final default/expanded screenshots: `.qa/document-review-2/`; final browser results and source-dialog screenshots: `.qa/document-polished-browser/`. Earlier full evidence and motion recordings remain in `.qa/document-final/`. All final screenshots have no console errors, horizontal overflow, failed images or readability lint findings. Motion-probe warnings about absent entrance and scroll effects are intentionally retained for immediate reading.
- Updated tracked previews are `examples/preview-desktop.png`, `examples/preview-mobile.png` and `examples/preview-source.png`. The standalone current report is `examples/report.html`. The installed skill directory junction continues to use this same Git-tracked implementation.
