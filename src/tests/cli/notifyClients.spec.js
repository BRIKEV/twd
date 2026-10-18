import { describe, it, expect, vi } from 'vitest';
import { notifyClients } from '../../cli/utils/notifyClients.js';

describe('notifyClients', () => {
  it('should call postMessage on all clients with correct payload', () => {
    const rule = { alias: 'foo' };
    const body = 'bar';
    const clients = [{ postMessage: vi.fn() }, { postMessage: vi.fn() }];

    notifyClients(clients, rule, body);

    for (const client of clients) {
      expect(client.postMessage).toHaveBeenCalledWith({
        type: 'EXECUTED',
        alias: 'foo',
        request: 'bar',
      });
    }
  });

  it('should send the rule id so the page can ignore hits on a replaced rule', () => {
    const client = { postMessage: vi.fn() };

    notifyClients([client], { alias: 'foo', id: 'rule-2' }, null, 1);

    expect(client.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ alias: 'foo', ruleId: 'rule-2', hitCount: 1 }),
    );
  });
});
