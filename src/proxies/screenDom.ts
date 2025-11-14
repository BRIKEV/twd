import { screen, configure } from '@testing-library/dom';
import { log } from '../utils/log';
import { domMessage } from './domMessage';

type ScreenDom = typeof screen;

function createLoggedProxy(obj: any, prefix = 'screen') {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const orig = Reflect.get(target, prop, receiver);
      if (typeof orig !== 'function') return orig;

      return (...args: any[]) => {
        const result = orig(...args);
        log(domMessage(prefix, prop, args));
        return result;
      };
    },
  });
}

export const screenDom: ScreenDom = createLoggedProxy(screen);

configure({
  getElementError(message) {
    return new Error(`${message}`);
  },
});
export const configureScreenDom: typeof configure = configure;
