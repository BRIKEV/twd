import { describe, it, beforeEach, vi, expect } from 'vitest';
import * as twd from '../../';
import { userEvent } from '../../proxies/userEvent';
import { tests } from '../../twdRegistry';

describe('userEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should simulate user events', async () => {
    twd.describe('User Events', () => {
      twd.it('should log userEvent actions', async () => {
        const user = userEvent.setup();
        const input = document.createElement('input');
        const nonFinded = document.createElement('div');
        document.body.appendChild(input);

        await user.click(input);
        expect(document.activeElement).toBe(input);

        await user.type(input, 'Hello');
        expect((input as HTMLInputElement).value).toBe('Hello');
      });
    });
    tests[0].status = 'running';
    await tests[0].fn();
    expect(tests[0].logs).toContainEqual(expect.stringContaining('Assertion passed: userEvent.instance.click finished'));
    expect(tests[0].logs).toContainEqual(expect.stringContaining('Assertion passed: userEvent.instance.type finished'));
  });
});
