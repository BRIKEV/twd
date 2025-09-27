import userEventLib from '@testing-library/user-event';
import { log } from '../utils/log';

type UserEvent = typeof userEventLib;

function createLoggedProxy(obj: any, prefix = 'userEvent') {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const orig = Reflect.get(target, prop, receiver);
      if (typeof orig !== 'function') return orig;

      // Special handling for setup
      if (prop === 'setup') {
        return (...args: any[]) => {
          const instance = orig(...args);
          // Proxy the returned instance
          return createLoggedProxy(instance, `${prefix}.instance`);
        };
      }

      return async (...args: any[]) => {
        try {
          const result = await orig(...args);
          // Success log
          log(`Assertion passed: ${prefix}.${String(prop)} finished`);
          return result;
        } catch (err) {
          // Failure log
          log(`Assertion failed: ${prefix}.${String(prop)} failed: ${(err as Error).message}`);
          throw err;
        }
      };
    },
  });
}

export const userEvent: UserEvent = createLoggedProxy(userEventLib);
