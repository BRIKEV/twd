import { findRule } from './utils/findRule.js';
import { notifyClients } from './utils/notifyClients.js';

/**
 * List of currently active mock rules.
 * @type {Rule[]}
 */
export let rules = [];

export const handleFetch = async (event) => {
  const { method } = event.request;
  const url = event.request.url;

  const rule = findRule(method, url, rules);

  if (rule) {
    console.log("[TWD] Mock hit:", rule.alias, method, url);

    event.respondWith(
      (async () => {
        // Capture body if needed
        let body = null;
        const requestContentType = event.request.headers.get("content-type") || "application/json";
        console.log("[TWD] Request content-type:", requestContentType);
        
        if (requestContentType.includes("application/json")) {
          try {
            body = await event.request.clone().json();
          } catch {}
        } else if (requestContentType.includes("form")) {
          try {
            const formData = await event.request.clone().formData();
            body = {};
            formData.forEach((value, key) => {
              body[key] = value;
            });
          } catch {}
        } else if (requestContentType.includes("text")) {
          try {
            body = await event.request.clone().text();
          } catch {}
        } else if (requestContentType.includes("octet-stream")) {
          try {
            body = await event.request.clone().arrayBuffer();
          } catch {}
        } else if (requestContentType.includes("image")) {
          try {
            body = await event.request.clone().blob();
          } catch {}
        } else {
          try {
            body = await event.request.clone().text();
          } catch {}
        }

        // Mark executed and notify page
        self.clients.matchAll().then((clients) => {
          notifyClients(clients, rule, body);
        });

        return new Response(JSON.stringify(rule.response), {
          status: rule.status || 200,
          headers: rule.responseHeaders || { "Content-Type": "application/json" },
        });
      })()
    );
  }
};

export const handleMessage = (event) => {
  const { type, rule } = event.data || {};
  if (type === "ADD_RULE") {
    rules = rules.filter((r) => r.alias !== rule.alias);
    rules.push(rule);
    console.log("[TWD] Rule added:", rule);
  }
  if (type === "CLEAR_RULES") {
    rules = [];
    console.log("[TWD] All rules cleared");
  }
};

// Intercept fetches
self.addEventListener("fetch", handleFetch);

// Listen for messages from the app
self.addEventListener("message", handleMessage);
