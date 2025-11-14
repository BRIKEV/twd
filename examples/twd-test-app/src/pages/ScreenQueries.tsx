import React, { useState } from 'react';

const ScreenQueries: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '2rem' }}>
      <h1>Screen Queries Demo</h1>
      <p>This page demonstrates various elements that can be queried using screenDom.</p>

      <section style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Buttons and Actions</h2>
        <button onClick={() => alert('Primary clicked')}>Primary Button</button>
        <button onClick={() => setIsVisible(!isVisible)} style={{ marginLeft: '1rem' }}>
          Toggle Visibility
        </button>
        <button disabled style={{ marginLeft: '1rem' }}>Disabled Button</button>
      </section>

      <section style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Form Elements</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="search-input">Search:</label>
          <input
            id="search-input"
            type="text"
            placeholder="Enter search term"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email-field">Email Address:</label>
          <input
            id="email-field"
            type="email"
            placeholder="user@example.com"
            style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            <input type="checkbox" id="agree-checkbox" />
            I agree to the terms
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            <input type="radio" name="option" value="option1" id="radio-option1" />
            Option 1
          </label>
          <label style={{ marginLeft: '1rem' }}>
            <input type="radio" name="option" value="option2" id="radio-option2" />
            Option 2
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="select-dropdown">Choose an option:</label>
          <select id="select-dropdown" style={{ marginLeft: '0.5rem', padding: '0.5rem' }}>
            <option value="">Select...</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </div>
      </section>

      <section style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Text Content</h2>
        <p>This is a paragraph with some text content.</p>
        <p data-testid="custom-paragraph">This paragraph has a test ID.</p>
        <div>
          <span>Inline text element</span>
        </div>
        {isVisible && (
          <div data-testid="conditional-element" style={{ color: 'green', marginTop: '1rem' }}>
            This element appears conditionally
          </div>
        )}
      </section>

      <section style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Links and Navigation</h2>
        <a href="/contact">Contact Page</a>
        <a href="/assertions" style={{ marginLeft: '1rem' }}>Assertions Page</a>
        <a href="https://example.com" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '1rem' }}>
          External Link
        </a>
      </section>

      <section style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Images</h2>
        <img
          src="/vite.svg"
          alt="Vite Logo"
          style={{ width: '50px', height: '50px' }}
        />
        <img
          src="/vite.svg"
          alt="Application Logo"
          style={{ width: '50px', height: '50px', marginLeft: '1rem' }}
        />
      </section>

      <section style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Headings</h2>
        <h3>Heading Level 3</h3>
        <h4>Heading Level 4</h4>
        <h5>Heading Level 5</h5>
      </section>

      {searchTerm && (
        <section style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #4CAF50', borderRadius: 8, backgroundColor: '#f0f8f0' }}>
          <p>You searched for: <strong>{searchTerm}</strong></p>
        </section>
      )}
    </div>
  );
};

export default ScreenQueries;

