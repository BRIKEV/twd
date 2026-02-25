import React from 'react';
import './Responsive.css';

const Responsive: React.FC = () => {
  return (
    <div className="responsive-wrapper" data-testid="responsive-wrapper">
      <nav className="responsive-nav" data-testid="responsive-nav">
        <a href="/">Home</a>
        <a href="/contact">Contact</a>
        <a href="/assertions">Assertions</a>
        <a href="/shows">Shows</a>
      </nav>

      <div className="responsive-content">
        <div className="responsive-main">
          <h1>Responsive Demo</h1>
          <p>This page uses CSS container queries to switch between desktop and mobile layouts.</p>

          <div className="responsive-card-grid" data-testid="card-grid">
            <div className="responsive-card">
              <h3>Card One</h3>
              <p>First card content for the responsive grid.</p>
            </div>
            <div className="responsive-card">
              <h3>Card Two</h3>
              <p>Second card content for the responsive grid.</p>
            </div>
            <div className="responsive-card">
              <h3>Card Three</h3>
              <p>Third card content for the responsive grid.</p>
            </div>
          </div>
        </div>

        <aside className="responsive-sidebar" data-testid="responsive-sidebar">
          <h3>Sidebar</h3>
          <ul>
            <li>Recent Posts</li>
            <li>Categories</li>
            <li>Archives</li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default Responsive;
