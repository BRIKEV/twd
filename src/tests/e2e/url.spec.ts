import { beforeEach, describe, expect, it, vi, afterAll, afterEach } from 'vitest';
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

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(() => {
    // Restore original location after all tests
    // @ts-expect-error -- restoring window.location that was deleted in beforeEach
    window.location = originalLocation;
  });

  it('should get the current URL', () => {
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
    await expect(urlCmd.should('eq', 'http://localhost:3000/about', 1)).rejects.toThrow(
      'Assertion failed: Expected URL to be http://localhost:3000/about, but got http://localhost:3000/home',
    );
  });

  it('should fail containment assertion with incorrect substring', async () => {
    const urlCmd = twd.url();
    await expect(urlCmd.should('contain.url', '/about', 1)).rejects.toThrow(
      'Assertion failed: Expected URL to contain /about, but got http://localhost:3000/home',
    );
  });

  it('should fail invalid assertion name', async () => {
    const urlCmd = twd.url();
    // @ts-expect-error -- intentionally passing invalid assertion name to test error handling
    await expect(
      urlCmd.should('invalid.assertion', 'http://localhost:3000/home', 1),
    ).rejects.toThrow('Unknown assertion: invalid.assertion');
  });

  it('should pass when a retry passes after a failed attempt', async () => {
    const urlCmd = twd.url();
    // The app navigates after the first attempt has already failed
    setTimeout(() => {
      window.location.href = 'http://localhost:3000/about';
    }, 150);
    const result = await urlCmd.should('eq', 'http://localhost:3000/about');
    expect(result).toContain('Assertion passed');
  });

  it('should keep retrying for 3000ms by default, like findBy*', async () => {
    vi.useFakeTimers();
    const urlCmd = twd.url();
    // The app navigates 2s after the action, which is slow but normal on a busy CI runner
    setTimeout(() => {
      window.location.href = 'http://localhost:3000/about';
    }, 2000);
    const pending = urlCmd.should('eq', 'http://localhost:3000/about');
    await vi.advanceTimersByTimeAsync(2100);
    await expect(pending).resolves.toContain('Assertion passed');
    vi.useRealTimers();
  });

  it('should give up after 3000ms by default', async () => {
    vi.useFakeTimers();
    let settled = false;
    const pending = twd.url().should('eq', 'http://localhost:3000/never');
    pending
      .catch(() => {})
      .finally(() => {
        settled = true;
      });
    await vi.advanceTimersByTimeAsync(2899);
    expect(settled).toBe(false);
    const assertion = expect(pending).rejects.toThrow(
      'Expected URL to be http://localhost:3000/never',
    );
    await vi.advanceTimersByTimeAsync(200);
    await assertion;
    vi.useRealTimers();
  });

  it('should throw the last failure when no retry passes', async () => {
    const urlCmd = twd.url();
    await expect(urlCmd.should('contain.url', '/about', 2)).rejects.toThrow(
      'Expected URL to contain /about',
    );
  });
});
