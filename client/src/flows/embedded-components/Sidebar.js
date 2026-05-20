import React from 'react';
import {
  Home, CreditCard, Plug, Banknote, ShieldAlert,
  Users, Package, Settings,
} from 'lucide-react';

const NavItem = ({ icon: Icon, label, active = false, indent = false, disabled = false }) => {
  const classes = [
    'ec-nav-item',
    active && 'ec-nav-item-active',
    indent && 'ec-nav-item-indent',
    disabled && 'ec-nav-item-disabled',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <Icon size={15} className="ec-nav-icon" />
      <span className="ec-nav-text">{label}</span>
    </div>
  );
};

const Sidebar = () => (
  <aside className="ec-dash-sidebar">
    <nav className="ec-dash-nav">
      <NavItem icon={Home} label="Home" disabled />

      <div className="ec-nav-section-label">Payments</div>
      <NavItem icon={CreditCard} label="Transactions" indent disabled />
      <NavItem icon={Plug} label="Connectors" active indent />
      <NavItem icon={Banknote} label="Payouts" indent disabled />
      <NavItem icon={ShieldAlert} label="Disputes" indent disabled />

      <div className="ec-nav-section-label">Business</div>
      <NavItem icon={Users} label="Customers" disabled />
      <NavItem icon={Package} label="Products" disabled />
    </nav>

    <div className="ec-dash-sidebar-footer">
      <NavItem icon={Settings} label="Settings" disabled />
    </div>
  </aside>
);

export default Sidebar;
