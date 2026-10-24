**简体中文** · [English](./README.en.md)

# Fly Brief

帮博主读懂品牌合作 brief，整理重点、要求和可以选择的视频选题。

<picture>
  <source media="(max-width: 600px)" srcset="./assets/readme/reading-flow-mobile.svg">
  <img src="./assets/readme/reading-flow.svg" width="100%" alt="交互示意：先看四问概览，点加号展开具体选题，再从原文入口核对品牌要求。内容为虚构节选。">
</picture>

先看结论 → 点 `＋` 展开细节 → 点 `[原文]` 核对出处。

## 开始用

有 Node.js 时，通过 [Skills CLI](https://github.com/vercel-labs/skills) 安装，按提示选择你的 agent：

```sh
npx skills add flyl1u/fly-brief --skill fly-brief
```

把 brief 文件、正文或可访问链接一起交给 agent：

```text
使用 $fly-brief 解读这份合作 brief，生成本地 HTML 报告。
给几个具体视频选题，先不写完整脚本。
```

生成后的报告可离线打开，无需构建、API Key 或运行中的服务。生成器需要 Python 3.10+；读取附件取决于 agent 已有的工具和权限。

## 看真实示例

下面是同一份虚构 brief 的真实界面，选择感兴趣的部分展开。

<details>
<summary>产品解释：输入、产物和使用条件</summary>

<picture>
  <source media="(max-width: 600px)" srcset="./assets/readme/product-expanded-mobile.png">
  <img src="./assets/readme/product-expanded.png" width="100%" alt="展开后的产品解释，逐项说明能力、人工检查条件和对应原文。">
</picture>

</details>

<details>
<summary>具体选题：场景、材料和视频怎样推进</summary>

<picture>
  <source media="(max-width: 600px)" srcset="./assets/readme/topic-expanded-mobile.png">
  <img src="./assets/readme/topic-expanded.png" width="100%" alt="一个完整的备选视频方向，说明达人身份、推广功能、具体痛点和选题详情。">
</picture>

</details>

<details>
<summary>原文出处：资料名称、段落位置和原句</summary>

<picture>
  <source media="(max-width: 600px)" srcset="./assets/readme/source-open-mobile.png">
  <img src="./assets/readme/source-open.png" width="100%" alt="来源弹窗展示资料名称、所在段落、原句摘录和原始文件入口。">
</picture>

</details>

<details>
<summary>本地试跑与开发说明</summary>

无需准备真实 brief，可以用仓库里的 [虚构材料](./examples/brief.md) 和 [报告数据](./examples/report.json) 试跑：

```sh
git clone https://github.com/flyl1u/fly-brief.git
cd fly-brief
python scripts/render_report.py --input examples/report.json --output output/demo/report.html
```

打开 `output/demo/report.html`。生成器负责渲染数据，brief 分析由 agent 完成。

维护入口：[技能规则](./SKILL.md) · [数据约定](./references/report-format.md) · [模板](./assets/report.html) · [生成器](./scripts/render_report.py)。

```sh
python -m unittest discover -s tests -v
```

修改模板还需检查桌面与手机效果。内置字体附有 [来源与许可证](./assets/fonts/SOURCES.md)。

</details>

报告默认使用中文。品牌要求与创作建议分开，无法读取的材料会标明；真实客户资料和报告默认保存在本地 `output/`，不会随项目提交。Agent 的模型调用和远程读取取决于所用工具。
