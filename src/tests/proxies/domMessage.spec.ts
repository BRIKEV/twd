import { describe, it, expect } from 'vitest';
import { domMessage } from '../../proxies/domMessage';

describe('domMessage', () => {
  it('should return query message for getBy methods', () => {
    expect(domMessage('screen', 'getByText', ['Hello'])).toBe('query: getByText("Hello")');
    expect(domMessage('screen', 'getByRole', ['button'])).toBe('query: getByRole("button")');
    expect(domMessage('screen', 'getByLabelText', ['Email'])).toBe('query: getByLabelText("Email")');
  });

  it('should return query message for queryBy methods', () => {
    expect(domMessage('screen', 'queryByText', ['Hello'])).toBe('query: queryByText("Hello")');
    expect(domMessage('screen', 'queryByRole', ['button'])).toBe('query: queryByRole("button")');
  });

  it('should return query message for findBy methods', () => {
    expect(domMessage('screen', 'findByText', ['Hello'])).toBe('query: findByText("Hello")');
    expect(domMessage('screen', 'findByRole', ['button'])).toBe('query: findByRole("button")');
  });

  it('should return query message for getAllBy methods', () => {
    expect(domMessage('screen', 'getAllByText', ['Hello'])).toBe('query: getAllByText("Hello")');
    expect(domMessage('screen', 'getAllByRole', ['button'])).toBe('query: getAllByRole("button")');
  });

  it('should return query message for queryAllBy methods', () => {
    expect(domMessage('screen', 'queryAllByText', ['Hello'])).toBe('query: queryAllByText("Hello")');
    expect(domMessage('screen', 'queryAllByRole', ['button'])).toBe('query: queryAllByRole("button")');
  });

  it('should return query message for findAllBy methods', () => {
    expect(domMessage('screen', 'findAllByText', ['Hello'])).toBe('query: findAllByText("Hello")');
    expect(domMessage('screen', 'findAllByRole', ['button'])).toBe('query: findAllByRole("button")');
  });

  it('should return helper message for within', () => {
    const div = document.createElement('div');
    expect(domMessage('screen', 'within', [div])).toBe('helper: within(<div>) called');

    const button = document.createElement('button');
    expect(domMessage('screen', 'within', [button])).toBe('helper: within(<button>) called');
  });

  it('should return helper message for within with unknown tag', () => {
    const unknown = {};
    expect(domMessage('screen', 'within', [unknown])).toBe('helper: within(<unknown>) called');
    expect(domMessage('screen', 'within', [null])).toBe('helper: within(<unknown>) called');
  });

  it('should return debug message for prettyDOM', () => {
    expect(domMessage('screen', 'prettyDOM', [])).toBe('debug: prettyDOM called');
  });

  it('should return debug message for logDOM', () => {
    expect(domMessage('screen', 'logDOM', [])).toBe('debug: logDOM called');
  });

  it('should return async utility message for act', () => {
    expect(domMessage('screen', 'act', [])).toBe('async utility: act executed');
  });

  it('should return async utility message for waitFor', () => {
    expect(domMessage('screen', 'waitFor', [])).toBe('async utility: waitFor executed');
  });

  it('should return async utility message for waitForElementToBeRemoved', () => {
    expect(domMessage('screen', 'waitForElementToBeRemoved', [])).toBe('async utility: waitForElementToBeRemoved executed');
  });

  it('should return default message for other methods', () => {
    expect(domMessage('screen', 'someMethod', [])).toBe('method: screen.someMethod executed');
    expect(domMessage('container', 'anotherMethod', ['arg1', 'arg2'])).toBe('method: container.anotherMethod executed');
  });

  it('should handle different prefixes correctly', () => {
    expect(domMessage('container', 'getByText', ['Hello'])).toBe('query: getByText("Hello")');
    expect(domMessage('custom', 'within', [document.createElement('div')])).toBe('helper: within(<div>) called');
    expect(domMessage('test', 'prettyDOM', [])).toBe('debug: prettyDOM called');
  });
});

