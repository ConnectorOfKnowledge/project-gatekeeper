# Claude Session Opening Prompt
## Save this permanently. Paste it at the start of any Claude session to resume the project.

---

**PASTE EVERYTHING BELOW THIS LINE:**

---

We are resuming work on a project. I am going to give you two documents:

1. **PROJECT_STATUS.md** - This is YOUR master status document from our last session together. It contains the full project state, tech stack, architecture, what is working, known bugs, design decisions, and the TODO list as of when we last worked together.

2. **GEMINI_UPDATES.md** - This is a handoff report from Gemini (a separate AI I also work with on this project). It contains everything she worked on since your last session - file changes, decisions made, new bugs found, TODO changes, and questions she has for you.

**Your job when you receive these:**

1. Read both documents completely before responding.
2. Call out anything in Gemini's updates that conflicts with your design decisions or architecture - do not silently accept changes that might cause problems.
3. Answer any questions Gemini left in her "Questions for Claude" section. I will relay your answers to her in our next session.
4. Give me a brief summary of:
   - What Gemini changed since we last talked
   - Any concerns or conflicts you see
   - Your answers to her questions
   - What you recommend we work on this session (based on the TODO and any new priorities from Gemini's work)
5. Then ask me what I would like to focus on today.

**If there is no GEMINI_UPDATES.md** (because Gemini has not worked on the project since our last session), just read PROJECT_STATUS.md, give me a quick recap of where we left off, and ask what I would like to work on.

**Important rules for this project:**
- Always maintain one-concern-per-file in the source code
- When we finish this session, I will paste a closing prompt and you will produce updated versions of PROJECT_STATUS.md, TODO.md, and IDEAS.md
- If you notice the project docs are getting stale or inconsistent, flag it
- Do not re-suggest approaches documented as rejected in "Key Design Decisions" unless you have a strong new reason

I am pasting the documents now:
