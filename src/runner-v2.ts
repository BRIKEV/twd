interface Handler {
  id: string;
  name: string;
  parent?: string;
  handler: () => void | Promise<void>;
  children?: string[];
  type: 'suite' | 'test';
  depth: number;
  only?: boolean;
  skip?: boolean;
}

type HookFn = () => void | Promise<void>;

const handlers = new Map<string, Handler>();
const beforeEachHooks = new Map<string, HookFn[]>();
const afterEachHooks = new Map<string, HookFn[]>();
const stack: string[] = [];

const generateId = () => Math.random().toString(36).substr(2, 9);

//
// Suite definition
//
const describe = (name: string, handler: () => void) => {
  const id = generateId();
  const parent = stack.at(-1);
  handlers.set(id, {
    id,
    name,
    type: 'suite',
    children: [],
    depth: stack.length,
    parent,
    handler,
  });
  if (parent) handlers.get(parent)!.children!.push(id);

  stack.push(id);
  handler();
  stack.pop();
};

//
// Test definition
//
const it = (name: string, handler: () => void | Promise<void>) => {
  const id = generateId();
  const parent = stack.at(-1);
  const h: Handler = {
    id,
    name,
    type: 'test',
    depth: stack.length,
    handler,
    parent,
  };
  if (parent) handlers.get(parent)!.children!.push(id);
  handlers.set(id, h);
};

// Aliases for it.only and it.skip
it.only = (name: string, handler: () => void | Promise<void>) => {
  const id = generateId();
  const parent = stack.at(-1);
  const h: Handler = {
    id,
    name,
    type: 'test',
    depth: stack.length,
    handler,
    parent,
    only: true,
  };
  if (parent) handlers.get(parent)!.children!.push(id);
  handlers.set(id, h);
};

it.skip = (name: string, handler?: () => void | Promise<void>) => {
  const id = generateId();
  const parent = stack.at(-1);
  const h: Handler = {
    id,
    name,
    type: 'test',
    depth: stack.length,
    handler: handler || (() => {}),
    parent,
    skip: true,
  };
  if (parent) handlers.get(parent)!.children!.push(id);
  handlers.set(id, h);
};

//
// Hooks
//
const beforeEach = (fn: HookFn) => {
  const currentSuite = stack.at(-1);
  if (!currentSuite) throw new Error('beforeEach() must be inside a describe()');
  if (!beforeEachHooks.has(currentSuite)) beforeEachHooks.set(currentSuite, []);
  beforeEachHooks.get(currentSuite)!.push(fn);
};

const afterEach = (fn: HookFn) => {
  const currentSuite = stack.at(-1);
  if (!currentSuite) throw new Error('afterEach() must be inside a describe()');
  if (!afterEachHooks.has(currentSuite)) afterEachHooks.set(currentSuite, []);
  afterEachHooks.get(currentSuite)!.push(fn);
};

const collectHooks = (suiteId: string) => {
  const before: HookFn[] = [];
  const after: HookFn[] = [];
  let current: string | undefined = suiteId;
  while (current) {
    if (beforeEachHooks.has(current)) before.unshift(...beforeEachHooks.get(current)!);
    if (afterEachHooks.has(current)) after.push(...afterEachHooks.get(current)!);
    current = handlers.get(current)?.parent;
  }
  return { before, after };
};

const clearTests = () => {
  handlers.clear();
  beforeEachHooks.clear();
  afterEachHooks.clear();
};


describe("Root Suite", () => {
  beforeEach(() => console.log("  (beforeEach root)"));
  afterEach(() => console.log("  (afterEach root)"));

  describe("Nested Suite", () => {
    beforeEach(() => console.log("    (beforeEach nested)"));
    afterEach(() => console.log("    (afterEach nested)"));

    it("works fine", () => {
      console.log("      Running test 1");
    });

    it.skip("is skipped", () => {
      console.log("      Skipped test");
    });

    it.only("runs exclusively", () => {
      console.log("      Running only test");
    });
  });
});

//
// Run logic
//
async function run() {
  const rootSuites = Array.from(handlers.values()).filter(h => !h.parent && h.type === 'suite');

  const runSuite = async (suite: Handler) => {
    console.log(`Suite: ${suite.name}`);
    const tests = (suite.children || []).map(id => handlers.get(id)!);

    for (const child of tests) {
      if (child.type === 'suite') {
        await runSuite(child);
      } else if (child.type === 'test') {
        if (child.skip) {
          console.log(`  ⏭️  Skipped: ${child.name}`);
          continue;
        }

        // check .only filtering
        if (hasOnly && !child.only) continue;

        const hooks = collectHooks(child.parent!);
        for (const hook of hooks.before) await hook();
        try {
          await child.handler();
          console.log(`  ✅ Passed: ${child.name}`);
        } catch (e) {
          console.error(`  ❌ Failed: ${child.name}`, e);
        }
        for (const hook of hooks.after) await hook();
      }
    }
  };

  const hasOnly = Array.from(handlers.values()).some(h => h.only);

  for (const suite of rootSuites) {
    await runSuite(suite);
  }
}

run();