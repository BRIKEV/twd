import { describe, it, expect } from 'vitest';
import { eventsMessage } from '../../../src/proxies/eventsMessage';

describe('eventsMessage', () => {
  it('should return type message', () => {
    expect(eventsMessage('userEvent', 'type', [null, 'hello'])).toBe('Event fired: Typed "hello" into element');
  });

  it('should return selectOptions message', () => {
    expect(eventsMessage('userEvent', 'selectOptions', [null, ['option1', 'option2']])).toBe('Event fired: Selected option(s) ["option1","option2"]');
  });

  it('should return click message', () => {
    expect(eventsMessage('userEvent', 'click', [])).toBe('Event fired: Clicked element');
  });

  it('should return dblClick message', () => {
    expect(eventsMessage('userEvent', 'dblClick', [])).toBe('Event fired: Double-clicked element');
  });

  it('should return tripleClick message', () => {
    expect(eventsMessage('userEvent', 'tripleClick', [])).toBe('Event fired: Triple-clicked element');
  });

  it('should return default message for other events', () => {
    expect(eventsMessage('userEvent', 'hover', [])).toBe('Event fired: userEvent.hover executed');
  });
});
