import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initTWD } from '../../bundled';

// Mock dependencies
vi.mock('preact', () => ({
  render: vi.fn(),
}));

vi.mock('../../initializers/initTests', () => ({
  initTests: vi.fn(),
}));

vi.mock('../../ui/TWDSidebar', () => ({
  TWDSidebar: (props: any) => props,
}));

vi.mock('../../commands/mockBridge', () => ({
  initRequestMocking: vi.fn().mockResolvedValue(undefined),
}));

import { initTests } from '../../initializers/initTests';
import { initRequestMocking } from '../../commands/mockBridge';

describe('initTWD', () => {
  const mockInitRequestMocking = vi.mocked(initRequestMocking);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize tests with default options', () => {
    const files = {};
    initTWD(files);
    
    expect(initTests).toHaveBeenCalled();
    const callArgs = (initTests as any).mock.calls[0];
    expect(callArgs[0]).toBe(files);
    // Check default props of the component passed as second argument
    expect(callArgs[1].props).toEqual({ open: true, position: 'left' });
    expect(mockInitRequestMocking).toHaveBeenCalledWith('/mock-sw.js');
  });

  it('should initialize tests with custom options', () => {
    const files = {};
    initTWD(files, { open: false, position: 'right' });
    
    expect(initTests).toHaveBeenCalled();
    const callArgs = (initTests as any).mock.calls[0];
    expect(callArgs[1].props).toEqual({ open: false, position: 'right' });
    expect(mockInitRequestMocking).toHaveBeenCalledWith('/mock-sw.js');
  });

  it('should initialize request mocking with default service worker URL when serviceWorker is true', () => {
    const files = {};
    initTWD(files, { serviceWorker: true });
    
    expect(mockInitRequestMocking).toHaveBeenCalledWith('/mock-sw.js');
  });

  it('should initialize request mocking with custom service worker URL', () => {
    const files = {};
    const customUrl = '/custom-mock-sw.js';
    initTWD(files, { serviceWorker: true, serviceWorkerUrl: customUrl });
    
    expect(mockInitRequestMocking).toHaveBeenCalledWith(customUrl);
  });

  it('should not initialize request mocking when serviceWorker is false', () => {
    const files = {};
    initTWD(files, { serviceWorker: false });
    
    expect(mockInitRequestMocking).not.toHaveBeenCalled();
  });

  it('should initialize request mocking by default when serviceWorker option is not provided', () => {
    const files = {};
    initTWD(files);
    
    expect(mockInitRequestMocking).toHaveBeenCalledWith('/mock-sw.js');
  });

  it('should handle all options together', () => {
    const files = {};
    initTWD(files, { 
      open: false, 
      position: 'right', 
      serviceWorker: true, 
      serviceWorkerUrl: '/custom-sw.js' 
    });
    
    expect(initTests).toHaveBeenCalled();
    const callArgs = (initTests as any).mock.calls[0];
    expect(callArgs[1].props).toEqual({ open: false, position: 'right' });
    expect(mockInitRequestMocking).toHaveBeenCalledWith('/custom-sw.js');
  });
});

