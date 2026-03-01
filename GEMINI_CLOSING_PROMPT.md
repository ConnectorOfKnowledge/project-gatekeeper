# Gemini Session Closing Prompt
## Save this permanently. Paste it at the end of any Gemini session.

---

**PASTE EVERYTHING BELOW THIS LINE:**

---

We are wrapping up this session. I need you to produce a handoff document called GEMINI_UPDATES.md that will be given to Claude (a separate AI) so he can stay in sync with what we did today.

Claude maintains the master project status document and the TODO list. He needs a clear, structured report from you so he can update his files without losing any detail.

Write the full GEMINI_UPDATES.md using this exact structure:

# Gemini Session Update
**Session Date:** [today's date]
**Session Focus:** [1-2 sentence summary of what we worked on]

## Changes Made
For each file you modified or created:
- [filename]: [What changed and why, in enough detail that another
  developer could understand the change without reading the diff]

## Decisions Made
For each significant decision:
- [Decision]: [The reasoning behind it, including what alternatives
  were considered and rejected]

## New Bugs or Issues Found
- [Description of any new problems discovered during this session]

## TODO Changes
- Completed: [items finished this session]
- Added: [new items that should go on the TODO]
- Removed/Deferred: [items we decided to drop or push to IDEAS]

## Ideas Surfaced (for IDEAS.md)
[Any feature ideas, technical explorations, or "maybe someday" items
that came up but are not committed to the active TODO]

## Questions for Claude
[Direct questions for Claude about architecture, his modules, design
decisions, or anything where his input would be valuable. Be specific.
Claude will answer these in his next session and the user will relay
the answers back to you.]

## Context Claude Might Need
[Anything unusual or non-obvious about this session's work that Claude
should know - e.g., "I refactored the module naming convention from
camelCase to snake_case" or "We discussed switching from PyQt6 to
Dear PyGui but decided against it because..." This section prevents
Claude from being confused by changes he did not expect.]

**Important guidelines:**
- Be specific about file changes. "Updated injector.py" is not enough. Say WHAT changed and WHY.
- In the Decisions section, always include the reasoning. Claude may have context that leads to a different conclusion, and he needs to understand your logic to evaluate it.
- The "Questions for Claude" section is valuable - use it. Claude may be maintaining modules you have not seen, and this is your async communication channel with him.
- Do not summarize away detail. This document IS the detail.

**Output the complete file in a single code block so the user can copy-paste it directly.**
