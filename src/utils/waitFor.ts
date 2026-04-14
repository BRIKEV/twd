import type { WaitForOptions } from '../twd-types';
import { log } from './log';

export const waitFor = (
  callback: () => void | Promise<void>,
  options?: WaitForOptions,
): Promise<void> => {
  const timeout = options?.timeout ?? 2000;
  const interval = options?.interval ?? 50;
  const message = options?.message;

  return new Promise<void>((resolve, reject) => {
    const start = Date.now();
    let lastError: Error | null = null;

    const attempt = async () => {
      try {
        await callback();
        const logMsg = message
          ? `waitFor: resolved (${message})`
          : 'waitFor: resolved';
        log(logMsg);
        resolve();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        if (Date.now() - start >= timeout) {
          const base = `waitFor timed out after ${timeout}ms`;
          const context = message ? ` waiting for: ${message}` : '';
          const detail = lastError ? `\nLast error: ${lastError.message}` : '';
          reject(new Error(`${base}${context}.${detail}`));
          return;
        }

        setTimeout(attempt, interval);
      }
    };

    attempt();
  });
};
