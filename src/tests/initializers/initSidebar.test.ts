import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initSidebar } from '../../initializers/initSidebar';
import { TWDSidebar } from '../../ui/TWDSidebar';
// Reimport after mocking
import { createRoot } from 'react-dom/client'

// Mock react-dom/client
vi.mock('react-dom/client', () => {
  return {
    createRoot: vi.fn(() => ({
      render: vi.fn(),
    })),
  }
});

describe('initSidebar', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('should append a div to the document body', async () => {
    await initSidebar({ open: true })
    const divs = document.body.querySelectorAll('div')
    expect(divs.length).toBe(1)
  })

  it('should create a React root and render TWDSidebar with correct props', async () => {
    const renderMock = vi.fn()
    ;(createRoot as any).mockReturnValueOnce({ render: renderMock })

    await initSidebar({ open: false, position: 'right' })

    expect(createRoot).toHaveBeenCalledTimes(1)
    expect(renderMock).toHaveBeenCalledTimes(1)

    // Shallow match: the JSX type and props
    const element = renderMock.mock.calls[0][0]
    expect(element.type).toBe(TWDSidebar)
    expect(element.props).toEqual({ open: false, position: 'right' })
  })
})
