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
      
      // Wait 4 seconds before moving to next
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

  // Parse scenario description into steps
  const getScenarioSteps = () => {
    const desc = scenario.detailedDescription;
    const sentences = desc.split('. ').filter(s => s.trim());
    return sentences.map(s => s.endsWith('.') ? s : s + '.');
  };

  return (
    <div className="space-y-6 text-base">
      {/* Mechanism Bar - Full Width */}
      <MechanismBar 
        mechanisms={retryMechanisms} 
        activeMechanisms={activeMechanisms} 
      />

      {/* Scenario Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          What happens in this scenario:
        </h3>
        <div className="space-y-3">
          {getScenarioSteps().map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-base text-blue-900 leading-relaxed">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls - Run and Reset side by side */}
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
          className="flex items-center gap-2 px-5 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>

        {currentStep > 0 && (
          <span className="text-base text-gray-600 ml-auto">
            Attempt <span className="font-bold">{currentStep}</span> of {scenario.attempts.length}
          </span>
        )}
      </div>

      {/* Timeline */}
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
          <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-5xl mb-4">⚡</div>
            <p className="text-gray-600 text-lg font-medium">
              Click "Run Simulation" to start
            </p>
            <p className="text-gray-500 mt-2">
              Watch how smart retry mechanisms recover failed payments
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {isComplete && (
        <div className={`rounded-xl p-6 border-2 ${
          isSuccess 
            ? 'bg-green-50 border-green-300'
            : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-gray-900">
                {isSuccess ? '✓ Payment Recovered' : '✕ All Attempts Failed'}
              </p>
              <p className="text-base text-gray-600 mt-1">
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
