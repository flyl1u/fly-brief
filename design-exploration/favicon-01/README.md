# fly-brief 图标探索 · 01

[打开交互对比页](./index.html) · [浅色总览](./overview.png) · [深色总览](./overview-dark.png) · [手机预览](./mobile.png)

2026-10-28，使用 fly-favicon 为 fly-brief 创作的 10 个纯图形 SVG。围绕读懂合作 brief、四个问题、提炼重点和视频构思，分别尝试极简文档、几何拼图、圆形负形、等距叠页、折纸、有机线稿、像素、手绘圈注、取景框和浮雕封蜡。

设计依据是仓库的 [产品说明](../../README.md)、[白纸文档设计记录](../../DESIGN.md) 和 [当前报告模板](../../assets/report.html)。原始设计请求逐字保存在 `manifest.json`，也可通过页面的「查看提示词」查看。本轮文件只包含产品图标设计，无客户材料。

## 推荐方向

- **[01 折页提要](./index.html?icon=01)**：最贴合白纸黑字的阅读气质，四行提要在 16px 下仍清楚。适合延续现有产品形象。
- **[02 四问拼图](./index.html?icon=02)**：四块结构直接对应产品、主推、要求和视频；简单色块更容易记忆。适合强调 fly-brief 的方法。
- **[05 纸翼启程](./index.html?icon=05)**：纸翼呼应 fly，从读材料走向创作。适合更轻快的创作者工具气质。

## 使用与复现

直接用浏览器打开 `index.html`，或通过本地静态服务器访问。点选候选会更新真实标签页图标、两种标签栏模拟和下载目标；`?icon=编号` 可保留选择。每个图标可从 `icons/` 单独取用。

页面不需要构建、远程依赖、API Key 或网络请求。关闭 JavaScript 后仍可查看全部静态候选；交互需要 JavaScript。复制整个目录即可离线使用。

`manifest.json` 和 `icons/*.svg` 同时是可复现的生成器输入。使用 fly-favicon 技能目录中的模板，输出到一个尚不存在的目录：

```text
python "<fly-favicon技能目录>/scripts/build_comparison.py" --manifest design-exploration/favicon-01/manifest.json --output "<新输出目录>"
```

## 已完成的验证

使用本机 Microsoft Edge 验证，截图保存于本目录：

- 10 个独立 SVG 通过 fly-favicon 生成器的格式与自包含校验；`node --check preview.js` 通过。
- 所有图片加载成功；16 / 24 / 32 CSS px 样本保持原尺寸。人工查看浅色、深色总览及手机画面，复核小尺寸轮廓。
- 02、05 点选后，真实 favicon 链接、标题、两种标签栏模拟、选中状态、下载和 URL 同步；刷新恢复 05，无效编号回到 01。
- Enter 和 Space 均能选择；提示词原文准确，关闭按钮、Esc 和遮罩均能关闭弹窗，并将焦点还给触发按钮。
- 实际下载的文件名为 `fly-brief-05.svg`，文件内容与选中的独立 SVG 相同。页眉品牌与 Star 链接均指向 fly-favicon 仓库，悬停后星星填充。
- 深浅主题正常切换；320 / 390 / 768px 页面和提示词弹窗均无横向溢出。
- `file://` 离线打开正常，选择参数生效；无外部网络请求、无页面 JavaScript 错误。禁用 JavaScript 后十个候选仍可查看。

报告生成器和正式报告模板未修改，本轮验证范围为图标探索文件。
