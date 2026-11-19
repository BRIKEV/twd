import { useWindowWidth } from './hooks/useViewport';

interface ViewportChipProps {
  matching: string[];
}

const PhoneIcon = () => (
  <svg width="12" height="14" viewBox="0 0 12 16" aria-hidden="true" focusable="false">
    <rect
      x="1.5"
      y="1"
      width="9"
      height="14"
      rx="1.5"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.3"
    />
    <path d="M5 12.5h2" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const MonitorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <rect
      x="1.5"
      y="2.5"
      width="13"
      height="8.5"
      rx="1"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.3"
    />
    <path d="M5.5 14h5M8 11v3" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

/** Read-only: the window is the selector. Resizing it is how you switch viewport. */
export const ViewportChip = ({ matching }: ViewportChipProps) => {
  // Read here, not passed down: only the chip re-renders on every resize event.
  const width = useWindowWidth();
  const names = matching.length ? matching.join(', ') : 'no viewport';
  return (
    <span
      className="twd-viewport-chip"
      data-testid="twd-viewport-chip"
      role="img"
      aria-label={`Current viewport: ${names}, ${width} pixels wide`}
    >
      {width < 768 ? <PhoneIcon /> : <MonitorIcon />}
      {names} · {width}px
    </span>
  );
};
