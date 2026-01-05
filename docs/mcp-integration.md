# MCP Integration

TWD MCP (Model Context Protocol) server enables AI assistants (Cursor, Claude Desktop) to generate TWD tests from browser automation data. It works in conjunction with **Playwright MCP** to execute browser actions programmatically and automatically generate test code.

## Overview

The TWD MCP server focuses on **data transformation**—converting browser automation data into TWD test code. Browser capture is handled by Playwright MCP, which provides:

- **Semantic alignment**: Playwright uses accessibility tree snapshots that map perfectly to TWD's `screenDom` (Testing Library) approach
- **Structured data**: Playwright provides clean, structured interaction data ideal for code generation
- **Cross-browser**: Works across Chromium, Firefox, and WebKit
- **Test-focused**: Built specifically for automation and testing scenarios

## Architecture

```
Playwright MCP (captures) → AI (orchestrates) → TWD MCP (generates test code)
```

## Installation

Add both Playwright MCP and TWD MCP to your AI assistant configuration. Both servers run via `npx`, so no local installation is required.

**For Cursor**: Edit `~/.cursor/mcp.json` (create if it doesn't exist)

**For Claude Desktop**: Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    },
    "twd-mcp": {
      "command": "npx",
      "args": ["twd-mcp@latest"]
    }
  }
}
```

::: tip Version Pinning
For stability, you can pin to a specific version:
- `"twd-mcp@1.0.0"` - Pin to specific version (recommended for stability)
- `"twd-mcp@^1.0.0"` - Allow patch and minor updates
- `"twd-mcp@latest"` - Always use latest version
:::

After configuration, restart your AI assistant (Cursor or Claude Desktop).

## How It Works

The TWD MCP server provides tools that your AI assistant uses automatically to generate TWD tests. You don't need to call these tools directly—just describe what you want to test, and the AI will use Playwright MCP to capture browser interactions and TWD MCP to generate the test code.

## Usage

Once configured, you can ask your AI assistant to generate TWD tests from browser interactions. Simply describe what you want to test, and the AI will use Playwright to automate the actions and generate the test code.

### Example Prompts

Here are some example prompts you can try in Cursor or Claude Desktop:

**Generate a test from a user flow:**
> "Use Playwright to navigate to my app at `http://localhost:5173`, click the login button, fill the email field with test@example.com, fill the password field with password123, click submit, then generate a TWD test from those actions"

**Test a specific interaction:**
> "Use Playwright to navigate to example.com, click the 'Get Started' button, then generate a TWD test for that interaction"

**Test with API mocking:**
> "Use Playwright to navigate to my app, click the 'Load Data' button, capture the network requests, and generate a TWD test with mocks for those API calls"

::: note
Playwright MCP executes actions programmatically based on your description—it doesn't manually record your browser interactions. You describe what should happen, and Playwright MCP executes those actions and captures the data automatically.
:::

### What Happens Behind the Scenes

When you ask for a test to be generated, the AI will:
1. Use Playwright MCP to navigate to your app and execute the described actions
2. Capture DOM snapshots with accessibility tree data (perfect for Testing Library queries)
3. Capture network requests and responses
4. Use TWD MCP to transform this data into a complete TWD test file
5. Output the generated test code ready to use in your project

### Example Generated Output

The generated test will follow TWD best practices, using Testing Library queries via `screenDom` and proper async/await patterns:

```typescript
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";

describe("Login flow", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("should complete the recorded flow", async () => {
    // Define mocks before interactions
    twd.mockRequest("LoginRequest", {
      method: "POST",
      url: "/api/login",
      response: { token: "abc123" },
      status: 200
    });

    await twd.visit("/");
    await userEvent.click(screenDom.getByRole('button', { name: /login/i }));
    await userEvent.type(screenDom.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screenDom.getByLabelText(/password/i), 'password123');
    await userEvent.click(screenDom.getByRole('button', { name: /submit/i }));
    
    // Assertions
    const successMessage = screenDom.getByText(/welcome/i);
    twd.should(successMessage, "be.visible");
  });
});
```

The generated tests are ready to use—just save them to a `.twd.test.ts` file in your project and they'll appear in your TWD sidebar!

## Troubleshooting

**MCP server not found**: Make sure you've restarted Cursor or Claude Desktop after adding the configuration.

**Tests not generating**: Ensure both Playwright MCP and TWD MCP are configured in your `mcp.json` file.

**Generated tests don't work**: The generated tests follow TWD patterns. Make sure you have TWD set up in your project—see the [Getting Started](/getting-started) guide.

## Resources

- 📦 [View on npm](https://www.npmjs.com/package/twd-mcp)
- 🐛 [Report bugs](https://github.com/BRIKEV/twd-mcp/issues)
- 📖 [GitHub Repository](https://github.com/BRIKEV/twd-mcp)

