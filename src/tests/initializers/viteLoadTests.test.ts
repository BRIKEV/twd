import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initViteLoadTests } from '../../initializers/viteLoadTests';
import { initSidebar } from '../../initializers/initSidebar';

// Mock initSidebar so we don’t actually render anything
vi.mock('../../initializers/initSidebar', () => ({
  initSidebar: vi.fn(),
}))


describe('initViteLoadTests', () => {
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

    const options = { open: true, position: 'right' as const }

    await initViteLoadTests(fakeModules, options)

    expect(testFn1).toHaveBeenCalledTimes(1)
    expect(testFn2).toHaveBeenCalledTimes(1)

    expect(initSidebar).toHaveBeenCalledTimes(1)
    expect(initSidebar).toHaveBeenCalledWith(options)
  })

  it('should handle empty testModules gracefully', async () => {
    const fakeModules = {}
    const options = { open: false }

    await expect(initViteLoadTests(fakeModules, options)).resolves.not.toThrow()
    expect(initSidebar).toHaveBeenCalledWith(options)
  })
})
