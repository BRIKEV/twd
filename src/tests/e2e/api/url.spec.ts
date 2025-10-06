import { beforeEach, describe, expect, it, vi, afterAll } from 'vitest';
import { twd } from '../../..';

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
    const urlCmd = await twd.url();
    expect(urlCmd.location.href).toBe('http://localhost:3000/home');
  });

  it('should assert URL equality', async () => {
    const urlCmd = await twd.url();
    const result = urlCmd.should('eq', 'http://localhost:3000/home');
    expect(typeof result).toBe('string');
    expect(result).toContain('Assertion passed');
  });

  it('should assert URL containment', async () => {
    const urlCmd = await twd.url();
    const result = urlCmd.should('contain.url', '/home');
    expect(typeof result).toBe('string');
    expect(result).toContain('Assertion passed');
  });

  it('should handle negated equality assertion', async () => {
    const urlCmd = await twd.url();
    const result = urlCmd.should('not.eq', 'http://localhost:3000/about');
    expect(typeof result).toBe('string');
    expect(result).toContain('Assertion passed');
  });

  it('should handle negated containment assertion', async () => {
    const urlCmd = await twd.url();
    const result = urlCmd.should('not.contain.url', '/about');
    expect(typeof result).toBe('string');
    expect(result).toContain('Assertion passed');
  });

  it('should fail equality assertion with incorrect URL', async () => {
    const urlCmd = await twd.url();
    expect(() => urlCmd.should('eq', 'http://localhost:3000/about')).toThrowError('Assertion failed: Expected URL to be http://localhost:3000/about, but got http://localhost:3000/home');
  });

  it('should fail containment assertion with incorrect substring', async () => {
    const urlCmd = await twd.url();
    expect(() => urlCmd.should('contain.url', '/about')).toThrowError('Assertion failed: Expected URL to contain /about, but got http://localhost:3000/home');
  });

  it('should fail invalid assertion name', async () => {
    const urlCmd = await twd.url();
    // @ts-expect-error
    expect(() => urlCmd.should('invalid.assertion', 'http://localhost:3000/home')).toThrowError('Unknown assertion: invalid.assertion');
  });
});