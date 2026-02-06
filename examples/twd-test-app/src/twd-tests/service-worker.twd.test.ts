import { twd, expect } from "../../../../src";
import { describe, it, beforeEach } from "../../../../src/runner";

/**
 * Service Worker Integration Tests
 *
 * These tests verify the mock service worker functionality works correctly
 * in a real browser environment. They test the fixes made to:
 * - Request interception and mocking
 * - Body capture for different content types
 * - Custom response headers and status codes
 * - Versioned API path handling
 * - Multiple concurrent mocks
 */
describe("Service Worker Integration", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  describe("Basic Request Mocking", () => {
    it("intercepts and mocks GET requests", async () => {
      await twd.mockRequest("basicGet", {
        method: "GET",
        url: "/api/sw-test/basic",
        response: { mocked: true, timestamp: Date.now() }
      });

      const response = await fetch("/api/sw-test/basic");
      const data = await response.json();

      expect(data.mocked).to.equal(true);
      expect(data.timestamp).to.be.a("number");
    });

    it("intercepts and mocks POST requests", async () => {
      await twd.mockRequest("basicPost", {
        method: "POST",
        url: "/api/sw-test/submit",
        response: { received: true }
      });

      const response = await fetch("/api/sw-test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "test" })
      });
      const data = await response.json();

      expect(data.received).to.equal(true);
    });
  });

  describe("Request Body Capture", () => {
    it("captures JSON request body", async () => {
      await twd.mockRequest("jsonBody", {
        method: "POST",
        url: "/api/sw-test/json-body",
        response: { success: true }
      });

      await fetch("/api/sw-test/json-body", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "test-user",
          email: "test@example.com",
          nested: { value: 123 }
        })
      });

      const rule = await twd.waitForRequest("jsonBody");

      expect(rule.request).to.deep.equal({
        name: "test-user",
        email: "test@example.com",
        nested: { value: 123 }
      });
    });

    it("captures form data request body", async () => {
      await twd.mockRequest("formBody", {
        method: "POST",
        url: "/api/sw-test/form-body",
        response: { success: true }
      });

      const formData = new FormData();
      formData.append("username", "testuser");
      formData.append("password", "secret123");

      await fetch("/api/sw-test/form-body", {
        method: "POST",
        body: formData
      });

      const rule = await twd.waitForRequest("formBody");

      expect(rule.request.username).to.equal("testuser");
      expect(rule.request.password).to.equal("secret123");
    });

    it("captures text request body", async () => {
      await twd.mockRequest("textBody", {
        method: "POST",
        url: "/api/sw-test/text-body",
        response: { success: true }
      });

      await fetch("/api/sw-test/text-body", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "Plain text content here"
      });

      const rule = await twd.waitForRequest("textBody");

      expect(rule.request).to.equal("Plain text content here");
    });
  });

  describe("Response Customization", () => {
    it("applies custom response headers", async () => {
      await twd.mockRequest("customHeaders", {
        method: "GET",
        url: "/api/sw-test/headers",
        response: { data: "test" },
        responseHeaders: {
          "X-Custom-Header": "custom-value",
          "X-Rate-Limit": "100"
        }
      });

      const response = await fetch("/api/sw-test/headers");

      expect(response.headers.get("X-Custom-Header")).to.equal("custom-value");
      expect(response.headers.get("X-Rate-Limit")).to.equal("100");
    });

    it("returns correct status codes", async () => {
      await twd.mockRequest("notFound", {
        method: "GET",
        url: "/api/sw-test/not-found",
        response: { error: "Not found" },
        status: 404
      });

      const response = await fetch("/api/sw-test/not-found");

      expect(response.status).to.equal(404);
      const data = await response.json();
      expect(data.error).to.equal("Not found");
    });

    it("handles 204 No Content responses", async () => {
      await twd.mockRequest("noContent", {
        method: "DELETE",
        url: "/api/sw-test/resource/123",
        response: null,
        status: 204
      });

      const response = await fetch("/api/sw-test/resource/123", {
        method: "DELETE"
      });

      expect(response.status).to.equal(204);
    });

    it("handles 500 server error responses", async () => {
      await twd.mockRequest("serverError", {
        method: "GET",
        url: "/api/sw-test/error",
        response: { error: "Internal server error", code: "SERVER_ERROR" },
        status: 500
      });

      const response = await fetch("/api/sw-test/error");

      expect(response.status).to.equal(500);
      const data = await response.json();
      expect(data.code).to.equal("SERVER_ERROR");
    });
  });

  describe("URL Matching", () => {
    it("matches URLs with regex patterns", async () => {
      await twd.mockRequest("regexMatch", {
        method: "GET",
        url: /\/api\/sw-test\/users\/\d+/,
        response: { id: 999, name: "Regex User" },
        urlRegex: true
      });

      // All these should match the regex
      const response1 = await fetch("/api/sw-test/users/123");
      const response2 = await fetch("/api/sw-test/users/456");

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.name).to.equal("Regex User");
      expect(data2.name).to.equal("Regex User");
    });

    it("matches versioned API paths (e.g., /api.v2)", async () => {
      // This tests the fix for issue #7 - versioned APIs were incorrectly treated as files
      await twd.mockRequest("versionedApi", {
        method: "GET",
        url: "/api.v2/endpoint",
        response: { version: 2, data: "success" }
      });

      const response = await fetch("/api.v2/endpoint");
      const data = await response.json();

      expect(data.version).to.equal(2);
      expect(data.data).to.equal("success");
    });

    it("matches partial URL paths", async () => {
      await twd.mockRequest("partialMatch", {
        method: "GET",
        url: "/api/sw-test/partial",
        response: { matched: true }
      });

      // Full URL should match partial rule
      const response = await fetch("http://localhost:5173/api/sw-test/partial?query=1");
      const data = await response.json();

      expect(data.matched).to.equal(true);
    });
  });

  describe("Multiple Mocks", () => {
    it("handles multiple concurrent mocks", async () => {
      await twd.mockRequest("usersApi", {
        method: "GET",
        url: "/api/sw-test/multi/users",
        response: [{ id: 1, name: "User 1" }]
      });

      await twd.mockRequest("postsApi", {
        method: "GET",
        url: "/api/sw-test/multi/posts",
        response: [{ id: 1, title: "Post 1" }]
      });

      // Make parallel requests
      const [usersRes, postsRes] = await Promise.all([
        fetch("/api/sw-test/multi/users"),
        fetch("/api/sw-test/multi/posts")
      ]);

      const users = await usersRes.json();
      const posts = await postsRes.json();

      expect(users).to.have.length(1);
      expect(users[0].name).to.equal("User 1");
      expect(posts).to.have.length(1);
      expect(posts[0].title).to.equal("Post 1");

      // Wait for both
      await twd.waitForRequests(["usersApi", "postsApi"]);
    });

    it("updates mock response mid-test", async () => {
      // First mock
      await twd.mockRequest("dynamicMock", {
        method: "GET",
        url: "/api/sw-test/dynamic",
        response: { status: "loading" }
      });

      const response1 = await fetch("/api/sw-test/dynamic");
      const data1 = await response1.json();
      expect(data1.status).to.equal("loading");

      // Update mock with same alias
      await twd.mockRequest("dynamicMock", {
        method: "GET",
        url: "/api/sw-test/dynamic",
        response: { status: "completed" }
      });

      const response2 = await fetch("/api/sw-test/dynamic");
      const data2 = await response2.json();
      expect(data2.status).to.equal("completed");
    });
  });

  describe("Request Delay", () => {
    it("delays the response by the specified amount", async () => {
      await twd.mockRequest("delayedGet", {
        method: "GET",
        url: "/api/sw-test/delayed",
        response: { delayed: true },
        delay: 500,
      });

      const start = performance.now();
      const response = await fetch("/api/sw-test/delayed");
      const elapsed = performance.now() - start;
      const data = await response.json();

      expect(data.delayed).to.equal(true);
      // Should take at least ~500ms (allow some tolerance)
      expect(elapsed).to.be.greaterThanOrEqual(450);
    });

    it("returns response immediately when no delay is set", async () => {
      await twd.mockRequest("noDelayGet", {
        method: "GET",
        url: "/api/sw-test/no-delay",
        response: { fast: true },
      });

      const start = performance.now();
      const response = await fetch("/api/sw-test/no-delay");
      const elapsed = performance.now() - start;
      const data = await response.json();

      expect(data.fast).to.equal(true);
      // Should be very fast (well under 200ms)
      expect(elapsed).to.be.lessThan(200);
    });

    it("notifies EXECUTED before the delay completes", async () => {
      await twd.mockRequest("delayedWithNotify", {
        method: "GET",
        url: "/api/sw-test/delayed-notify",
        response: { ok: true },
        delay: 1000,
      });

      // Start the fetch (don't await yet)
      const fetchPromise = fetch("/api/sw-test/delayed-notify");

      // waitForRequest should resolve quickly (EXECUTED fires before delay)
      const rule = await twd.waitForRequest("delayedWithNotify");
      expect(rule.executed).to.equal(true);

      // Now wait for the actual response to come back
      const response = await fetchPromise;
      const data = await response.json();
      expect(data.ok).to.equal(true);
    });
  });

  describe("Request Counter", () => {
    it("tracks hit count for a single rule", async () => {
      await twd.mockRequest("countedGet", {
        method: "GET",
        url: "/api/sw-test/counted",
        response: { counted: true },
      });

      expect(twd.getRequestCount("countedGet")).to.equal(0);

      await fetch("/api/sw-test/counted");
      await twd.waitForRequest("countedGet");
      expect(twd.getRequestCount("countedGet")).to.equal(1);

      // Re-register so executed resets for waitForRequest to work again
      await twd.mockRequest("countedGet", {
        method: "GET",
        url: "/api/sw-test/counted",
        response: { counted: true },
      });

      await fetch("/api/sw-test/counted");
      await twd.waitForRequest("countedGet");
      expect(twd.getRequestCount("countedGet")).to.equal(2);

      // Third call
      await twd.mockRequest("countedGet", {
        method: "GET",
        url: "/api/sw-test/counted",
        response: { counted: true },
      });

      await fetch("/api/sw-test/counted");
      await twd.waitForRequest("countedGet");
      expect(twd.getRequestCount("countedGet")).to.equal(3);
    });

    it("tracks hit counts for multiple rules independently", async () => {
      await twd.mockRequest("countA", {
        method: "GET",
        url: "/api/sw-test/count-a",
        response: { a: true },
      });

      await twd.mockRequest("countB", {
        method: "GET",
        url: "/api/sw-test/count-b",
        response: { b: true },
      });

      // Hit countA twice
      await fetch("/api/sw-test/count-a");
      await twd.waitForRequest("countA");

      await twd.mockRequest("countA", {
        method: "GET",
        url: "/api/sw-test/count-a",
        response: { a: true },
      });
      await fetch("/api/sw-test/count-a");
      await twd.waitForRequest("countA");

      // Hit countB once
      await fetch("/api/sw-test/count-b");
      await twd.waitForRequest("countB");

      const counts = twd.getRequestCounts();
      expect(counts["countA"]).to.equal(2);
      expect(counts["countB"]).to.equal(1);
    });

    it("resets counts when rules are cleared", async () => {
      await twd.mockRequest("resetCount", {
        method: "GET",
        url: "/api/sw-test/reset-count",
        response: { ok: true },
      });

      await fetch("/api/sw-test/reset-count");
      await twd.waitForRequest("resetCount");
      expect(twd.getRequestCount("resetCount")).to.equal(1);

      twd.clearRequestMockRules();

      expect(twd.getRequestCount("resetCount")).to.equal(0);
      expect(twd.getRequestCounts()).to.deep.equal({});
    });

    it("returns 0 for unknown alias", () => {
      expect(twd.getRequestCount("nonExistent")).to.equal(0);
    });
  });

  describe("Mock Management", () => {
    it("clears all mocks correctly", async () => {
      await twd.mockRequest("tempMock1", {
        method: "GET",
        url: "/api/sw-test/temp1",
        response: { temp: 1 }
      });

      await twd.mockRequest("tempMock2", {
        method: "GET",
        url: "/api/sw-test/temp2",
        response: { temp: 2 }
      });

      const rules = twd.getRequestMockRules();
      expect(rules.length).to.equal(2);

      twd.clearRequestMockRules();

      const rulesAfterClear = twd.getRequestMockRules();
      expect(rulesAfterClear.length).to.equal(0);
    });

    it("overwrites mock with same alias", async () => {
      await twd.mockRequest("sameAlias", {
        method: "GET",
        url: "/api/sw-test/alias1",
        response: { version: 1 }
      });

      await twd.mockRequest("sameAlias", {
        method: "GET",
        url: "/api/sw-test/alias2",
        response: { version: 2 }
      });

      // Should only have 1 rule (overwritten)
      const rules = twd.getRequestMockRules();
      const sameAliasRules = rules.filter(r => r.alias === "sameAlias");
      expect(sameAliasRules.length).to.equal(1);
      expect((sameAliasRules[0].response as { version: number }).version).to.equal(2);
    });
  });
});
