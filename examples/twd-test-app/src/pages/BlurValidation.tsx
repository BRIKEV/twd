import React, { useState } from 'react';

const BlurValidation: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [firstNameError, setFirstNameError] = useState('');

  const handleFirstNameBlur = () => {
    if (!firstName.trim()) {
      setFirstNameError('First name is required');
    } else {
      setFirstNameError('');
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '2rem' }}>
      <h2>Blur Validation</h2>
      <p>
        This page tests that blur-triggered validation works correctly even when
        the browser tab is not focused (e.g. during automated twd-relay runs).
      </p>
      <form>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="first-name">First name:</label>
          <br />
          <input
            id="first-name"
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            onBlur={handleFirstNameBlur}
            aria-describedby={firstNameError ? 'first-name-error' : undefined}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {firstNameError && (
            <span
              id="first-name-error"
              role="alert"
              style={{ color: 'red', fontSize: '0.875rem' }}
            >
              {firstNameError}
            </span>
          )}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="last-name">Last name:</label>
          <br />
          <input
            id="last-name"
            type="text"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
      </form>
    </div>
  );
};

export default BlurValidation;
