import React from 'react';
import { RefreshCw } from 'lucide-react';
import StatusPill from './StatusPill';
import { getTone } from './simulationData';

const LedgerRow = ({ item, variant }) => {
  const { bg, color } = getTone(item.tone);

  const isExternal = variant === 'external';
  const rowBg = isExternal ? '#fff' : '#f7faff';
  const rowBorder = isExternal ? '#eef0f3' : '#e6f0ff';

  return (
    <div
      className="flex items-center gap-2.5 rounded-lg"
      style={{
        padding: '9px 11px',
        background: rowBg,
        border: `1px solid ${rowBorder}`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 dark:text-white" style={{ fontSize: '12px' }}>
          {item.label}
        </div>
        <div className="text-gray-400 dark:text-gray-500" style={{ fontSize: '10.5px', marginTop: '1px' }}>
          {item.sub}
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-gray-900 dark:text-white" style={{ fontSize: '12px' }}>
          {item.amount}
        </div>
        <div style={{ marginTop: '3px' }}>
          <StatusPill tone={item.tone} text={item.status} size="small" />
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ text, variant }) => {
  const borderColor = variant === 'external' ? '#e3e6ec' : '#d4e3fb';
  return (
    <div
      className="text-center text-gray-300 dark:text-gray-600"
      style={{
        fontSize: '11px',
        padding: '16px 0',
        border: `1px dashed ${borderColor}`,
        borderRadius: '9px',
      }}
    >
      {text}
    </div>
  );
};

const LedgerColumn = ({ title, subtitle, bulletColor, titleColor, items, emptyText, variant, countLabel }) => {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span style={{ width: 8, height: 8, borderRadius: 2, background: bulletColor, display: 'inline-block' }} />
        <span
          className="font-bold uppercase"
          style={{ fontSize: '11px', letterSpacing: '0.05em', color: titleColor }}
        >
          {title}
        </span>
        <span className="ml-auto text-gray-400 dark:text-gray-500" style={{ fontSize: '10.5px' }}>
          {countLabel}
        </span>
      </div>
      <div
        style={{ fontSize: '10.5px', margin: '4px 0 11px' }}
        className={variant === 'external' ? 'text-gray-400 dark:text-gray-500' : 'text-primary'}
      >
        {subtitle}
      </div>
      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <EmptyState text={emptyText} variant={variant} />
        ) : (
          items.map((item, i) => <LedgerRow key={i} item={item} variant={variant} />)
        )}
      </div>
    </div>
  );
};

const LedgerPanel = ({
  invoiceId,
  invoiceAmount,
  invoiceStatus,
  invoiceTone,
  external,
  internal,
  isActive,
  position,
}) => {
  const baseStyle = {
    position: 'absolute',
    ...position,
    background: 'linear-gradient(165deg, #f5f9ff, #eaf2ff)',
    border: '2px solid #0066FF',
    borderRadius: '16px',
    padding: '16px 18px',
    transition: 'box-shadow 0.3s ease',
  };

  const glowStyle = isActive
    ? { boxShadow: '0 0 0 4px rgba(0,102,255,.22), 0 16px 34px -12px rgba(0,102,255,.42)' }
    : { boxShadow: '0 14px 30px -14px rgba(0,102,255,.3)' };

  const extCount = external.length + (external.length === 1 ? ' attempt' : ' attempts');
  const intCount = internal.length + (internal.length === 1 ? ' attempt' : ' attempts');

  return (
    <div
      style={{ ...baseStyle, ...glowStyle }}
      className="dark:!bg-gradient-to-br dark:!from-gray-800 dark:!to-gray-900"
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-lg text-white"
          style={{
            width: 34,
            height: 34,
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #0066FF, #0052CC)',
          }}
        >
          <RefreshCw size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold" style={{ fontSize: '15px', color: '#0a3a8c', letterSpacing: '-0.01em' }}>
            Revenue Recovery
          </div>
          <div className="font-semibold text-primary" style={{ fontSize: '11px' }}>
            Invoice ledger &middot; external + internal attempts
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-400 dark:text-gray-500" style={{ fontSize: '11px' }}>
            Invoice {invoiceId}
          </div>
          <div className="flex items-center gap-2 justify-end" style={{ fontSize: '17px', fontWeight: 800, color: '#1a1f36' }}>
            <span className="dark:text-white">{invoiceAmount}</span>
            <StatusPill tone={invoiceTone} text={invoiceStatus} />
          </div>
        </div>
      </div>

      {/* Two ledger columns */}
      <div className="flex gap-4" style={{ marginTop: '16px' }}>
        <LedgerColumn
          title="EXTERNAL TRANSACTIONS"
          subtitle="initiated by Billing Engine"
          bulletColor="#9099a8"
          titleColor="#5e6573"
          items={external}
          emptyText="No external payments yet"
          variant="external"
          countLabel={extCount}
        />
        <div style={{ width: 1, background: '#e3e6ec' }} className="dark:bg-gray-700" />
        <LedgerColumn
          title="INTERNAL TRANSACTIONS"
          subtitle="scheduled & retried by Revenue Recovery"
          bulletColor="#0066FF"
          titleColor="#0a3a8c"
          items={internal}
          emptyText="No retries scheduled yet"
          variant="internal"
          countLabel={intCount}
        />
      </div>
    </div>
  );
};

export default LedgerPanel;
