# TWD AI Guides

This directory contains prompts and context files for AI coding assistants to help them understand and generate TWD test code.

## Recommended: Agent Skills CLI

The easiest way to install TWD context into your AI agent — no copy-pasting needed:

```bash
npx skills add BRIKEV/twd
```

Works with Claude Code, Cursor, Codex, and [35+ more agents](https://github.com/vercel-labs/skills#available-agents). See the [`skills/`](../skills/) directory for the available skills.

## Manual Setup

### `TWD_PROMPT.md`

A comprehensive prompt file that gives AI assistants full context about TWD. This includes:

- What TWD is and how it works
- Required imports and file naming conventions
- Element selection patterns (Testing Library + CSS selectors)
- User interactions with userEvent
- All assertion types
- API mocking with Mock Service Worker
- Component mocking
- Common mistakes to avoid
- Quick reference table

## How to Use

### Claude Code / Claude.ai

Copy the contents of `TWD_PROMPT.md` into your conversation or add it to your project's `CLAUDE.md` file.

### Cursor

1. Go to Settings > Rules for AI
2. Paste the contents of `TWD_PROMPT.md`
3. Or add it to your project's `.cursorrules` file

### GitHub Copilot

Add the contents to your project's `.github/copilot-instructions.md` file.

### Windsurf / Codeium

Add to your project's AI context or rules configuration.

### Other AI Tools

Most AI coding assistants support some form of custom instructions or context. Copy the contents of `TWD_PROMPT.md` into the appropriate configuration.

## Contributing

If you find patterns or common issues that should be included in the AI guides, please open an issue or PR.
