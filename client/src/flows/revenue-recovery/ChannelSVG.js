import React, { forwardRef } from 'react';
import { CHANNELS, PORTS } from './simulationData';

const ChannelSVG = forwardRef(({ pathRefs }, _ref) => {
  return (
    <svg
      width="1080"
      height="640"
      viewBox="0 0 1080 640"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {/* Base pipes */}
      {Object.entries(CHANNELS).map(([id, d]) => (
        <path
          key={`base-${id}`}
          d={d}
          fill="none"
          stroke="#e3e6ec"
          strokeWidth={6}
          strokeLinecap="round"
        />
      ))}

      {/* Flow overlays (lit during transmission) */}
      {Object.entries(CHANNELS).map(([id, d]) => (
        <path
          key={`flow-${id}`}
          ref={pathRefs[id]}
          d={d}
          fill="none"
          stroke="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{ opacity: 0 }}
        />
      ))}

      {/* Ports — outer circles */}
      <g fill="#cfd4dd">
        {PORTS.map((p, i) => (
          <circle key={`port-outer-${i}`} cx={p.cx} cy={p.cy} r={5} />
        ))}
      </g>
      {/* Ports — inner circles */}
      <g fill="#fff">
        {PORTS.map((p, i) => (
          <circle key={`port-inner-${i}`} cx={p.cx} cy={p.cy} r={2.2} />
        ))}
      </g>
    </svg>
  );
});

ChannelSVG.displayName = 'ChannelSVG';

export default ChannelSVG;
