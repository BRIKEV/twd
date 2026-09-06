import { useState, useEffect, useMemo } from 'react';
import { TestList } from './TestList';
import { ClosedSidebar } from './ClosedSidebar';
import { useLayout } from './hooks/useLayout';
import { handlers, TestRunner } from '../runner';
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
import { PaceSelect, PACE_OPTIONS } from './PaceSelect';
import { setPace } from '../pace';

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

const collectTestIds = (nodes: Node[]): string[] => {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.type === 'test') ids.push(node.id);
    if (node.childrenNodes) ids.push(...collectTestIds(node.childrenNodes));
  }
  return ids;
};

export const TWDSidebar = ({ open, position = 'left', search, pace }: TWDSidebarProps) => {
  const [refreshKey, setRefresh] = useState(0);
  const [isOpen, setIsOpen] = useState(getOpenState(open));
  useLayout({ isOpen, position });
  const [message, setMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState(getSearchQuery(search));
  const [paceMs, setPaceMs] = useState(getStoredPace(pace));

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

  const { filteredTestIds, displayTests } = useMemo(() => {
    if (searchQuery) {
      const ids = collectTestIds(filteredRoots);
      const idSet = new Set(ids);
      return {
        filteredTestIds: ids,
        displayTests: tests.filter((t) => t.type === 'test' && idSet.has(t.id)),
      };
    }
    return {
      filteredTestIds: null as string[] | null,
      displayTests: tests.filter((t) => t.type === 'test'),
    };
  }, [filteredRoots, searchQuery, refreshKey]);

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
    await runner.runSingle(test.id);
    const srMessage = displaySRMessageSpecificTest(test);
    setMessage(srMessage);
  };

  if (!isOpen) {
    return <ClosedSidebar position={position} setOpen={handleSetIsOpen} />;
  }

  const totalTests = displayTests.length;

  return (
    <div
      className="twd-sidebar"
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
              <span aria-live="polite">{searchQuery ? 'Run Filtered' : 'Run All'}</span>
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
            <span className="twd-sidebar-version">v{TWD_VERSION}</span>
          </div>
          <button
            aria-label="Close sidebar"
            className="twd-btn twd-btn-icon"
            onClick={() => handleSetIsOpen(false)}
          >
            ✖
          </button>
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
        <MockRulesButton />
        {search && <SearchInput value={searchQuery} onChange={handleSearchChange} />}
      </div>
      <div className="twd-sidebar-content">
        <TestList roots={filteredRoots} runTest={runTest} searchQuery={searchQuery} />
      </div>
    </div>
  );
};
