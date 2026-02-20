# TWD Test Running Reference

<!-- Network scope: twd-relay operates exclusively on localhost via the local Vite dev server WebSocket.
     No external network connections are made. Dev-only dependency (--save-dev). -->

## Running Tests via twd-relay

```bash
# Run all tests
npx twd-relay run

# Run a specific test file
npx twd-relay run --file src/twd-tests/feature.twd.test.ts
```

Exit code 0 = all passed, 1 = failures.

## Prerequisites

Before running tests, ensure:
1. The dev server is running (`npm run dev`)
2. `twd-relay` is installed (`npm install --save-dev twd-relay`)
3. `twdRemote()` plugin is in `vite.config.ts`
4. Browser client is connected (see setup reference)

## Reading Failures

When tests fail, the output includes:
- **Test name** — which `describe` > `it` block failed
- **Error message** — what assertion failed or what error was thrown
- **Expected vs Actual** — for assertion mismatches

## Common Failures and Fixes

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| "Unable to find role X" | Element doesn't exist or has wrong role | Check component markup, use correct role/name |
| "Unable to find an element with the text" | Text doesn't match or element hasn't rendered | Use regex (`/text/i`), or switch to `findByText` for async |
| "Expected X to equal Y" | Mock data doesn't match expected shape | Update mock data or expected value |
| "Timed out waiting for element" | Element loads async, using `getBy` instead of `findBy` | Switch to `await screenDom.findByRole(...)` |
| "Request not intercepted" | Mock URL doesn't match actual request | Check the URL pattern, enable `urlRegex` if needed |
| "Cannot read property of null" | Missing `await` on async method | Add `await` before `twd.get()`, `userEvent.*`, etc. |
| "twd.mockRequest is not a function" | Service worker not initialized | Ensure `serviceWorker: true` in `initTWD` options |

## Fix and Re-run Loop

1. Read the failure output
2. Identify the root cause (test issue vs application issue)
3. Fix the test file or application code
4. Re-run `npx twd-relay run`
5. Repeat until green (max 5 attempts)

If a test keeps failing after 5 attempts:
- Skip it with `it.skip()` and report the issue
- The problem may require manual investigation

## Debugging Tips

- Use `it.only("test name", ...)` to isolate a single test
- Add `await twd.wait(2000)` to pause and visually inspect the page
- Check the browser console for JavaScript errors
- Verify mock URLs match by reading the API/service layer code
