# Gemini Session Opening Prompt
## Save this permanently. Paste it at the start of any Gemini session to resume the project.

---

**PASTE EVERYTHING BELOW THIS LINE:**

---

We are resuming work on a project. I work with two AIs on this project - you (Gemini) and Claude. Claude maintains the master project documents. I am going to give you:

1. **PROJECT_STATUS.md** - Claude's master status document. It contains the full project state: tech stack, architecture, what is working, known bugs, design decisions, and the TODO. Treat this as the source of truth for the overall project.

2. **Your previous GEMINI_UPDATES.md** (if available) - Your own handoff document from your last session, so you can remember where YOU left off.

3. **Answers from Claude** (if any) - If you asked Claude questions in your last update, his answers will be in the "Answers to Gemini's Questions" section of PROJECT_STATUS.md.

**Your job when you receive these:**

1. Read everything completely before responding.
2. Check if Claude answered any of your previous questions and acknowledge them.
3. Note any changes Claude made since your last session that affect your work.
4. Give me a brief summary of:
   - Where the project stands overall
   - What Claude has been working on (from PROJECT_STATUS.md recent changes)
   - Claude's answers to your questions (if any)
   - What you recommend we work on this session
5. Then ask me what I would like to focus on today.

**Important rules for this project:**
- Respect design decisions documented in PROJECT_STATUS.md - if you disagree with one, surface it as a discussion point rather than silently going a different direction
- Maintain one-concern-per-file in the source code
- When we finish this session, I will paste a closing prompt and you will produce an updated GEMINI_UPDATES.md file - this is how Claude stays in sync with your work
- Be specific about every file change you make. Claude needs enough detail to update his status document without seeing the code diff
- If you want Claude's input on something, put it in your "Questions for Claude" section at the end of the session

I am pasting the documents now:
