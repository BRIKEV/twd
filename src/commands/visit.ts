import { wait } from "../utils/wait";
import { log } from "../utils/log";

const DELAY = 100;

export const visit = async (url: string, reload?: boolean): Promise<void> => {
  log(`visit("${url}")`);

  if (window.location.pathname === url || reload) {
    const dummy = `/__dummy_${Math.random().toString(36).slice(2)}`;
    window.history.pushState({}, "", dummy);
    window.dispatchEvent(new PopStateEvent("popstate"));
    await wait(10);
  }

  // Then navigate to the target route
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
  await wait(DELAY);
};
