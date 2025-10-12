import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initTests } from '../../initializers/initTests';
import { initSidebar } from '../../initializers/initSidebar';
import { TWDSidebar } from '../../ui/TWDSidebar';

// Mock initSidebar so we don’t actually render anything
vi.mock('../../initializers/initSidebar', () => ({
  initSidebar: vi.fn(),
}))


describe('initTests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should run all test modules and then initialize sidebar', async () => {
    const testFn1 = vi.fn().mockResolvedValue(undefined)
    const testFn2 = vi.fn().mockResolvedValue(undefined)
    const fakeModules = {
      './one.twd.test.ts': testFn1,
      './two.twd.test.ts': testFn2,
    }

    const createRoot = vi.fn().mockReturnValue({ render: vi.fn() })

    await initTests(fakeModules, <TWDSidebar open={true} position="right" />, createRoot)

    expect(testFn1).toHaveBeenCalledTimes(1)
    expect(testFn2).toHaveBeenCalledTimes(1)

    expect(initSidebar).toHaveBeenCalledTimes(1)
    expect(initSidebar).toHaveBeenCalledWith({ Component: <TWDSidebar open={true} position="right" />, createRoot })
  })

  it('should handle empty testModules gracefully', async () => {
    const fakeModules = {}
    const createRoot = vi.fn().mockReturnValue({ render: vi.fn() })

    await expect(initTests(fakeModules, <TWDSidebar open={false} position="right" />, createRoot)).resolves.not.toThrow()
    expect(initSidebar).toHaveBeenCalledWith({ Component: <TWDSidebar open={false} position="right" />, createRoot })
  })
})
