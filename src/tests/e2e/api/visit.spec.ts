import { describe, expect, it } from 'vitest';
import { twd } from '../../..';

describe('twd visit command', () => {
  it('should change the URL when visiting a new page', async () => {
    expect(window.location.pathname).toBe('/');
    await twd.visit('/new-page');
    expect(window.location.pathname).toBe('/new-page');
  });
});
