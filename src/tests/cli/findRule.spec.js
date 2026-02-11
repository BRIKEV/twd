import { describe, it, expect } from 'vitest';
import { findRule } from '../../cli/utils/findRule.js';

describe('findRule', () => {
  it('matches by method and exact url', () => {
    const rules = [
      { method: 'GET', url: 'https://foo.com', alias: 'a' },
      { method: 'POST', url: 'https://bar.com', alias: 'b' },
    ];
    expect(findRule('GET', 'https://foo.com', rules)).toEqual(rules[0]);
    expect(findRule('POST', 'https://bar.com', rules)).toEqual(rules[1]);
    expect(findRule('GET', 'https://bar.com', rules)).toBeUndefined();
  });

  it('matches by path (rule url starts with /)', () => {
    const rules = [
      { method: 'GET', url: '/auth/v1/token?grant_type=password', alias: 'a' },
    ];
    expect(findRule('GET', 'http://127.0.0.1:54321/auth/v1/token?grant_type=password', rules)).toEqual(rules[0]);
    expect(findRule('GET', 'http://127.0.0.1:54321/auth/v1/token?grant_type=refresh', rules)).toBeUndefined();
    expect(findRule('GET', 'http://127.0.0.1:54321/other', rules)).toBeUndefined();
  });

  it('matches by regex string (starts with ^)', () => {
    const rules = [
      { method: 'GET', url: '^https://foo\\.com/.*$', alias: 'a', urlRegex: true },
    ];
    expect(findRule('GET', 'https://foo.com/api', rules)).toEqual(rules[0]);
    expect(findRule('GET', 'https://foo.com/other', rules)).toEqual(rules[0]);
    expect(findRule('GET', 'https://bar.com', rules)).toBeUndefined();
  });

  it('should not throw for invalid regex', () => {
    const rules = [
      { method: 'GET', url: '^https://foo\\.com/([.*$', alias: 'a', urlRegex: true },
    ];
    expect(findRule('GET', 'https://foo.com/api', rules)).toBeUndefined();
  });

  it('matches by regex string (wrapped in /.../)', () => {
    const rules = [
      { method: 'GET', url: /users.*/, alias: 'a', urlRegex: true },
    ];
    expect(findRule('GET', 'https://foo.com/api/users/preferences', rules)).toEqual(rules[0]);
    expect(findRule('GET', 'https://foo.com/api/products', rules)).toBeUndefined();
  });

  it('returns the first matching rule', () => {
    const rules = [
      { method: 'GET', url: '/api', alias: 'first' },
      { method: 'GET', url: '/api', alias: 'second' },
    ];
    expect(findRule('GET', 'http://localhost/api', rules)).toEqual(rules[0]);
  });

  it('is case-insensitive for method', () => {
    const rules = [
      { method: 'get', url: 'https://foo.com', alias: 'a' },
    ];
    expect(findRule('GET', 'https://foo.com', rules)).toEqual(rules[0]);
    expect(findRule('get', 'https://foo.com', rules)).toEqual(rules[0]);
    expect(findRule('Get', 'https://foo.com', rules)).toEqual(rules[0]);
  });

  it('returns undefined if no match', () => {
    const rules = [
      { method: 'GET', url: '/api', alias: 'a' },
    ];
    expect(findRule('POST', 'http://localhost/api', rules)).toBeUndefined();
    expect(findRule('GET', 'http://localhost/other', rules)).toBeUndefined();
  });

  it('should not match if the url is a file with extension', () => {
    const rules = [
      { method: 'GET', url: '/api', alias: 'a' },
    ];
    expect(findRule('GET', 'http://localhost/api.json', rules)).toBeUndefined();
    expect(findRule('GET', 'http://localhost/api.txt', rules)).toBeUndefined();
    expect(findRule('GET', 'http://localhost/api.xml', rules)).toBeUndefined();
    expect(findRule('GET', 'http://localhost/api.html', rules)).toBeUndefined();
    expect(findRule('GET', 'http://localhost/api.twd.test.ts', rules)).toBeUndefined();
    expect(findRule('GET', 'http://localhost/api.twd.test.ts?t=12345', rules)).toBeUndefined();
  });

  it('should match if the url is a file with extension and the rule url is a file with extension', () => {
    const rules = [
      { method: 'GET', url: '/api.json', alias: 'a' },
    ];
    expect(findRule('GET', 'http://localhost/api.json', rules)).toEqual(rules[0]);
    expect(findRule('GET', 'http://localhost/api.txt', rules)).toBeUndefined();
    expect(findRule('GET', 'http://localhost/api.xml', rules)).toBeUndefined();
    expect(findRule('GET', 'http://localhost/api.html', rules)).toBeUndefined();
  });

  it('should match API paths with version numbers containing dots', () => {
    const rules = [
      { method: 'GET', url: '/api.v2/users', alias: 'a' },
    ];
    // Version in middle of path - should match
    expect(findRule('GET', 'http://localhost/api.v2/users', rules)).toEqual(rules[0]);
  });

  it('should match versioned API endpoints (e.g., /api.v2)', () => {
    const rules = [
      { method: 'GET', url: '/api.v2', alias: 'a' },
    ];
    // Version at end of path - should NOT be treated as file
    expect(findRule('GET', 'http://localhost/api.v2', rules)).toEqual(rules[0]);
    expect(findRule('GET', 'http://localhost/api.v2?param=1', rules)).toEqual(rules[0]);
  });

  it('should match semantic version paths (e.g., /v1.2.3/endpoint)', () => {
    const rules = [
      { method: 'GET', url: '/v1.2.3/endpoint', alias: 'a' },
    ];
    expect(findRule('GET', 'http://localhost/v1.2.3/endpoint', rules)).toEqual(rules[0]);
  });

  it('should match paths ending with version-like patterns', () => {
    const rules = [
      { method: 'GET', url: '/service.v1', alias: 'a' },
      { method: 'GET', url: '/api.2', alias: 'b' },
      { method: 'GET', url: '/endpoint.0', alias: 'c' },
    ];
    expect(findRule('GET', 'http://localhost/service.v1', rules)).toEqual(rules[0]);
    expect(findRule('GET', 'http://localhost/api.2', rules)).toEqual(rules[1]);
    expect(findRule('GET', 'http://localhost/endpoint.0', rules)).toEqual(rules[2]);
  });

  it('should still correctly identify actual files vs versioned APIs', () => {
    const rules = [
      { method: 'GET', url: '/api/data', alias: 'api' },
    ];
    // These are actual files - should NOT match the /api/data rule
    expect(findRule('GET', 'http://localhost/api/data.json', rules)).toBeUndefined();
    expect(findRule('GET', 'http://localhost/api/data.js', rules)).toBeUndefined();
    expect(findRule('GET', 'http://localhost/api/data.css', rules)).toBeUndefined();

    // These are API endpoints - should match
    expect(findRule('GET', 'http://localhost/api/data', rules)).toEqual(rules[0]);
    expect(findRule('GET', 'http://localhost/api/data?query=1', rules)).toEqual(rules[0]);
  });

  it('should not match general rule when request URL has version suffix', () => {
    // /api and /api.v2 are different endpoints — mock for /api should not match /api.v2
    const rules = [
      { method: 'GET', url: '/api', alias: 'a' },
    ];
    expect(findRule('GET', 'http://localhost/api.v2', rules)).toBeUndefined();
    expect(findRule('GET', 'http://localhost/api.v1', rules)).toBeUndefined();
    expect(findRule('GET', 'http://localhost/api.2', rules)).toBeUndefined();
    // But /api itself should still match
    expect(findRule('GET', 'http://localhost/api', rules)).toEqual(rules[0]);
    // /api should NOT match /api/v2 — sub-paths are different resources
    expect(findRule('GET', 'http://localhost/api/v2', rules)).toBeUndefined();
  });

  describe('boundary-aware matching', () => {
    it('does not match overlapping path segments (wallet vs wallet-transactions)', () => {
      const rules = [
        { method: 'GET', url: 'v1/travelers/123/wallet', alias: 'wallet' },
        { method: 'GET', url: 'v1/travelers/123/wallet-transactions', alias: 'walletTransactions' },
      ];
      expect(findRule('GET', 'http://localhost/v1/travelers/123/wallet-transactions?page=1&page_size=10', rules)).toEqual(rules[1]);
      expect(findRule('GET', 'http://localhost/v1/travelers/123/wallet', rules)).toEqual(rules[0]);
    });

    it('matches when URL ends with rule URL (end of string boundary)', () => {
      const rules = [
        { method: 'GET', url: '/api/users', alias: 'users' },
      ];
      expect(findRule('GET', 'http://localhost/api/users', rules)).toEqual(rules[0]);
    });

    it('matches when followed by ? (query param boundary)', () => {
      const rules = [
        { method: 'GET', url: '/api/users', alias: 'users' },
      ];
      expect(findRule('GET', 'http://localhost/api/users?page=1&limit=10', rules)).toEqual(rules[0]);
    });

    it('does not match when followed by / (sub-path is a different resource)', () => {
      const rules = [
        { method: 'GET', url: '/api/users', alias: 'users' },
      ];
      expect(findRule('GET', 'http://localhost/api/users/123', rules)).toBeUndefined();
    });

    it('matches when followed by # (hash boundary)', () => {
      const rules = [
        { method: 'GET', url: '/api/users', alias: 'users' },
      ];
      expect(findRule('GET', 'http://localhost/api/users#section', rules)).toEqual(rules[0]);
    });

    it('matches rule with query params followed by & (ampersand boundary)', () => {
      const rules = [
        { method: 'GET', url: '/api/users?page=1', alias: 'users' },
      ];
      expect(findRule('GET', 'http://localhost/api/users?page=1&limit=10', rules)).toEqual(rules[0]);
    });

    it('does not match sub-resource paths (travelers/123 vs travelers/123/billing-details)', () => {
      const rules = [
        { method: 'GET', url: 'v1/travelers/123', alias: 'travellerDetail' },
        { method: 'GET', url: 'v1/travelers/123/billing-details', alias: 'billingDetails' },
      ];
      expect(findRule('GET', 'http://localhost/v1/travelers/123/billing-details', rules)).toEqual(rules[1]);
      expect(findRule('GET', 'http://localhost/v1/travelers/123', rules)).toEqual(rules[0]);
      expect(findRule('GET', 'http://localhost/v1/travelers/123?q=asd', rules)).toEqual(rules[0]);
    });

    it('does not match partial path segments', () => {
      const rules = [
        { method: 'GET', url: '/api/item', alias: 'item' },
      ];
      expect(findRule('GET', 'http://localhost/api/items', rules)).toBeUndefined();
      expect(findRule('GET', 'http://localhost/api/item-details', rules)).toBeUndefined();
      expect(findRule('GET', 'http://localhost/api/item', rules)).toEqual(rules[0]);
    });

    it('does not match when rule URL is a substring mid-segment', () => {
      const rules = [
        { method: 'GET', url: '/user', alias: 'user' },
      ];
      expect(findRule('GET', 'http://localhost/username', rules)).toBeUndefined();
      expect(findRule('GET', 'http://localhost/user', rules)).toEqual(rules[0]);
      expect(findRule('GET', 'http://localhost/user?id=1', rules)).toEqual(rules[0]);
    });

    it('allows substring matching within query strings', () => {
      const rules = [
        { method: 'GET', url: 'https://api.tvmaze.com/search/shows?q=', alias: 'shows' },
      ];
      expect(findRule('GET', 'https://api.tvmaze.com/search/shows?q=friends', rules)).toEqual(rules[0]);
      expect(findRule('GET', 'https://api.tvmaze.com/search/shows?q=', rules)).toEqual(rules[0]);
    });

    it('allows substring matching for partial query param values', () => {
      const rules = [
        { method: 'GET', url: '/api/data?filter=active', alias: 'data' },
      ];
      expect(findRule('GET', 'http://localhost/api/data?filter=active&sort=name', rules)).toEqual(rules[0]);
    });

    it('still applies boundary check in path even when URL has query string', () => {
      const rules = [
        { method: 'GET', url: '/api/user', alias: 'user' },
      ];
      // Path boundary still enforced — /users is not /user
      expect(findRule('GET', 'http://localhost/api/users?page=1', rules)).toBeUndefined();
      expect(findRule('GET', 'http://localhost/api/user?page=1', rules)).toEqual(rules[0]);
    });
  });
});
