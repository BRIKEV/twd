import ChevronDown from './Icons/ChevronDown';

/**
 * The speeds offered in the sidebar.
 *
 * 300ms is what `twd-cli --record` paces a recorded run at, and the same value
 * reads well when you are watching a run in your own tab. Anything faster is
 * hard to follow, anything slower gets tedious past a handful of commands.
 */
export const PACE_OPTIONS = [
  { value: 0, label: 'Off (full speed)' },
  { value: 300, label: 'Slow (300ms)' },
  { value: 600, label: 'Slower (600ms)' },
] as const;

interface PaceSelectProps {
  value: number;
  onChange: (ms: number) => void;
}

export const PaceSelect = ({ value, onChange }: PaceSelectProps) => {
  return (
    <div className="twd-pace-row">
      <label className="twd-pace-label" htmlFor="twd-pace-select">
        Speed
      </label>
      {/* The native arrow ignores padding and sits against the border, so it is
          hidden and replaced by the chevron the suites use. */}
      <span className="twd-pace-select-wrapper">
        <select
          id="twd-pace-select"
          className="twd-pace-select"
          value={value}
          onChange={(e) => onChange(Number(e.currentTarget.value))}
        >
          {PACE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="twd-pace-select-chevron" aria-hidden="true">
          <ChevronDown />
        </span>
      </span>
    </div>
  );
};
