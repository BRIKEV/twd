import { beforeEach, describe, expect, it } from 'vitest';
import { twd } from '../../';

describe('twd get command', () => {
  let div: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    // Create a wrapper div that would be the app container (not the sidebar)
    const appContainer = document.createElement('div');
    appContainer.id = 'app';
    document.body.appendChild(appContainer);
    
    // append a div inside the app container
    div = document.createElement('div');
    div.className = 'inner';
    appContainer.appendChild(div);
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