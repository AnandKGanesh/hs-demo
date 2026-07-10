import React, { useState } from 'react';
import { Copy, Check, Webhook } from 'lucide-react';

const WebhookField = ({ url, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {label && (
        <label
          className="block font-medium text-gray-500 dark:text-gray-400"
          style={{ fontSize: '11px', marginBottom: '4px' }}
        >
          {label}
        </label>
      )}
      <div
        className="flex items-center gap-2"
        style={{
          background: '#f7f8fa',
          border: '1px solid #e5e7eb',
          borderRadius: '9px',
          padding: '10px 12px',
        }}
      >
        <Webhook size={16} className="flex-shrink-0" style={{ color: '#9099a8' }} />
        <code
          className="flex-1 font-mono break-all"
          style={{ fontSize: '11.5px', color: '#5e6573' }}
        >
          {url}
        </code>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 font-semibold flex-shrink-0"
          style={{
            fontSize: '11px',
            padding: '5px 10px',
            borderRadius: '7px',
            background: copied ? '#D1FAE5' : '#E6F0FF',
            color: copied ? '#047857' : '#0066FF',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {copied ? (
            <>
              <Check size={13} /> Copied!
            </>
          ) : (
            <>
              <Copy size={13} /> Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WebhookField;
