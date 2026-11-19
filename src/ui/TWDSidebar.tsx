import { useState, useEffect, useMemo, useRef } from 'react';
import { TestList } from './TestList';
import { ClosedSidebar } from './ClosedSidebar';
import { useLayout, shouldOverlay } from './hooks/useLayout';
import { useViewport, useWindowWidthValue } from './hooks/useViewport';
import { handlers, TestRunner, type Handler } from '../runner';
import { MockRulesButton } from './MockRulesButton';
import { clearRequestMockRules } from '../commands/mockBridge';
import { clearComponentMocks } from './componentMocks';
import { isChaiAssertionError, printChaiError, formatChaiError } from './utils/chaiErrorFormat';
import { LogType } from './utils/formatLogs';
import {
  displaySRMessageSpecificTest,
  displaySRMessageAllTests,
} from './utils/screenReaderMessages';
import { TWD_VERSION } from '../constants/version';
import { SearchInput } from './SearchInput';
import { filterTree } from './utils/filterTree';
import { buildTreeFromHandlers, type Node } from './utils/buildTreeFromHandlers';
import { markOtherViewports } from './utils/markOtherViewports';
import { PaceSelect, PACE_OPTIONS } from './PaceSelect';
import { ViewportChip } from './ViewportChip';
import { RunPill } from './RunPill';
import { setPace } from '../pace';
import {
  describeViewports,
  getEffectiveViewport,
  getViewportConfig,
  isInCurrentViewport,
} from '../viewports';

interface TWDSidebarProps {
  /**
   * Whether the sidebar is open by default
   */
  open: boolean;
  /**
   * Sidebar position
   * - left: Sidebar on the left side (default)
   * - right: Sidebar on the right side
   *
   * @default "left"
   */
  position?: 'left' | 'right';
  /**
   * Whether to show the search/filter input
   */
  search?: boolean;
  /**
   * Whether to show the execution speed selector
   */
  pace?: boolean;
  /**
   * Whether to show the mock rules button (triggered count, logs the rules)
   * @default false
   */
  mockRules?: boolean;
}

const positionStyles = {
  left: { left: 0, borderRight: '1px solid var(--twd-border)' },
  right: { right: 0, borderLeft: '1px solid var(--twd-border)' },
};

const getSearchQuery = (search?: boolean) => {
  if (!search) {
    sessionStorage.removeItem('twd-search-filter');
    return '';
  }
  return sessionStorage.getItem('twd-search-filter') || '';
};

const PACE_STORAGE_KEY = 'twd-pace';

// Read back through the option list rather than trusting the stored number.
// sessionStorage survives a reload that changed the options, and setPace clamps
// silently, so an unknown value would leave the select and the runner disagreeing.
const getStoredPace = (pace?: boolean) => {
  if (!pace) {
    sessionStorage.removeItem(PACE_STORAGE_KEY);
    return 0;
  }
  const stored = Number(sessionStorage.getItem(PACE_STORAGE_KEY));
  return PACE_OPTIONS.some((option) => option.value === stored) ? stored : 0;
};

const getOpenState = (open: boolean) => {
  if (!sessionStorage.getItem('twd-sidebar-open')) {
    return open;
  }
  return sessionStorage.getItem('twd-sidebar-open') === 'true';
};

const collectTests = (nodes: Node[]): Node[] =>
  nodes.flatMap((node) => (node.type === 'test' ? [node] : collectTests(node.childrenNodes ?? [])));

const collectTestIds = (nodes: Node[]): string[] => {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.type === 'test') ids.push(node.id);
    if (node.childrenNodes) ids.push(...collectTestIds(node.childrenNodes));
  }
  return ids;
};

// The badge shown on a test for another viewport: what it was written for.
const viewportBadgeFor = (handler: Handler | undefined) => {
  if (!handler) return '';
  const { viewports } = getViewportConfig();
  return (getEffectiveViewport(handler) ?? [])
    .map((name) => (viewports[name] ? name : `unknown: ${name}`))
    .join(', ');
};

interface RunProgress {
  total: number;
  done: number;
  passed: number;
  failed: number;
}

