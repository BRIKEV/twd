import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock functions using vi.hoisted to make them available in hoisted vi.mock calls
const { mockRmSync, mockResolve } = vi.hoisted(() => ({
  mockRmSync: vi.fn(),
  mockResolve: vi.fn(),
}));

// Mock the modules before importing the plugin
vi.mock('fs', () => ({
  rmSync: mockRmSync,
  default: {
    rmSync: mockRmSync,
  },
}));

vi.mock('path', () => ({
  resolve: mockResolve,
  default: {
    resolve: mockResolve,
  },
}));

// Import after mocks are set up
import { removeMockServiceWorker } from '../../vite-plugin';

describe('removeMockServiceWorker', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockRmSync.mockClear();
    mockResolve.mockClear();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return a valid Vite plugin object', () => {
    const plugin = removeMockServiceWorker();

    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('remove-mock-sw');
    expect(plugin.apply).toBe('build');
    expect(plugin.closeBundle).toBeDefined();
    expect(typeof plugin.closeBundle).toBe('function');
  });

  it('should have the correct plugin configuration', () => {
    const plugin = removeMockServiceWorker();

    // Verify the plugin name
    expect(plugin.name).toBe('remove-mock-sw');

    // Verify it only applies during build
    expect(plugin.apply).toBe('build');
  });

  it('should remove mock-sw.js when file exists', () => {
    const plugin = removeMockServiceWorker();
    const resolvedPath = 'dist/mock-sw.js';
    
    mockResolve.mockReturnValue(resolvedPath);
    mockRmSync.mockImplementation(() => {}); // Success case

    // closeBundle is a function in our implementation
    (plugin.closeBundle as () => void)();

    expect(mockResolve).toHaveBeenCalledWith('dist/mock-sw.js');
    expect(mockRmSync).toHaveBeenCalledWith(resolvedPath);
    expect(consoleLogSpy).toHaveBeenCalledWith('🧹 Removed mock-sw.js from build');
  });

  it('should handle error gracefully when file does not exist', () => {
    const plugin = removeMockServiceWorker();
    const resolvedPath = 'dist/mock-sw.js';
    
    mockResolve.mockReturnValue(resolvedPath);
    mockRmSync.mockImplementation(() => {
      throw new Error('File not found');
    }); // Error case

    // closeBundle is a function in our implementation
    (plugin.closeBundle as () => void)();

    expect(mockResolve).toHaveBeenCalledWith('dist/mock-sw.js');
    expect(mockRmSync).toHaveBeenCalledWith(resolvedPath);
    expect(consoleLogSpy).toHaveBeenCalledWith('🧹 No mock-sw.js found in build');
  });
});
