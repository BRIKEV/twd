import { log } from "../utils/log";

export type Rule = {
  method: string;
  url: string | RegExp;
  response: unknown;
  alias?: string;
  executed?: boolean;
  request?: unknown;
  status?: number;
  headers?: Record<string, string>;
};

const rules: Rule[] = [];

export interface Options {
  method: string;
  url: string | RegExp;
  response: unknown;
  status?: number;
  headers?: Record<string, string>;
}

/**
 * Mock a network request.
 *
 * @param alias Identifier for the mock rule. Useful for `waitFor()`.
 * @param options Options to configure the mock:
 *  - `method`: HTTP method ("GET", "POST", …)
 *  - `url`: URL string or RegExp to match
 *  - `response`: Body of the mocked response
 *  - `status`: (optional) HTTP status code (default: 200)
 *  - `headers`: (optional) Response headers
 *
 * @example
 * ```ts
 * mockRequest("getUser", {
 *   method: "GET",
 *   url: /\/api\/user\/\d+/,
 *   response: { id: 1, name: "Kevin" },
 *   status: 200,
 *   headers: { "x-mock": "true" }
 * });
 * ```
 */
export const mockRequest = (alias: string, options: Options) => {
  const idx = rules.findIndex((r) => r.alias === alias);
  const rule = { alias, ...options, executed: false };

  if (idx !== -1) rules[idx] = rule;
  else rules.push(rule);
};

/**
 * Wait for a mocked request to be made.
 * @param alias The alias of the mock rule to wait for
 * @returns The matched rule (with body if applicable)
 */
export const waitFor = async (alias: string) => {
  // Find the rule that matches the alias and was executed
  const rule = rules.find((r) => r.alias === alias && r.executed);

  if (!rule) {
    throw new Error(`No intercept rule found for ${alias}`);
  }

  // Yield one tick so React can render
  await new Promise((r) => setTimeout(r, 0));
  return rule;
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
    rule.request = init?.body; // <-- capture body if present

    return new Response(JSON.stringify(rule.response), {
      status: rule.status || 200,
      headers: rule.headers || { "Content-Type": "application/json" },
    });
  }

  return originalFetch(input, init);
};
