import { twd, screenDom, userEvent, expect } from "../../../../src";
import { describe, it } from "../../../../src/runner";

/**
 * Tests the <input type="file"> pattern: a valid image upload should display
 * its filename, and a non-image upload should surface a visible error.
 *
 * Drives the input with userEvent.upload(input, file) and queries the result
 * via Testing Library's screenDom (getByLabelText / getByText / getByRole)
 * rather than the legacy twd.get() API.
 */
describe("File Upload", () => {
  it("displays the filename after uploading a valid image", async () => {
    await twd.visit("/file-upload");

    const input = screenDom.getByLabelText(/upload an image/i);
    const file = new File(["(binary)"], "photo.png", { type: "image/png" });

    await userEvent.upload(input, file);

    // The selected filename should be shown and visible
    const filename = screenDom.getByText("photo.png");
    twd.should(filename, "be.visible");
  });

  it("shows an error and no filename when a non-image file is uploaded", async () => {
    await twd.visit("/file-upload");

    const input = screenDom.getByLabelText(/upload an image/i);
    const file = new File(["not an image"], "notes.txt", { type: "text/plain" });

    await userEvent.upload(input, file);

    // The error should be visible...
    const error = screenDom.getByRole("alert");
    twd.should(error, "be.visible");

    // ...and no filename should have been rendered
    const filename = screenDom.queryByTestId("uploaded-filename");
    expect(filename).to.be.null;
  });
});
