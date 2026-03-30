import React, { useState } from 'react';
import { Play, RotateCcw, Shield, ShieldAlert, ShieldCheck, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const scenarios = [
  {
    id: 'low_risk',
    name: 'Low Risk Transaction',
    transaction: { amount: 50, currency: 'USD', cardNetwork: 'visa', cardType: 'credit', country: 'USA', isRecurring: false, merchantRiskProfile: 'low' },
    riskFactors: { amountRisk: 10, geoRisk: 5, deviceRisk: 10, behaviorRisk: 5, merchantRisk: 10 },
    totalRiskScore: 40,
    decision: 'skip',
    reason: 'Risk score below threshold (40 < 100)',
    outcome: { authSuccess: true, friction: 'none', fraudPrevented: false }
  },
  {
    id: 'medium_risk',
    name: 'Medium Risk Transaction',
    transaction: { amount: 250, currency: 'USD', cardNetwork: 'mastercard', cardType: 'credit', country: 'USA', isRecurring: false, merchantRiskProfile: 'medium' },
    riskFactors: { amountRisk: 25, geoRisk: 10, deviceRisk: 15, behaviorRisk: 20, merchantRisk: 30 },
    totalRiskScore: 100,
    decision: 'challenge',
    reason: 'Risk score at threshold (100) - Challenge triggered',
    outcome: { authSuccess: true, friction: 'challenge', fraudPrevented: true }
  },
  {
    id: 'high_risk',
    name: 'High Risk Transaction',
    transaction: { amount: 1500, currency: 'USD', cardNetwork: 'visa', cardType: 'credit', country: 'Nigeria', isRecurring: false, merchantRiskProfile: 'high' },
    riskFactors: { amountRisk: 40, geoRisk: 35, deviceRisk: 20, behaviorRisk: 25, merchantRisk: 40 },
    totalRiskScore: 160,
    decision: 'challenge',
    reason: 'High risk score (160) - Mandatory challenge required',
    outcome: { authSuccess: true, friction: 'challenge', fraudPrevented: true }
  },
  {
    id: 'recurring_exemption',
    name: 'Recurring Payment Exemption',
    transaction: { amount: 100, currency: 'USD', cardNetwork: 'visa', cardType: 'credit', country: 'USA', isRecurring: true, merchantRiskProfile: 'low' },
    riskFactors: { amountRisk: 15, geoRisk: 5, deviceRisk: 10, behaviorRisk: 5, merchantRisk: 10 },
    totalRiskScore: 45,
    decision: 'skip',
    reason: 'Recurring payment with established credential - 3DS exempted',
    outcome: { authSuccess: true, friction: 'none', fraudPrevented: false }
  },
  {
    id: 'challenge_failure',
    name: 'Challenge Authentication Failure',
    transaction: { amount: 800, currency: 'USD', cardNetwork: 'mastercard', cardType: 'credit', country: 'Russia', isRecurring: false, merchantRiskProfile: 'high' },
    riskFactors: { amountRisk: 35, geoRisk: 30, deviceRisk: 25, behaviorRisk: 30, merchantRisk: 40 },
    totalRiskScore: 160,
    decision: 'challenge',
    reason: 'High risk geography and amount - Challenge required',
    outcome: { authSuccess: false, friction: 'challenge', fraudPrevented: true, failureReason: 'Customer failed authentication' }
  },
];

const RiskScoreBar = ({ score, maxScore = 200 }) => {
  const percentage = (score / maxScore) * 100;
  let colorClass = 'bg-green-500';
  if (score >= 100) colorClass = 'bg-amber-500';
  if (score >= 150) colorClass = 'bg-red-500';
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span className="font-medium">Risk Score</span>
        <span className="font-bold text-gray-900">{score}/200</span>
      </div>
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} transition-all duration-1000`} style={{ width: `${percentage}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>Safe (0)</span>
        <span className="font-medium text-gray-500">Threshold: 100</span>
        <span>High Risk (200)</span>
      </div>
    </div>
  );
};

