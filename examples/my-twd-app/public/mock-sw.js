// mock-sw.js

// Storage for rules inside the SW
let rules = [];

/**
 * Match a request against rules
 */
const findRule = (method, url) => {
  return rules.find(
    (r) =>
      r.method === method &&
      (typeof r.url === "string" ? r.url === url : new RegExp(r.url).test(url))
  );
};

// Intercept fetches
self.addEventListener("fetch", (event) => {
  const { method } = event.request;
  const url = event.request.url;

  const rule = findRule(method, url);

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
          clients.forEach((client) =>
            client.postMessage({
              type: "EXECUTED",
              alias: rule.alias,
              request: body,
            })
          );
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
});
