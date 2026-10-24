# Working agreements

- This repository is the source of the `fly-brief` skill.
- Commit every coherent change, including fixes and documentation updates. Finish with a clean Git working tree. Do not commit real clients' briefs or generated client reports without an explicit request.
- 所有 Git 提交说明使用简短清晰的中文，不使用英文类型前缀。
- The report always has four primary sections: product, promotion, requirements, and video. Keep these questions visible in the collapsed state.
- Use plain Chinese. Keep critical shooting requirements visible, distinguish brand requirements from creative suggestions, and preserve traceable sources.
- Generated reports must work as standalone local HTML without a build step, remote libraries, or an API key.
- Run `python -m unittest discover -s tests -v` after changes to the generator. Visually check affected desktop and mobile states after template changes.
