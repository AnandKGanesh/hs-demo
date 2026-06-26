import React, { useEffect, useRef } from 'react';
import StatusPill from './StatusPill';
import { getTone } from './simulationData';

const LogRow = ({ entry }) => {
  const { bg, color } = getTone(entry.tone);

  return (
    <div
      className="flex gap-2.5 items-start rounded-lg"
      style={{
        padding: '9px 11px',
        background: '#f7f8fa',
        borderLeft: `3px solid ${color}`,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <span
        className="dark:text-gray-500"
        style={{
          fontSize: '10px',
          color: '#aab',
          fontVariantNumeric: 'tabular-nums',
          paddingTop: '2px',
          whiteSpace: 'nowrap',
        }}
      >
        {entry.time}
      </span>
      <div className="flex-1 min-w-0" style={{ overflowWrap: 'anywhere' }}>
        <div className="font-semibold text-gray-900 dark:text-white" style={{ fontSize: '12px', overflowWrap: 'anywhere' }}>
          {entry.route}
        </div>
        <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px', marginTop: '1px', overflowWrap: 'anywhere' }}>
          {entry.label}
        </div>
      </div>
      <StatusPill tone={entry.tone} text={entry.status} size="small" />
    </div>
  );
};

const MessageStream = ({ log, phase }) => {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const liveLabel = phase === 'running' ? '\u25CF live' : phase === 'done' ? '\u2713 complete' : 'idle';
  const liveColor = phase === 'running' ? '#0066FF' : phase === 'done' ? '#10B981' : '#aab';
  const liveBg = phase === 'running' ? '#E6F0FF' : phase === 'done' ? '#D1FAE5' : '#f1f3f7';

  return (
    <div
      className="flex flex-col border-l border-gray-100 dark:border-gray-700"
      style={{ flex: '0 0 30%', minWidth: 0, minHeight: 0, overflow: 'hidden' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700"
        style={{ padding: '14px 18px', flexShrink: 0 }}
      >
        <span
          className="font-bold uppercase text-gray-400 dark:text-gray-500"
          style={{ fontSize: '11px', letterSpacing: '0.06em' }}
        >
          Message Stream
        </span>
        <span
          className="ml-auto font-semibold"
          style={{
            fontSize: '10px',
            color: liveColor,
            background: liveBg,
            borderRadius: '999px',
            padding: '3px 9px',
          }}
        >
          {liveLabel}
        </span>
      </div>

      {/* Scrollable log */}
      <div
        ref={logRef}
        className="flex flex-col gap-2 overflow-y-auto dark:bg-gray-800"
        style={{ flex: 1, minHeight: 0, padding: '14px', overflowY: 'auto', overflowX: 'hidden' }}
      >
        {log.length === 0 ? (
          <div className="text-center text-gray-300 dark:text-gray-600" style={{ fontSize: '12px', padding: '20px 0' }}>
            No messages yet &mdash; press Start.
          </div>
        ) : (
          log.map((entry, i) => <LogRow key={i} entry={entry} />)
        )}
      </div>
    </div>
  );
};

export default MessageStream;
