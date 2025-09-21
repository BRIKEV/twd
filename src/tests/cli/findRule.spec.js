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

  it('matches by regex url', () => {
    const rules = [
      { method: 'GET', url: 'https://foo.com', alias: 'a' },
    ];
    expect(findRule('GET', /^https:\/\/foo\..+/, rules)).toEqual(rules[0]);
    expect(findRule('GET', 'https://bar.com', rules)).toBeUndefined();
  });

  it('returns the first matching rule', () => {
    const rules = [
      { method: 'GET', url: 'https://foo.com', alias: 'first' },
      { method: 'GET', url: 'https://foo.com', alias: 'second' },
    ];
    expect(findRule('GET', 'https://foo.com', rules)).toEqual(rules[0]);
  });

  it('should match by contains url', () => {
    const rules = [
      { method: 'GET', url: 'https://foo.com/api', alias: 'a' },
    ];
    expect(findRule('GET', 'https://foo.com/api', rules)).toEqual(rules[0]);
    expect(findRule('GET', 'https://foo.com/api/users', rules)).toBeUndefined();
    expect(findRule('GET', 'https://foo.com/home', rules)).toBeUndefined();
  });

  it('should match by regex', () => {
    const rules = [
      { method: 'GET', url: 'https://foo.com/api/users/preferences', alias: 'a' },
    ];
    expect(findRule('GET', /\/users\/*/, rules)).toEqual(rules[0]);
  });

  it('should match by contains some path of the url', () => {
    const rules = [
      { method: 'GET', url: 'https://foo.com/api', alias: 'a' },
    ];
    expect(findRule('GET', '/api', rules)).toEqual(rules[0]);
    expect(findRule('GET', '/api/users', rules)).toBeUndefined();
    expect(findRule('GET', 'https://foo.com/home', rules)).toBeUndefined();
  });

  it('is case-insensitive for method', () => {
    const rules = [
      { method: 'get', url: 'https://foo.com', alias: 'a' },
    ];
    expect(findRule('GET', 'https://foo.com', rules)).toEqual(rules[0]);
    expect(findRule('get', 'https://foo.com', rules)).toEqual(rules[0]);
    expect(findRule('Get', 'https://foo.com', rules)).toEqual(rules[0]);
  });
});
