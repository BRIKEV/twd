import { handlers } from "../runner";

export const log = (msg: string) => {
  const current = handlers.size
    ? Array.from(handlers.values()).find((h) => h.status === "running")
    : null;
  if (current) {
    current.logs?.push(msg);
  }
};
