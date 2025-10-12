import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initSidebar } from '../../initializers/initSidebar';
import { TWDSidebar } from '../../ui/TWDSidebar';

describe('initSidebar', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('should append a div to the document body', async () => {
    const createRoot = vi.fn().mockReturnValue({ render: vi.fn() })
    await initSidebar({
      Component: <TWDSidebar open={true} position="left" />,
      createRoot,
    })
    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(document.body.querySelectorAll('div').length).toBe(1);
  })
})
