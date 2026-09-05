import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { LogItem } from '../../ui/LogItem';

describe('LogItem whitespace', () => {
  it('should preserve newlines in a plain-text log entry', () => {
    const { container } = render(<LogItem log={'line one\nline two'} index={0} />);

    const item = container.querySelector('li');
    expect(item).not.toBeNull();
    expect(item!.style.whiteSpace).toBe('pre-wrap');
  });
});
