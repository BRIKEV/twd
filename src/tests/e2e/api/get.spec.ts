import { beforeEach, describe, expect, it, vi } from 'vitest';
import { twd } from '../../..';

describe('twd get command', () => {
  let div: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    div = document.createElement('div');
    document.body.appendChild(div);
  });
  
  it('should get element', async () => {
    div.textContent = 'Hello World';
    const elem = await twd.get('div');
    expect(elem).not.toBeNull();
  });

  it('should throw error if element not found', async () => {
    await expect(twd.get('.non-existent')).rejects.toThrow();
  });
});