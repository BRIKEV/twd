import { it, twd } from "../../../../src/twd";

it("assertion examples", async () => {
  await twd.visit("/assertions");

  // have.text
  const haveText = await twd.get("#have-text");
  haveText.should("have.text", "Hello");

  // contain.text
  const containText = await twd.get("#contain-text");
  containText.should("contain.text", "world");

  // be.empty
  const beEmpty = await twd.get("#be-empty");
  beEmpty.should("be.empty");

  // have.attr
  const haveAttr = await twd.get("#have-attr");
  haveAttr.should("have.attr", "placeholder", "Type here");

  // have.value
  const haveValue = await twd.get("#have-value");
  haveValue.should("have.value", "test value");

  // be.disabled
  const beDisabled = await twd.get("#be-disabled");
  beDisabled.should("be.disabled");

  // be.enabled
  const beEnabled = await twd.get("#be-enabled");
  beEnabled.should("be.enabled");

  // be.checked
  const beChecked = await twd.get("#be-checked");
  beChecked.should("be.checked");

  // be.focused
  const labelFocused = await twd.get("#label-focused");
  labelFocused.click();
  const beFocused = await twd.get("#be-focused");
  beFocused.should("be.focused");

  // be.visible
  const beVisible = await twd.get("#be-visible");
  beVisible.should("be.visible");

  // have.class
  const haveClass = await twd.get("#have-class");
  haveClass.should("have.class", "my-class");

  // be.selected
  const beSelected = await twd.get("#be-selected option[value='two']");
  beSelected.should("be.selected");
});
