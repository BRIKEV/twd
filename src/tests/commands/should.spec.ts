import { beforeEach, describe, expect, it } from 'vitest';
import { twd, screenDom } from '../..';

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
    const elem = await screenDom.getByText('Hello World');
    twd.should(elem, 'have.text', 'Hello World');
    expect(() => twd.should(elem, 'have.text', 'Wrong Text')).toThrow();
  });
});
