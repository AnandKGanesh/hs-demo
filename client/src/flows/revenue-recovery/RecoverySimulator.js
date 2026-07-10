import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Clock, Sparkles, Store, CreditCard, Globe, Building2, Landmark,
  History, CheckCircle2, XCircle, ShieldAlert, ArrowRight, Info, TrendingUp,
  Play, RotateCcw, Loader2,
} from 'lucide-react';
import {
  SCENARIOS, ONBOARD_DATE, clockFor, fmtDateTime, fmtDate, fmt,
  cardHistory, futureDays, buildSchedule, decisionFor, insightSentence,
  pMerchantFor, maturity, merchantConfidence, JUSPAY_CONFIDENCE,
  HARD_DECLINE_COST, hardDeclineRetryCount,
} from './recoverySimData';
import RetryDecisionModal from './RetryDecisionModal';

const TABS = [
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'installments', label: 'Installments' },
];

const STEP_MS = 750;

// ---------------------------------------------------------------------------
// Time Machine — a scrubber bounded between the merchant's onboarding and today.
// ---------------------------------------------------------------------------
const TimeMachine = ({ t, setT }) => {
  const clock = clockFor(t);
  const mat = maturity(t);
  const densityLabel =
    mat < 0.12 ? 'Sparse' : mat < 0.4 ? 'Building' : mat < 0.75 ? 'Dense' : 'Rich';

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Time Machine</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Shift through the merchant's lifetime — data density decides which insights drive the retries
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Merchant onboarded</div>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{fmtDateTime(ONBOARD_DATE)}</div>
        </div>
        <div className="text-right min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-primary">Current date-time</div>
          <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{fmtDateTime(clock)}</div>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={1000}
        value={Math.round(t * 1000)}
        onChange={(e) => setT(Number(e.target.value) / 1000)}
        className="w-full accent-[#0066FF] cursor-pointer"
      />

      <div className="flex items-center justify-between mt-3 text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          Merchant data density:{' '}
          <span className="font-semibold text-gray-800 dark:text-gray-200">{densityLabel}</span>
        </span>
        <div className="flex gap-1 items-center">
          {[0.15, 0.35, 0.55, 0.75, 0.95].map((mark) => (
            <span
              key={mark}
              className={`h-1.5 w-6 rounded-full ${mat >= mark ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
const ScenarioCard = ({ scenario, active, onClick }) => (
  <button
    onClick={onClick}
    className={`text-left rounded-xl border p-4 transition-all ${
      active
        ? 'border-primary ring-2 ring-blue-100 dark:ring-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
    }`}
  >
    <div className="flex items-start justify-between gap-2 mb-1.5">
      <span className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{scenario.title}</span>
      {scenario.hardDecline && <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{scenario.blurb}</p>
    <div className="flex flex-wrap gap-1.5">
      <span className="text-[10px] font-mono rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-gray-600 dark:text-gray-300">
        {scenario.errorCode} · {scenario.errorLabel}
      </span>
    </div>
  </button>
);

// ---------------------------------------------------------------------------
// Probability that any given retry samples Merchant insights (grows with density).
const SamplingBadge = ({ scenario, p, budget }) => {
  if (scenario.hardDecline) {
    const count = hardDeclineRetryCount(budget);
    if (count === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
          <ShieldAlert className="w-3.5 h-3.5" /> Retries suppressed · no budget
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
        <ShieldAlert className="w-3.5 h-3.5" /> Budget ${budget.toFixed(2)} → up to {count} {count === 1 ? 'retry' : 'retries'}
      </span>
    );
  }
  const pct = Math.round(p * 100);
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
        <Store className="w-3.5 h-3.5 text-indigo-500" />
        Merchant-insight sampling: <span className="text-indigo-600 dark:text-indigo-300">{pct}%</span>
      </span>
      <div className="w-40 h-2 rounded-full bg-blue-100 dark:bg-blue-900/40 overflow-hidden flex">
        <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} title={`Merchant ${pct}%`} />
        <div className="h-full bg-primary/70" style={{ width: `${100 - pct}%` }} title={`Juspay ${100 - pct}%`} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
const TrailNode = ({ tone, children, last }) => {
  const colors = {
    failed: 'bg-red-500',
    succeeded: 'bg-emerald-500',
    suppressed: 'bg-amber-500',
    origin: 'bg-gray-400',
    pending: 'bg-gray-300 dark:bg-gray-600',
  };
  return (
    <div className={`relative pl-8 ${last ? '' : 'pb-4'}`}>
      <span className="absolute left-0 top-1 w-4 h-4 rounded-full ring-4 ring-white dark:ring-gray-800 flex items-center justify-center">
        <span className={`w-4 h-4 rounded-full ${colors[tone]}`} />
      </span>
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// HERO — the retry trail, centre stage, with the Run Simulation CTA.
// ---------------------------------------------------------------------------
const HeroTrail = ({ scenario, t, run, budget, setBudget, onRun, onExplain }) => {
  const liveP = pMerchantFor(scenario, t);
  const schedule = run.schedule;
  const shown = schedule ? schedule.attempts.slice(0, run.shown) : [];
  const done = run.state === 'done';
  const running = run.state === 'running';
  const recovered = done && schedule && !schedule.suppressed && schedule.recovered;
  const budgetExhausted = done && schedule && schedule.hardDecline && !schedule.suppressed && !schedule.recovered;
  const forcedCount = hardDeclineRetryCount(budget);

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">
        {/* Hero header + CTA */}
        <div className="px-6 pt-6 pb-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-br from-blue-50/60 to-transparent dark:from-blue-900/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Retry Trail</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The engine retries from the current date · up to 10 attempts within 30 days.
              </p>

              {/* Hard-decline retry budget */}
              {scenario.hardDecline && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Retry budget</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                    <input
                      type="number"
                      min={0}
                      max={2}
                      step={0.1}
                      value={budget}
                      onChange={(e) => setBudget(Math.max(0, Number(e.target.value) || 0))}
                      className="w-24 pl-5 pr-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    ${HARD_DECLINE_COST.toFixed(2)} penalty / retry · funds up to {forcedCount} {forcedCount === 1 ? 'retry' : 'retries'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <SamplingBadge scenario={scenario} p={liveP} budget={budget} />
              {!running && !done && (
                <button
                  onClick={onRun}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-semibold shadow-sm"
                >
                  <Play size={16} /> Run Simulation
                </button>
              )}
              {running && (
                <button
                  disabled
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary/60 text-white rounded-lg text-sm font-semibold cursor-default"
                >
                  <Loader2 size={16} className="animate-spin" /> Running…
                </button>
              )}
              {done && (
                <button
                  onClick={onRun}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-semibold"
                >
                  <RotateCcw size={16} /> Replay
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trail body */}
        <div className="px-6 py-6">
          <div className="relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-gray-200 dark:before:bg-gray-700">
            {/* Origin: the failed charge */}
            <TrailNode tone="origin">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Initial charge failed · {scenario.amount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {fmtDateTime(clockFor(t))} · {scenario.errorCode} {scenario.errorLabel}
              </div>
            </TrailNode>

            {/* Idle prompt */}
            {run.state === 'idle' && (
              <TrailNode tone="pending" last>
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                  {scenario.hardDecline
                    ? forcedCount > 0
                      ? `Budget of $${budget.toFixed(2)} set — Run to fund up to ${forcedCount} ${forcedCount === 1 ? 'retry' : 'retries'} against the hard decline.`
                      : 'Hard decline — retries are suppressed by default. Set a retry budget above to override and force attempts.'
                    : 'Press Run Simulation to schedule and play out the retries from the current date.'}
                </p>
              </TrailNode>
            )}

            {/* Fraud: suppressed */}
            {schedule?.suppressed && run.state !== 'idle' && (
              <TrailNode tone="suppressed" last>
                <div className="rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      Retries suppressed — hard decline
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed">
                    A fraud / hard-decline signal will not clear on retry. The engine holds off to avoid
                    network penalties and issuer fraud flags. Recovery is not attempted.
                  </p>
                </div>
              </TrailNode>
            )}

            {/* Retry attempts */}
            {shown.map((a, i) => {
              const d = decisionFor(scenario, a, t);
              const succeeded = a.outcome === 'succeeded';
              const isLast = i === shown.length - 1 && (done || schedule.attempts.length === shown.length);
              return (
                <TrailNode key={i} tone={a.outcome} last={isLast && succeeded}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {succeeded ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          Retry #{i + 1} · {succeeded ? 'Recovered' : 'Declined again'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {fmtDateTime(a.date)} · day +{a.offsetDays}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Acted on{' '}
                        <span className={`font-semibold ${a.source === 'merchant' ? 'text-indigo-600 dark:text-indigo-400' : 'text-primary'}`}>
                          {a.source === 'merchant' ? 'Merchant insights' : 'Juspay insights'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onExplain(a)}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline flex-shrink-0 whitespace-nowrap"
                    >
                      Why this retry? <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </TrailNode>
              );
            })}
          </div>

          {/* Outcome summary — highlights how probabilistic sourcing cut retries */}
          {recovered && (
            <div className="mt-5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 p-4">
              <p className="text-sm text-emerald-800 dark:text-emerald-300">
                <b>Recovered in {schedule.successAt} {schedule.successAt === 1 ? 'retry' : 'retries'}.</b>{' '}
                At {Math.round(schedule.pMerchant * 100)}% merchant-insight sampling, the engine drew{' '}
                <b>{schedule.merchantCount}</b> of {schedule.successAt} retr{schedule.successAt === 1 ? 'y' : 'ies'}{' '}
                from Merchant insights and the rest from the Juspay network.{' '}
                {schedule.hardDecline
                  ? `It stayed within the $${schedule.budget.toFixed(2)} budget, spending $${schedule.spent.toFixed(2)} in network penalties to clear the hard decline.`
                  : schedule.pMerchant > 0.05
                  ? `A pure network baseline would need about ${schedule.counterCount} retries — richer merchant data converges faster.`
                  : `Merchant data is still too sparse to trust here, so it fell back to the network baseline (~${schedule.counterCount} retries). Move the Time Machine forward and replay to watch sampling — and recovery — improve.`}
              </p>
            </div>
          )}

          {/* Hard-decline budget outcome */}
          {budgetExhausted && (
            <div className="mt-5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 p-4">
              <p className="text-sm text-red-800 dark:text-red-300">
                <b>Budget exhausted — invoice still unrecovered.</b>{' '}
                The budget only covered <b>{schedule.attempts.length}</b> of the ~{schedule.needed} retries needed to
                clear this hard decline at the current data density, spending <b>${schedule.spent.toFixed(2)}</b> of
                ${schedule.budget.toFixed(2)}. Raise the budget to about ${(schedule.needed * schedule.cost).toFixed(2)}{' '}
                to fund a recovery, or move the Time Machine forward so denser merchant data needs fewer retries.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
const ClusterField = ({ icon, label, value }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</div>
      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{value}</div>
    </div>
  </div>
);

const ClusterPanel = ({ scenario, history }) => (
  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Cluster Info</span>
      </div>
      <span className="text-[11px] text-gray-500 dark:text-gray-400">{scenario.customer}</span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 mb-5">
      <ClusterField
        icon={<XCircle className="w-4 h-4 text-red-500" />}
        label="Error code"
        value={`${scenario.errorCode} · ${scenario.errorLabel}`}
      />
      <ClusterField icon={<CreditCard className="w-4 h-4 text-gray-500" />} label="Card funding" value={scenario.cluster.funding} />
      <ClusterField icon={<Globe className="w-4 h-4 text-gray-500" />} label="Card network" value={scenario.cluster.network} />
      <ClusterField icon={<Building2 className="w-4 h-4 text-gray-500" />} label="Billing country" value={scenario.cluster.country} />
      <ClusterField icon={<Landmark className="w-4 h-4 text-gray-500" />} label="Issuer" value={scenario.cluster.issuer} />
      <ClusterField icon={<CreditCard className="w-4 h-4 text-gray-500" />} label="BIN" value={scenario.cluster.bin} />
    </div>

    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Historical successful transactions on this card
        </span>
      </div>
      <div className="space-y-1.5">
        {history.map((h, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-300">{fmtDateTime(h.date)}</span>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 font-medium">
              {h.weekday}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
const InsightRow = ({ day, source }) => {
  const data = source === 'merchant' ? day.merchant : day.juspay;
  const sparse = source === 'merchant' && data.sparse;
  return (
    <div
      className={`rounded-lg border p-3 ${
        day.isBest
          ? 'border-primary/40 bg-blue-50/40 dark:bg-blue-900/10'
          : 'border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/30'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{fmtDate(day.date)}</span>
        {day.isBest && (
          <span className="text-[9px] font-bold uppercase tracking-wide text-primary bg-blue-100 dark:bg-blue-900/40 rounded-full px-1.5 py-0.5">
            Best day
          </span>
        )}
      </div>
      {sparse ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">
          Insufficient merchant data for this cluster yet ({fmt(data.domA)} samples).
        </p>
      ) : (
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{insightSentence(data)}</p>
      )}
    </div>
  );
};

const InsightsPanel = ({ title, icon, source, days, confidence, accent, usage, active }) => (
  <div className={`rounded-xl border bg-white dark:bg-gray-800 p-5 ${active ? 'border-primary/50 ring-1 ring-blue-100 dark:ring-blue-900/40' : 'border-gray-200 dark:border-gray-700'}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
        <span className={`text-[9px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 ${active ? 'text-white bg-primary' : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700'}`}>
          {Math.round(usage * 100)}% of retries
        </span>
      </div>
      <span className={`text-[11px] font-semibold ${accent}`}>{Math.round(confidence * 100)}% conf.</span>
    </div>
    <div className="text-[11px] text-gray-400 dark:text-gray-500 mb-3">Cluster insights for the next 3 days</div>
    <div className="space-y-2">
      {days.map((d, i) => (
        <InsightRow key={i} day={d} source={source} />
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
const RecoverySimulator = () => {
  const [t, setT] = useState(0);
  const [tab, setTab] = useState('subscriptions');
  const [scenarioId, setScenarioId] = useState(null);
  const [modalAttempt, setModalAttempt] = useState(null);
  const [budget, setBudget] = useState(0);
  const [run, setRun] = useState({ state: 'idle', shown: 0, schedule: null });
  const runTokenRef = useRef(null);

  const clock = useMemo(() => clockFor(t), [t]);
  const scenario = useMemo(
    () => SCENARIOS[tab].find((s) => s.id === scenarioId) || null,
    [tab, scenarioId]
  );

  const history = useMemo(() => (scenario ? cardHistory(scenario, clock) : []), [scenario, clock]);
  const days = useMemo(() => (scenario ? futureDays(scenario, clock, t) : []), [scenario, clock, t]);
  const liveP = scenario ? pMerchantFor(scenario, t) : 0;
  const merchConf = merchantConfidence(t);

  const resetRun = useCallback(() => {
    runTokenRef.current = null;
    setRun({ state: 'idle', shown: 0, schedule: null });
  }, []);

  // Any change to the scenario, Time Machine, or retry budget invalidates a run:
  // the schedule would be different, so start fresh.
  useEffect(() => {
    resetRun();
  }, [scenarioId, tab, t, budget, resetRun]);

  useEffect(() => () => { runTokenRef.current = null; }, []);

  const runSimulation = useCallback(async () => {
    if (!scenario) return;
    const schedule = buildSchedule(scenario, t, budget);
    const token = {};
    runTokenRef.current = token;
    setModalAttempt(null);
    setRun({ state: 'running', shown: 0, schedule });

    if (schedule.suppressed) {
      await new Promise((r) => setTimeout(r, 500));
      if (runTokenRef.current !== token) return;
      setRun({ state: 'done', shown: 0, schedule });
      return;
    }

    for (let i = 0; i < schedule.attempts.length; i++) {
      await new Promise((r) => setTimeout(r, STEP_MS));
      if (runTokenRef.current !== token) return;
      setRun((prev) => ({ ...prev, shown: i + 1 }));
    }
    if (runTokenRef.current !== token) return;
    setRun((prev) => ({ ...prev, state: 'done' }));
  }, [scenario, t, budget]);

  const selectTab = (id) => {
    setTab(id);
    setScenarioId(null);
    setModalAttempt(null);
    setBudget(0);
  };

  const selectScenario = (id) => {
    setScenarioId(id);
    setModalAttempt(null);
    setBudget(0);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          An RL-based retry engine recovers failed recurring payments. Pick a scenario, set merchant
          data density with the Time Machine, then run the simulation to watch the engine schedule
          retries — switching from Juspay to Merchant insights as data densifies.
        </p>
      </div>

      <TimeMachine t={t} setT={setT} />

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            onClick={() => selectTab(tb.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === tb.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Scenario selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SCENARIOS[tab].map((s) => (
          <ScenarioCard
            key={s.id}
            scenario={s}
            active={scenarioId === s.id}
            onClick={() => selectScenario(s.id)}
          />
        ))}
      </div>

      {!scenario ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select a scenario above to run the recovery simulation.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* HERO — retry trail centre stage */}
          <HeroTrail
            scenario={scenario}
            t={t}
            run={run}
            budget={budget}
            setBudget={setBudget}
            onRun={runSimulation}
            onExplain={setModalAttempt}
          />

          {/* Supporting evidence */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3 text-center">
              What the engine looked at
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ClusterPanel scenario={scenario} history={history} />
              <div className="space-y-5">
                <InsightsPanel
                  title="Juspay insights"
                  icon={<Sparkles className="w-4 h-4 text-primary" />}
                  source="juspay"
                  days={days}
                  confidence={JUSPAY_CONFIDENCE}
                  accent="text-primary"
                  usage={1 - liveP}
                  active={liveP < 0.5}
                />
                <InsightsPanel
                  title="Merchant insights"
                  icon={<Store className="w-4 h-4 text-indigo-500" />}
                  source="merchant"
                  days={days}
                  confidence={merchConf}
                  accent="text-indigo-500"
                  usage={liveP}
                  active={liveP >= 0.5}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {modalAttempt && (
        <RetryDecisionModal
          scenario={scenario}
          attempt={modalAttempt}
          t={t}
          onClose={() => setModalAttempt(null)}
        />
      )}
    </div>
  );
};

export default RecoverySimulator;
