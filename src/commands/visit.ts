import { wait } from "../utils/wait";
import { log } from "../utils/log";

const DELAY = 100;

export const visit = async (url: string) => {
  log(`visit("${url}")`);

  // If already on same path, toggle to dummy route first
  if (window.location.pathname === url) {
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
