import { findRule } from './utils/findRule.js';
import { notifyClients } from './utils/notifyClients.js';

// Storage for rules inside the SW
let rules = [];

// Intercept fetches
self.addEventListener("fetch", (event) => {
  const { method } = event.request;
  const url = event.request.url;

  const rule = findRule(method, url, rules);

  if (rule) {
    console.log("Mock hit:", rule.alias, method, url);

    event.respondWith(
      (async () => {
        // Capture body if needed
        let body = null;
        try {
          body = await event.request.clone().text();
        } catch {}

        // Mark executed and notify page
        self.clients.matchAll().then((clients) => {
          notifyClients(clients, rule, body);
        });

        return new Response(JSON.stringify(rule.response), {
          status: rule.status || 200,
          headers: rule.headers || { "Content-Type": "application/json" },
        });
      })()
    );
  }
});

// Listen for messages from the app
self.addEventListener("message", (event) => {
  const { type, rule } = event.data || {};
  if (type === "ADD_RULE") {
    rules = rules.filter((r) => r.alias !== rule.alias);
    rules.push(rule);
    console.log("Rule added:", rule);
  }
  if (type === "CLEAR_RULES") {
    rules = [];
    console.log("All rules cleared");
  }
});
