import type { Handler } from "../../runner";
import { LogType } from "./formatLogs";

/**
 * Generate screen reader message for a specific test result
 */
export const displaySRMessageSpecificTest = (test: Handler): string => {
  if (test.status === "pass") {
    return `Test "${test.name}" passed.`;
  } else if (test.status === "fail") {
    if (!test.logs || test.logs.length === 0) {
      return `Test "${test.name}" failed.`;
    }
    
    const lastLog = test.logs[test.logs.length - 1];
    try {
      const parsed = JSON.parse(lastLog);
      if (parsed.type === LogType.CHAI_MESSAGE || parsed.type === LogType.ERROR) {
        return `Test "${test.name}" failed. ${parsed.message}`;
      } else if (parsed.type === LogType.CHAI_DIFF) {
        return `Test "${test.name}" failed. Expected value does not match actual value.`;
      }
      return `Test "${test.name}" failed.`;
    } catch {
      // If log is not valid JSON, treat it as plain text
      return `Test "${test.name}" failed. ${lastLog}`;
    }
  } else if (test.status === "skip") {
    return `Test "${test.name}" skipped.`;
  }
  return '';
};

/**
 * Generate screen reader message for all tests result
 */
export const displaySRMessageAllTests = (tests: Handler[]): string => {
  const testItems = tests.filter(t => t.type === "test");
  const passed = testItems.filter(t => t.status === "pass").length;
  const failed = testItems.filter(t => t.status === "fail").length;
  const skipped = testItems.filter(t => t.status === "skip").length;
  
  const parts: string[] = [];
  
  if (failed > 0) {
    parts.push(`Test run completed.`);
    parts.push(`${passed} test${passed !== 1 ? 's' : ''} passed`);
    parts.push(`${failed} test${failed !== 1 ? 's' : ''} failed`);
    if (skipped > 0) {
      parts.push(`${skipped} test${skipped !== 1 ? 's' : ''} skipped`);
    }
    return parts.join(', ') + '.';
  } else {
    parts.push(`All tests passed.`);
    parts.push(`${passed} test${passed !== 1 ? 's' : ''} completed`);
    if (skipped > 0) {
      parts.push(`${skipped} test${skipped !== 1 ? 's' : ''} skipped`);
    }
    return parts.join(', ') + '.';
  }
};
