import chalk from 'chalk';
import { Handler } from "./runner";

export interface TestResult {
  id: string;
  status: 'pass' | 'fail' | 'skip';
  error?: string;
}

export const reportResults = (handlers: Map<string, Handler>, testResults: TestResult[]) => {
  const roots = [...handlers.values()].filter(h => !h.parent);

  const printHandler = (handler: Handler, indent = 0) => {
    const prefix = '  '.repeat(indent);
    const entry = testResults.find(r => r.id === handler.id);
    
    let icon = '';
    let errorMsg = '';
    if (handler.type !== 'suite') {
      if (entry?.status === 'pass') {
        icon = chalk.green('✓');
      } else if (entry?.status === 'fail') {
        icon = chalk.red('✗');
        errorMsg = ` - Error: ${entry.error}`;
      } else {
        icon = chalk.yellow('○');
      }
    }

    const label = handler.type === 'suite'
      ? `${prefix}${handler.name}`
      : `${prefix}${icon} ${handler.name}`;

    console.log(label);

    if (errorMsg) {
      console.log(chalk.red(`${prefix}${errorMsg}`));
    }

    if (handler.children) {
      for (const childId of handler.children) {
        const child = handlers.get(childId);
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
