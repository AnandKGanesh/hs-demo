// Pre-configured PSPs and Routing Rules for the Intelligent Routing Simulator
// Zero configuration - everything is auto-set up

export const psps = [
  {
    id: 'psp1',
    name: 'PSP 1',
    shortName: 'P1',
    color: '#3b82f6', // blue
    authRate: 0.92,
    costPerTxn: 0.025, // 2.5%
    avgLatency: 450, // ms
    supportedNetworks: ['visa', 'mastercard', 'amex'],
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    maxAmount: 10000,
    currentVolume: 0,
    currentAuthRate: 0.92,
    currentLatency: 450,
  },
  {
    id: 'psp2',
    name: 'PSP 2',
    shortName: 'P2',
    color: '#10b981', // green
    authRate: 0.88,
    costPerTxn: 0.022, // 2.2%
    avgLatency: 380, // ms
    supportedNetworks: ['visa', 'mastercard', 'discover'],
    supportedCurrencies: ['USD', 'CAD', 'MXN'],
    maxAmount: 5000,
    currentVolume: 0,
    currentAuthRate: 0.88,
    currentLatency: 380,
  },
  {
    id: 'psp3',
    name: 'PSP 3',
    shortName: 'P3',
    color: '#f59e0b', // amber
    authRate: 0.95,
    costPerTxn: 0.028, // 2.8%
    avgLatency: 520, // ms
    supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'],
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'],
    maxAmount: 15000,
    currentVolume: 0,
    currentAuthRate: 0.95,
    currentLatency: 520,
  },
  {
    id: 'psp4',
    name: 'PSP 4',
    shortName: 'P4',
    color: '#ef4444', // red
    authRate: 0.85,
    costPerTxn: 0.020, // 2.0%
    avgLatency: 600, // ms
    supportedNetworks: ['visa', 'mastercard'],
    supportedCurrencies: ['USD'],
    maxAmount: 2500,
    currentVolume: 0,
    currentAuthRate: 0.85,
    currentLatency: 600,
  },
];

// 8 Active Rules - Mix of static and dynamic
export const routingRules = [
  {
    id: 'rule_amount_tiers',
    name: 'Amount Tier Routing',
    type: 'static',
    description: 'Route based on transaction amount',
    priority: 1,
    active: true,
    condition: (txn, psps) => {
      if (txn.amount < 100) return psps.filter(p => p.costPerTxn <= 0.022);
      if (txn.amount > 5000) return psps.filter(p => p.maxAmount >= txn.amount);
      return psps;
    },
  },
  {
    id: 'rule_card_network',
    name: 'Card Network Filter',
    type: 'static',
    description: 'Filter by supported card network',
    priority: 2,
    active: true,
    condition: (txn, psps) => {
      return psps.filter(p => p.supportedNetworks.includes(txn.cardNetwork));
    },
  },
  {
    id: 'rule_currency',
    name: 'Currency Support',
    type: 'static',
    description: 'Filter by supported currency',
    priority: 3,
    active: true,
    condition: (txn, psps) => {
      return psps.filter(p => p.supportedCurrencies.includes(txn.currency));
    },
  },
  {
    id: 'rule_risk_score',
    name: 'Risk-Based Routing',
    type: 'static',
    description: 'High-risk txns to high-auth-rate PSPs',
    priority: 4,
    active: true,
    condition: (txn, psps) => {
      if (txn.riskScore > 70) {
        return psps.filter(p => p.authRate >= 0.92);
      }
      return psps;
    },
  },
  {
    id: 'rule_auth_rate_monitor',
    name: 'Auth Rate Monitor',
    type: 'dynamic',
    description: 'Override if PSP auth rate drops below threshold',
    priority: 5,
    active: true,
    threshold: 0.80,
    check: (selectedPsp, allPsps) => {
      if (selectedPsp.currentAuthRate < 0.80) {
        const betterPsp = allPsps
          .filter(p => p.currentAuthRate >= 0.85)
          .sort((a, b) => b.currentAuthRate - a.currentAuthRate)[0];
        if (betterPsp && betterPsp.id !== selectedPsp.id) {
          return {
            override: true,
            newPsp: betterPsp,
            reason: `Auth rate dropped to ${(selectedPsp.currentAuthRate * 100).toFixed(1)}%`,
          };
        }
      }
      return { override: false };
    },
  },
  {
    id: 'rule_latency_monitor',
    name: 'Latency Monitor',
    type: 'dynamic',
    description: 'Override if PSP latency exceeds threshold',
    priority: 6,
    active: true,
    threshold: 800,
    check: (selectedPsp, allPsps) => {
      if (selectedPsp.currentLatency > 800) {
        const fasterPsp = allPsps
          .filter(p => p.currentLatency <= 600)
          .sort((a, b) => a.currentLatency - b.currentLatency)[0];
        if (fasterPsp && fasterPsp.id !== selectedPsp.id) {
          return {
            override: true,
            newPsp: fasterPsp,
            reason: `High latency: ${selectedPsp.currentLatency}ms`,
          };
        }
      }
      return { override: false };
    },
  },
  {
    id: 'rule_cost_optimizer',
    name: 'Cost Optimizer',
    type: 'dynamic',
    description: 'Switch to lower cost PSP if auth rates are similar',
    priority: 7,
    active: true,
    check: (selectedPsp, allPsps) => {
      const cheaperPsps = allPsps.filter(p => 
        p.costPerTxn < selectedPsp.costPerTxn && 
        p.currentAuthRate >= selectedPsp.currentAuthRate - 0.05
      );
      if (cheaperPsps.length > 0) {
        const cheapest = cheaperPsps.sort((a, b) => a.costPerTxn - b.costPerTxn)[0];
        return {
          override: true,
          newPsp: cheapest,
          reason: `Save ${((selectedPsp.costPerTxn - cheapest.costPerTxn) * 100).toFixed(1)}% cost`,
        };
      }
      return { override: false };
    },
  },
  {
    id: 'rule_volume_balancer',
    name: 'Volume Balancer',
    type: 'dynamic',
    description: 'Balance volume across PSPs',
    priority: 8,
    active: true,
    check: (selectedPsp, allPsps, stats) => {
      const totalVolume = stats.totalProcessed;
      if (totalVolume > 100) {
        const pspShare = (selectedPsp.currentVolume / totalVolume) * 100;
        if (pspShare > 40) {
          const underutilized = allPsps
            .filter(p => (p.currentVolume / totalVolume) * 100 < 25)
            .sort((a, b) => a.currentVolume - b.currentVolume)[0];
          if (underutilized && underutilized.id !== selectedPsp.id) {
            return {
              override: true,
              newPsp: underutilized,
              reason: `Balance load: ${pspShare.toFixed(0)}% on ${selectedPsp.shortName}`,
            };
          }
        }
      }
      return { override: false };
    },
  },
];

// Transaction attribute options for generation
export const txnOptions = {
  amounts: [25, 50, 100, 250, 500, 1000, 2500, 5000, 7500, 10000, 15000],
  cardNetworks: ['visa', 'mastercard', 'amex', 'discover'],
  currencies: ['USD', 'EUR', 'GBP', 'CAD', 'MXN'],
  riskScores: [10, 25, 35, 50, 65, 75, 85, 95],
};

// Initial stats
export const initialStats = {
  totalProcessed: 0,
  totalTarget: 10000,
  successful: 0,
  failed: 0,
  overrides: 0,
  totalCost: 0,
  avgAuthRate: 0,
  pspDistribution: {
    psp1: 0,
    psp2: 0,
    psp3: 0,
    psp4: 0,
  },
  recentOverrides: [],
};
