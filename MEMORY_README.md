# Project Memory Templates - Quick Reference
## How to use this system

### These 4 files are PROMPTS (save permanently, never edit):
| File | When to use |
|------|-------------|
| `CLAUDE_OPENING_PROMPT.md` | Paste at the START of a Claude session |
| `CLAUDE_CLOSING_PROMPT.md` | Paste at the END of a Claude session |
| `GEMINI_OPENING_PROMPT.md` | Paste at the START of a Gemini session |
| `GEMINI_CLOSING_PROMPT.md` | Paste at the END of a Gemini session |

### These 4 files are TEMPLATES (copy into each new project, then they get updated every session):
| File | Who maintains it | What it does |
|------|-----------------|--------------|
| `PROJECT_STATUS_TEMPLATE.md` | Claude | Master project state - rename to `PROJECT_STATUS.md` in your project |
| `TODO_TEMPLATE.md` | Claude | Active task list - rename to `TODO.md` in your project |
| `IDEAS_TEMPLATE.md` | Claude | Parking lot for future ideas - rename to `IDEAS.md` in your project |
| `GEMINI_UPDATES_TEMPLATE.md` | Gemini | Her session handoff report - rename to `GEMINI_UPDATES.md` in your project |

### Starting a new project:
1. Create a project folder
2. Copy the 4 template files into it and remove `_TEMPLATE` from the names
3. Fill in the project name and initial details
4. You are ready to go

### Session workflow:
```
START SESSION:  Paste opening prompt -> paste project docs
WORK:           Build stuff
END SESSION:    Paste closing prompt -> save the output files back to the project folder
```
