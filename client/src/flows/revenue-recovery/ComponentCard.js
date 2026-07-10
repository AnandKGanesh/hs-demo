import React from 'react';
import { FileText, CreditCard } from 'lucide-react';
import StatusPill from './StatusPill';

const ComponentCard = ({ title, provider, iconType, status, tone, isActive, position }) => {
  const Icon = iconType === 'billing' ? FileText : CreditCard;

  const baseStyle = {
    position: 'absolute',
    ...position,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '13px',
    padding: '13px 15px',
    transition: 'box-shadow 0.3s ease',
  };

  const glowStyle = isActive
    ? {
        boxShadow: `0 0 0 3px rgba(94,101,115,.2), 0 10px 24px -8px rgba(94,101,115,.4)`,
      }
    : {
        boxShadow: '0 6px 18px -10px rgba(15,23,42,.18)',
      };

  return (
    <div style={{ ...baseStyle, ...glowStyle }} className="dark:!bg-gray-800 dark:!border-gray-700">
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 30, height: 30, background: '#eef1f6' }}
        >
          <Icon size={16} className="text-gray-500 dark:text-gray-400" />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900 dark:text-white" style={{ fontSize: '14px' }}>
            {title}
          </div>
          <div className="text-gray-400 dark:text-gray-500" style={{ fontSize: '11px' }}>
            {provider}
          </div>
        </div>
      </div>
      <div style={{ marginTop: '11px' }}>
        <StatusPill tone={tone} text={status} />
      </div>
    </div>
  );
};

export default ComponentCard;
