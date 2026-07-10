import React from 'react';
import { getTone } from './simulationData';

const StatusPill = ({ tone, text, size = 'normal' }) => {
  const { bg, color } = getTone(tone);

  const sizeStyles = {
    normal: { fontSize: '11.5px', padding: '5px 12px' },
    small: { fontSize: '9.5px', padding: '2px 8px' },
  };

  const style = {
    display: 'inline-block',
    fontWeight: 600,
    borderRadius: '999px',
    background: bg,
    color,
    whiteSpace: 'nowrap',
    ...sizeStyles[size],
  };

  return <span style={style}>{text}</span>;
};

export default StatusPill;
