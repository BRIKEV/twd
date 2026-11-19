interface RunPillProps {
  position: 'left' | 'right';
  done: number;
  total: number;
  passed: number;
  failed: number;
  onShow: () => void;
}

/** Shown while a run hides the overlay sidebar, so the page stays visible. */
export const RunPill = ({ position, done, total, passed, failed, onShow }: RunPillProps) => (
  <div
    className="twd-run-pill"
    style={position === 'left' ? { left: '12px' } : { right: '12px' }}
    role="status"
    aria-live="polite"
    aria-label="TWD run progress"
  >
    <svg
      className="twd-loader"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="8" cy="8" r="6" stroke="var(--twd-border)" strokeWidth="2" fill="none" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="var(--twd-warning)" strokeWidth="2" fill="none" />
    </svg>
    <span>
      TWD {done}/{total}
    </span>
    <span style={{ color: 'var(--twd-success)' }}>&#10003; {passed}</span>
    <span style={{ color: 'var(--twd-error)' }}>&#10007; {failed}</span>
    <button className="twd-btn twd-run-pill-show" aria-label="Show TWD sidebar" onClick={onShow}>
      Show
    </button>
  </div>
);
