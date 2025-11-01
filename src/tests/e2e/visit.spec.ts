import { describe, expect, it, beforeEach, vi } from 'vitest';
import { twd } from '../..';

describe('twd visit command', () => {
  beforeEach(() => {
    // Reset to root path before each test
    window.history.replaceState({}, '', '/');
  });

  it('should change the URL when visiting a new page', async () => {
    expect(window.location.pathname).toBe('/');
    await twd.visit('/new-page');
    expect(window.location.pathname).toBe('/new-page');
  });

  it('should handle visiting the same page twice', async () => {
    expect(window.location.pathname).toBe('/');
    await twd.visit('/same-page');
    expect(window.location.pathname).toBe('/same-page');
    
    // Visit the same page again - should still work
    await twd.visit('/same-page');
    expect(window.location.pathname).toBe('/same-page');
  });

  it('should handle visiting root path from different pages', async () => {
    await twd.visit('/some-page');
    expect(window.location.pathname).toBe('/some-page');
    
    await twd.visit('/');
    expect(window.location.pathname).toBe('/');
  });

  it('should handle visiting pages with query parameters', async () => {
    await twd.visit('/page?param=value');
    expect(window.location.pathname).toBe('/page');
    expect(window.location.search).toBe('?param=value');
  });

  it('should handle visiting pages with hash fragments', async () => {
    await twd.visit('/page#section');
    expect(window.location.pathname).toBe('/page');
    expect(window.location.hash).toBe('#section');
  });

  it('should handle visiting complex URLs with both query and hash', async () => {
    await twd.visit('/page?param=value&other=test#section');
    expect(window.location.pathname).toBe('/page');
    expect(window.location.search).toBe('?param=value&other=test');
    expect(window.location.hash).toBe('#section');
  });

  it('should dispatch popstate events when navigating', async () => {
    const popstateHandler = vi.fn();
    window.addEventListener('popstate', popstateHandler);
    
    await twd.visit('/test-page');
    
    // Should have dispatched at least one popstate event
    expect(popstateHandler).toHaveBeenCalled();
    
    window.removeEventListener('popstate', popstateHandler);
  });

  it('should dispatch multiple popstate events when visiting the same page', async () => {
    const popstateHandler = vi.fn();
    window.addEventListener('popstate', popstateHandler);
    
    await twd.visit('/same-path');
    
    popstateHandler.mockClear();
    await twd.visit('/same-path');
    
    // Should dispatch more events when visiting same path (dummy route + target route)
    expect(popstateHandler.mock.calls.length).toBeGreaterThan(1);
    
    window.removeEventListener('popstate', popstateHandler);
  });

  it('should handle special characters in URLs', async () => {
    const specialUrl = '/page with spaces & symbols!';
    await twd.visit(specialUrl);
    // Browser URL-encodes special characters
    expect(window.location.pathname).toBe('/page%20with%20spaces%20&%20symbols!');
  });

  it('should handle empty string URL', async () => {
    await twd.visit('');
    // Empty string defaults to root path
    expect(window.location.pathname).toBe('/');
  });

  it('should handle deeply nested paths', async () => {
    const deepPath = '/level1/level2/level3/level4/page';
    await twd.visit(deepPath);
    expect(window.location.pathname).toBe(deepPath);
  });

  it('should preserve history stack when navigating', async () => {
    const initialLength = window.history.length;
    
    await twd.visit('/page1');
    await twd.visit('/page2');
    await twd.visit('/page3');
    
    // Each visit should add to history
    expect(window.history.length).toBeGreaterThan(initialLength);
  });

  it('should handle rapid successive visits', async () => {
    const visits = ['/rapid1', '/rapid2', '/rapid3', '/rapid4'];
    
    // Visit multiple pages rapidly
    for (const path of visits) {
      await twd.visit(path);
    }
    
    // Should end up on the last visited page
    expect(window.location.pathname).toBe('/rapid4');
  });

  it('should handle visiting the same page from different states', async () => {
    const targetPage = '/target-page';
    
    // Visit from root
    await twd.visit(targetPage);
    expect(window.location.pathname).toBe(targetPage);
    
    // Visit from another page
    await twd.visit('/intermediate');
    await twd.visit(targetPage);
    expect(window.location.pathname).toBe(targetPage);
    
    // Visit same page again (this tests the dummy route logic)
    await twd.visit(targetPage);
    expect(window.location.pathname).toBe(targetPage);
  });
});
