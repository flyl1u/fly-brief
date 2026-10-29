# Fly Brief report

North star: 打开能复述合作，展开能开始构思视频。

## 当前状态 · 白纸文档与可比较选题 · 2026-10-29

- 用户确认：采用 `design-exploration/02/report.html` 的整理方向，保留黑白文档、四个主问题、固定品牌页头；删去截图圈出的独立“2026 年 · 北京时间”行和参考入口后的“未查看”文字。正式模板为 `assets/report.html`，示例为 `examples/report.html`。
- 用户确认：主推名称使用更大字号，交付时间与必拍流程加强强调。前三块显示文字加号入口；视频选题直接比较视角、素材和产物，每个选题独立展开。
- 用户确认：第一块按输入、工具处理、人工判断、产物阅读；展开详情控制行长，选题推进分步骤表达。
- 既有用户约束继续有效：纯白底，桌面 1056 px 阅读宽度，左问右答；不加合作标题行、工具口号、复制／全部展开工具条或页尾教程。品牌、原 brief、Star 入口与 08「圈出重点」图标保留。
- Agent 实现：小于等于 900 px 堆叠阅读，避免中屏挤压比较列；手机选题改为同字段的纵向列表。窄屏文字自然换行，不截断关键要求。
- Agent 实现：第三块 `schedule` 承载每个交付节点，不生成独立年份／时区说明行。完整日期、时区保留在来源摘录及可选 `datetime`；需要区分跨年或跨时区时写进对应节点文字。
- Agent 实现：参考链接保留，`unviewed` 留在 JSON 中且仍禁止借鉴分析，不显示未查看徽标；`unavailable` 继续提示无法访问。
- Agent 实现：`details.items.label` 全部存在时按字段排版；`steps` 用有序列表；视频 `preview` 显示视角、素材、产物。旧报告仍可用原项目列表，不推断缺失字段。
- 事实、品牌要求、冲突保留精确来源；建议和未知事项继续标识。来源弹窗突出资料名称、位置和摘录，Esc 关闭并返回原入口焦点。
- 单文件内嵌字体、图标、数据、脚本和样式，无远程加载依赖。原资料及参考保留原链接。
- 动效沿用按下反馈、加号变减号、详情轻微位移和弹窗出场，支持减少动态效果；阅读不等待首次进入或滚动动画。

当前验证：15 项生成器测试与 18 项浏览器检查通过；覆盖字段来源、日期、步骤、旧数据、独立展开、键盘、来源弹窗、参考导航、打印和减少动态效果。已目视查看桌面及 320/390/768/901 px 的默认和展开状态，未发现控制台错误、横向溢出、失败图片或可读性 lint。README 桌面、手机与来源预览图已刷新。来源摘录、原始参考 URL 和 unviewed 状态与修改前一致。正式报告与安装目录 junction 同源。证据在忽略目录 `.qa/approved-report/` 与 `.qa/approved-visual/`。本轮沿用用户确认的小样，仅做主 Agent 视觉核对，未独立评分；历史评分不适用于本次版本。

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