const RiskFactorRow = ({ name, score }) => {
  const percentage = (score / 50) * 100;
  return (
    <div className="flex items-center gap-4 py-2">
      <span className="text-sm text-gray-600 w-40">{name}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${score > 30 ? 'bg-amber-500' : 'bg-primary'} transition-all duration-700`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-8 text-right">{score}</span>
    </div>
  );
};

const DecisionBadge = ({ decision }) => {
  const styles = {
    skip: 'bg-green-100 text-green-700 border-green-300',
    challenge: 'bg-amber-100 text-amber-700 border-amber-300',
    block: 'bg-red-100 text-red-700 border-red-300',
  };
  const labels = { skip: 'Skip 3DS', challenge: 'Challenge Required', block: 'Block Transaction' };
  return (
    <span className={`px-4 py-2 text-base font-bold rounded-full border-2 ${styles[decision]}`}>
      {labels[decision]}
    </span>
  );
};

const StepCard = ({ stepNumber, title, icon: Icon, isActive, children }) => (
  <div className={`rounded-xl border-2 p-6 transition-all duration-500 ${isActive ? 'border-primary shadow-lg bg-white' : 'border-gray-200 bg-gray-50'}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Step {stepNumber}</span>
        <h3 className={`text-lg font-bold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{title}</h3>
      </div>
    </div>
    {isActive && <div className="mt-4">{children}</div>}
  </div>
);

const ThreeDSDecisionManager = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [showScenario, setShowScenario] = useState(false);
  
  const currentScenario = scenarios[currentScenarioIndex];
  
  const runSimulation = async () => {
    if (currentStep === 3) {
      setCurrentScenarioIndex((prev) => (prev + 1) % scenarios.length);
      setCurrentStep(0);
      setShowScenario(false);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    setIsRunning(true);
    setCurrentStep(0);
    setShowScenario(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCurrentStep(1);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCurrentStep(2);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCurrentStep(3);
    setIsRunning(false);
  };
  
  const reset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setShowScenario(false);
  };
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-primary-50 rounded-xl border border-primary-light p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Transaction</span>
            <div className="flex items-center gap-6 bg-white rounded-lg px-6 py-3 border border-primary-light shadow-sm">
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase mb-1">Amount</p>
                <p className="font-bold text-gray-900 text-lg">${currentScenario.transaction.amount} <span className="text-sm font-normal text-gray-500">{currentScenario.transaction.currency}</span></p>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase mb-1">Card</p>
                <p className="font-bold text-gray-900 text-lg uppercase">{currentScenario.transaction.cardNetwork}</p>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase mb-1">Country</p>
                <p className="font-bold text-gray-900 text-lg">{currentScenario.transaction.country}</p>
              </div>
              {currentScenario.transaction.isRecurring && (
                <>
                  <div className="h-10 w-px bg-gray-200" />
                  <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase mb-1">Type</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white">
                      Recurring
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isRunning ? (
              <button onClick={runSimulation} className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors shadow-sm">
                <Play className="w-5 h-5" />
                Run Simulation ({currentScenarioIndex + 1}/{scenarios.length})
              </button>
            ) : (
              <div className="flex items-center gap-2 text-gray-600 px-4 py-3 bg-gray-100 rounded-lg">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <span className="font-medium">Analyzing Step {currentStep}/3...</span>
              </div>
            )}
            <button onClick={reset} className="flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {showScenario ? (
        <div className="space-y-6">
          {/* Step 1: Risk Assessment */}
          <StepCard stepNumber={1} title="Risk Assessment" icon={Shield} isActive={currentStep >= 1}>
            <div className="space-y-6">
              <RiskScoreBar score={currentScenario.totalRiskScore} />
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Risk Factor Breakdown</h4>
                <div className="space-y-1">
                  <RiskFactorRow name="Transaction Amount" score={currentScenario.riskFactors.amountRisk} />
                  <RiskFactorRow name="Geographic Risk" score={currentScenario.riskFactors.geoRisk} />
                  <RiskFactorRow name="Device Risk" score={currentScenario.riskFactors.deviceRisk} />
                  <RiskFactorRow name="Behavioral Risk" score={currentScenario.riskFactors.behaviorRisk} />
                  <RiskFactorRow name="Merchant Profile" score={currentScenario.riskFactors.merchantRisk} />
                </div>
              </div>
            </div>
          </StepCard>
          
          {/* Step 2: 3DS Decision */}
          <StepCard stepNumber={2} title="3DS Authentication Decision" icon={ShieldAlert} isActive={currentStep >= 2}>
            <div className="space-y-6">
              <div className="flex items-center justify-center py-4">
                <DecisionBadge decision={currentScenario.decision} />
              </div>
              <div className="bg-gray-50 rounded-xl p-5">
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Decision Logic: </span>
                  {currentScenario.reason}
                </p>
              </div>
              {currentScenario.transaction.isRecurring && currentScenario.decision === 'skip' && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Recurring payment exemption applied (TRA - Transaction Risk Analysis)</span>
                  </div>
                </div>
              )}
            </div>
          </StepCard>
          
          {/* Step 3: Transaction Outcome */}
          <StepCard stepNumber={3} title="Transaction Outcome" icon={ShieldCheck} isActive={currentStep >= 3}>
            <div className="grid grid-cols-2 gap-6">
              {/* Transaction Result */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Payment Result</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {currentScenario.outcome.authSuccess ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                    <span className="text-gray-900 font-medium">
                      {currentScenario.outcome.authSuccess ? 'Payment Successful' : 'Payment Failed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {currentScenario.outcome.friction === 'none' ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-amber-500" />
                    )}
                    <span className="text-gray-700">
                      {currentScenario.outcome.friction === 'none' ? 'No customer friction' : '3DS Challenge completed'}
                    </span>
                  </div>
                  {currentScenario.outcome.fraudPrevented && (
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-primary" />
                      <span className="text-primary font-medium">Fraud prevented</span>
                    </div>
                  )}
                  {currentScenario.outcome.failureReason && (
                    <div className="mt-3 p-3 bg-red-100 rounded-lg">
                      <p className="text-red-700 text-sm font-medium">{currentScenario.outcome.failureReason}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Impact Analysis */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Impact Analysis</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Customer Friction</span>
                    <span className={`font-semibold ${currentScenario.outcome.friction === 'none' ? 'text-green-600' : 'text-amber-600'}`}>
                      {currentScenario.outcome.friction === 'none' ? 'Low' : 'Medium'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Fraud Prevention</span>
                    <span className={`font-semibold ${currentScenario.outcome.fraudPrevented ? 'text-green-600' : 'text-gray-500'}`}>
                      {currentScenario.outcome.fraudPrevented ? 'Active' : 'Standard'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Conversion Impact</span>
                    <span className={`font-semibold ${currentScenario.decision === 'skip' ? 'text-green-600' : 'text-amber-600'}`}>
                      {currentScenario.decision === 'skip' ? 'Optimized' : 'Slight Reduction'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Liability Shift</span>
                    <span className={`font-semibold ${currentScenario.decision === 'challenge' && currentScenario.outcome.authSuccess ? 'text-green-600' : 'text-gray-500'}`}>
                      {currentScenario.decision === 'challenge' && currentScenario.outcome.authSuccess ? 'Yes (3DS)' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </StepCard>
          
          {/* Final Status */}
          {currentStep === 3 && (
            <div className={`rounded-xl p-6 text-center ${currentScenario.outcome.authSuccess ? 'bg-green-50 border-2 border-green-400' : 'bg-red-50 border-2 border-red-400'}`}>
              <div className="flex items-center justify-center gap-4">
                {currentScenario.outcome.authSuccess ? (
                  <CheckCircle className="w-10 h-10 text-green-500" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-500" />
                )}
                <div className="text-left">
                  <p className={`text-xl font-bold ${currentScenario.outcome.authSuccess ? 'text-green-800' : 'text-red-800'}`}>
                    {currentScenario.outcome.authSuccess ? 'Transaction Complete' : 'Transaction Declined'}
                  </p>
                  <p className={`text-sm ${currentScenario.outcome.authSuccess ? 'text-green-600' : 'text-red-600'}`}>
                    {currentScenario.outcome.authSuccess 
                      ? `Payment processed${currentScenario.decision === 'challenge' ? ' with 3DS authentication' : ' without friction'}`
                      : currentScenario.outcome.failureReason
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">3DS Decision Manager</h3>
          <p className="text-gray-600 mb-1">Click "Run Simulation" to see how risk scores determine 3DS authentication decisions</p>
          <p className="text-sm text-gray-400">Scenario: {currentScenario.name}</p>
        </div>
      )}
    </div>
  );
};

export default ThreeDSDecisionManager;