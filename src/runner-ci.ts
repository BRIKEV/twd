import { Handler } from "./runner";

// ANSI color codes
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';

interface TestResult {
  id: string;
  status: 'pass' | 'fail' | 'skip';
  error?: string;
}

export const reportResults = (handlers: Handler[], testResults: TestResult[]) => {
  const roots = [...handlers].filter(h => !h.parent);

  const printHandler = (handler: Handler, indent = 0) => {
    const prefix = '  '.repeat(indent);
    const entry = testResults.find(r => r.id === handler.id);
    
    let icon = '';
    let errorMsg = '';
    if (handler.type !== 'suite') {
      if (entry?.status === 'pass') {
        icon = `${GREEN}✓${RESET}`;
      } else if (entry?.status === 'fail') {
        icon = `${RED}✗${RESET}`;
        errorMsg = ` - Error: ${entry.error}`;
      } else {
        icon = `${YELLOW}○${RESET}`;
      }
    }

    const label = handler.type === 'suite'
      ? `${prefix}${handler.name}`
      : `${prefix}${icon} ${handler.name}`;

    console.log(label);

    if (errorMsg) {
      console.log(`${RED}${prefix}${errorMsg}${RESET}`);
    }

    if (handler.children) {
      for (const childId of handler.children) {
        const child = handlers.find(h => h.id === childId);
        if (child) printHandler(child, indent + 1);
      }
    }
  };

  for (const root of roots) printHandler(root);
};

export const executeTests = async (): Promise<{ handlers: Handler[], testStatus: TestResult[] }> => {
  const TestRunner = window.__testRunner;
  const testStatus: TestResult[] = [];
  const runner = new TestRunner({
    onStart: () => {},
    onPass: (test: Handler) => {
      testStatus.push({ id: test.id, status: "pass" });
    },
    onFail: (test: Handler, err: Error) => {
      testStatus.push({ id: test.id, status: "fail", error: err.message });
    },
    onSkip: (test: Handler) => {
      testStatus.push({ id: test.id, status: "skip" });
    },
  });
  const handlers = await runner.runAll();
  return { handlers: Array.from(handlers.values()), testStatus };
};
