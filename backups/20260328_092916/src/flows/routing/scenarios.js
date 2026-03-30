// Different routing scenarios to demonstrate the flow

export const routingScenarios = [
  {
    id: 'standard_routing',
    name: 'Standard Routing',
    description: 'A typical transaction routing through all 3 steps',
    transaction: {
      amount: 200,
      currency: 'USD',
      cardNetwork: 'mastercard',
      cardNumber: '****8240',
      riskScore: 35,
      riskLevel: 'Low',
      country: 'USA',
    },
    steps: [
      {
        step: 1,
        name: 'Eligibility Analysis',
        description: 'Shortlisted eligible PSP from pre-configured list of PSPs',
        psps: [
          { id: 'psp1', name: 'PSP 1', shortName: 'P1', status: 'eligible', reason: 'Supports Mastercard & USD' },
          { id: 'psp2', name: 'PSP 2', shortName: 'P2', status: 'eligible', reason: 'Supports Mastercard & USD' },
          { id: 'psp3', name: 'PSP 3', shortName: 'P3', status: 'not_eligible', reason: 'Amount exceeds $150 limit for new merchants' },
          { id: 'psp4', name: 'PSP 4', shortName: 'P4', status: 'not_eligible', reason: 'Does not support USD currency' },
        ],
      },
      {
        step: 2,
        name: 'Rule-based Routing',
        description: 'Selected PSP 1 as the optimal processor through pre-configured rules',
        selectedPsp: { id: 'psp1', name: 'PSP 1', shortName: 'P1' },
        appliedRules: [
          { name: 'Amount Tier', condition: '$200 falls in preferred tier for PSP 1' },
          { name: 'Merchant Config', condition: 'PSP 1 has lowest cost for this volume' },
        ],
        fallbackPsps: [
          { id: 'psp2', name: 'PSP 2', shortName: 'P2', label: 'Fallback processor' },
        ],
      },
      {
        step: 3,
        name: 'Intelligent Routing',
        description: 'PSP 2 selected due to temporary downtime with PSP 1',
        originalPsp: { id: 'psp1', name: 'PSP 1', shortName: 'P1', issue: 'Temporary downtime' },
        finalPsp: { id: 'psp2', name: 'PSP 2', shortName: 'P2', label: 'Optimal processor' },
        overrideReason: 'Auth rate dropped below 80% threshold',
      },
    ],
    result: {
      success: true,
      message: 'Payment completed with PSP 2',
    },
  },
  {
    id: 'high_risk_routing',
    name: 'High-Risk Transaction',
    description: 'How high-risk transactions are routed to high-auth-rate PSPs',
    transaction: {
      amount: 5000,
      currency: 'USD',
      cardNetwork: 'visa',
      cardNumber: '****4521',
      riskScore: 85,
      riskLevel: 'High',
      country: 'USA',
    },
    steps: [
      {
        step: 1,
        name: 'Eligibility Analysis',
        description: 'High-risk transactions filter to PSPs with better fraud protection',
        psps: [
          { id: 'psp1', name: 'PSP 1', shortName: 'P1', status: 'eligible', reason: 'Supports high-risk transactions' },
          { id: 'psp2', name: 'PSP 2', shortName: 'P2', status: 'not_eligible', reason: 'Max amount limit: $2,500' },
          { id: 'psp3', name: 'PSP 3', shortName: 'P3', status: 'eligible', reason: 'Best auth rate for high-risk' },
          { id: 'psp4', name: 'PSP 4', shortName: 'P4', status: 'not_eligible', reason: 'Does not support high-risk scores >70' },
        ],
      },
      {
        step: 2,
        name: 'Risk-Based Routing',
        description: 'Selected PSP 3 due to highest auth rate for high-risk transactions',
        selectedPsp: { id: 'psp3', name: 'PSP 3', shortName: 'P3' },
        appliedRules: [
          { name: 'Risk Score', condition: 'Score 85 > 70 → Route to high-auth PSP' },
          { name: 'Auth Rate', condition: 'PSP 3 has 95% auth rate vs PSP 1 at 92%' },
        ],
        fallbackPsps: [
          { id: 'psp1', name: 'PSP 1', shortName: 'P1', label: 'Fallback processor' },
        ],
      },
      {
        step: 3,
        name: 'Real-time Validation',
        description: 'PSP 3 confirmed - no override needed',
        originalPsp: { id: 'psp3', name: 'PSP 3', shortName: 'P3' },
        finalPsp: { id: 'psp3', name: 'PSP 3', shortName: 'P3', label: 'Optimal processor' },
        overrideReason: null,
      },
    ],
    result: {
      success: true,
      message: 'Payment completed with PSP 3',
    },
  },
  {
    id: 'cost_optimization',
    name: 'Cost Optimization',
    description: 'How the cost optimizer switches to cheaper PSPs when auth rates are similar',
    transaction: {
      amount: 50,
      currency: 'USD',
      cardNetwork: 'visa',
      cardNumber: '****1234',
      riskScore: 20,
      riskLevel: 'Low',
      country: 'USA',
    },
    steps: [
      {
        step: 1,
        name: 'Eligibility Analysis',
        description: 'Small amount transaction - all PSPs eligible',
        psps: [
          { id: 'psp1', name: 'PSP 1', shortName: 'P1', status: 'eligible', reason: 'Supports all criteria' },
          { id: 'psp2', name: 'PSP 2', shortName: 'P2', status: 'eligible', reason: 'Supports all criteria' },
          { id: 'psp3', name: 'PSP 3', shortName: 'P3', status: 'eligible', reason: 'Supports all criteria' },
          { id: 'psp4', name: 'PSP 4', shortName: 'P4', status: 'eligible', reason: 'Supports all criteria' },
        ],
      },
      {
        step: 2,
        name: 'Initial Selection',
        description: 'Rule-based routing selected PSP 1 (highest default auth rate)',
        selectedPsp: { id: 'psp1', name: 'PSP 1', shortName: 'P1' },
        appliedRules: [
          { name: 'Default Preference', condition: 'PSP 1 has highest base auth rate (92%)' },
        ],
        fallbackPsps: [
          { id: 'psp2', name: 'PSP 2', shortName: 'P2', label: 'Fallback processor' },
          { id: 'psp4', name: 'PSP 4', shortName: 'P4', label: 'Cheapest option' },
        ],
      },
      {
        step: 3,
        name: 'Cost Optimization Override',
        description: 'Switched to PSP 4 - similar auth rate but 0.5% lower cost',
        originalPsp: { id: 'psp1', name: 'PSP 1', shortName: 'P1', cost: '2.5%' },
        finalPsp: { id: 'psp4', name: 'PSP 4', shortName: 'P4', label: 'Optimal processor', cost: '2.0%' },
        overrideReason: 'Save 0.5% cost: Auth rates similar (92% vs 85%)',
        savings: '$0.25 on this transaction',
      },
    ],
    result: {
      success: true,
      message: 'Payment completed with PSP 4 (Cost optimized)',
    },
  },
  {
    id: 'volume_balancing',
    name: 'Volume Balancing',
    description: 'How volume balancer prevents PSP overload',
    transaction: {
      amount: 150,
      currency: 'EUR',
      cardNetwork: 'mastercard',
      cardNumber: '****9876',
      riskScore: 30,
      riskLevel: 'Low',
      country: 'Germany',
    },
    steps: [
      {
        step: 1,
        name: 'Eligibility Analysis',
        description: 'Filtering by currency and card network support',
        psps: [
          { id: 'psp1', name: 'PSP 1', shortName: 'P1', status: 'eligible', reason: 'Supports EUR & Mastercard' },
          { id: 'psp2', name: 'PSP 2', shortName: 'P2', status: 'not_eligible', reason: 'Does not support EUR' },
          { id: 'psp3', name: 'PSP 3', shortName: 'P3', status: 'eligible', reason: 'Supports EUR & Mastercard' },
          { id: 'psp4', name: 'PSP 4', shortName: 'P4', status: 'not_eligible', reason: 'Does not support EUR' },
        ],
      },
      {
        step: 2,
        name: 'Rule-based Routing',
        description: 'Selected PSP 1 based on standard preferences',
        selectedPsp: { id: 'psp1', name: 'PSP 1', shortName: 'P1' },
        appliedRules: [
          { name: 'Standard Rules', condition: 'PSP 1 is default for EUR transactions' },
        ],
        fallbackPsps: [
          { id: 'psp3', name: 'PSP 3', shortName: 'P3', label: 'Alternative processor' },
        ],
      },
      {
        step: 3,
        name: 'Volume Balancing Override',
        description: 'Switched to PSP 3 - PSP 1 reached 40% volume threshold',
        originalPsp: { id: 'psp1', name: 'PSP 1', shortName: 'P1', issue: '86% of traffic' },
        finalPsp: { id: 'psp3', name: 'PSP 3', shortName: 'P3', label: 'Balanced load' },
        overrideReason: 'Balance load: PSP 1 handling 86% of traffic',
      },
    ],
    result: {
      success: true,
      message: 'Payment completed with PSP 3 (Load balanced)',
    },
  },
];
