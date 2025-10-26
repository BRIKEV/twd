import { beforeEach, describe, expect, it } from 'vitest';
import { twd } from '../..';

describe('twd getAll command', () => {
  let item1: HTMLDivElement;
  let item2: HTMLDivElement;
  let item3: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    // Create a wrapper div that would be the app container (not the sidebar)
    const container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);

    item1 = document.createElement('div');
    item1.className = 'item';
    item1.textContent = 'Hello';
    container.appendChild(item1);

    item2 = document.createElement('div');
    item2.className = 'item';
    item2.textContent = 'World';
    container.appendChild(item2);

    item3 = document.createElement('div');
    item3.className = 'item';
    item3.textContent = '!';
    container.appendChild(item3);
  });
  
  it('should get all elements', async () => {
    const items = await twd.getAll('.item');
    expect(items).toHaveLength(3);
    expect(items[0].el).toBe(item1);
    expect(items[1].el).toBe(item2);
    expect(items[2].el).toBe(item3);
  });

  it('should return empty array if no elements found', async () => {
    await expect(twd.getAll('.non-existent')).rejects.toThrow();
  });
});