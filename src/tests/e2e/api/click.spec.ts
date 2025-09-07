import { beforeEach, describe, expect, it, vi } from 'vitest';
import { twd } from '../../..';

describe('twd click', () => {
  let button: HTMLButtonElement;
  let input: HTMLInputElement;
  let div: HTMLDivElement;
  let clickHandler: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    document.body.innerHTML = '';
    button = document.createElement('button');
    input = document.createElement('input');
    div = document.createElement('div');
    clickHandler = vi.fn();
    button.addEventListener('click', clickHandler);
    input.addEventListener('click', clickHandler);
    div.addEventListener('click', clickHandler);
    document.body.appendChild(button);
    document.body.appendChild(input);
    document.body.appendChild(div);
  });

  it('should click a button and trigger click event', async () => {
    const elem = await twd.get('button');
    await elem.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  it('should click an input and trigger click event', async () => {
    const elem = await twd.get('input');
    await elem.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  it('should click a div and trigger click event', async () => {
    const elem = await twd.get('div');
    await elem.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });
});
