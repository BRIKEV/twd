import { beforeEach, describe, expect, it, vi, afterAll } from 'vitest';
import { twd } from '../..';

describe('twd url command', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Reset the DOM and mock location before each test
    document.body.innerHTML = '';
    delete (window as any).location;
    (window as any).location = {
      href: 'http://localhost:3000/home',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
      ancestorOrigins: '',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/home',
      search: '',
      hash: '',
    };
  });

  afterAll(() => {
    // Restore original location after all tests
    // @ts-expect-error
    window.location = originalLocation;
  });

  it('should get the current URL', async () => {
    const urlCmd = twd.url();
    expect(urlCmd.location.href).toBe('http://localhost:3000/home');
  });

  it('should assert URL equality', async () => {
    const urlCmd = twd.url();
    const result = await urlCmd.should('eq', 'http://localhost:3000/home');
    expect(typeof result).toBe('string');
    expect(result).toContain('Assertion passed');
  });

  it('should assert URL containment', async () => {
    const result = await twd.url().should('contain.url', '/home');
    expect(typeof result).toBe('string');
    expect(result).toContain('Assertion passed');
  });

  it('should handle negated equality assertion', async () => {
    const urlCmd = twd.url();
    const result = await urlCmd.should('not.eq', 'http://localhost:3000/about');
    expect(typeof result).toBe('string');
    expect(result).toContain('Assertion passed');
  });

  it('should handle negated containment assertion', async () => {
    const result = await twd.url().should('not.contain.url', '/about');
    expect(typeof result).toBe('string');
    expect(result).toContain('Assertion passed');
  });

  it('should fail equality assertion with incorrect URL', async () => {
    const urlCmd = twd.url();
    await expect(urlCmd.should('eq', 'http://localhost:3000/about')).rejects.toThrow('Assertion failed: Expected URL to be http://localhost:3000/about, but got http://localhost:3000/home');
  });
  
  it('should fail containment assertion with incorrect substring', async () => {
    const urlCmd = twd.url();
    await expect(urlCmd.should('contain.url', '/about', 1)).rejects.toThrow('Assertion failed: Expected URL to contain /about, but got http://localhost:3000/home');
  });

  it('should fail invalid assertion name', async () => {
    const urlCmd = twd.url();
    // @ts-expect-error
    await expect(urlCmd.should('invalid.assertion', 'http://localhost:3000/home', 1)).rejects.toThrow('Unknown assertion: invalid.assertion');
  });

  it('should retry assertion when it fails', async () => {
    const urlCmd = twd.url();
    // this should not fail as it retries
    urlCmd.should('eq', 'http://localhost:3000/about');
    window.location.href = 'http://localhost:3000/about';
  });
});