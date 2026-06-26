import React, { useState } from 'react';
import { TrendingUp, Play, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

const failureReasons = [
  { id: 'insufficient_funds', label: 'Insufficient Funds', recoveryRate: 65 },
  { id: 'expired_card', label: 'Expired Card', recoveryRate: 15 },
  { id: 'incorrect_cvc', label: 'Incorrect CVC', recoveryRate: 40 },
  { id: 'lost_card', label: 'Lost Card', recoveryRate: 5 },
  { id: 'do_not_honor', label: 'Do Not Honor', recoveryRate: 30 },
  { id: 'network_error', label: 'Network Error', recoveryRate: 85 },
];

const retryStrategies = [
  { id: 'immediate', label: 'Immediate Retry', description: 'Retry within minutes of failure' },
  { id: 'exponential', label: 'Exponential Backoff', description: 'Retry after 1h, 6h, 24h, 3d, 7d' },
  { id: 'smart', label: 'Smart Scheduling', description: 'AI-driven optimal retry timing based on failure reason' },
  { id: 'fixed', label: 'Fixed Schedule', description: 'Retry on fixed days (Day 1, 3, 7, 14)' },
];

const RecoverySimulator = () => {
  const [selectedReason, setSelectedReason] = useState(failureReasons[0]);
  const [selectedStrategy, setSelectedStrategy] = useState(retryStrategies[2]);
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runSimulation = () => {
    setHasRun(true);
  };

  const reset = () => {
    setHasRun(false);
    setSelectedReason(failureReasons[0]);
    setSelectedStrategy(retryStrategies[2]);
  };

  const baseRecoveryRate = selectedReason.recoveryRate;
  const strategyMultiplier =
    selectedStrategy.id === 'smart' ? 1.25 :
    selectedStrategy.id === 'exponential' ? 1.15 :
    selectedStrategy.id === 'immediate' ? 1.05 :
    1.0;
  const projectedRecovery = Math.min(95, Math.round(baseRecoveryRate * strategyMultiplier));
  const attempts = selectedStrategy.id === 'immediate' ? 3 :
    selectedStrategy.id === 'exponential' ? 5 :
    selectedStrategy.id === 'smart' ? 4 : 4;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Simulate payment recovery scenarios. Select a failure reason and retry strategy to project recovery rates and visualize the dunning timeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Failure Reason
          </label>
          <button
            onClick={() => { setIsReasonOpen(!isReasonOpen); setIsStrategyOpen(false); }}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">{selectedReason.label}</span>
            {isReasonOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {isReasonOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {failureReasons.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => { setSelectedReason(reason); setIsReasonOpen(false); setHasRun(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{reason.label}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">Base recovery: {reason.recoveryRate}%</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Retry Strategy
          </label>
          <button
            onClick={() => { setIsStrategyOpen(!isStrategyOpen); setIsReasonOpen(false); }}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <div className="text-left">
              <span className="font-medium text-gray-900 dark:text-white">{selectedStrategy.label}</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">{selectedStrategy.description}</span>
            </div>
            {isStrategyOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {isStrategyOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {retryStrategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => { setSelectedStrategy(strategy); setIsStrategyOpen(false); setHasRun(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{strategy.label}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">{strategy.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={runSimulation}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          <Play size={16} /> Run Simulation
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {hasRun && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-3xl font-bold text-primary">{projectedRecovery}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Projected Recovery Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{attempts}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Retry Attempts</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{baseRecoveryRate}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Base Recovery (no strategy)</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recovery Timeline</h4>
            <div className="space-y-2">
              {Array.from({ length: attempts }).map((_, i) => {
                const cumulativeRecovery = Math.min(projectedRecovery, Math.round(baseRecoveryRate * strategyMultiplier * ((i + 1) / attempts)));
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-gray-500 dark:text-gray-400">Attempt {i + 1}</div>
                    <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full bg-primary rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${cumulativeRecovery}%` }}
                      >
                        <span className="text-xs text-white font-medium">{cumulativeRecovery}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Using <strong>{selectedStrategy.label}</strong> for <strong>{selectedReason.label}</strong>, you can recover approximately <strong>{projectedRecovery}%</strong> of failed payments over <strong>{attempts}</strong> retry attempts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecoverySimulator;
