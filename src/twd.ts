import { register, tests } from "./twdRegistry";

let beforeEachFn: (() => void | Promise<void>) | null = null;

export const beforeEach = (fn: typeof beforeEachFn) => {
  beforeEachFn = fn;
};

export const describe = (_: string, fn: () => void) => {
  fn(); // for now, just run immediately
};

export const it = (name: string, fn: () => Promise<void> | void) => {
  register(name, async () => {
    if (beforeEachFn) await beforeEachFn();
    await fn();
  });
};

export const itOnly = (name: string, fn: () => Promise<void> | void) => {
  register(name, async () => {
    if (beforeEachFn) await beforeEachFn();
    await fn();
  }, { only: true });
};

export const itSkip = (name: string, _fn: () => Promise<void> | void) => {
  register(name, async () => {}, { skip: true });
};

export const log = (msg: string) => {
  // find the currently "running" test
  const current = tests.find(t => t.status === "running");
  if (current) {
    current.logs?.push(msg);
  }
};

const waitFor = (fn: () => HTMLElement | null, timeout = 2000, interval = 50) => {
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

// Mini Cypress-style helpers
export const twd = {
  get: async (selector: string) => {
    log(`🔎 get("${selector}")`);
    const el = await waitFor(() => document.querySelector(selector));

    return {
      el,
      click: () => {
        log(`🖱️ click(${selector})`);
        el.click();
      },
      type: (text: string) => {
        log(`⌨️ type("${text}") into ${selector}`);
        (el as HTMLInputElement).value = text;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        return el as HTMLInputElement;
      },
      text: () => {
        const content = el.textContent || "";
        log(`📄 text(${selector}) → "${content}"`);
        return content;
      },
    };
  },
  visit: (url: string) => {
    log(`🌍 visit("${url}")`);
    window.history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
};