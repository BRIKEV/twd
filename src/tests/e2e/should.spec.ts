import { beforeEach, describe, expect, it } from 'vitest';
import { twd } from '../..';

describe('twd should', () => {
  let div: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    // Create a wrapper div that would be the app container (not the sidebar)
    const appContainer = document.createElement('div');
    appContainer.id = 'app';
    document.body.appendChild(appContainer);
    
    div = document.createElement('div');
    appContainer.appendChild(div);
  });
  
  it('should assert have.text', async () => {
    div.textContent = 'Hello World';
    const elem = await twd.get('div');
    elem.should('have.text', 'Hello World');
    expect(() => elem.should('have.text', 'Wrong Text')).toThrow();
  });
});
