# README 顶图

`hero.zh-CN.svg` 和 `hero.svg` 分别用于中文、英文 README。画布为 1680 × 640，所有图标内嵌，打开 SVG 不需要网络。`scene.cjs` 是两种语言共用的源稿，以 fly-ppt 的绘图函数构建。文字保留为 SVG 文字，字体由设备提供，其他设备可能使用后备字体。

## 素材

六个 Agent 的原始 SVG 复制自本次指定的 fly-ppt Skill 的 `assets/icons/`，未修改图标路径、颜色或形状；仅在外层添加手绘贴纸和倾斜变换。原始上游为 [LobeHub Icons](https://github.com/lobehub/lobe-icons)，MIT 许可全文保存在 [icons/LICENSE.txt](./icons/LICENSE.txt)。这些是第三方图标库素材。

| 图标 | 上游 SVG |
| --- | --- |
| Claude Code | [claudecode-color.svg](https://github.com/lobehub/lobe-icons/blob/master/packages/static-svg/icons/claudecode-color.svg) |
| Codex | [codex.svg](https://github.com/lobehub/lobe-icons/blob/master/packages/static-svg/icons/codex.svg) |
| Kimi | [kimi-color.svg](https://github.com/lobehub/lobe-icons/blob/master/packages/static-svg/icons/kimi-color.svg) |
| WorkBuddy | [workbuddy-color.svg](https://github.com/lobehub/lobe-icons/blob/master/packages/static-svg/icons/workbuddy-color.svg) |
| Cursor | [cursor.svg](https://github.com/lobehub/lobe-icons/blob/master/packages/static-svg/icons/cursor.svg) |
| Gemini CLI | [gemini-color.svg](https://github.com/lobehub/lobe-icons/blob/master/packages/static-svg/icons/gemini-color.svg) |

fly-brief 使用仓库现有的 [favicon.svg](../favicon.svg)，未修改图标。报告示意、纸面、手绘外框、下划线和箭头由本次源稿与 fly-ppt 绘图函数绘制；报告示意没有客户内容。

## 内容依据

该图表达「支持 Skill 的 Agent → fly-brief → 本地 HTML 报告」的工作流程。报告的四块内容来自仓库的 [SKILL.md](../../SKILL.md) 和 README。以下官方文档核对了图中产品的技能机制，核对日期为 2026-10-28：

- [Claude Code：Extend Claude with skills](https://code.claude.com/docs/en/skills)
- [Codex：Build skills](https://learn.chatgpt.com/docs/build-skills)
- [Kimi Code：Agent Skills](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/skills.html)
- [WorkBuddy：技能](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Skills-Market)
- [Cursor：Agent Skills](https://cursor.com/docs/skills)
- [Gemini CLI：Agent Skills](https://geminicli.com/docs/cli/skills/)

这里列举支持技能机制的 Agent，不表示已经逐一完成 fly-brief 实测，也不表示品牌合作或官方背书。各 Agent 的技能目录和配置仍以其文档为准。

## 重新生成

在仓库根目录运行，需要 Node.js 和已安装的 fly-ppt Skill；其依赖准备方式见 fly-ppt 的 `references/authoring.md`。将 `$flyPpt` 设置为该 Skill 的安装目录：

```powershell
$flyPpt = '<fly-ppt 安装目录>'
node (Join-Path $flyPpt 'scripts/build.cjs') assets/readme/scene.cjs --out output/readme-hero --formats html,svg,png --renderer browser
```

查看 `output/readme-hero/previews/` 中的中英文 PNG；`演示文稿.html` 是资源内嵌的双语预览，用左右方向键切换语言。构建成功后更新 README 使用的两个文件：

```powershell
Copy-Item -LiteralPath 'output/readme-hero/slides/hero-zh-cn.svg' -Destination 'assets/readme/hero.zh-CN.svg'
Copy-Item -LiteralPath 'output/readme-hero/slides/hero.svg' -Destination 'assets/readme/hero.svg'
```

生成的 PNG、HTML 与构建报告留在 Git 忽略的 `output/`。检查 PNG 的文字、边界和箭头间距，并以 README 的实际图片宽度检查中英文版本。
