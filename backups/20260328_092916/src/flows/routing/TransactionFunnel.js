import React from 'react';
import { CheckCircle, XCircle, ArrowRight, Zap, Filter, TrendingUp } from 'lucide-react';

// PSP Avatar with Juspay Blue
const PspAvatar = ({ psp, size = 'md', isSelected, isEliminated }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
  };
  
  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
        isEliminated 
          ? 'bg-gray-300 text-gray-500' 
          : isSelected 
          ? 'bg-[#0066FF] text-white ring-4 ring-[#E6F0FF]' 
          : 'bg-[#0066FF] text-white'
      }`}
    >
      {psp?.shortName || '?'}
    </div>
  );
};

// Status Badge with Juspay colors
const StatusBadge = ({ status, text }) => {
  const styles = {
    eligible: 'bg-[#E6F0FF] text-[#0066FF] border-[#0066FF]',
    selected: 'bg-[#0066FF] text-white border-[#0066FF]',
    notEligible: 'bg-gray-100 text-gray-400 border-gray-300',
    rejected: 'bg-red-50 text-red-600 border-red-300',
  };
  
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${styles[status] || styles.notEligible}`}>
      {text}
    </span>
  );
};

// Transaction Details Card
const TransactionCard = ({ txn }) => {
  const networkIcons = {
    visa: 'VISA',
    mastercard: 'MC',
    amex: 'AMEX',
    discover: 'DISC',
  };
  
  return (
    <div className="bg-white rounded-xl border-2 border-[#E6F0FF] p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-8 bg-gradient-to-r from-[#0066FF] to-[#3385FF] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {networkIcons[txn.cardNetwork] || txn.cardNetwork.toUpperCase().slice(0, 4)}
            </span>
          </div>
          <div>
            <span className="font-bold text-gray-900 text-lg block">{txn.cardNumber}</span>
            <span className="text-xs text-gray-500">Card Number</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-[#0066FF] block">{txn.amountDisplay}</span>
          <span className="text-xs text-gray-500">Amount</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Network</p>
          <p className="font-semibold text-gray-900 text-sm">{txn.cardNetwork.toUpperCase()}</p>
        </div>
        <div className="text-center border-l border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Currency</p>
          <p className="font-semibold text-gray-900 text-sm">{txn.currency}</p>
        </div>
        <div className="text-center border-l border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Risk Level</p>
          <p className={`font-semibold text-sm ${
            txn.riskLevel === 'High' ? 'text-red-600' : 
            txn.riskLevel === 'Medium' ? 'text-amber-600' : 
            'text-green-600'
          }`}>
            {txn.riskLevel}
          </p>
        </div>
        <div className="text-center border-l border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Risk Score</p>
          <p className="font-semibold text-gray-900 text-sm">{txn.riskScore}/100</p>
        </div>
      </div>
    </div>
  );
};

// Step 1: Eligibility Analysis
const Step1Eligibility = ({ data, psps }) => {
  return (
    <div className="bg-[#E6F0FF] rounded-2xl border-2 border-[#0066FF] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#0066FF] flex items-center justify-center shadow-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-[#0066FF]">Step 1: Eligibility Analysis</h4>
          <p className="text-sm text-gray-700">Checking which PSPs support this transaction</p>
        </div>
      </div>
      
      <TransactionCard txn={data.txn} />
      
      <div className="bg-white rounded-xl border border-[#E6F0FF] p-4">
        <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Eligibility Check Results</p>
        <div className="space-y-2">
          {data.outputPsps.map((psp) => (
            <div 
              key={psp.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-[#E6F0FF] border border-[#0066FF]"
            >
              <div className="flex items-center gap-3">
                <PspAvatar psp={psp} size="sm" isSelected={true} />
                <div>
                  <p className="font-bold text-gray-900">{psp.name}</p>
                  <p className="text-xs text-[#0066FF]">✓ Supports all transaction criteria</p>
                </div>
              </div>
              <StatusBadge status="eligible" text="Eligible" />
            </div>
          ))}
          {psps.filter(p => !data.outputPsps.some(op => op.id === p.id)).map((psp) => (
            <div 
              key={psp.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 opacity-60"
            >
              <div className="flex items-center gap-3">
                <PspAvatar psp={psp} size="sm" isEliminated={true} />
                <div>
                  <p className="font-bold text-gray-500 line-through">{psp.name}</p>
                  <p className="text-xs text-gray-400">✗ Does not meet criteria</p>
                </div>
              </div>
              <StatusBadge status="notEligible" text="Not Eligible" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-white rounded-lg border border-[#E6F0FF]">
        <p className="text-sm text-gray-700">
          <span className="font-bold text-[#0066FF]">Result:</span> {data.outputPsps.length} of {psps.length} PSPs are eligible for this transaction
        </p>
      </div>
    </div>
  );
};

// Step 2: Filtering PSPs (Rule-based Routing)
const Step2Filtering = ({ data }) => {
  return (
    <div className="bg-[#E6F0FF] rounded-2xl border-2 border-[#0066FF] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#0066FF] flex items-center justify-center shadow-lg">
          <Filter className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-[#0066FF]">Step 2: Rule-Based Routing</h4>
          <p className="text-sm text-gray-700">Applying merchant-configured rules to select optimal PSP</p>
        </div>
      </div>
      
      {/* Selected PSP - Highlighted */}
      {data.selectedPsp && (
        <div className="bg-white rounded-xl p-5 border-2 border-[#0066FF] shadow-md mb-4">
          <div className="flex items-center gap-4">
            <PspAvatar psp={data.selectedPsp} size="lg" isSelected={true} />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h5 className="text-xl font-bold text-gray-900">{data.selectedPsp.name}</h5>
                <StatusBadge status="selected" text="Selected by Rules" />
              </div>
              <p className="text-sm text-gray-600">Optimal processor based on merchant configuration</p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#0066FF]">{(data.selectedPsp.authRate * 100).toFixed(0)}%</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Auth Rate</p>
            </div>
            <div className="text-center border-l border-gray-200">
              <p className="text-2xl font-bold text-[#0066FF]">{(data.selectedPsp.costPerTxn * 100).toFixed(1)}%</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Cost</p>
            </div>
            <div className="text-center border-l border-gray-200">
              <p className="text-2xl font-bold text-[#0066FF]">{data.selectedPsp.avgLatency}ms</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Latency</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Applied Rules */}
      {data.rules && data.rules.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-[#E6F0FF] mb-4">
          <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Applied Rules</p>
          <div className="space-y-2">
            {data.rules.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-[#E6F0FF] rounded-lg">
                <div className="w-6 h-6 rounded-full bg-[#0066FF] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{rule.rule}</p>
                  <p className="text-xs text-gray-600">{rule.condition}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Fallback Options */}
      {data.availablePsps && data.availablePsps.length > 1 && (
        <div className="bg-white rounded-xl p-4 border border-[#E6F0FF]">
          <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Fallback Options (if needed)</p>
          <div className="flex gap-4">
            {data.availablePsps
              .filter(p => p.id !== data.selectedPsp?.id)
              .map((psp) => (
                <div key={psp.id} className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                  <PspAvatar psp={psp} size="sm" />
                  <span className="text-xs font-medium text-gray-600 mt-1">{psp.name}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Step 3: Dynamic Override
const Step3DynamicOverride = ({ data }) => {
  return (
    <div className="bg-[#E6F0FF] rounded-2xl border-2 border-[#0066FF] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#0066FF] flex items-center justify-center shadow-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-[#0066FF]">Step 3: Real-Time Override Check</h4>
          <p className="text-sm text-gray-700">Monitoring live PSP performance and applying dynamic rules</p>
        </div>
      </div>
      
      {data.wasOverridden ? (
        <div className="space-y-4">
          {/* Override Alert */}
          <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-amber-800">Dynamic Override Triggered</p>
                <p className="text-sm text-amber-700">{data.overrideReason}</p>
              </div>
            </div>
          </div>

          {/* Before/After Comparison */}
          <div className="bg-white rounded-xl p-5 border border-[#E6F0FF]">
            <p className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide text-center">Route Change</p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <PspAvatar psp={data.originalPsp} size="md" isEliminated={true} />
                <p className="font-semibold text-gray-500 mt-2 line-through">{data.originalPsp?.name}</p>
                <p className="text-xs text-red-500">Original Choice</p>
              </div>
              
              <div className="flex flex-col items-center">
                <ArrowRight className="w-8 h-8 text-[#0066FF]" />
                <span className="text-xs font-bold text-[#0066FF] mt-1">OVERRIDE</span>
              </div>
              
              <div className="text-center">
                <PspAvatar psp={data.finalPsp} size="lg" isSelected={true} />
                <p className="font-bold text-gray-900 mt-2">{data.finalPsp?.name}</p>
                <p className="text-xs text-green-600 font-medium">✓ Final Selection</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No Override Scenario */
        <div className="bg-green-50 rounded-xl p-5 border-2 border-green-400">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-green-800 text-lg">No Override Needed</p>
              <p className="text-sm text-green-700">Rule-based selection confirmed as optimal</p>
            </div>
          </div>
          
          {data.finalPsp && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="flex items-center gap-3">
                <PspAvatar psp={data.finalPsp} size="md" isSelected={true} />
                <div>
                  <p className="font-bold text-gray-900">{data.finalPsp.name}</p>
                  <p className="text-sm text-green-600">✓ All performance metrics optimal</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main Transaction Funnel Component
const TransactionFunnel = ({ currentTxn, psps }) => {
  if (!currentTxn) {
    return (
      <div className="bg-[#E6F0FF] border-2 border-dashed border-[#0066FF] rounded-2xl p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-[#0066FF] flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-[#0066FF] mb-2">Ready to Route Transactions</h3>
        <p className="text-gray-600">Click "Run Simulation" to see how transactions flow through the routing engine</p>
      </div>
    );
  }
  
  const { txn, steps, selectedPsp, originalPsp, finalPsp, wasOverridden, overrideReason } = currentTxn;
  
  return (
    <div className="space-y-6">
      {/* Step 1 */}
      <Step1Eligibility 
        data={{ txn, outputPsps: steps[0].outputPsps }} 
        psps={psps} 
      />
      
      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-full bg-[#0066FF] flex items-center justify-center shadow-lg">
          <ArrowRight className="w-6 h-6 text-white rotate-90" />
        </div>
      </div>
      
      {/* Step 2 */}
      <Step2Filtering 
        data={steps[1]} 
      />
      
      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-full bg-[#0066FF] flex items-center justify-center shadow-lg">
          <ArrowRight className="w-6 h-6 text-white rotate-90" />
        </div>
      </div>
      
      {/* Step 3 */}
      <Step3DynamicOverride 
        data={{ 
          originalPsp, 
          finalPsp, 
          wasOverridden, 
          overrideReason 
        }} 
      />
      
      {/* Final Result */}
      <div className={`rounded-2xl p-6 text-center border-2 ${
        currentTxn.success 
          ? 'bg-green-50 border-green-400' 
          : 'bg-red-50 border-red-400'
      }`}>
        <div className="flex items-center justify-center gap-3 mb-3">
          {currentTxn.success ? (
            <>
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-green-800">Payment Successful</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-red-800">Payment Failed</span>
            </>
          )}
        </div>
        {finalPsp && (
          <p className="text-gray-700">
            Processed via <span className="font-bold text-[#0066FF]">{finalPsp.name}</span> • 
            Cost: <span className="font-bold">${currentTxn.cost.toFixed(2)}</span> • 
            Latency: <span className="font-bold">{currentTxn.latency}ms</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default TransactionFunnel;
