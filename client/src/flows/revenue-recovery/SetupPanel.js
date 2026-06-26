import React, { useState } from 'react';
import { CreditCard, FileText, Check, Info, ChevronDown, ChevronUp, Plug, Webhook } from 'lucide-react';
import WebhookField from './WebhookField';

const paymentConnectors = [
  { id: 'stripe', name: 'Stripe', description: 'Global card payments' },
  { id: 'adyen', name: 'Adyen', description: 'Omnichannel payments' },
  { id: 'vantiv', name: 'Vantiv', description: 'Worldpay card processing' },
  { id: 'hyperswitch', name: 'Hyperswitch', description: 'Unified payment infrastructure' },
];

const billingConnectors = [
  { id: 'chargebee', name: 'Chargebee', description: 'Subscription billing & invoicing' },
  { id: 'recurly', name: 'Recurly', description: 'Recurring billing management' },
  { id: 'stripe_billing', name: 'Stripe Billing', description: 'Stripe native subscription billing' },
  { id: 'custom_billing', name: 'Custom Billing', description: 'Bring your own billing system' },
];

const generateWebhookId = () => Math.random().toString(36).substring(2, 10);

const formatConnectorName = (s) =>
  s ? s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '9px',
  fontSize: '13px',
  color: '#1a1f36',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const focusRingStyle = {
  borderColor: '#0066FF',
  boxShadow: '0 0 0 3px rgba(0,102,255,.12)',
};

