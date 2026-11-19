import { useEffect, useState } from 'react';
import { getMatchingViewports, hasViewports } from '../../viewports';

export interface ViewportSnapshot {
  /** Window width in CSS px, the width media queries see. */
  width: number;
  /** Whether the project declared any viewport. */
  defined: boolean;
  /** Declared viewports matching the window, in registry order. */
  matching: string[];
}

const read = (): ViewportSnapshot => ({
  width: window.innerWidth,
  defined: hasViewports(),
  matching: getMatchingViewports(),
});

const same = (a: ViewportSnapshot, b: ViewportSnapshot) =>
  a.width === b.width &&
  a.defined === b.defined &&
  a.matching.length === b.matching.length &&
  a.matching.every((name, i) => name === b.matching[i]);

/** Live view of the window width and the matching viewports. */
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
