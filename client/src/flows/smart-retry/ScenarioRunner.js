import React, { useState, useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import AttemptCard from './AttemptCard';
import MechanismBar from './MechanismBar';
import { retryMechanisms } from './scenarios';

const ScenarioRunner = ({ scenario }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activeMechanisms, setActiveMechanisms] = useState([]);

  useEffect(() => {
    setActiveMechanisms(scenario.mechanisms || []);
  }, [scenario]);

  const runScenario = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    setIsComplete(false);

    for (let i = 0; i < scenario.attempts.length; i++) {
      setCurrentStep(i + 1);
      
      await new Promise(resolve => setTimeout(resolve, 4000));
    }

    setIsRunning(false);
    setIsComplete(true);
  };

  const resetScenario = () => {
    setCurrentStep(0);
    setIsRunning(false);
    setIsComplete(false);
  };

  const visibleAttempts = scenario.attempts.slice(0, currentStep);
  const lastAttempt = visibleAttempts[visibleAttempts.length - 1];
  const isSuccess = lastAttempt?.status === 'approved';

  const getScenarioSteps = () => {
    const desc = scenario.detailedDescription;
    const sentences = desc.split('. ').filter(s => s.trim());
    return sentences.map(s => s.endsWith('.') ? s : s + '.');
  };

  return (
    <div className="space-y-6 text-base">
      <MechanismBar 
        mechanisms={retryMechanisms} 
        activeMechanisms={activeMechanisms} 
      />

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
          What happens in this scenario:
        </h3>
        <div className="space-y-3">
          {getScenarioSteps().map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-base text-blue-900 dark:text-blue-200 leading-relaxed">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={runScenario}
          disabled={isRunning}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-medium"
        >
          <Play className="w-5 h-5" />
          {isRunning ? 'Running...' : 'Run Simulation'}
        </button>
        
        <button
          onClick={resetScenario}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>

        {currentStep > 0 && (
          <span className="text-base text-gray-600 dark:text-gray-400 ml-auto">
            Attempt <span className="font-bold">{currentStep}</span> of {scenario.attempts.length}
          </span>
        )}
      </div>

      <div className="space-y-0">
        {visibleAttempts.map((attempt, index) => (
          <AttemptCard
            key={attempt.id}
            attempt={attempt}
            isHighlighted={index === visibleAttempts.length - 1}
            showConnector={index < visibleAttempts.length - 1}
          />
        ))}

        {visibleAttempts.length === 0 && (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-5xl mb-4">⚡</div>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
              Click "Run Simulation" to start
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Watch how smart retry mechanisms recover failed payments
            </p>
          </div>
        )}
      </div>

      {isComplete && (
        <div className={`rounded-xl p-6 border-2 ${
          isSuccess 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
            : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {isSuccess ? '✓ Payment Recovered' : '✕ All Attempts Failed'}
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                {isSuccess 
                  ? `Successfully completed in ${scenario.attempts.length} retry attempts`
                  : 'Maximum retry attempts exhausted without success'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioRunner;
