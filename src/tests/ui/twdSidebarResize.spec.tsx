import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import * as twd from '../../runner';
import { TWDSidebar } from '../../ui/TWDSidebar';
import { defineViewports, resetViewports } from '../../viewports';
import { partitionTree } from '../../ui/utils/partitionTree';

// Wrap the real partition so the test can count how often the sidebar rebuilds
// its tree: that is the expensive part of a sidebar render.
vi.mock('../../ui/utils/partitionTree', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../ui/utils/partitionTree')>();
  return { partitionTree: vi.fn(actual.partitionTree) };
});

const resizeTo = (width: number) => {
  act(() => {
    window.innerWidth = width;
    window.dispatchEvent(new Event('resize'));
  });
};

describe('TWDSidebar - resize cost', () => {
  beforeEach(() => {
    twd.clearTests();
    resetViewports();
    sessionStorage.clear();
    window.innerWidth = 1280;
    defineViewports({ mobile: { maxWidth: 767 }, desktop: { minWidth: 1024 } });
    twd.describe('Group', () => {
      twd.it('mobile test', { viewport: 'mobile' }, () => {});
      twd.it('desktop test', { viewport: 'desktop' }, () => {});
    });
  });

  it('does not rebuild the test tree while resizing inside the same viewport', () => {
    render(<TWDSidebar open />);
    const calls = vi.mocked(partitionTree).mock.calls.length;

    resizeTo(1250);
    resizeTo(1200);
    resizeTo(1100);

    expect(vi.mocked(partitionTree).mock.calls.length).toBe(calls);
    // The chip still follows the width.
    expect(screen.getByTestId('twd-viewport-chip')).toHaveTextContent('desktop · 1100px');
    expect(
      screen.getByText('Not in Run All at 1100px. Play still works.', { exact: false }),
    ).toBeInTheDocument();
  });

  it('rebuilds the test tree once when the resize crosses into another viewport', () => {
    render(<TWDSidebar open />);
    const calls = vi.mocked(partitionTree).mock.calls.length;

    resizeTo(700);
    resizeTo(650);
    resizeTo(390);

    expect(vi.mocked(partitionTree).mock.calls.length).toBe(calls + 1);
    expect(screen.getByTestId('twd-viewport-chip')).toHaveTextContent('mobile · 390px');
  });
});
