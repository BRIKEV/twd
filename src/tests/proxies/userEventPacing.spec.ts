import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// vi.mock factories are hoisted above module-level consts, so the doubles have
// to be created inside vi.hoisted for the factory to see them.
const { instanceApi, directApi, setupMock } = vi.hoisted(() => {
  const makeApi = () => ({
    click: vi.fn().mockResolvedValue(undefined),
    type: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
    keyboard: vi.fn().mockResolvedValue(undefined),
  });
  const instance = makeApi();
  return {
    instanceApi: instance,
    directApi: makeApi(),
    setupMock: vi.fn(() => instance),
  };
});

vi.mock('@testing-library/user-event', () => ({
  default: { ...directApi, setup: setupMock },
}));

vi.mock('../../pace', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../pace')>();
  return { ...actual, pace: vi.fn() };
});

import { userEvent } from '../../proxies/userEvent';
import { setPace, pace } from '../../pace';

describe('userEvent pacing', () => {
  let input: HTMLInputElement;

  beforeEach(() => {
    vi.clearAllMocks();
    setPace(0);
    input = document.createElement('input');
    document.body.appendChild(input);
  });

  afterEach(() => {
    setPace(0);
    input.remove();
  });

  it('paces after an interaction', async () => {
    await userEvent.click(input);
    expect(pace).toHaveBeenCalledTimes(1);
  });

  it('paces after typing', async () => {
    await userEvent.type(input, 'hello');
    expect(pace).toHaveBeenCalledTimes(1);
  });

  it('paces after clearing', async () => {
    await userEvent.clear(input);
    expect(pace).toHaveBeenCalledTimes(1);
  });

  it('paces after keyboard input', async () => {
    input.focus();
    await userEvent.keyboard('abc');
    expect(pace).toHaveBeenCalledTimes(1);
  });

  it('does not pace on setup, which performs no action', () => {
    userEvent.setup();
    expect(pace).not.toHaveBeenCalled();
  });

  it('calls through to the real library rather than swallowing the action', async () => {
    await userEvent.click(input);

    expect(directApi.click).toHaveBeenCalledWith(input);
    expect(instanceApi.click).not.toHaveBeenCalled();
  });
});
