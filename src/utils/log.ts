import { tests } from "../twdRegistry";

export const log = (msg: string) => {
  // find the currently "running" test
  const current = tests.find(t => t.status === "running");
  if (current) {
    current.logs?.push(msg);
  }
};
