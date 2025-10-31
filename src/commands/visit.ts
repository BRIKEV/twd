import { wait } from "../utils/wait";
import { log } from "../utils/log";

const DELAY = 100;

export const visit = async (url: string): Promise<void> => {
  log(`visit("${url}")`);
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
  await wait(DELAY);
};
