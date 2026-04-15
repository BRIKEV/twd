import type { WaitForOptions } from '../twd-types';
import { log } from './log';

export const waitFor = <T>(
  callback: () => T | Promise<T>,
  options?: WaitForOptions,
): Promise<T> => {
  const timeout = options?.timeout ?? 2000;
  const interval = options?.interval ?? 50;
  const message = options?.message;

  return new Promise<T>((resolve, reject) => {
    const start = Date.now();
    let settled = false;

    const attempt = async () => {
      try {
        const result = await callback();
        if (settled) return;
        settled = true;
        const logMsg = message
          ? `waitFor: resolved (${message})`
          : 'waitFor: resolved';
        log(logMsg);
        resolve(result);
      } catch (err) {
        if (settled) return;
        const lastError = err instanceof Error ? err : new Error(String(err));

        if (Date.now() - start >= timeout) {
          settled = true;
          const base = `waitFor timed out after ${timeout}ms`;
          const context = message ? ` waiting for: ${message}` : '';
          const detail = `\nLast error: ${lastError.message}`;
          reject(new Error(`${base}${context}.${detail}`));
          return;
        }

        setTimeout(attempt, interval);
      }
    };

    attempt();
  });
};