const ConnectorConfig = ({ title, icon: Icon, connectors, initialConfig, onConnect, webhookType, infoText, defaultLabel }) => {
  const [selected, setSelected] = useState(initialConfig?.processor || connectors[0]?.id || null);
  const [form, setForm] = useState({
    apiKey: initialConfig?.apiKey || 'sk_live_demo_a1b2c3',
    sourceVerificationKey: initialConfig?.sourceVerificationKey || 'whsec_demo_x7y8z9',
    label: initialConfig?.label || defaultLabel || '',
  });
  const [connected, setConnected] = useState(!!initialConfig?.webhookUrl);
  const [webhookUrl, setWebhookUrl] = useState(initialConfig?.webhookUrl || '');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(null);

  const handleConnect = () => {
    if (!selected) {
      setError(`Please select a ${title.toLowerCase()}`);
      return;
    }
    if (!form.apiKey || !form.sourceVerificationKey || !form.label) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    const url = `https://rr.hyperswitch.io/webhooks/${webhookType}/${generateWebhookId()}`;
    setWebhookUrl(url);
    setConnected(true);
    onConnect({
      processor: selected,
      apiKey: form.apiKey,
      sourceVerificationKey: form.sourceVerificationKey,
      label: form.label,
      webhookUrl: url,
    });
  };

  const selectedConnector = connectors.find((c) => c.id === selected);

  return (
    <div
      className="dark:bg-gray-800"
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '13px',
        padding: '16px 18px',
        boxShadow: '0 6px 18px -10px rgba(15,23,42,.18)',
      }}
    >
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 30, height: 30, background: '#eef1f6' }}
        >
          <Icon size={16} className="text-gray-500 dark:text-gray-400" />
        </div>
        <div>
          <div className="font-bold text-gray-900 dark:text-white" style={{ fontSize: '14px' }}>
            {title}
          </div>
          {connected && selectedConnector && (
            <div className="text-gray-400 dark:text-gray-500" style={{ fontSize: '11px' }}>
              {selectedConnector.name} &middot; Connected
            </div>
          )}
        </div>
        {connected && (
          <span
            className="ml-auto font-semibold"
            style={{
              fontSize: '10px',
              color: '#047857',
              background: '#D1FAE5',
              borderRadius: '999px',
              padding: '3px 9px',
            }}
          >
            &#10003; Connected
          </span>
        )}
      </div>

      {/* Connector selection grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {connectors.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelected(c.id);
              setForm((prev) => ({ ...prev, label: `Production ${c.name}` }));
              setError('');
            }}
            className="text-left transition-colors dark:bg-gray-900"
            style={{
              padding: '11px 12px',
              borderRadius: '9px',
              border: selected === c.id ? '1px solid #0066FF' : '1px solid #e5e7eb',
              background: selected === c.id ? '#E6F0FF' : '#fff',
            }}
          >
            <span className="block font-semibold text-gray-900 dark:text-white" style={{ fontSize: '12px' }}>
              {c.name}
            </span>
            <span className="block text-gray-400 dark:text-gray-500" style={{ fontSize: '10.5px', marginTop: '1px' }}>
              {c.description}
            </span>
          </button>
        ))}
      </div>

      {/* Form fields */}
      {selected && !connected && (
        <div className="space-y-3">
          <div>
            <label
              className="block font-medium text-gray-500 dark:text-gray-400"
              style={{ fontSize: '11px', marginBottom: '4px' }}
            >
              API Key
            </label>
            <input
              type="password"
              value={form.apiKey}
              onChange={(e) => setForm((prev) => ({ ...prev, apiKey: e.target.value }))}
              onFocus={() => setFocused('apiKey')}
              onBlur={() => setFocused(null)}
              placeholder="sk_live_..."
              style={focused === 'apiKey' ? { ...inputStyle, ...focusRingStyle } : inputStyle}
            />
          </div>
          <div>
            <label
              className="block font-medium text-gray-500 dark:text-gray-400"
              style={{ fontSize: '11px', marginBottom: '4px' }}
            >
              Source Verification Key
            </label>
            <input
              type="password"
              value={form.sourceVerificationKey}
              onChange={(e) => setForm((prev) => ({ ...prev, sourceVerificationKey: e.target.value }))}
              onFocus={() => setFocused('svk')}
              onBlur={() => setFocused(null)}
              placeholder="whsec_..."
              style={focused === 'svk' ? { ...inputStyle, ...focusRingStyle } : inputStyle}
            />
          </div>
          <div>
            <label
              className="block font-medium text-gray-500 dark:text-gray-400"
              style={{ fontSize: '11px', marginBottom: '4px' }}
            >
              Label
            </label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
              onFocus={() => setFocused('label')}
              onBlur={() => setFocused(null)}
              placeholder="Production Stripe"
              style={focused === 'label' ? { ...inputStyle, ...focusRingStyle } : inputStyle}
            />
          </div>

          {error && (
            <p className="text-red-600 dark:text-red-400" style={{ fontSize: '11px' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleConnect}
            className="text-white font-semibold transition-colors"
            style={{
              fontSize: '13px',
              background: '#0066FF',
              border: 'none',
              borderRadius: '9px',
              padding: '10px 18px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,102,255,.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plug size={14} /> Connect
          </button>
        </div>
      )}

      {/* Connected state */}
      {connected && (
        <div className="space-y-3">
          <WebhookField url={webhookUrl} label={`${title} Webhook URL`} />
          <div
            className="flex items-start gap-2"
            style={{
              background: '#E6F0FF',
              border: '1px solid #CCE0FF',
              borderRadius: '9px',
              padding: '11px 13px',
            }}
          >
            <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#0066FF' }} />
            <p style={{ fontSize: '11.5px', color: '#0052CC' }}>{infoText}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const SetupPanel = ({
  paymentConfig,
  billingConfig,
  onPaymentConnect,
  onBillingConnect,
  isCollapsed,
  onToggleCollapse,
}) => {
  const paymentName = formatConnectorName(paymentConfig?.processor) || 'Not connected';
  const billingName = formatConnectorName(billingConfig?.processor) || 'Not connected';
  const paymentConnected = !!paymentConfig?.webhookUrl;
  const billingConnected = !!billingConfig?.webhookUrl;

  if (isCollapsed) {
    return (
      <div
        className="bg-white dark:bg-gray-800 overflow-hidden"
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -16px rgba(15,23,42,.12)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700"
          style={{ padding: '16px 24px' }}
        >
          <div
            className="flex items-center justify-center text-white font-extrabold"
            style={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0066FF, #0052CC)',
              fontSize: '15px',
            }}
          >
            H
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white" style={{ fontSize: '15px', letterSpacing: '-0.01em' }}>
              Revenue Recovery &mdash; Setup &amp; Configuration
            </div>
            <div className="text-gray-400 dark:text-gray-500" style={{ fontSize: '12px' }}>
              Connector credentials and webhook endpoints
            </div>
          </div>
          <div className="flex gap-2 ml-auto" style={{ fontSize: '11.5px' }}>
            <span
              style={{
                background: '#f1f3f7',
                border: '1px solid #e5e7eb',
                borderRadius: '999px',
                padding: '5px 11px',
                color: '#5e6573',
              }}
            >
              Payment: <b className="text-gray-900 dark:text-white">{paymentName}</b>{' '}
              {paymentConnected && <span style={{ color: '#10B981' }}>&#10003;</span>}
            </span>
            <span
              style={{
                background: '#f1f3f7',
                border: '1px solid #e5e7eb',
                borderRadius: '999px',
                padding: '5px 11px',
                color: '#5e6573',
              }}
            >
              Billing: <b className="text-gray-900 dark:text-white">{billingName}</b>{' '}
              {billingConnected && <span style={{ color: '#10B981' }}>&#10003;</span>}
            </span>
          </div>
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-1 font-medium flex-shrink-0"
            style={{ fontSize: '12.5px', color: '#0066FF', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            Edit <ChevronDown size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 overflow-hidden"
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        boxShadow: '0 20px 40px -16px rgba(15,23,42,.12)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700"
        style={{ padding: '16px 24px' }}
      >
        <div
          className="flex items-center justify-center text-white font-extrabold"
          style={{
            width: 30,
            height: 30,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0066FF, #0052CC)',
            fontSize: '15px',
          }}
        >
          H
        </div>
        <div>
          <div className="font-bold text-gray-900 dark:text-white" style={{ fontSize: '15px', letterSpacing: '-0.01em' }}>
            Revenue Recovery &mdash; Setup &amp; Configuration
          </div>
          <div className="text-gray-400 dark:text-gray-500" style={{ fontSize: '12px' }}>
            Connect your payment processor and billing engine to enable recovery flows
          </div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-1 font-medium flex-shrink-0 ml-auto"
          style={{ fontSize: '12.5px', color: '#5e6573', cursor: 'pointer', background: 'none', border: 'none' }}
        >
          Collapse <ChevronUp size={16} />
        </button>
      </div>

      {/* Body */}
      <div
        className="dark:bg-gray-900/50"
        style={{ background: '#fafbfc', padding: '20px 24px', borderBottom: '1px solid #eef0f3' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ConnectorConfig
            title="Payment Processor"
            icon={CreditCard}
            connectors={paymentConnectors}
            initialConfig={paymentConfig}
            onConnect={onPaymentConnect}
            webhookType="payments"
            infoText="Configure this webhook URL in your payment processor's dashboard to receive payment events (e.g. payment.failed, payment.succeeded)."
            defaultLabel="Production Stripe"
          />
          <ConnectorConfig
            title="Billing Processor"
            icon={FileText}
            connectors={billingConnectors}
            initialConfig={billingConfig}
            onConnect={onBillingConnect}
            webhookType="billing"
            infoText="Configure this webhook URL in your billing processor to receive invoice events (e.g. invoice.generated, payment.triggered)."
            defaultLabel="Production Chargebee"
          />
        </div>
      </div>
    </div>
  );
};

export default SetupPanel;
