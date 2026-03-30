import React, { useState } from 'react';
import { Play, RotateCcw, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const scenarios = [
  {
    id: 'auth_rate_down',
    name: 'Auth Rate Based (PSP Down)',
    transaction: { amount: 300, currency: 'USD', cardNetwork: 'visa', cardType: 'credit', country: 'USA' },
    step1: {
      allPsps: ['PSP-A', 'PSP-B', 'PSP-C', 'PSP-D'],
      eliminated: ['PSP-B'],
      eliminationReason: { 
        'PSP-B': 'Debit cards only - credit card used'
      },
      eligible: ['PSP-A', 'PSP-C', 'PSP-D'],
    },
    step2: {
      selected: 'PSP-A',
      fallback: ['PSP-C', 'PSP-D'],
      rule: { condition: 'scheme: visa', operator: 'and', amount: 'amount: 200-500', action: 'select: PSP-A (default)' },
    },
    step3: { final: 'PSP-C', overridden: true, reason: 'PSP-A auth rate dropped to 72%', original: 'PSP-A' },
  },
  {
    id: 'debit_routing',
    name: 'Cost Optimization by Debit Routing',
    transaction: { amount: 50, currency: 'USD', cardNetwork: 'visa', cardType: 'debit', country: 'USA' },
    step1: {
      allPsps: ['PSP-A', 'PSP-B', 'PSP-C', 'PSP-D'],
      eliminated: ['PSP-C'],
      eliminationReason: { 
        'PSP-C': 'Visa credit cards only - debit card used'
      },
      eligible: ['PSP-A', 'PSP-B', 'PSP-D'],
    },
    step2: {
      selected: 'PSP-A',
      fallback: ['PSP-B', 'PSP-D'],
      rule: { condition: 'scheme: visa', operator: 'and', amount: 'amount: < 100', action: 'select: PSP-A (default)' },
    },
    step3: { final: 'PSP-B', overridden: true, reason: 'Debit routing: Lower fees on PSP-B', original: 'PSP-A' },
  },
  {
    id: 'psp_downtime',
    name: 'PSP Downtime',
    transaction: { amount: 500, currency: 'USD', cardNetwork: 'mastercard', cardType: 'credit', country: 'USA' },
    step1: {
      allPsps: ['PSP-A', 'PSP-B', 'PSP-C', 'PSP-D'],
      eliminated: ['PSP-B', 'PSP-C'],
      eliminationReason: { 
        'PSP-B': 'Debit cards only - credit card used',
        'PSP-C': 'Visa cards only - Mastercard used'
      },
      eligible: ['PSP-A', 'PSP-D'],
    },
    step2: {
      selected: 'PSP-A',
      fallback: ['PSP-D'],
      rule: { condition: 'scheme: mastercard', operator: 'and', amount: 'amount: 200-500', action: 'select: PSP-A (default)' },
    },
    step3: { final: 'PSP-D', overridden: true, reason: 'PSP-A experiencing temporary downtime', original: 'PSP-A' },
  },
  {
    id: 'standard',
    name: 'Standard Routing',
    transaction: { amount: 200, currency: 'USD', cardNetwork: 'mastercard', cardType: 'credit', country: 'USA' },
    step1: {
      allPsps: ['PSP-A', 'PSP-B', 'PSP-C', 'PSP-D'],
      eliminated: ['PSP-B', 'PSP-C'],
      eliminationReason: { 
        'PSP-B': 'Debit cards only - credit card used',
        'PSP-C': 'Visa cards only - Mastercard used'
      },
      eligible: ['PSP-A', 'PSP-D'],
    },
    step2: {
      selected: 'PSP-A',
      fallback: ['PSP-D'],
      rule: { condition: 'scheme: mastercard', operator: 'and', amount: 'amount: > 100', action: 'select: PSP-A' },
    },
    step3: { final: 'PSP-A', overridden: false, reason: null, original: 'PSP-A' },
  },
  {
    id: 'international',
    name: 'International Payment',
    transaction: { amount: 150, currency: 'EUR', cardNetwork: 'mastercard', cardType: 'credit', country: 'Germany' },
    step1: {
      allPsps: ['PSP-A', 'PSP-B', 'PSP-C', 'PSP-D'],
      eliminated: ['PSP-B', 'PSP-C'],
      eliminationReason: { 
        'PSP-B': 'Debit cards only - credit card used',
        'PSP-C': 'USD and Visa only - EUR and Mastercard used'
      },
      eligible: ['PSP-A', 'PSP-D'],
    },
    step2: {
      selected: 'PSP-A',
      fallback: ['PSP-D'],
      rule: { condition: 'currency: EUR', operator: 'and', amount: 'network: mastercard', action: 'select: PSP-A (default)' },
    },
    step3: { final: 'PSP-A', overridden: false, reason: null, original: 'PSP-A' },
  },
];

const pspConfig = {
  'PSP-A': { color: 'bg-blue-500', description: 'All Cards, All currencies' },
  'PSP-B': { color: 'bg-green-500', description: 'Debit cards, All currencies' },
  'PSP-C': { color: 'bg-amber-500', description: 'Visa Cards, USD' },
  'PSP-D': { color: 'bg-red-500', description: 'All Cards, APMs, All currencies' },
};

const routingCategories = [
  { name: 'Volume Based Routing', type: 'Static', description: 'Distribute traffic evenly' },
  { name: 'Rule Based Routing', type: 'Static', description: 'Custom merchant rules' },
  { name: 'Default Fallback Routing', type: 'Static', description: 'Backup processors' },
  { name: 'Auth rate based Routing', type: 'Dynamic', description: 'Live success rates' },
  { name: 'Least cost Routing', type: 'Dynamic', description: 'Optimize fees' },
];

const StatusBadge = ({ status, text }) => {
  const styles = {
    eligible: 'bg-green-100 text-green-700 border-green-300',
    selected: 'bg-primary text-white border-primary',
    fallback: 'bg-gray-100 text-gray-600 border-gray-300',
    notEligible: 'bg-gray-200 text-gray-400 border-gray-300 line-through',
  };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded border ${styles[status] || styles.eligible}`}>{text}</span>;
};

const PspAvatar = ({ psp, size = 'md', status = 'normal' }) => {
  const sizeClasses = { sm: 'w-10 h-10 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-14 h-14 text-base' };
  const statusStyles = {
    normal: pspConfig[psp]?.color || 'bg-gray-400',
    eliminated: 'bg-gray-300',
    selected: `${pspConfig[psp]?.color || 'bg-gray-400'} ring-4 ring-primary-light`,
  };
  const letter = psp.replace('PSP-', '');
  return (
    <div className={`${sizeClasses[size]} ${statusStyles[status]} rounded-full flex items-center justify-center text-white font-bold transition-all duration-500`}>
      {letter}
    </div>
  );
};

const RuleChip = ({ type, value, color = 'blue' }) => {
  const colors = {
    blue: 'bg-primary-50 text-primary border-primary-light',
    green: 'bg-green-100 text-green-700 border-green-300',
    amber: 'bg-amber-100 text-amber-700 border-amber-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
  };
  return <span className={`px-2 py-1 text-xs font-medium rounded border ${colors[color]}`}>{type}: {value}</span>;
};

const RoutingSimulator = () => {
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCurrentStep(2);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCurrentStep(3);
    setIsRunning(false);
  };
  
  const reset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setShowScenario(false);
  };
  
  const nextScenario = () => {
    setCurrentScenarioIndex((prev) => (prev + 1) % scenarios.length);
    reset();
  };
  
  return (
    <div className="flex gap-6">

      <div className="w-56 flex-shrink-0">
        <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide">Routing Types</h3>
        <div className="space-y-3">
          {routingCategories.map((cat, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800 text-sm">{cat.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${cat.type === 'Static' ? 'bg-gray-100 text-gray-600' : 'bg-primary-50 text-primary'}`}>
                  {cat.type}
                </span>
              </div>
              <p className="text-xs text-gray-500">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>
      

      <div className="flex-1 min-w-0 space-y-4">

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-xs font-bold text-gray-500 mb-3 text-center uppercase tracking-wide">Sample Merchant Configuration</h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(pspConfig).map(([psp, config]) => (
              <div key={psp} className="flex items-center gap-3">
                <PspAvatar psp={psp} size="sm" />
                <div>
                  <p className="font-semibold text-sm text-gray-800">{psp}</p>
                  <p className="text-xs text-gray-500">{config.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        

        <div className="bg-primary-50 rounded-xl border border-primary-light p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 uppercase font-medium">Transaction</span>
              <div className="flex items-center gap-4 bg-white rounded-lg px-4 py-2 border border-primary-light">
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase">Amount</p>
                  <p className="font-bold text-gray-900">${currentScenario.transaction.amount} {currentScenario.transaction.currency}</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase">Card</p>
                  <p className="font-bold text-gray-900 uppercase">{currentScenario.transaction.cardNetwork}</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase">Type</p>
                  <p className="font-bold text-gray-900 capitalize">{currentScenario.transaction.cardType}</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase">Country</p>
                  <p className="font-bold text-gray-900">{currentScenario.transaction.country}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <button
                  onClick={runSimulation}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm"
                >
                  <Play className="w-4 h-4" />
                  Run Simulation ({currentScenarioIndex + 1}/{scenarios.length})
                </button>
              ) : (
                <div className="flex items-center gap-2 text-gray-600 text-sm px-4 py-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span>Step {currentStep + 1}...</span>
                </div>
              )}
              <button onClick={reset} className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
        

        {showScenario ? (
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className={`flex-1 bg-gray-50 rounded-xl border-2 p-4 ${currentStep >= 1 ? 'border-primary shadow-md' : 'border-gray-300'}`}>
                <p className="text-xs text-gray-400 uppercase mb-3 text-center font-medium">All PSPs</p>
                <div className="flex justify-center gap-3">
                  {currentScenario.step1.allPsps.map((psp) => (
                    <div key={psp} className="flex flex-col items-center gap-1">
                      <PspAvatar psp={psp} status={currentStep >= 1 && currentScenario.step1.eliminated.includes(psp) ? 'eliminated' : 'normal'} />
                      {currentStep >= 1 && (
                        <StatusBadge status={currentScenario.step1.eliminated.includes(psp) ? 'notEligible' : 'eligible'} text={currentScenario.step1.eliminated.includes(psp) ? 'Not Eligible' : 'Eligible'} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="w-12 flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              
              <div className={`flex-1 bg-primary-50 rounded-xl border-2 p-4 ${currentStep >= 1 ? 'border-primary shadow-md' : 'border-primary-light'}`}>
                <h4 className="font-bold text-primary mb-2 text-sm">Step 1: Eligibility Analysis</h4>
                <p className="text-sm text-gray-600 mb-3">Shortlist eligible PSP from the pre-configured list</p>
                {currentStep >= 1 && (
                  <div className="space-y-1.5">
                    {currentScenario.step1.eligible.map((psp) => (
                      <div key={psp} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{psp}</span>
                        <StatusBadge status="eligible" text="Eligible" />
                      </div>
                    ))}
                    {currentScenario.step1.eliminated.map((psp) => (
                      <div key={psp} className="flex items-center gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-400 line-through">{psp}</span>
                        <span className="text-xs text-gray-400">- {currentScenario.step1.eliminationReason[psp]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center py-1">
              <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Static Routing</span>
            </div>
            
            <div className="flex gap-4">
              <div className={`flex-1 bg-gray-50 rounded-xl border-2 p-4 ${currentStep >= 2 ? 'border-primary shadow-md' : 'border-gray-300'}`}>
                <p className="text-xs text-gray-400 uppercase mb-3 text-center font-medium">Filtered PSPs</p>
                <div className="flex justify-center gap-3">
                  {currentScenario.step1.eligible.map((psp) => (
                    <div key={psp} className="flex flex-col items-center gap-1">
                      <PspAvatar psp={psp} status={currentStep >= 2 && psp === currentScenario.step2.selected ? 'selected' : 'normal'} />
                      {currentStep >= 2 && (
                        <span className={`text-xs ${psp === currentScenario.step2.selected ? 'text-primary font-medium' : 'text-gray-500'}`}>
                          {psp === currentScenario.step2.selected ? 'Selected' : 'Fallback'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="w-12 flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              
              <div className={`flex-1 bg-primary-50 rounded-xl border-2 p-4 ${currentStep >= 2 ? 'border-primary shadow-md' : 'border-primary-light'}`}>
                <h4 className="font-bold text-primary mb-2 text-sm">Step 2: Filtering PSPs</h4>
                <p className="text-sm text-gray-600 mb-3">Select {currentScenario.step2.selected} as the optimal processor</p>
                {currentStep >= 2 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase font-medium">Sample Merchant Rule</p>
                    <div className="flex flex-wrap gap-1">
                      <RuleChip type="condition" value={currentScenario.step2.rule.condition} color="blue" />
                      <RuleChip type="operator" value={currentScenario.step2.rule.operator} color="purple" />
                      <RuleChip type="amount" value={currentScenario.step2.rule.amount} color="amber" />
                      <RuleChip type="action" value={currentScenario.step2.rule.action} color="green" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center py-1">
              <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Dynamic Routing</span>
            </div>
            
            <div className="flex gap-4">
              <div className={`flex-1 bg-gray-50 rounded-xl border-2 p-4 ${currentStep >= 3 ? 'border-primary shadow-md' : 'border-gray-300'}`}>
                <p className="text-xs text-gray-400 uppercase mb-3 text-center font-medium">Final Selection</p>
                <div className="flex justify-center gap-3">
                  {currentScenario.step1.eligible.map((psp) => (
                    <div key={psp} className="flex flex-col items-center gap-1">
                      <PspAvatar 
                        psp={psp} 
                        status={currentStep >= 3 && psp === currentScenario.step3.final ? 'selected' : 
                                currentStep >= 3 && psp === currentScenario.step3.original && psp !== currentScenario.step3.final ? 'eliminated' : 'normal'}
                      />
                      {currentStep >= 3 && (
                        <span className={`text-xs ${
                          psp === currentScenario.step3.final ? 'text-green-600 font-medium' : 
                          psp === currentScenario.step3.original && psp !== currentScenario.step3.final ? 'text-red-400' : 'text-gray-500'
                        }`}>
                          {psp === currentScenario.step3.final ? 'Final' : 
                           psp === currentScenario.step3.original && psp !== currentScenario.step3.final ? 'Overridden' : 'Alternative'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="w-12 flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              
              <div className={`flex-1 bg-primary-50 rounded-xl border-2 p-4 ${currentStep >= 3 ? 'border-primary shadow-md' : 'border-primary-light'}`}>
                <h4 className="font-bold text-primary mb-2 text-sm">Step 3: Ranking on real-time data</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {currentScenario.step3.overridden 
                    ? `Select ${currentScenario.step3.final} due to ${currentScenario.step3.reason}`
                    : `${currentScenario.step3.final} confirmed - no override needed`
                  }
                </p>
                {currentStep >= 3 && currentScenario.step3.overridden && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <PspAvatar psp={currentScenario.step3.original} size="sm" status="eliminated" />
                      <ArrowRight className="w-4 h-4 text-amber-500" />
                      <PspAvatar psp={currentScenario.step3.final} size="sm" status="selected" />
                    </div>
                    <p className="text-xs text-amber-700 mt-1">Override: {currentScenario.step3.reason}</p>
                  </div>
                )}
              </div>
            </div>
            
            {currentStep === 3 && (
              <div className="bg-green-50 border-2 border-green-400 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className={`w-12 h-12 ${pspConfig[currentScenario.step3.final]?.color || 'bg-green-500'} rounded-full flex items-center justify-center text-white font-bold`}>
                    {currentScenario.step3.final.replace('PSP-', '')}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-green-800">Payment done with {currentScenario.step3.final}</p>
                    <p className="text-sm text-green-600">Transaction completed successfully</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <Play className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-gray-700 mb-1">Ready to Route Transactions</h3>
            <p className="text-sm text-gray-500 mb-1">Click &quot;Run Simulation&quot; to see how transactions flow</p>
            <p className="text-xs text-gray-400">Scenario: {currentScenario.name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutingSimulator;
