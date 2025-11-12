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

        // Mark executed and notify page
        self.clients.matchAll().then((clients) => {
          notifyClients(clients, rule, body);
        });

        return mockResponse(
          rule.response,
          rule.status ?? 200,
          rule.responseHeaders
        );
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
