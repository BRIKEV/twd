import userEventLib from '@testing-library/user-event';
import { log } from '../utils/log';
import { eventsMessage } from './eventsMessage';

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
        const result = await orig(...args);
        log(eventsMessage(prefix, prop, args));
        return result;
      };
    },
  });
}

export const userEvent: UserEvent = createLoggedProxy(userEventLib);
