import { twd, userEvent } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("Example Test Suite", () => {
  it("should click read docs", async () => {
    const readDocsButton = await twd.get("button[data-testid='read-doc']");
    await userEvent.click(readDocsButton.el);
    // aaa
  });
});