# Claude Session Closing Prompt
## Save this permanently. Paste it at the end of any Claude session.

---

**PASTE EVERYTHING BELOW THIS LINE:**

---

We are wrapping up this session. I need you to produce two things:

## 1. Updated PROJECT_STATUS.md

Rewrite the full PROJECT_STATUS.md file incorporating everything from this session. Follow this exact structure:

# [Project Name] - Project Status
**Last Updated:** [today's date]
**Current Phase:** [brief description of where the project stands]

## Tech Stack
[Current languages, libraries, tools, versions]

## Architecture Overview
[2-3 sentence summary of how the app is structured]

## What's Working
[Checklist of features - checked = working, unchecked = in progress]

## Known Bugs / Blockers
[Numbered list of current issues]

## Recent Changes (last 2-3 sessions)
[Date and description of significant changes, newest first]

## Key Design Decisions (and WHY)
[Bullet points of architectural choices with reasoning]

## Gemini's Last Update Summary
[If Gemini provided updates this session, summarize what she reported
and what was incorporated. Include any unanswered questions FROM Gemini
and your responses/recommendations. If no Gemini updates, write "N/A"]

## Answers to Gemini's Questions
[If Gemini asked questions in her last update, answer them here so the
user can relay them back. If none, write "N/A"]

## Next Session TODO
[Prioritized list of what to work on next]

Make sure you:
- Preserve ALL historical design decisions, not just this session's
- Update the "What's Working" checklist accurately
- Move completed TODOs to the done state
- Add any new bugs discovered
- Keep the "Recent Changes" section to the last 3 sessions max (archive older ones)

## 2. Updated TODO.md

Rewrite the full TODO.md:

## In Progress
[Items actively being worked on]

## Up Next
[Prioritized items for upcoming sessions]

## Done (recent)
[Items completed in the last 3-4 sessions with dates]

Also update IDEAS.md if we discussed any new feature ideas or technical explorations that are not committed to the TODO yet.

**Output each file in its own clearly labeled code block so I can copy-paste them directly into my repo.**
