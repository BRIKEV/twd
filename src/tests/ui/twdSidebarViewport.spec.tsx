import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, act, within } from '@testing-library/react';
import * as twd from '../../runner';
import { TWDSidebar } from '../../ui/TWDSidebar';
import { defineViewports, resetViewports } from '../../viewports';

const VIEWPORTS = {
  mobile: { maxWidth: 767 },
  desktop: { minWidth: 1024 },
};

const resizeTo = (width: number) => {
  act(() => {
    window.innerWidth = width;
    window.dispatchEvent(new Event('resize'));
  });
};

// A test body that stays pending until the returned release() is called.
const deferred = () => {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { body: () => promise, release };
};

describe('TWDSidebar - viewports', () => {
  beforeEach(() => {
    twd.clearTests();
    resetViewports();
    sessionStorage.clear();
    vi.clearAllMocks();
    window.innerWidth = 1280;
    document.documentElement.style.marginLeft = '0';
    document.documentElement.style.marginRight = '0';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('without declared viewports', () => {
    it('shows no chip, no other-viewports group and the plain Run All label', () => {
      twd.describe('Group', () => {
        twd.it('tagged but ignored', { viewport: 'mobile' }, () => {});
      });
      render(<TWDSidebar open />);
      expect(screen.getByText('Run All')).toBeInTheDocument();
      expect(screen.queryByTestId('twd-viewport-chip')).not.toBeInTheDocument();
      expect(screen.queryByText(/Other viewports/)).not.toBeInTheDocument();
      expect(screen.getByText('Total: 1')).toBeInTheDocument();
    });
  });

  describe('viewport chip', () => {
    it('shows the matching viewport and the width, live on resize', () => {
      defineViewports(VIEWPORTS);
      window.innerWidth = 390;
      render(<TWDSidebar open />);
      const chip = screen.getByTestId('twd-viewport-chip');
      expect(chip).toHaveTextContent('mobile · 390px');
      expect(chip).toHaveAccessibleName('Current viewport: mobile, 390 pixels wide');

      resizeTo(1280);
      expect(screen.getByTestId('twd-viewport-chip')).toHaveTextContent('desktop · 1280px');

      resizeTo(900);
      expect(screen.getByTestId('twd-viewport-chip')).toHaveTextContent('no viewport · 900px');
    });

    it('appears when viewports are defined after the first render', () => {
      render(<TWDSidebar open />);
      expect(screen.queryByTestId('twd-viewport-chip')).not.toBeInTheDocument();
      act(() => {
        defineViewports(VIEWPORTS);
      });
      expect(screen.getByTestId('twd-viewport-chip')).toHaveTextContent('desktop · 1280px');
    });
  });

  describe('run buttons', () => {
    it('names the active viewport on Run All and Run Filtered', async () => {
      defineViewports(VIEWPORTS);
      window.innerWidth = 390;
      twd.describe('Group', () => {
        twd.it('opens burger menu', { viewport: 'mobile' }, () => {});
      });
      const user = userEvent.setup();
      render(<TWDSidebar open search />);
      expect(screen.getByText('Run All · mobile')).toBeInTheDocument();
      await user.type(screen.getByRole('searchbox'), 'burger');
      expect(screen.getByText('Run Filtered · mobile')).toBeInTheDocument();
    });

    it('Run All only runs the tests matching the current width', async () => {
      defineViewports(VIEWPORTS, { default: 'desktop' });
      window.innerWidth = 390;
      const mobileFn = vi.fn();
      const desktopFn = vi.fn();
      twd.describe('Header', () => {
        twd.it('opens burger menu', { viewport: 'mobile' }, mobileFn);
        twd.it('shows nav links', desktopFn);
      });
      const user = userEvent.setup();
      render(<TWDSidebar open />);
      await user.click(screen.getByText('Run All · mobile'));
      await waitFor(() => expect(mobileFn).toHaveBeenCalledTimes(1));
      expect(desktopFn).not.toHaveBeenCalled();
    });
  });

  describe('other viewports group', () => {
    const register = () => {
      defineViewports(VIEWPORTS, { default: 'desktop' });
      twd.describe('Header', () => {
        twd.it('opens burger menu', { viewport: 'mobile' }, () => {});
        twd.it('shows nav links', () => {});
        twd.it('has a typo', { viewport: 'deskop' }, () => {});
      });
    };

    it('folds non-matching tests into a collapsed group with a hint', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      register();
      window.innerWidth = 390;
      render(<TWDSidebar open />);

      const toggle = screen.getByRole('button', { name: /Other viewports \(2\)/ });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByText('Not in Run All at 390px. Play still works.')).toBeInTheDocument();
      expect(
        screen.getByRole('group', { name: 'Tests for other viewports, not run by Run All' }),
      ).toBeInTheDocument();
      expect(screen.getByText('opens burger menu')).toBeInTheDocument();
      expect(screen.queryByText('shows nav links')).not.toBeInTheDocument();
      // Totals describe the matching set only.
      expect(screen.getByText('Total: 1')).toBeInTheDocument();
    });

    it('expands to show badges, and remembers the choice', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      register();
      window.innerWidth = 390;
      const user = userEvent.setup();
      const { unmount } = render(<TWDSidebar open />);

      await user.click(screen.getByRole('button', { name: /Other viewports \(2\)/ }));
      expect(screen.getByRole('button', { name: /Other viewports \(2\)/ })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      const group = screen.getByRole('group', {
        name: 'Tests for other viewports, not run by Run All',
      });
      expect(within(group).getByText('shows nav links')).toBeInTheDocument();
      expect(within(group).getByText('desktop')).toBeInTheDocument();
      expect(within(group).getByText('unknown: deskop')).toBeInTheDocument();
      expect(
        within(group).getByRole('button', {
          name: 'Run shows nav links test, written for desktop',
        }),
      ).toBeInTheDocument();
      expect(sessionStorage.getItem('twd-other-viewports-open')).toBe('true');

      unmount();
      render(<TWDSidebar open />);
      expect(screen.getByRole('button', { name: /Other viewports \(2\)/ })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('moves tests between sections when the window is resized', () => {
      register();
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      window.innerWidth = 390;
      render(<TWDSidebar open />);
      expect(screen.getByText('opens burger menu')).toBeInTheDocument();
      expect(screen.queryByText('shows nav links')).not.toBeInTheDocument();

      resizeTo(1280);
      expect(screen.getByText('shows nav links')).toBeInTheDocument();
      expect(screen.queryByText('opens burger menu')).not.toBeInTheDocument();
    });

    it('play on a non-matching test runs it and prepends a viewport warning', async () => {
      defineViewports(VIEWPORTS, { default: 'desktop' });
      window.innerWidth = 390;
      sessionStorage.setItem('twd-other-viewports-open', 'true');
      const desktopFn = vi.fn();
      twd.describe('Header', () => {
        twd.it('opens burger menu', { viewport: 'mobile' }, () => {});
        twd.it('shows nav links', desktopFn);
      });
      const user = userEvent.setup();
      render(<TWDSidebar open />);

      await user.click(
        screen.getByRole('button', { name: 'Run shows nav links test, written for desktop' }),
      );
      await waitFor(() => expect(desktopFn).toHaveBeenCalledTimes(1));
      expect(
        await screen.findByText(
          'Written for desktop (min 1024px). Ran at 390px, so layout differences are expected.',
        ),
      ).toBeInTheDocument();
      // The off-viewport pass does not count in the header totals.
      const stats = screen.getByText('Total: 1').parentElement!;
      expect(within(stats).getByText(/✓/)).toHaveTextContent('✓ 0');
    });

    it('does not add the warning when the test matches', async () => {
      defineViewports(VIEWPORTS);
      window.innerWidth = 390;
      twd.describe('Header', () => {
        twd.it('opens burger menu', { viewport: 'mobile' }, () => {});
      });
      const user = userEvent.setup();
      render(<TWDSidebar open />);
      await user.click(screen.getByRole('button', { name: 'Run opens burger menu test' }));
      await waitFor(() =>
        expect(screen.getByText('opens burger menu').closest('.twd-status-pass')).not.toBeNull(),
      );
      expect(screen.queryByText(/Written for/)).not.toBeInTheDocument();
    });
  });

  describe('layout modes', () => {
    it('pushes the page when there is room, overlays it when there is not', () => {
      render(<TWDSidebar open position="left" />);
      expect(document.documentElement).toHaveStyle({ marginLeft: '280px' });
      expect(screen.getByTestId('twd-sidebar')).not.toHaveClass('twd-sidebar-overlay');

      resizeTo(390);
      expect(document.documentElement).toHaveStyle({ marginLeft: '0px' });
      expect(screen.getByTestId('twd-sidebar')).toHaveClass('twd-sidebar-overlay');

      resizeTo(1280);
      expect(document.documentElement).toHaveStyle({ marginLeft: '280px' });
    });

    it('overlays at small widths even with no viewports declared', () => {
      window.innerWidth = 390;
      render(<TWDSidebar open position="right" />);
      expect(document.documentElement).toHaveStyle({ marginRight: '0px' });
      expect(screen.getByTestId('twd-sidebar')).toHaveClass('twd-sidebar-overlay');
    });

    it('does not switch mode while a run is in progress', async () => {
      const pending = deferred();
      twd.describe('Group', () => {
        twd.it('slow', pending.body);
      });
      const user = userEvent.setup();
      render(<TWDSidebar open position="left" />);
      await user.click(screen.getByText('Run All'));
      resizeTo(390);
      expect(document.documentElement).toHaveStyle({ marginLeft: '280px' });

      await act(async () => {
        pending.release();
        await Promise.resolve();
      });
      await waitFor(() => expect(document.documentElement).toHaveStyle({ marginLeft: '0px' }));
    });
  });

  describe('run pill', () => {
    it('hides the overlay during a run, shows progress, and restores it at the end', async () => {
      window.innerWidth = 390;
      const pending = deferred();
      twd.describe('Group', () => {
        twd.it('fast', () => {});
        twd.it('slow', pending.body);
      });
      const user = userEvent.setup();
      render(<TWDSidebar open />);
      await user.click(screen.getByText('Run All'));

      const pill = await screen.findByRole('status', { name: 'TWD run progress' });
      expect(screen.queryByTestId('twd-sidebar')).not.toBeInTheDocument();
      await waitFor(() => expect(pill).toHaveTextContent('TWD 1/2'));
      expect(pill).toHaveTextContent('✓ 1');
      expect(pill).toHaveTextContent('✗ 0');

      await act(async () => {
        pending.release();
        await Promise.resolve();
      });
      await waitFor(() => expect(screen.getByTestId('twd-sidebar')).toBeInTheDocument());
      expect(screen.queryByRole('status', { name: 'TWD run progress' })).not.toBeInTheDocument();
    });

    it('Show brings the sidebar back without stopping the run', async () => {
      window.innerWidth = 390;
      const pending = deferred();
      const after = vi.fn();
      twd.describe('Group', () => {
        twd.it('slow', pending.body);
        twd.it('after', after);
      });
      const user = userEvent.setup();
      render(<TWDSidebar open />);
      await user.click(screen.getByText('Run All'));
      await user.click(await screen.findByRole('button', { name: 'Show TWD sidebar' }));
      expect(screen.getByTestId('twd-sidebar')).toBeInTheDocument();

      await act(async () => {
        pending.release();
        await Promise.resolve();
      });
      await waitFor(() => expect(after).toHaveBeenCalledTimes(1));
    });

    it('never hides the sidebar in push mode', async () => {
      const pending = deferred();
      twd.describe('Group', () => {
        twd.it('slow', pending.body);
      });
      const user = userEvent.setup();
      render(<TWDSidebar open />);
      await user.click(screen.getByText('Run All'));
      expect(screen.getByTestId('twd-sidebar')).toBeInTheDocument();
      expect(screen.queryByRole('status', { name: 'TWD run progress' })).not.toBeInTheDocument();
      await act(async () => {
        pending.release();
        await Promise.resolve();
      });
    });

    it('also hides for runs started outside the sidebar, such as twd-relay', async () => {
      window.innerWidth = 390;
      const pending = deferred();
      twd.describe('Group', () => {
        twd.it('slow', pending.body);
      });
      render(<TWDSidebar open />);
      const external = new twd.TestRunner({
        onStart: () => {},
        onPass: () => {},
        onFail: () => {},
        onSkip: () => {},
      });
      let run!: Promise<unknown>;
      act(() => {
        run = external.runAll();
      });
      expect(await screen.findByRole('status', { name: 'TWD run progress' })).toBeInTheDocument();
      await act(async () => {
        pending.release();
        await run;
      });
      expect(screen.getByTestId('twd-sidebar')).toBeInTheDocument();
    });

    it('leaves a closed sidebar closed and shows no pill', async () => {
      window.innerWidth = 390;
      const pending = deferred();
      twd.describe('Group', () => {
        twd.it('slow', pending.body);
      });
      render(<TWDSidebar open={false} />);
      const external = new twd.TestRunner({
        onStart: () => {},
        onPass: () => {},
        onFail: () => {},
        onSkip: () => {},
      });
      let run!: Promise<unknown>;
      act(() => {
        run = external.runAll();
      });
      expect(screen.queryByRole('status', { name: 'TWD run progress' })).not.toBeInTheDocument();
      await act(async () => {
        pending.release();
        await run;
      });
      expect(screen.queryByTestId('twd-sidebar')).not.toBeInTheDocument();
      expect(screen.getByText('TWD')).toBeInTheDocument();
    });
  });
});
