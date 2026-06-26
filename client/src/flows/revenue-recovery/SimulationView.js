import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import ComponentCard from './ComponentCard';
import LedgerPanel from './LedgerPanel';
import ChannelSVG from './ChannelSVG';
import MessageStream from './MessageStream';
import { formatTime, futureDate, formatConnectorName } from './simulationData';

const INVOICE_ID = 'INV-2024-0001';
const INVOICE_AMOUNT = '$49.00';

const SimulationView = ({ paymentConfig, billingConfig }) => {
  const [phase, setPhase] = useState('idle');
  const [active, setActive] = useState(null);
  const [billStatus, setBillStatus] = useState('Idle');
  const [billTone, setBillTone] = useState('idle');
  const [procStatus, setProcStatus] = useState('Idle');
  const [procTone, setProcTone] = useState('idle');
  const [invoiceStatus, setInvoiceStatus] = useState('No invoice');
  const [invoiceTone, setInvoiceTone] = useState('idle');
  const [external, setExternal] = useState([]);
  const [internal, setInternal] = useState([]);
  const [log, setLog] = useState([]);
  const [banner, setBanner] = useState('Press Start to play the full bi-directional flow.');

  const cardRef = useRef(null);
  const headerRef = useRef(null);
  const controlBarRef = useRef(null);
  const stageWrapRef = useRef(null);
  const stageRef = useRef(null);
  const chipRef = useRef(null);
  const pathRefs = {
    cBP: useRef(null),
    cBR: useRef(null),
    cPR: useRef(null),
  };
  const cancelRef = useRef(false);
  const [stageScale, setStageScale] = useState(1);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const header = headerRef.current;
    const controlBar = controlBarRef.current;
    const wrap = stageWrapRef.current;
    if (!card || !header || !controlBar || !wrap) return;

    const compute = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      const wScale = w / 1080;
      const hScale = h / 640;
      return Math.min(1, wScale, hScale);
    };

    let rafId;
    let timeoutIds = [];
    const update = () => setStageScale(compute());

    const scheduleUpdate = () => {
      cancelAnimationFrame(rafId);
      timeoutIds.forEach(clearTimeout);
      timeoutIds = [];
      rafId = requestAnimationFrame(() => {
        update();
        timeoutIds.push(setTimeout(update, 120));
        timeoutIds.push(setTimeout(update, 350));
        timeoutIds.push(setTimeout(update, 700));
      });
    };

    scheduleUpdate();
    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(wrap);
    ro.observe(card);
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      cancelAnimationFrame(rafId);
      timeoutIds.forEach(clearTimeout);
      ro.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const tick = (ms) =>
    new Promise((resolve) => {
      setTimeout(() => {
        if (cancelRef.current) return resolve('cancelled');
        resolve();
      }, ms);
    });

  const addLog = useCallback((route, label, status, tone) => {
    setLog((prev) => [...prev, { time: formatTime(), route, label, status, tone }]);
  }, []);

  const pushExternal = useCallback((item) => {
    setExternal((prev) => [...prev, item]);
  }, []);

  const pushInternal = useCallback((item) => {
    setInternal((prev) => [...prev, item]);
  }, []);

  const patchInternal = useCallback((idx, patch) => {
    setInternal((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    );
  }, []);

  const flyChip = useCallback((channelId, reverse, color, label) => {
    return new Promise((resolve) => {
      const stage = stageRef.current;
      const chip = chipRef.current;
      const path = pathRefs[channelId]?.current;

      if (!stage || !chip || !path) {
        setTimeout(resolve, 320);
        return;
      }

      const len = path.getTotalLength();

      path.style.stroke = color;
      path.style.strokeDasharray = '1 8';
      path.style.opacity = '1';
      path.style.animation = 'ccflow 0.6s linear infinite';
      path.style.animationDirection = reverse ? 'reverse' : 'normal';

      chip.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:${color};flex:none;"></span><span>${label}</span>`;
      chip.style.borderColor = color;
      chip.style.boxShadow = `0 8px 22px -6px ${color}88`;
      chip.style.opacity = '1';

      const cw = chip.offsetWidth || 90;
      const ch = chip.offsetHeight || 28;
      const dur = 1000;
      const t0 = performance.now();
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        chip.style.opacity = '0';
        setTimeout(() => {
          path.style.opacity = '0';
          path.style.animation = '';
          path.style.stroke = 'none';
        }, 220);
        resolve();
      };

      const frame = (n) => {
        if (done || cancelRef.current) {
          if (!done) finish();
          return;
        }
        const p = Math.min(1, (n - t0) / dur);
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const at = reverse ? 1 - e : e;
        const pt = path.getPointAtLength(at * len);
        chip.style.transform = `translate(${pt.x - cw / 2}px, ${pt.y - ch / 2}px)`;
        if (p < 1) requestAnimationFrame(frame);
        else finish();
      };

      requestAnimationFrame(frame);
      setTimeout(finish, dur + 280);
    });
  }, []);

  const run = useCallback(async () => {
    cancelRef.current = false;
    setPhase('running');
    setActive('bill');
    setLog([]);
    setExternal([]);
    setInternal([]);
    setBillStatus('Idle');
    setBillTone('idle');
    setProcStatus('Idle');
    setProcTone('idle');
    setInvoiceStatus('No invoice');
    setInvoiceTone('idle');
    setBanner('Flow in progress\u2026');

    if ((await tick(300)) === 'cancelled') return;

    // 1 — Invoice generated by Billing
    setActive('bill');
    setBillTone('info');
    setBillStatus(`Invoice ${INVOICE_ID} raised`);
    setInvoiceTone('info');
    setInvoiceStatus('Open');
    addLog('Billing Engine', `invoice ${INVOICE_ID} generated \u00B7 ${INVOICE_AMOUNT}`, 'created', 'listen');
    if ((await tick(550)) === 'cancelled') return;

    // 2 — invoice.created webhook (Billing -> Recovery)
    await flyChip('cBR', false, '#0066FF', 'invoice.created');
    if (cancelRef.current) return;
    addLog('Billing \u2192 Recovery', 'invoice.created webhook', 'received', 'listen');
    setActive('rec');
    if ((await tick(400)) === 'cancelled') return;

    // 3a — Billing triggers payment to Processor
    setActive('bill');
    setProcTone('processing');
    setProcStatus('Processing payment\u2026');
    await flyChip('cBP', false, '#5e6573', 'trigger payment');
    if (cancelRef.current) return;
    addLog('Billing \u2192 Processor', `trigger payment \u00B7 ${INVOICE_AMOUNT}`, 'sent', 'idle');
    setActive('proc');
    if ((await tick(650)) === 'cancelled') return;

    // 3b — Payment failed, response back to Billing
    setProcTone('failed');
    setProcStatus('Declined \u00B7 insufficient funds');
    await flyChip('cBP', true, '#EF4444', 'response: failed');
    if (cancelRef.current) return;
    addLog('Processor \u2192 Billing', 'payment response: failed', 'failed', 'failed');

    // 3c — Attach external transaction to ledger
    pushExternal({
      label: 'Payment attempt',
      sub: 'Stripe \u00B7 triggered by Billing',
      amount: INVOICE_AMOUNT,
      status: 'Failed',
      tone: 'failed',
    });
    setInvoiceTone('failed');
    setInvoiceStatus('Past due');
    if ((await tick(300)) === 'cancelled') return;

    // 4 — Processor reports failure to Recovery via webhook
    setActive('proc');
    await flyChip('cPR', false, '#EF4444', 'payment.failed');
    if (cancelRef.current) return;
    addLog('Processor \u2192 Recovery', 'payment.failed webhook', 'received', 'failed');
    setActive('rec');
    if ((await tick(450)) === 'cancelled') return;

    // 5-6 — Schedule + retry loop (retry #1 fails, retry #2 succeeds)
    let attempt = 0;
    let success = false;

    while (!success) {
      attempt++;
      const date = futureDate(attempt * 2);

      // Schedule internal transaction
      pushInternal({
        label: `Retry #${attempt}`,
        sub: `Scheduled ${date}`,
        amount: INVOICE_AMOUNT,
        status: 'Scheduled',
        tone: 'scheduled',
      });
      const idx = attempt - 1;
      setActive('rec');
      addLog('Recovery \u00B7 internal', `scheduled retry #${attempt} for ${date}`, 'scheduled', 'scheduled');
      if ((await tick(650)) === 'cancelled') return;

      // Trigger retry
      patchInternal(idx, { status: 'Processing', tone: 'processing' });
      setActive('rec');
      setProcTone('processing');
      setProcStatus(`Retrying charge (#${attempt})\u2026`);
      await flyChip('cPR', true, '#0066FF', `retry #${attempt}`);
      if (cancelRef.current) return;
      addLog('Recovery \u2192 Processor', `retry payment #${attempt}`, 'retrying', 'listen');
      setActive('proc');
      if ((await tick(700)) === 'cancelled') return;

      success = attempt >= 2;

      if (!success) {
        // Retry failed
        setProcTone('failed');
        setProcStatus(`Declined again (#${attempt})`);
        await flyChip('cPR', false, '#EF4444', 'failed');
        if (cancelRef.current) return;
        addLog('Processor \u2192 Recovery', 'payment.failed webhook', 'failed', 'failed');
        patchInternal(idx, { status: 'Failed', sub: `Attempted ${date}`, tone: 'failed' });
        setActive('rec');
        if ((await tick(450)) === 'cancelled') return;
      } else {
        // Retry succeeded
        setProcTone('success');
        setProcStatus('Payment succeeded \u2713');
        await flyChip('cPR', false, '#10B981', 'succeeded');
        if (cancelRef.current) return;
        addLog('Processor \u2192 Recovery', 'payment.succeeded webhook', 'recovered', 'success');
        patchInternal(idx, { status: 'Succeeded', sub: `Captured ${date}`, tone: 'success' });
        setActive('rec');
        if ((await tick(500)) === 'cancelled') return;
      }
    }

    // 7 — Recovery marks invoice paid at Billing via API
    await flyChip('cBR', true, '#10B981', 'mark paid (API)');
    if (cancelRef.current) return;
    addLog('Recovery \u2192 Billing', 'PATCH invoice \u2192 paid (API)', 'sent', 'success');
    setActive(null);
    setBillTone('success');
    setBillStatus(`${INVOICE_ID} \u00B7 paid \u2713`);
    setInvoiceTone('recovered');
    setInvoiceStatus('Recovered');
    setPhase('done');
    setBanner(`\u2713 Recovered ${INVOICE_AMOUNT} on retry #${attempt} \u00B7 invoice marked paid.`);
  }, [flyChip, addLog, pushExternal, pushInternal, patchInternal]);

  const onStart = () => {
    if (phase !== 'running') run();
  };

  const paymentName = formatConnectorName(paymentConfig?.processor) || 'Stripe';
  const billingName = formatConnectorName(billingConfig?.processor) || 'Chargebee';

  const btnLabel = phase === 'running' ? 'Running\u2026' : phase === 'done' ? 'Replay flow' : '\u25B6  Start';
  const btnBg = phase === 'running' ? '#9bb6e6' : '#0066FF';
  const btnCursor = phase === 'running' ? 'default' : 'pointer';

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden flex flex-col"
      style={{
        border: '1px solid #e5e7eb',
        boxShadow: '0 20px 40px -16px rgba(15,23,42,.12)',
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* Header */}
      <div
        ref={headerRef}
        className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700"
        style={{ padding: '16px 24px', flexShrink: 0 }}
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
            Revenue Recovery &mdash; Component Communication
          </div>
          <div className="text-gray-400 dark:text-gray-500" style={{ fontSize: '12px' }}>
            Messages travel as chips across two-way channels &middot; Recovery keeps the invoice ledger
          </div>
        </div>
        <div className="flex gap-2 ml-auto" style={{ fontSize: '11.5px' }}>
          <span
            className="border rounded-full"
            style={{ background: '#f1f3f7', border: '1px solid #e5e7eb', padding: '5px 11px', color: '#5e6573' }}
          >
            Payment: <b className="text-gray-900 dark:text-white">{paymentName}</b>{' '}
            <span style={{ color: '#10B981' }}>&#10003;</span>
          </span>
          <span
            className="border rounded-full"
            style={{ background: '#f1f3f7', border: '1px solid #e5e7eb', padding: '5px 11px', color: '#5e6573' }}
          >
            Billing: <b className="text-gray-900 dark:text-white">{billingName}</b>{' '}
            <span style={{ color: '#10B981' }}>&#10003;</span>
          </span>
        </div>
      </div>

      {/* Control bar */}
      <div
        ref={controlBarRef}
        className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 dark:bg-gray-900/50"
        style={{ padding: '14px 24px', background: '#fafbfc', flexShrink: 0 }}
      >
        <button
          onClick={onStart}
          disabled={phase === 'running'}
          className="text-white font-semibold"
          style={{
            fontSize: '13px',
            background: btnBg,
            border: 'none',
            borderRadius: '9px',
            padding: '10px 18px',
            cursor: btnCursor,
            boxShadow: '0 2px 8px rgba(0,102,255,.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {phase !== 'running' && phase !== 'done' && <Play size={14} />}
          {phase === 'done' && <RotateCcw size={14} />}
          {btnLabel}
        </button>
        <div className="text-gray-500 dark:text-gray-400 font-medium" style={{ fontSize: '12.5px' }}>
          {banner}
        </div>
        <div className="flex items-center gap-2 ml-auto text-gray-400 dark:text-gray-500" style={{ fontSize: '11px' }}>
          <span style={{ width: 18, height: 5, borderRadius: '3px', background: '#e3e6ec', display: 'inline-block' }} />
          <span>channel</span>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#0066FF', display: 'inline-block', marginLeft: '6px' }} />
          <span>message chip &middot; travels both ways</span>
        </div>
      </div>

      {/* Body: stage (70%) + log (30%) */}
      <div className="flex flex-col lg:flex-row items-stretch overflow-hidden" style={{ flex: 1, minHeight: 0 }}>
        {/* Stage — 70% */}
        <div
          ref={stageWrapRef}
          className="relative overflow-hidden"
          style={{
            flex: '0 0 70%',
            minWidth: 0,
            minHeight: 0,
            background: 'radial-gradient(circle at 50% 40%, #fafbff 0%, #f3f4f7 74%)',
          }}
        >
          <div
            ref={stageRef}
            style={{
              position: 'relative',
              width: 1080,
              height: 640,
              transform: `scale(${stageScale})`,
              transformOrigin: 'top left',
            }}
          >
            <ChannelSVG pathRefs={pathRefs} />

            {/* Traveling message chip */}
            <div
              ref={chipRef}
              className="absolute"
              style={{
                top: 0,
                left: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '6px 11px',
                background: '#fff',
                border: '1.5px solid #dde1e9',
                borderRadius: '999px',
                boxShadow: '0 8px 20px -6px rgba(15,23,42,.32)',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#1a1f36',
                whiteSpace: 'nowrap',
                opacity: 0,
                pointerEvents: 'none',
                transform: 'translate(-300px, -300px)',
                zIndex: 9,
              }}
            />

            {/* Billing card */}
            <ComponentCard
              title="Billing Engine"
              provider={billingName}
              iconType="billing"
              status={billStatus}
              tone={billTone}
              isActive={active === 'bill'}
              position={{ left: 50, top: 44, width: 240 }}
            />

            {/* Processor card */}
            <ComponentCard
              title="Payment Processor"
              provider={paymentName}
              iconType="payment"
              status={procStatus}
              tone={procTone}
              isActive={active === 'proc'}
              position={{ left: 790, top: 44, width: 240 }}
            />

            {/* Revenue Recovery ledger panel */}
            <LedgerPanel
              invoiceId={INVOICE_ID}
              invoiceAmount={INVOICE_AMOUNT}
              invoiceStatus={invoiceStatus}
              invoiceTone={invoiceTone}
              external={external}
              internal={internal}
              isActive={active === 'rec'}
              position={{ left: 60, top: 280, width: 840 }}
            />
          </div>
        </div>

        {/* Message stream — 30% */}
        <MessageStream log={log} phase={phase} />
      </div>
    </div>
  );
};

export default SimulationView;
