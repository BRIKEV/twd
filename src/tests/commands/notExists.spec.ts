import { beforeEach, describe, expect, it } from 'vitest';
import { twd } from '../../';

describe('twd not Exists command', () => {
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
  
  it('should get throw exception as element exists', async () => {
    div.textContent = 'Hello World';
    await expect(twd.notExists('div')).rejects.toThrow();
  });

  it('should not throw error if element not found', async () => {
    await twd.notExists('.non-existent');
  });
});