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
});
