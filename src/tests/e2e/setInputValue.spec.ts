import { beforeEach, describe, it } from 'vitest';
import { twd } from '../..';

describe('twd setInputValue command', () => {
  let div: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    const appContainer = document.createElement('div');
    appContainer.id = 'app';
    document.body.appendChild(appContainer);
    // Create a wrapper div that would be the app container (not the sidebar)
    const rangeInput = document.createElement('input');
    rangeInput.type = 'range';
    rangeInput.value = '50';
    appContainer.appendChild(rangeInput);
  });

  it('should set input value and trigger input event', async () => {
    const rangeInput = await twd.get('input[type="range"]');
    let inputEventFired = false;
    rangeInput.el.addEventListener('input', () => {
      inputEventFired = true;
    });

    twd.setInputValue(rangeInput.el, '75');

    rangeInput.should('have.value', '75');
  });
});