import { beforeEach, describe, expect, it, vi } from 'vitest';
import { twd } from '../../..';

describe('twd text content', () => {
  let div: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    div = document.createElement('div');
    document.body.appendChild(div);
  });
  
  it('should retieve text', async () => {
    div.textContent = 'Hello World';
    const elem = await twd.get('div');
    const text = await elem.text();
    expect(text).toBe('Hello World');
  });
});