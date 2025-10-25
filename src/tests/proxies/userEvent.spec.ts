import { describe, it, beforeEach, vi, expect } from 'vitest';
import * as twd from '../../runner';
import { userEvent } from '../../proxies/userEvent';

describe('userEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should simulate user events', async () => {
    twd.describe('User Events', () => {
      twd.it('should log userEvent actions', async () => {
        const user = userEvent.setup();
        const input = document.createElement('input');
        document.body.appendChild(input);

        await user.click(input);
        expect(document.activeElement).toBe(input);

        await user.type(input, 'Hello');
        expect((input as HTMLInputElement).value).toBe('Hello');
      });
    });
    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    testArray[1].status = 'running';
    await testArray[1].handler();
    expect(testArray[1].logs).toContainEqual(expect.stringContaining('Event fired: Clicked element'));
    expect(testArray[1].logs).toContainEqual(expect.stringContaining('Event fired: Typed "Hello" into element'));
  });
});
