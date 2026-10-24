# Working agreements

- This repository is the source of the `fly-brief` skill.
- Commit every coherent change, including fixes and documentation updates. Finish with a clean Git working tree. Do not commit real clients' briefs or generated client reports without an explicit request.
- Git 提交说明保持简短清晰，按提交条数约 40% 使用英文、60% 使用中文；后续以每 5 次提交中 2 次英文、3 次中文为目标，不为凑比例拆分无意义提交。
- The report always has four primary sections: product, promotion, requirements, and video. Keep these questions visible in the collapsed state.
- Use plain Chinese. Keep critical shooting requirements visible, distinguish brand requirements from creative suggestions, and preserve traceable sources.
- Generated reports must work as standalone local HTML without a build step, remote libraries, or an API key.
- Run `python -m unittest discover -s tests -v` after changes to the generator. Visually check affected desktop and mobile states after template changes.
