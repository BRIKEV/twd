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
      { method: 'GET', url: /^https:\/\/foo\..+/, alias: 'a' },
    ];
    expect(findRule('GET', 'https://foo.com', rules)).toEqual(rules[0]);
    expect(findRule('GET', 'https://foo.org', rules)).toEqual(rules[0]);
    expect(findRule('GET', 'https://bar.com', rules)).toBeUndefined();
  });
});
