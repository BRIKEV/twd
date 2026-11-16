// Compiled by scripts/check-consumer-types.sh against the packed tarball, under
// every moduleResolution mode a consumer might use.
//
// When a published .d.ts stops resolving, TypeScript gives the export an error
// type that behaves like `any` and suppresses further errors, so a type-level
// "is not any" check cannot see it. Instead, every export is misused below under
// `@ts-expect-error`: if the export loses its types, the misuse compiles, the
// directive becomes unused and tsc fails with TS2578 on that line.
import { twd, screenDom, screenDomGlobal, userEvent, expect, initTests, TWDSidebar } from 'twd-js';
import { describe, it, beforeEach, afterEach } from 'twd-js/runner';
import { twd as twdPlugin, twdHmr, removeMockServiceWorker, twdSnapshot } from 'twd-js/vite-plugin';
import { executeTests, reportResults } from 'twd-js/runner-ci';
import { MockedComponent } from 'twd-js/ui';
import { initTWD } from 'twd-js/bundled';

export function misuseEveryExport() {
  // twd-js
  // @ts-expect-error selector must be a string
  void twd.get(123);
  // @ts-expect-error role must be a string or matcher
  void screenDom.getByRole(123);
  // @ts-expect-error role must be a string or matcher
  void screenDomGlobal.getByRole(123);
  // @ts-expect-error click needs an element
  void userEvent.click('button');
  // @ts-expect-error expect needs a value
  expect();
  // @ts-expect-error initTests needs its arguments
  initTests();
  // @ts-expect-error TWDSidebar needs props
  TWDSidebar();

  // twd-js/runner
  // @ts-expect-error name must be a string
  describe(123, () => {});
  // @ts-expect-error name must be a string
  it(123, () => {});
  // @ts-expect-error hook must be a function
  beforeEach(123);
  // @ts-expect-error hook must be a function
  afterEach(123);

  // twd-js/vite-plugin
  // @ts-expect-error options must be an object
  twdPlugin(123);
  // @ts-expect-error options must be an object
  twdHmr(123);
  // @ts-expect-error options must be an object
  removeMockServiceWorker(123);
  // @ts-expect-error options must be an object
  twdSnapshot(123);

  // twd-js/runner-ci
  // @ts-expect-error executeTests takes no arguments
  void executeTests(123);
  // @ts-expect-error reportResults needs handlers and results
  reportResults();

  // twd-js/ui
  // @ts-expect-error MockedComponent needs name and children
  MockedComponent({});

  // twd-js/bundled
  // @ts-expect-error test modules must be an object
  initTWD(123);
}

// The case from issue #434: elements and assertion names stay typed.
describe('App', () => {
  it('checks list items', async () => {
    const items = await twd.getAll('li');
    items.forEach((item) => {
      item.should('be.visible');
    });
    const heading = await screenDom.findByRole('heading', { level: 1 });
    // @ts-expect-error not a valid assertion name
    twd.should(heading, 'not.a.valid.assertion');
  });
});
