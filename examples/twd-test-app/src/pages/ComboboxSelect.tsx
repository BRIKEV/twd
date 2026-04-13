import React, { useState, useRef, useEffect } from 'react';

const COUNTRIES = ['Spain', 'France', 'Germany', 'Italy', 'Portugal', 'United States', 'United Kingdom'];

/**
 * Minimal combobox component that mirrors the pattern used in real apps
 * (e.g. phone-code selectors): a button opens a filter input + list,
 * keyboard arrow keys navigate, Enter selects.
 *
 * Used to verify that userEvent.keyboard("Spain{arrowdown}{enter}") works
 * correctly even when the browser tab is not focused.
 */
const ComboboxSelect: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const filterRef = useRef<HTMLInputElement>(null);

  const filtered = COUNTRIES.filter(c =>
    c.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    if (open && filterRef.current) {
      filterRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filter]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setHighlightedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (filtered[highlightedIndex]) {
        setSelected(filtered[highlightedIndex]);
        setOpen(false);
        setFilter('');
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setFilter('');
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '2rem' }}>
      <h2>Combobox Select</h2>
      <p>
        Tests that <code>userEvent.keyboard("Spain&#123;arrowdown&#125;&#123;enter&#125;")</code>{' '}
        works when the browser window is not focused.
      </p>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={() => setOpen(o => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          style={{ padding: '0.5rem 1rem' }}
        >
          {selected || 'Select country'}
        </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              border: '1px solid #ccc',
              background: '#1a1a2e',
              zIndex: 10,
              minWidth: 200,
              borderRadius: 4,
            }}
          >
            <input
              ref={filterRef}
              type="text"
              placeholder="Filter…"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Filter countries"
              style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
            />
            <ul role="listbox" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {filtered.map((country, i) => (
                <li
                  key={country}
                  role="option"
                  aria-selected={i === highlightedIndex}
                  onClick={() => { setSelected(country); setOpen(false); setFilter(''); }}
                  style={{
                    padding: '0.4rem 0.75rem',
                    background: i === highlightedIndex ? '#333' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {country}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {selected && (
        <p data-testid="selected-country" style={{ marginTop: '1rem' }}>
          Selected: <strong>{selected}</strong>
        </p>
      )}
    </div>
  );
};

export default ComboboxSelect;
