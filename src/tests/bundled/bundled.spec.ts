import { describe, it, expect, vi } from 'vitest';
import { initTWD } from '../../bundled';

// Mock dependencies
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(),
}));

vi.mock('../../initializers/initTests', () => ({
  initTests: vi.fn(),
}));

vi.mock('../../ui/TWDSidebar', () => ({
  TWDSidebar: (props: any) => props,
}));

vi.mock('../..', () => ({
  twd: {
    initRequestMocking: vi.fn().mockResolvedValue(undefined),
  },
}));

import { initTests } from '../../initializers/initTests';

describe('initTWD', () => {
  it('should initialize tests with default options', () => {
    const files = {};
    initTWD(files);
    
    expect(initTests).toHaveBeenCalled();
    const callArgs = (initTests as any).mock.calls[0];
    expect(callArgs[0]).toBe(files);
    // Check default props of the component passed as second argument
    expect(callArgs[1].props).toEqual({ open: true, position: 'left' });
  });

  it('should initialize tests with custom options', () => {
    const files = {};
    initTWD(files, { open: false, position: 'right' });
    
    expect(initTests).toHaveBeenCalled();
    const callArgs = (initTests as any).mock.calls[1]; // Get the second call
    expect(callArgs[1].props).toEqual({ open: false, position: 'right' });
  });
});

