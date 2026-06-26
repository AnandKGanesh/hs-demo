export const TONES = {
  idle:       { bg: '#f1f3f7', color: '#6b7280' },
  info:       { bg: '#E6F0FF', color: '#0052CC' },
  listen:     { bg: '#E6F0FF', color: '#0066FF' },
  processing: { bg: '#FEF3C7', color: '#B45309' },
  scheduled:  { bg: '#FEF3C7', color: '#B45309' },
  failed:     { bg: '#FEE2E2', color: '#B91C1C' },
  success:    { bg: '#D1FAE5', color: '#047857' },
  recovered:  { bg: '#D1FAE5', color: '#047857' },
  captured:   { bg: '#E6F0FF', color: '#0052CC' },
};

export const CHANNELS = {
  cBP: 'M290,90 L790,90',
  cBR: 'M150,136 C150,235 196,230 200,278',
  cPR: 'M905,136 C905,235 800,230 800,278',
};

export const CHANNEL_LABELS = [
  { x: 540, y: 78, text: 'payments \u21C4 responses', rotate: null },
  { x: 120, y: 230, text: 'invoice events \u21C4 status', rotate: -78 },
  { x: 936, y: 230, text: 'results \u21C4 retries', rotate: 78 },
];

export const PORTS = [
  { cx: 290, cy: 90 },
  { cx: 790, cy: 90 },
  { cx: 150, cy: 136 },
  { cx: 200, cy: 278 },
  { cx: 905, cy: 136 },
  { cx: 800, cy: 278 },
];

export const getTone = (toneName) => TONES[toneName] || TONES.idle;

export const formatTime = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

export const futureDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatConnectorName = (s) =>
  s ? s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';
