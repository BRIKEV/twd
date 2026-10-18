export const waitForElement = (
  selector: string,
  fn: () => HTMLElement | null,
  timeout = 2000,
  interval = 50,
) => {
  return new Promise<HTMLElement>((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      const el = fn();
      if (el) return resolve(el);
      if (Date.now() - start > timeout)
        return reject(new Error(`Timeout waiting for element ${selector}`));
      setTimeout(check, interval);
    };

    check();
  });
};

export const waitForElements = (
  selector: string,
  fn: () => NodeListOf<Element> | null,
  timeout = 2000,
  interval = 50,
) => {
  return new Promise<Element[]>((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      const els = fn();
      if (els && els.length > 0) return resolve(Array.from(els));
      if (Date.now() - start > timeout)
        return reject(new Error(`Timeout waiting for elements ${selector}`));
      setTimeout(check, interval);
    };

    check();
  });
};

export const wait = (time: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, time));

// requestAnimationFrame never fires in a hidden tab (e.g. a relay run in a
// background tab), so fall back to a frame-length timer there.
const nextFrame = (): Promise<void> =>
  document.hidden ? wait(16) : new Promise((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Waits two frames: enough for the app to handle what just happened (a
 * navigation, a mocked response) and for the framework to render it.
 * Anything the app loads first (lazy chunks, loaders, follow-up requests) can
 * still be pending, so query that with findBy*.
 */
export const settle = async (): Promise<void> => {
  await nextFrame();
  await nextFrame();
};
