import React from 'react';
import { X, Sparkles, Store, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { decisionFor, insightSentence, fmtDateTime } from './recoverySimData';

const ConfidenceBar = ({ label, icon, value, chosen }) => {
  const pct = Math.round(value * 100);
  return (
    <div
      className={`rounded-lg border p-4 ${
        chosen
          ? 'border-primary bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{label}</span>
        </div>
        {chosen && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-white bg-primary rounded-full px-2 py-0.5">
            Used
          </span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-2xl font-bold ${chosen ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
          {pct}%
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">confidence</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full ${chosen ? 'bg-primary' : 'bg-gray-400 dark:bg-gray-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const RetryDecisionModal = ({ scenario, attempt, t, onClose }) => {
  if (!attempt) return null;

  const d = decisionFor(scenario, attempt, t);
  const usedMerchant = d.source === 'merchant';
  const succeeded = attempt.outcome === 'succeeded';
  const activeInsight = usedMerchant ? d.insight.merchant : d.insight.juspay;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {succeeded ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Why the engine retried on {fmtDateTime(d.date).split(' · ')[0]}
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Scheduled for <span className="font-medium text-gray-700 dark:text-gray-300">{fmtDateTime(d.date)}</span>
              {' · '}
              Outcome:{' '}
              <span className={succeeded ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                {succeeded ? 'Recovered' : 'Declined again'}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {scenario.hardDecline && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1">
                Budget-forced retry
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                This retry only ran because a retry budget overrode the default suppression on a hard
                decline. It cost <b>${(attempt.cost || 0).toFixed(2)}</b> in network penalty; the engine keeps
                retrying within budget until it {succeeded ? 'recovers' : 'runs out'}.
              </p>
            </div>
          )}

          {/* Decision headline */}
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/40 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
              Decision
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              At this data density the engine samples Merchant insights with probability{' '}
              <span className="font-bold text-indigo-600 dark:text-indigo-300">{Math.round(d.probability * 100)}%</span>.
              This retry sampled{' '}
              <span className="font-bold text-gray-900 dark:text-white">
                {usedMerchant ? 'Merchant insights' : 'Juspay network insights'}
              </span>
              {usedMerchant
                ? ' — enough merchant cluster history had accrued to time this retry on the merchant’s own best day.'
                : d.insight.merchant.sparse
                ? ' — merchant data for this cluster is still sparse, so the cross-merchant network signal was drawn.'
                : ' — the draw favoured the network baseline for this attempt (the engine keeps exploring both).'}
            </p>
          </div>

          {/* Confidence comparison */}
          <div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Insight confidence at retry time
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ConfidenceBar
                label="Juspay insights"
                icon={<Sparkles className="w-4 h-4 text-primary" />}
                value={d.juspayConfidence}
                chosen={!usedMerchant}
              />
              <ConfidenceBar
                label="Merchant insights"
                icon={<Store className="w-4 h-4 text-indigo-500" />}
                value={d.merchantConfidence}
                chosen={usedMerchant}
              />
            </div>
          </div>

          {/* Insight for the transacted day */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              Insight for the transacted day
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/40">
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                {insightSentence(activeInsight)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-gray-600 dark:text-gray-300">
                  Day of month: <b className="text-gray-900 dark:text-white">{activeInsight.domOrdinal}</b>
                </span>
                <span className="rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-gray-600 dark:text-gray-300">
                  Day of week: <b className="text-gray-900 dark:text-white">{activeInsight.dowName}</b>
                </span>
                <span className="rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-gray-600 dark:text-gray-300">
                  Source: <b className="text-gray-900 dark:text-white">{usedMerchant ? 'Merchant' : 'Juspay'}</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetryDecisionModal;
