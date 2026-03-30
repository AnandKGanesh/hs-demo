import { txnOptions } from './routingConfig';

// Generate a random transaction with diverse attributes
export const generateTransaction = (index) => {
  const amount = txnOptions.amounts[Math.floor(Math.random() * txnOptions.amounts.length)];
  const cardNetwork = txnOptions.cardNetworks[Math.floor(Math.random() * txnOptions.cardNetworks.length)];
  const currency = txnOptions.currencies[Math.floor(Math.random() * txnOptions.currencies.length)];
  const riskScore = txnOptions.riskScores[Math.floor(Math.random() * txnOptions.riskScores.length)];
  
  // Generate card number based on network
  const cardPrefixes = {
    visa: ['4'],
    mastercard: ['5', '2'],
    amex: ['3'],
    discover: ['6'],
  };
  
  const prefix = cardPrefixes[cardNetwork][0];
  const cardNumber = `${prefix}${Math.random().toString().slice(2, 17)}`.slice(0, 16);
  
  return {
    id: `txn_${Date.now()}_${index}`,
    amount,
    cardNetwork,
    currency,
    riskScore,
    cardNumber: `****${cardNumber.slice(-4)}`,
    timestamp: Date.now(),
    // Derived attributes for display
    amountDisplay: amount < 100 ? `$${amount}` : `$${amount.toLocaleString()}`,
    riskLevel: riskScore > 70 ? 'High' : riskScore > 40 ? 'Medium' : 'Low',
  };
};

// Generate a batch of transactions
export const generateTransactionBatch = (count) => {
  return Array.from({ length: count }, (_, i) => generateTransaction(i));
};

// Simulate the routing decision process
export const simulateRouting = (txn, psps, rules) => {
  const steps = [];
  
  // Step 1: Eligibility Analysis
  const eligiblePsps = [...psps];
  steps.push({
    step: 1,
    name: 'Eligibility Analysis',
    description: 'Shortlisted eligible PSPs from pre-configured list',
    inputPsps: psps.map(p => ({ ...p })),
    outputPsps: eligiblePsps.map(p => ({ ...p })),
    rules: [],
  });
  
  // Step 2: Static Rule Filtering
  let filteredPsps = [...eligiblePsps];
  const activeStaticRules = rules.filter(r => r.type === 'static' && r.active);
  
  activeStaticRules.forEach(rule => {
    const beforeCount = filteredPsps.length;
    filteredPsps = rule.condition(txn, filteredPsps);
    const afterCount = filteredPsps.length;
    
    if (beforeCount !== afterCount) {
      steps[0].rules.push({
        rule: rule.name,
        removed: beforeCount - afterCount,
      });
    }
  });
  
  // Sort remaining PSPs by default preference (auth rate)
  filteredPsps.sort((a, b) => b.authRate - a.authRate);
  const selectedPsp = filteredPsps[0];
  
  steps.push({
    step: 2,
    name: 'Filtering PSPs',
    description: selectedPsp 
      ? `Selected ${selectedPsp.name} as the optimal processor through pre-configured rules`
      : 'No eligible PSPs found',
    selectedPsp: selectedPsp ? { ...selectedPsp } : null,
    availablePsps: filteredPsps.map(p => ({ ...p })),
  });
  
  // Step 3: Dynamic Override Check
  let finalPsp = selectedPsp;
  let overrideReason = null;
  let wasOverridden = false;
  
  if (selectedPsp) {
    const activeDynamicRules = rules.filter(r => r.type === 'dynamic' && r.active);
    
    for (const rule of activeDynamicRules) {
      const result = rule.check(selectedPsp, psps, { totalProcessed: 0 });
      if (result.override) {
        finalPsp = result.newPsp;
        overrideReason = result.reason;
        wasOverridden = true;
        break;
      }
    }
  }
  
  steps.push({
    step: 3,
    name: 'Ranking based on real-time data',
    description: wasOverridden
      ? `${finalPsp.name} selected due to ${overrideReason}`
      : finalPsp
      ? `${finalPsp.name} confirmed as optimal choice`
      : 'No PSP available',
    originalPsp: selectedPsp ? { ...selectedPsp } : null,
    finalPsp: finalPsp ? { ...finalPsp } : null,
    wasOverridden,
    overrideReason,
  });
  
  // Simulate success/failure
  const success = finalPsp ? Math.random() < finalPsp.currentAuthRate : false;
  
  return {
    txn,
    steps,
    selectedPsp: finalPsp,
    originalPsp: selectedPsp,
    wasOverridden,
    overrideReason,
    success,
    cost: finalPsp ? txn.amount * finalPsp.costPerTxn : 0,
    latency: finalPsp ? finalPsp.currentLatency : 0,
  };
};

// Update PSP statistics after each transaction
export const updatePspStats = (psps, pspId, success) => {
  return psps.map(psp => {
    if (psp.id === pspId) {
      const newVolume = psp.currentVolume + 1;
      const currentSuccesses = psp.currentAuthRate * psp.currentVolume;
      const newSuccesses = success ? currentSuccesses + 1 : currentSuccesses;
      const newAuthRate = newVolume > 0 ? newSuccesses / newVolume : psp.authRate;
      
      // Add some randomness to latency (simulate real-time fluctuations)
      const latencyVariance = (Math.random() - 0.5) * 100;
      const newLatency = Math.max(200, psp.avgLatency + latencyVariance);
      
      return {
        ...psp,
        currentVolume: newVolume,
        currentAuthRate: newAuthRate,
        currentLatency: Math.round(newLatency),
      };
    }
    return psp;
  });
};
