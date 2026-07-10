// ---------------------------------------------------------------------------
// Recovery Simulator — deterministic data engine
//
// An RL-based retry engine recovers failed recurring payments. Everything shown
// derives deterministically from:
//   1. the selected scenario, and
//   2. the Time Machine position `t` (0 = merchant onboarded, 1 = current date).
//
// As `t` grows the merchant "ages": it accumulates more transactions, so
// Merchant insights get denser and more confident. Once the merchant cluster is
// dense enough, the engine switches its retry schedule from Juspay (network)
// insights to Merchant insights — and converges in fewer retries.
// ---------------------------------------------------------------------------

// Fixed clock bounds for the demo.
export const CURRENT_DATE = new Date('2026-07-10T14:32:00');
export const ONBOARD_DATE = new Date('2026-01-15T10:05:00');
export const SPAN_MS = CURRENT_DATE.getTime() - ONBOARD_DATE.getTime();

// Time Machine position -> wall-clock date ("current date" of the simulation).
export const clockFor = (t) =>
  new Date(ONBOARD_DATE.getTime() + clamp01(t) * SPAN_MS);

// ---- small utilities ------------------------------------------------------

export const clamp01 = (n) => Math.max(0, Math.min(1, n));
export const fmt = (n) => Math.round(n).toLocaleString('en-US');

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n) => String(n).padStart(2, '0');

export const weekdayName = (d) => WEEKDAYS[d.getDay()];

