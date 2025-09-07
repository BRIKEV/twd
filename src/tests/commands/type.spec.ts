import { describe, expect, it } from 'vitest';
import { simulateType } from '../../commands/type';

describe('simulateType', () => {
  it('should type text into input', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);

    simulateType(input, 'Hello World');

    expect(input.value).toBe('Hello World');
  });

  it('should type text into textarea', () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    simulateType(textarea, 'Hello World');

    expect(textarea.value).toBe('Hello World');
  });

  it('should throw error when typing into non-input/textarea', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    expect((div as any).value).toBeUndefined();
  });
});
