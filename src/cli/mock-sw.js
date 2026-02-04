import { findRule } from './utils/findRule.js';
import { notifyClients } from './utils/notifyClients.js';
import { mockResponse } from './utils/mockResponse.js';
import { TWD_VERSION } from '../constants/version_cli.js';

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

        // Mark executed and notify page (await to prevent race condition)
        const clients = await self.clients.matchAll();
        notifyClients(clients, rule, body);

        return mockResponse(
          rule.response,
          rule.status ?? 200,
          rule.responseHeaders
        );
      })()
    );
  }
};

const isValidVersion = (version) => {
  if (version !== TWD_VERSION) {
    console.warn(
      `[TWD] ⚠️ Version mismatch detected:
Client version: ${version}
Service Worker version: ${TWD_VERSION}

This may lead to unexpected behavior.
Please unregister the Service Worker and reload the page to ensure compatibility.

To reinstall:
  npx twd-js init public --save

Docs: https://brikev.github.io/twd/api-mocking.html#_1-install-mock-service-worker`
    );
  }
};


export const handleMessage = (event) => {
  const { type, rule, version } = event.data || {};
  isValidVersion(version);
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

self.addEventListener('install', () => {
  self.skipWaiting(); // Don't wait, activate immediately
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Take control of all pages immediately
});

// console.log command to tell current version
console.log(`[TWD] Mock Service Worker loaded - version ${TWD_VERSION}`);
// Intercept fetches
self.addEventListener("fetch", handleFetch);

// Listen for messages from the app
self.addEventListener("message", handleMessage);
