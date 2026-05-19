import React from 'react';
import { Search, Bell, LayoutGrid } from 'lucide-react';

const Header = () => (
  <header className="ec-dash-header">
    <div className="ec-dash-brand">
      <div className="ec-brand-mark">
        <LayoutGrid size={13} strokeWidth={2.25} />
      </div>
      <span className="ec-brand-name">Dashboard</span>
    </div>

    <div className="ec-dash-search">
      <Search size={13} className="ec-dash-search-icon" />
      <input
        type="text"
        placeholder="Search payments, customers, connectors..."
        className="ec-dash-search-input"
        readOnly
      />
      <kbd className="ec-dash-search-kbd">⌘K</kbd>
    </div>

    <div className="ec-dash-actions">
      <button type="button" className="ec-dash-icon-btn" aria-label="Notifications">
        <Bell size={15} />
        <span className="ec-dash-dot" />
      </button>
      <div className="ec-dash-avatar">MA</div>
    </div>
  </header>
);

export default Header;
