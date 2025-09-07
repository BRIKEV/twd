import { beforeEach, describe, expect, it } from 'vitest';
import { twd } from '../../..';

describe('twd should', () => {
  let div: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    div = document.createElement('div');
    document.body.appendChild(div);
  });
  
  it('should assert have.text', async () => {
    div.textContent = 'Hello World';
    const elem = await twd.get('div');
    elem.should('have.text', 'Hello World');
    expect(() => elem.should('have.text', 'Wrong Text')).toThrow();
  });
});