export const TWDSidebar = ({
  open,
  position = 'left',
  search,
  pace,
  mockRules = false,
}: TWDSidebarProps) => {
  const [refreshKey, setRefresh] = useState(0);
  const [isOpen, setIsOpen] = useState(getOpenState(open));
  const viewport = useViewport();
  const [run, setRun] = useState<RunProgress | null>(null);
  const [hiddenForRun, setHiddenForRun] = useState(false);
  const [scrollToFailure, setScrollToFailure] = useState(false);
  // The layout mode is locked while a run is in progress: switching between
  // push and overlay reflows the page under test.
  const wantsOverlay = useWindowWidthValue(shouldOverlay);
  const [overlay, setOverlay] = useState(wantsOverlay);
  const isRunning = run !== null;
  useEffect(() => {
    if (!isRunning) setOverlay(wantsOverlay);
  }, [wantsOverlay, isRunning]);
  useLayout({ isOpen, position, overlay });
  const [message, setMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState(getSearchQuery(search));
  const [paceMs, setPaceMs] = useState(getStoredPace(pace));

  // Run listeners are registered once; they read the latest values from here.
  const latest = useRef({ isOpen, overlay });
  latest.current = { isOpen, overlay };

  // Pacing lives in module state so that every run picks it up, including the
  // ones twd-relay triggers from outside the tab. The sidebar only has to keep
  // that state in step with the selection.
  useEffect(() => {
    setPace(paceMs);
  }, [paceMs]);

  useEffect(() => {
    const onStateChange = () => setRefresh((n) => n + 1);
    window.addEventListener('twd:state-change', onStateChange);
    return () => window.removeEventListener('twd:state-change', onStateChange);
  }, []);

  // Follow every run, whoever started it (this sidebar, twd-relay, a script),
  // through the runner's window events.
  useEffect(() => {
    const onRunStart = (event: Event) => {
      const { total } = (event as CustomEvent<{ total: number }>).detail;
      setRun({ total, done: 0, passed: 0, failed: 0 });
      // Hiding only ever happens in overlay mode, where it does not move the page.
      if (latest.current.isOpen && latest.current.overlay) setHiddenForRun(true);
    };
    const onTestEnd = (event: Event) => {
      const { status } = (event as CustomEvent<{ status: string }>).detail;
      setRun(
        (prev) =>
          prev && {
            ...prev,
            done: prev.done + 1,
            passed: prev.passed + (status === 'pass' ? 1 : 0),
            failed: prev.failed + (status === 'fail' ? 1 : 0),
          },
      );
    };
    const onRunEnd = () => {
      setRun(null);
      setHiddenForRun((wasHidden) => {
        if (wasHidden) setScrollToFailure(true);
        return false;
      });
    };
    window.addEventListener('twd:run-start', onRunStart);
    window.addEventListener('twd:test-end', onTestEnd);
    window.addEventListener('twd:run-end', onRunEnd);
    return () => {
      window.removeEventListener('twd:run-start', onRunStart);
      window.removeEventListener('twd:test-end', onTestEnd);
      window.removeEventListener('twd:run-end', onRunEnd);
    };
  }, []);

  useEffect(() => {
    if (!scrollToFailure) return;
    setScrollToFailure(false);
    const failed = document.querySelector<HTMLElement>(
      '[data-testid="twd-sidebar"] .twd-status-fail',
    );
    failed?.scrollIntoView?.({ block: 'center' });
  }, [scrollToFailure]);

  const runner = new TestRunner({
    onStart: (test) => {
      test.status = 'running';
      setRefresh((n) => n + 1);
    },
    onPass: (test) => {
      test.status = 'pass';
      setRefresh((n) => n + 1);
    },
    onFail: (test, err) => {
      test.status = 'fail';
      console.group(`%c❌ Test failed: ${test.name}`, 'color: red; font-weight: bold;');
      if (isChaiAssertionError(err)) {
        printChaiError(err);
        const formattedError = formatChaiError(err);
        if (formattedError.type === 'diff') {
          // Store structured error data as JSON string with prefix
          test.logs.push(
            JSON.stringify({
              type: LogType.CHAI_DIFF,
              expected: formattedError.expected,
              actual: formattedError.actual,
            }),
          );
        } else {
          test.logs.push(
            JSON.stringify({
              type: LogType.CHAI_MESSAGE,
              message: `Test failed: ${formattedError.message}`,
            }),
          );
        }
      } else {
        console.error(err.message);
        test.logs.push(
          JSON.stringify({
            type: LogType.ERROR,
            message: `Test failed: ${err.message}`,
          }),
        );
      }
      console.groupEnd();
      setRefresh((n) => n + 1);
    },
    onSkip: (test) => {
      test.status = 'skip';
      setRefresh((n) => n + 1);
    },
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value) {
      sessionStorage.setItem('twd-search-filter', value);
    } else {
      sessionStorage.removeItem('twd-search-filter');
    }
  };

  const handlePaceChange = (ms: number) => {
    setPaceMs(ms);
    if (ms) {
      sessionStorage.setItem(PACE_STORAGE_KEY, ms.toString());
    } else {
      sessionStorage.removeItem(PACE_STORAGE_KEY);
    }
  };

  const handleSetIsOpen = (open: boolean) => {
    setIsOpen(open);
    sessionStorage.setItem('twd-sidebar-open', open.toString());
  };

  const tests = Array.from(handlers.values());

  const roots = useMemo(() => buildTreeFromHandlers(tests), [refreshKey]);

  const filteredRoots = useMemo(() => filterTree(roots, searchQuery), [roots, searchQuery]);

  // With viewports declared, tests outside the current width stay in place,
  // greyed and badged. Without them, nothing is marked.
  const markedRoots = useMemo(() => {
    if (!viewport.defined) return filteredRoots;
    return markOtherViewports(
      filteredRoots,
      (node) => {
        const handler = handlers.get(node.id);
        return handler ? isInCurrentViewport(handler, viewport.matching) : true;
      },
      (node) => viewportBadgeFor(handlers.get(node.id)),
    );
  }, [filteredRoots, viewport.defined, viewport.matching, refreshKey]);

  const { filteredTestIds, displayTests } = useMemo(() => {
    const matchingIds = new Set(
      collectTests(markedRoots)
        .filter((node) => node.viewportBadge === undefined)
        .map((node) => node.id),
    );
    return {
      // The runner narrows these to the current viewport on its own.
      filteredTestIds: searchQuery ? collectTestIds(filteredRoots) : null,
      // Totals describe the tests Run All would run here.
      displayTests: tests.filter((t) => t.type === 'test' && matchingIds.has(t.id)),
    };
  }, [markedRoots, filteredRoots, searchQuery, refreshKey]);

  const runAll = async () => {
    // Clear the last run test name when running all tests
    setMessage('');
    sessionStorage.removeItem('twd-last-run-test-name');
    if (filteredTestIds) {
      await runner.runByIds(filteredTestIds);
    } else {
      await runner.runAll();
    }
    const srMessage = displaySRMessageAllTests(tests);
    setMessage(srMessage);
  };

  const runTest = async (id: string) => {
    const test = Array.from(handlers.values())
      .filter((h) => h.type === 'test')
      .find((t) => t.id === id);
    if (!test) return;
    // Save test name to session storage for scroll persistence
    setMessage('');
    sessionStorage.setItem('twd-last-run-test-name', test.name);
    // Decided before the run: the width it ran at is the one that matters.
    const width = window.innerWidth;
    const offViewport = viewport.defined && !isInCurrentViewport(test);
    await runner.runSingle(test.id);
    if (offViewport) {
      test.logs.unshift(
        JSON.stringify({
          type: LogType.VIEWPORT_WARNING,
          message: `Written for ${describeViewports(getEffectiveViewport(test) ?? [])}. Ran at ${width}px, so layout differences are expected.`,
        }),
      );
      setRefresh((n) => n + 1);
    }
    const srMessage = displaySRMessageSpecificTest(test);
    setMessage(srMessage);
  };

  if (!isOpen) {
    return <ClosedSidebar position={position} setOpen={handleSetIsOpen} />;
  }

  if (hiddenForRun && run) {
    return (
      <RunPill
        position={position}
        done={run.done}
        total={run.total}
        passed={run.passed}
        failed={run.failed}
        onShow={() => setHiddenForRun(false)}
      />
    );
  }

  const totalTests = displayTests.length;
  const viewportSuffix =
    viewport.defined && viewport.matching.length ? ` · ${viewport.matching.join(', ')}` : '';

  return (
    <div
      className={`twd-sidebar${overlay ? ' twd-sidebar-overlay' : ''}`}
      style={positionStyles[position]}
      data-testid="twd-sidebar"
      role="complementary"
      aria-label="Test While Developing sidebar"
    >
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          margin: '-1px',
          border: '0',
          padding: '0',
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
        }}
      >
        {message}
      </div>
      <div data-testid="twd-sidebar-header" className="twd-sidebar-header">
        <div className="twd-sidebar-header-row">
          <div className="twd-sidebar-header-buttons">
            <button
              onClick={() => {
                void runAll();
              }}
              className="twd-btn twd-btn-primary"
            >
              <span aria-live="polite">
                {searchQuery ? 'Run Filtered' : 'Run All'}
                {viewportSuffix}
              </span>
            </button>
            <button
              onClick={() => {
                clearRequestMockRules();
                clearComponentMocks();
              }}
              aria-label="Clear all mocks"
              className="twd-btn twd-btn-secondary"
            >
              Clear mocks
            </button>
          </div>
          <button
            aria-label="Close sidebar"
            className="twd-btn twd-btn-icon"
            onClick={() => handleSetIsOpen(false)}
          >
            ✖
          </button>
        </div>
        <div className="twd-sidebar-meta-row">
          {viewport.defined && <ViewportChip matching={viewport.matching} />}
          <span className="twd-sidebar-version">v{TWD_VERSION}</span>
        </div>
        <div className="twd-sidebar-stats">
          <span style={{ color: 'var(--twd-text)' }}>Total: {totalTests}</span>
          <div className="twd-sidebar-stats-counts">
            <span style={{ color: 'var(--twd-success)' }}>
              &#10003; {displayTests.filter((test) => test.status === 'pass').length}
            </span>
            <span style={{ color: 'var(--twd-error)' }}>
              &#10007; {displayTests.filter((test) => test.status === 'fail').length}
            </span>
          </div>
        </div>
        {pace && <PaceSelect value={paceMs} onChange={handlePaceChange} />}
        {mockRules && <MockRulesButton />}
        {search && <SearchInput value={searchQuery} onChange={handleSearchChange} />}
      </div>
      <div className="twd-sidebar-content">
        <TestList roots={markedRoots} runTest={runTest} searchQuery={searchQuery} />
      </div>
    </div>
  );
};
