# Interview-Preparation

Repository for GenAI interview preparation content and website work.

## Repository Layout

```text
Interview-Preparation/
├─ Interview question/
│  ├─ genai_questions_backup.json
│  └─ questions.html
├─ code/                      # Website output/work area
├─ docs/                      # Source notes/content for site work
└─ README.md
```

## Current Setup

- Git repository root: `Interview prep work/` (this folder)
- Remote: `origin -> git@github.com:iamrishi-x/Interview-Preparation.git`
- Main branch: `main`
- `code/` is reserved for website data/output only.

## Workflow

1. Make content updates under `Interview question/` and `docs/`.
2. Build/update the site output in `code/`.
3. Commit to `main` locally.
4. Push when ready.

## Notes

- Local Codex/workspace files are ignored via `.gitignore`.
- Keep secrets out of git (`.env` should stay local only).