export const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const fmtDateTime = (d) =>
  `${weekdayName(d).slice(0, 3)}, ${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const fmtDate = (d) =>
  `${weekdayName(d).slice(0, 3)}, ${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export const addDays = (d, days) => {
  const n = new Date(d.getTime());
  n.setDate(n.getDate() + days);
  return n;
};

// Deterministic pseudo-random in [0, 1) from an integer seed.
const rand = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// ---- merchant maturity ----------------------------------------------------
// How much data / confidence the merchant has accumulated at Time Machine `t`.

export const maturity = (t) => Math.pow(clamp01(t), 1.35);

export const merchantVolume = (base, t) => Math.round(base * maturity(t));

// Below this many samples the merchant cluster is treated as "insufficient data".
export const MERCHANT_MIN_SAMPLES = 12;

export const merchantConfidence = (t) => Math.min(0.94, 0.05 + maturity(t) * 0.95);

// Fixed, high network-wide confidence for Juspay insights.
export const JUSPAY_CONFIDENCE = 0.9;

// ---- insight string (the phrasing required by the spec) -------------------

export const insightSentence = ({ domS, domA, domOrdinal, dowS, dowA, dowName }) =>
  `We have seen ${fmt(domS)} out of ${fmt(domA)} transactions succeed on the ${domOrdinal} of the month, ` +
  `and ${fmt(dowS)} out of ${fmt(dowA)} succeed on ${dowName}.`;

// ---------------------------------------------------------------------------
// Scenarios: 2 tabs x 3 scenarios.
//   juspayRetries  – attempts needed to recover using the network baseline.
//   merchantRetries – (fewer) attempts once the merchant cluster is dense.
//   merchantBase   – merchant cluster sample size reached at t = 1.
// ---------------------------------------------------------------------------

export const SCENARIOS = {
  subscriptions: [
    {
      id: 'sub_nsf',
      seed: 11,
      title: 'Long-term subscriber · Insufficient Funds',
      blurb: 'Loyal customer, card has funds only around payday.',
      customer: 'Long-term subscriber · 26 months',
      amount: '$49.00',
      cadence: 'Monthly subscription',
      errorCode: '51',
      errorLabel: 'Insufficient Funds (NSF)',
      hardDecline: false,
      merchantBase: 240,
      juspayRetries: 6,
      merchantRetries: 3,
      cluster: { funding: 'Debit', network: 'Visa', country: 'United States', issuer: 'Chase Bank, N.A.', bin: '414720' },
      histOffsets: [31, 62, 92, 123, 154],
    },
    {
      id: 'sub_generic',
      seed: 23,
      title: 'New subscriber · Generic Decline',
      blurb: 'First-cycle customer, issuer soft-declined the charge.',
      customer: 'New subscriber · 4 days',
      amount: '$19.00',
      cadence: 'Monthly subscription',
      errorCode: '05',
      errorLabel: 'Do Not Honor (Generic Decline)',
      hardDecline: false,
      merchantBase: 160,
      juspayRetries: 4,
      merchantRetries: 2,
      cluster: { funding: 'Credit', network: 'Mastercard', country: 'United States', issuer: 'Barclays Bank PLC', bin: '540123' },
      histOffsets: [4],
    },
    {
      id: 'sub_fraud',
      seed: 37,
      title: 'Active subscriber · Hard Decline (Fraud)',
      blurb: 'Issuer flagged the credential as fraud — a hard decline.',
      customer: 'Active subscriber · 11 months',
      amount: '$89.00',
      cadence: 'Monthly subscription',
      errorCode: '59',
      errorLabel: 'Suspected Fraud (Hard Decline)',
      hardDecline: true,
      merchantBase: 220,
      juspayRetries: 8,
      merchantRetries: 5,
      cluster: { funding: 'Credit', network: 'Visa', country: 'United States', issuer: 'Deutsche Bank AG', bin: '431940' },
      histOffsets: [30, 61, 91],
    },
  ],
  installments: [
    {
      id: 'inst_nsf',
      seed: 41,
      title: 'Long-term customer · Insufficient Funds',
      blurb: '9th of 12 instalments, buyer pays down after salary credit.',
      customer: 'Instalment plan · 9 of 12 paid',
      amount: '$120.00',
      cadence: 'Instalment · 1 of 12 remaining cycles',
      errorCode: '51',
      errorLabel: 'Insufficient Funds (NSF)',
      hardDecline: false,
      merchantBase: 260,
      juspayRetries: 7,
      merchantRetries: 3,
      cluster: { funding: 'Debit', network: 'Visa', country: 'United States', issuer: 'Royal Bank of Canada', bin: '450231' },
      histOffsets: [30, 60, 90, 120, 150, 180],
    },
    {
      id: 'inst_generic',
      seed: 53,
      title: 'New customer · Generic Decline',
      blurb: 'First instalment, issuer returned a generic soft decline.',
      customer: 'Instalment plan · 1 of 6 · new',
      amount: '$65.00',
      cadence: 'Instalment · cycle 1 of 6',
      errorCode: '05',
      errorLabel: 'Do Not Honor (Generic Decline)',
      hardDecline: false,
      merchantBase: 170,
      juspayRetries: 5,
      merchantRetries: 2,
      cluster: { funding: 'Credit', network: 'Mastercard', country: 'United States', issuer: 'National Australia Bank', bin: '552012' },
      histOffsets: [6],
    },
    {
      id: 'inst_fraud',
      seed: 67,
      title: '4th instalment · Hard Decline (Fraud)',
      blurb: 'Mid-plan credential flagged as fraud — retries are unsafe.',
      customer: 'Instalment plan · 4 of 8',
      amount: '$150.00',
      cadence: 'Instalment · cycle 4 of 8',
      errorCode: '59',
      errorLabel: 'Suspected Fraud (Hard Decline)',
      hardDecline: true,
      merchantBase: 230,
      juspayRetries: 9,
      merchantRetries: 6,
      cluster: { funding: 'Credit', network: 'Mastercard', country: 'United States', issuer: 'BNP Paribas', bin: '513688' },
      histOffsets: [30, 60, 90],
    },
  ],
};

// ---- probabilistic insight sourcing ---------------------------------------
// Rather than a hard switch, every retry *samples* its insight source from this
// probability. It is ~0 while the merchant cluster is sparse and grows with data
// density, so denser data means more retries pick merchant-insight times and the
// engine converges in fewer attempts. Capped below 1 to always keep a little
// network exploration.
export const pMerchantFor = (scenario, t) => {
  const vol = merchantVolume(scenario.merchantBase, t);
  if (vol < MERCHANT_MIN_SAMPLES) return 0;
  return Math.min(0.92, maturity(t));
};

// ---- insight stats for an arbitrary date ----------------------------------

export const insightForDate = (scenario, date, t) => {
  const dom = date.getDate();
  const dow = date.getDay();
  const seed = scenario.seed * 131 + dom * 7 + dow * 17;

  const jDomA = 150 + Math.floor(rand(seed) * 80);
  const jDowA = 130 + Math.floor(rand(seed + 1) * 60);
  const domRate = 0.28 + rand(seed + 2) * 0.6;
  const dowRate = 0.28 + rand(seed + 3) * 0.6;

  const domOrdinal = ordinal(dom);
  const dowName = WEEKDAYS[dow];

  const mDomA = merchantVolume(jDomA * 0.6, t);
  const mDowA = merchantVolume(jDowA * 0.6, t);

  return {
    juspay: {
      domS: Math.round(jDomA * domRate), domA: jDomA, domOrdinal,
      dowS: Math.round(jDowA * dowRate), dowA: jDowA, dowName,
    },
    merchant: {
      domS: Math.round(mDomA * domRate), domA: mDomA, domOrdinal,
      dowS: Math.round(mDowA * dowRate), dowA: mDowA, dowName,
      sparse: Math.min(mDomA, mDowA) < MERCHANT_MIN_SAMPLES,
    },
    rate: domRate + dowRate,
  };
};

// Historical successful transactions for this card (fixed, before the clock).
export const cardHistory = (scenario, clock) =>
  scenario.histOffsets.map((off) => {
    const d = addDays(clock, -off);
    d.setHours(9, 14, 0, 0);
    return { date: d, weekday: weekdayName(d) };
  });

// The three candidate retry days after the failure (for the insight panels).
export const futureDays = (scenario, clock, t) => {
  const arr = [1, 2, 3].map((off) => {
    const date = addDays(clock, off);
    const ins = insightForDate(scenario, date, t);
    return { date, juspay: ins.juspay, merchant: ins.merchant, rate: ins.rate, isBest: false };
  });
  let bi = 0;
  arr.forEach((d, i) => { if (d.rate > arr[bi].rate) bi = i; });
  arr[bi].isBest = true;
  return arr;
};

// Estimated network-penalty cost of retrying a hard-declined (fraud) credential.
// Hard declines carry excessive-retry fines / fraud-flag risk, so each attempt
// is charged against a merchant-set budget.
export const HARD_DECLINE_COST = 0.1;

export const hardDeclineRetryCount = (budget) =>
  Math.min(10, Math.max(0, Math.floor((budget || 0) / HARD_DECLINE_COST)));

// ---- the retry schedule the engine runs from the current date -------------

export const buildSchedule = (scenario, t, budget = 0) => {
  const first = clockFor(t);
  const pM = pMerchantFor(scenario, t);
  const cost = HARD_DECLINE_COST;
  const isHard = scenario.hardDecline;

  // Retries the engine would need to recover at this density. Shrinks as merchant
  // sampling grows: at pM = 0 it costs the full network baseline; at pM = 1 it
  // converges in merchantRetries.
  const spread = scenario.juspayRetries - scenario.merchantRetries;
  const needed = Math.max(1, Math.round(scenario.juspayRetries - pM * spread));

  // Hard declines are suppressed by default; a retry budget caps how many
  // attempts may run. Everything else uses the same probabilistic retry logic.
  const budgetCap = isHard ? hardDeclineRetryCount(budget) : Infinity;

  if (isHard && budgetCap === 0) {
    return {
      suppressed: true, hardDecline: true, attempts: [], first,
      successAt: 0, recovered: false, needed, counterCount: needed,
      pMerchant: pM, merchantCount: 0, budget: budget || 0, cost, spent: 0,
    };
  }

  // Run up to `needed` attempts, but never more than the budget (or 10) allows.
  const count = Math.min(needed, budgetCap, 10);
  const recovered = count >= needed; // did we reach the success attempt in budget?
  const window = Math.min(30, 4 + count * 4); // stays within 30 days

  const attempts = [];
  let last = 0;
  for (let i = 0; i < count; i++) {
    const s = scenario.seed * 1000 + i * 31;
    // Per-retry Bernoulli draw on the sampling probability — this is the decision.
    const source = rand(s) < pM ? 'merchant' : 'juspay';
    // Merchant retries target the personalised good day a touch sooner.
    const jitter = source === 'merchant' ? -1 : 0;
    let offsetDays = Math.round(((i + 1) * window) / count) + jitter;
    offsetDays = Math.min(30, Math.max(last + 1, offsetDays));
    last = offsetDays;
    attempts.push({
      index: i,
      date: addDays(first, offsetDays),
      offsetDays,
      source,
      probability: pM,
      outcome: recovered && i === count - 1 ? 'succeeded' : 'failed',
      ...(isHard ? { cost } : {}),
    });
  }

  const merchantCount = attempts.filter((a) => a.source === 'merchant').length;
  return {
    suppressed: false,
    hardDecline: isHard,
    attempts,
    first,
    successAt: recovered ? count : 0,
    recovered,
    needed,
    counterCount: scenario.juspayRetries, // pure network baseline, for contrast
    pMerchant: pM,
    merchantCount,
    budget: budget || 0,
    cost,
    spent: isHard ? count * cost : 0,
  };
};

// Decision snapshot for a single retry attempt (used by the explainability modal).
export const decisionFor = (scenario, attempt, t) => {
  const insight = insightForDate(scenario, attempt.date, t);
  const jConf = JUSPAY_CONFIDENCE - 0.04 + (attempt.date.getDate() % 5) * 0.015;
  const mConf = merchantConfidence(t);
  const active = attempt.source === 'merchant' ? insight.merchant : insight.juspay;
  return {
    insight,
    active,
    juspayConfidence: jConf,
    merchantConfidence: mConf,
    source: attempt.source,
    probability: attempt.probability ?? pMerchantFor(scenario, t),
    date: attempt.date,
  };
};
