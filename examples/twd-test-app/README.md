# TWD Test App

This is a test application for TWD. It is a simple application that demonstrates the use of TWD. We used it to test the TWD library and its features.

## Installation

To install the dependencies, run the following command:

```bash
npm install
```

## Running the application

To run the application, run the following command:

```bash
npm run dev
```

## AI Remote Testing (twd-relay)

This app includes [twd-relay](../../docs/ai-remote-testing.md) which lets AI agents (Claude Code, Cursor, Copilot) run TWD tests and read results via WebSocket — no browser automation needed.

The relay is configured as a Vite plugin in `vite.config.ts` and the browser client connects in `src/main.tsx`. Once the dev server is running, any WebSocket client can trigger tests at `ws://localhost:5173/__twd/ws`.
