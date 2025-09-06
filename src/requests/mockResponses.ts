import { log } from "../utils/log";

// twd-intercept.ts
type Rule = {
  method: string;
  url: string | RegExp;
  response: unknown;
  alias?: string;
  executed?: boolean; // mark when fetch hits this rule
};

const rules: Rule[] = [];

// Define or overwrite a mock
export const mockRequest = (alias: string, method: string, url: string | RegExp, response: unknown) => {
  const idx = rules.findIndex((r) => r.alias === alias);
  const rule = { alias, method: method.toUpperCase(), url, response, executed: false };

  if (idx !== -1) rules[idx] = rule;
  else rules.push(rule);
};

// Wait for a request by alias
// Wait for a request by URL
export const waitFor = async (alias: string) => {
  // Find the rule that matches the alias and was executed
  const rule = rules.find((r) => r.alias === alias && r.executed);

  if (!rule) {
    throw new Error(`No intercept rule found for ${alias}`);
  }

  // Yield one tick so React can render
  await new Promise((r) => setTimeout(r, 0));
};



// Patch fetch once
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo, init?: RequestInit) => {
  const method = init?.method?.toUpperCase() || "GET";
  const url = typeof input === "string" ? input : input.toString();

  const rule = rules.find(
    (r) =>
      r.method === method &&
      (typeof r.url === "string" ? r.url === url : r.url.test(url))
  );

  if (rule) {
    log(`🛡️ ${rule.alias} → ${method} ${url}`);
    rule.executed = true; // <-- mark it executed

    return new Response(JSON.stringify(rule.response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return originalFetch(input, init);
};
