import { describe, it, expect, vi } from 'vitest';
import { notifyClients } from '../../cli/utils/notifyClients.js';

describe('notifyClients', () => {
  it('should call postMessage on all clients with correct payload', () => {
    const rule = { alias: 'foo' };
    const body = 'bar';
    const clients = [
      { postMessage: vi.fn() },
      { postMessage: vi.fn() },
    ];

    notifyClients(clients, rule, body);

    for (const client of clients) {
      expect(client.postMessage).toHaveBeenCalledWith({
        type: 'EXECUTED',
        alias: 'foo',
        request: 'bar',
      });
    }
  });
});
