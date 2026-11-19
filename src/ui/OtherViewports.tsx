import { useState } from 'react';
import type { Node } from './utils/buildTreeFromHandlers';
import { TestList } from './TestList';
import ChevronDown from './Icons/ChevronDown';
import ChevronRight from './Icons/ChevronRight';

const STORAGE_KEY = 'twd-other-viewports-open';

interface OtherViewportsProps {
  roots: Node[];
  count: number;
  width: number;
  runTest: (id: string) => Promise<void>;
}

const readOpen = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

/**
 * Tests that do not belong to the current width. Greyed, never hidden: search
 * still finds them and the play button still runs them.
 */
export const OtherViewports = ({ roots, count, width, runTest }: OtherViewportsProps) => {
  const [open, setOpen] = useState(readOpen);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Storage can be unavailable; the toggle still works for this render.
    }
  };

  return (
    <div
      className="twd-other-viewports"
      role="group"
      aria-label="Tests for other viewports, not run by Run All"
      data-testid="twd-other-viewports"
    >
      <button className="twd-other-viewports-toggle" aria-expanded={open} onClick={toggle}>
        <span>Other viewports ({count})</span>
        {open ? <ChevronDown /> : <ChevronRight />}
      </button>
      <p className="twd-other-viewports-hint">Not in Run All at {width}px. Play still works.</p>
      {open && <TestList roots={roots} runTest={runTest} listLabel="Tests for other viewports" />}
    </div>
  );
};
