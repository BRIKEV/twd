export const waitForElement = (fn: () => HTMLElement | null, timeout = 2000, interval = 50) => {
  return new Promise<HTMLElement>((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      const el = fn();
      if (el) return resolve(el);
      if (Date.now() - start > timeout) return reject(new Error("Timeout waiting for element"));
      setTimeout(check, interval);
    };

    check();
  });
};