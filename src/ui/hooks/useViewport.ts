import { useEffect, useState } from 'react';
import { getMatchingViewports, hasViewports } from '../../viewports';

export interface ViewportSnapshot {
  /** Whether the project declared any viewport. */
  defined: boolean;
  /** Declared viewports matching the window, in registry order. */
  matching: string[];
}

const read = (): ViewportSnapshot => ({
  defined: hasViewports(),
  matching: getMatchingViewports(),
});

const same = (a: ViewportSnapshot, b: ViewportSnapshot) =>
  a.defined === b.defined &&
  a.matching.length === b.matching.length &&
  a.matching.every((name, i) => name === b.matching[i]);

/**
 * Live view of the matching viewports. It changes only when a resize crosses a
 * breakpoint, so the whole sidebar does not re-render on every resize event:
 * the width itself lives in `useWindowWidth`, read only by what displays it.
 */
export const useViewport = (): ViewportSnapshot => {
  const [snapshot, setSnapshot] = useState(read);

  useEffect(() => {
    const update = () => {
      const next = read();
      setSnapshot((prev) => (same(prev, next) ? prev : next));
    };
    // DevTools device mode fires resize too, and matchMedia results only change
    // when the window does, so resize covers every case.
    window.addEventListener('resize', update);
    window.addEventListener('twd:viewports-change', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('twd:viewports-change', update);
    };
  }, []);

  return snapshot;
};

/**
 * A value derived from the window width, updated on resize. React skips the
 * re-render when the derived value is unchanged, so deriving a boolean is
 * cheap; deriving the width re-renders on every event, so keep that to leaf
 * components.
 */
export const useWindowWidthValue = <T>(derive: (width: number) => T): T => {
  const [value, setValue] = useState(() => derive(window.innerWidth));

  useEffect(() => {
    const update = () => setValue(derive(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
    // `derive` is expected to be a module-level function, so it never changes.
  }, []);

  return value;
};

const identity = (width: number) => width;

/** The window width in CSS px, the width media queries see. */
export const useWindowWidth = () => useWindowWidthValue(identity);
