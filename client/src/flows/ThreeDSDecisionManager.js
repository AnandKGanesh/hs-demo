import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Play,
  Shield,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  CheckCircle,
  XCircle
} from 'lucide-react';

const FIELD_CATEGORIES = {
  '3DS Decision': [
    { id: 'issuer_name', label: 'issuer_name', type: 'string', info: 'Name of the card issuing bank' },
    { id: 'issuer_country', label: 'issuer_country', type: 'string', info: 'Country code of the issuer' },
    { id: 'acquirer_country', label: 'acquirer_country', type: 'string', info: 'Country code of the acquirer' },
    { id: 'customer_device_platform', label: 'customer_device_platform', type: 'enum', info: 'Device platform (Web, Android, iOS)' },
  ],
  'Payment Methods': [
    { id: 'card_network', label: 'card_network', type: 'enum', info: 'Card network (Visa, Mastercard, Amex)' },
  ],
  'Payments': [
    { id: 'amount', label: 'amount', type: 'number', info: 'Transaction amount in minor units (cents)' },
    { id: 'currency', label: 'currency', type: 'string', info: 'ISO currency code (USD, EUR, etc.)' },
  ]
};

const ALL_FIELDS = Object.entries(FIELD_CATEGORIES).flatMap(([category, fields]) =>
  fields.map(field => ({ ...field, category }))
);

const OPERATORS = {
  number: [
    { id: 'EQUAL_TO', label: 'EQUAL TO', color: 'text-red-500 dark:text-red-400' },
    { id: 'GREATER_THAN', label: 'GREATER THAN', color: 'text-red-500 dark:text-red-400' },
    { id: 'LESS_THAN', label: 'LESS THAN', color: 'text-red-500 dark:text-red-400' },
  ],
  string: [
    { id: 'IS', label: 'IS', color: 'text-gray-700 dark:text-gray-300' },
    { id: 'IS_NOT', label: 'IS_NOT', color: 'text-red-500 dark:text-red-400' },
  ],
  enum: [
    { id: 'IS', label: 'IS', color: 'text-gray-700 dark:text-gray-300' },
    { id: 'IS_NOT', label: 'IS_NOT', color: 'text-red-500 dark:text-red-400' },
  ]
};

const THREE_DS_DECISIONS = [
  { id: 'no_three_ds', label: 'Request No-3DS', description: 'Skip 3DS authentication' },
  { id: 'challenge_requested', label: 'Mandate 3DS Challenge', description: 'Always require challenge' },
  { id: 'challenge_preferred', label: 'Prefer 3DS Challenge', description: 'Prefer challenge when possible' },
  { id: 'three_ds_exemption_requested_tra', label: 'Request 3DS Exemption, Type: TRA', description: 'Transaction Risk Analysis exemption' },
  { id: 'three_ds_exemption_requested_low_value', label: 'Request 3DS Exemption, Type: Low Value Transaction', description: 'Low value transaction exemption' },
  { id: 'issuer_three_ds_exemption_requested', label: 'No challenge requested', description: 'Proceed without challenge' },
];

const ENUM_VALUES = {
  card_network: ['Visa', 'Mastercard', 'American Express'],
  customer_device_platform: ['Web', 'Android', 'iOS'],
};

const SIMULATION_SCENARIOS = [
  {
    id: 'scenario-1',
    name: 'High Value Transaction',
    description: 'Amount > $100 triggers mandatory 3DS',
    transaction: { amount: 15000, currency: 'USD', card_network: 'Visa', issuer_country: 'US', customer_device_platform: 'Web' }
  },
  {
    id: 'scenario-2',
    name: 'Low Value Transaction',
    description: 'Amount < $50 exempts from 3DS',
    transaction: { amount: 2500, currency: 'USD', card_network: 'Mastercard', issuer_country: 'US', customer_device_platform: 'Mobile' }
  },
  {
    id: 'scenario-3',
    name: 'High Risk Country',
    description: 'Transaction from high-risk country mandates 3DS',
    transaction: { amount: 5000, currency: 'USD', card_network: 'Visa', issuer_country: 'NG', customer_device_platform: 'Web' }
  },
  {
    id: 'scenario-4',
    name: 'Mobile UK Transaction',
    description: 'Mobile transactions from UK require 3DS',
    transaction: { amount: 10000, currency: 'GBP', card_network: 'Visa', issuer_country: 'GB', customer_device_platform: 'iOS' }
  }
];

const ThreeDSDecisionManager = () => {
  const [rules, setRules] = useState([
    {
      id: 'rule-1',
      name: 'High Amount Rule',
      expanded: false,
      enabled: true,
      conditions: [{ id: 'cond-1', field: 'amount', operator: 'GREATER_THAN', value: '10000', logicalOperator: 'AND' }],
      decision: 'challenge_requested'
    },
    {
      id: 'rule-2',
      name: 'High Risk Country',
      expanded: false,
      enabled: true,
      conditions: [{ id: 'cond-1', field: 'issuer_country', operator: 'IS', value: 'NG', logicalOperator: 'AND' }],
      decision: 'challenge_requested'
    },
    {
      id: 'rule-3',
      name: 'Mobile UK Transactions',
      expanded: false,
      enabled: true,
      conditions: [
        { id: 'cond-1', field: 'customer_device_platform', operator: 'IS', value: 'iOS', logicalOperator: 'AND' },
        { id: 'cond-2', field: 'issuer_country', operator: 'IS', value: 'GB', logicalOperator: 'AND' }
      ],
      decision: 'challenge_requested'
    },
    {
      id: 'rule-4',
      name: 'Corporate Card Rule',
      expanded: false,
      enabled: true,
      conditions: [
        { id: 'cond-1', field: 'card_network', operator: 'IS', value: 'Mastercard', logicalOperator: 'AND' },
        { id: 'cond-2', field: 'amount', operator: 'GREATER_THAN', value: '15000', logicalOperator: 'AND' }
      ],
      decision: 'challenge_preferred'
    }
  ]);
  
  const [showFieldDropdown, setShowFieldDropdown] = useState(null);
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(null);
  const [showDecisionDropdown, setShowDecisionDropdown] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [evaluatingRuleId, setEvaluatingRuleId] = useState(null);
  const [matchedRuleId, setMatchedRuleId] = useState(null);
  const [simulationResults, setSimulationResults] = useState([]);

  const filteredFields = ALL_FIELDS;

  const groupedFields = filteredFields.reduce((acc, field) => {
    if (!acc[field.category]) acc[field.category] = [];
    acc[field.category].push(field);
    return acc;
  }, {});

  const getFieldType = (fieldId) => ALL_FIELDS.find(f => f.id === fieldId)?.type || 'string';
  const getFieldLabel = (fieldId) => ALL_FIELDS.find(f => f.id === fieldId)?.label || fieldId;
  const getOperatorsForField = (fieldId) => OPERATORS[getFieldType(fieldId)] || OPERATORS.string;
  const getDecisionDetails = (decisionId) => THREE_DS_DECISIONS.find(d => d.id === decisionId) || THREE_DS_DECISIONS[0];

  const addRule = () => {
    const newRule = {
      id: `rule-${rules.length + 1}`,
      name: `Rule ${rules.length + 1}`,
      expanded: false,
      enabled: true,
      conditions: [{ id: `cond-${Date.now()}`, field: 'amount', operator: 'EQUAL_TO', value: '', logicalOperator: 'AND' }],
      decision: 'no_three_ds'
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (ruleId) => rules.length > 1 && setRules(rules.filter(r => r.id !== ruleId));

  const addCondition = (ruleId) => {
    setRules(rules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, conditions: [...rule.conditions, { id: `cond-${Date.now()}`, field: 'issuer_country', operator: 'IS', value: '', logicalOperator: 'AND' }] }
        : rule
    ));
  };

  const removeCondition = (ruleId, conditionId) => {
    setRules(rules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, conditions: rule.conditions.filter(c => c.id !== conditionId) }
        : rule
    ));
  };

  const updateCondition = (ruleId, conditionId, updates) => {
    setRules(rules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, conditions: rule.conditions.map(cond => cond.id === conditionId ? { ...cond, ...updates } : cond) }
        : rule
    ));
  };

  const updateRuleDecision = (ruleId, decision) => {
    setRules(rules.map(rule => rule.id === ruleId ? { ...rule, decision } : rule));
  };

  const toggleRuleExpanded = (ruleId) => {
    setRules(rules.map(rule => rule.id === ruleId ? { ...rule, expanded: !rule.expanded } : rule));
  };

  const handleFieldSelect = (ruleId, conditionId, fieldId) => {
    const field = ALL_FIELDS.find(f => f.id === fieldId);
    const operators = OPERATORS[field.type] || OPERATORS.string;
    updateCondition(ruleId, conditionId, { field: fieldId, operator: operators[0].id, value: '' });
    setShowFieldDropdown(null);
  };

  const evaluateRule = (rule, transaction) => {
    let matched = true;
    let first = true;
    
    for (const condition of rule.conditions) {
      const txValue = transaction[condition.field];
      let conditionMatched = false;
      
      switch (condition.operator) {
        case 'EQUAL_TO': conditionMatched = parseFloat(txValue) === parseFloat(condition.value); break;
        case 'GREATER_THAN': conditionMatched = parseFloat(txValue) > parseFloat(condition.value); break;
        case 'LESS_THAN': conditionMatched = parseFloat(txValue) < parseFloat(condition.value); break;
        case 'IS': conditionMatched = String(txValue).toLowerCase() === String(condition.value).toLowerCase(); break;
        case 'IS_NOT': conditionMatched = String(txValue).toLowerCase() !== String(condition.value).toLowerCase(); break;
        default: conditionMatched = String(txValue) === String(condition.value);
      }
      
      if (first) {
        matched = conditionMatched;
        first = false;
      } else if (condition.logicalOperator === 'AND') {
        matched = matched && conditionMatched;
      } else if (condition.logicalOperator === 'OR') {
        matched = matched || conditionMatched;
      }
    }
    
    return matched;
  };

  const runScenario = async () => {
    setIsRunning(true);
    setEvaluatingRuleId(null);
    setMatchedRuleId(null);

    const scenario = SIMULATION_SCENARIOS[currentScenario];
    const transaction = scenario.transaction;

    const allMatchedRules = [];
    for (const rule of rules) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setEvaluatingRuleId(rule.id);
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, expanded: true } : r));
      
      const isMatch = evaluateRule(rule, transaction);
      if (isMatch) {
        allMatchedRules.push(rule);
        setMatchedRuleId(rule.id);
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      
      setEvaluatingRuleId(null);
    }

    const firstMatchedRule = allMatchedRules.length > 0 ? allMatchedRules[0] : null;
    
    const result = {
      scenario: scenario,
      matchedRules: allMatchedRules,
      primaryMatch: firstMatchedRule,
      decision: firstMatchedRule ? firstMatchedRule.decision : 'no_three_ds'
    };

    setSimulationResults(prev => [...prev, result]);
    setCurrentScenario((prev) => (prev + 1) % SIMULATION_SCENARIOS.length);
    setIsRunning(false);
  };

  const resetAll = () => {
    setCurrentScenario(0);
    setSimulationResults([]);
    setEvaluatingRuleId(null);
    setMatchedRuleId(null);
    setIsRunning(false);
  };

  return (
    <div className="w-full h-full">
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-6 h-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rule Assignment Template</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Define rules to determine 3DS authentication requirements</p>
          </div>
          
          <div className="p-3 md:p-6 space-y-4 overflow-y-auto flex-1">
            {rules.map((rule, index) => {
              const isEvaluating = evaluatingRuleId === rule.id;
              const isMatched = matchedRuleId === rule.id;
              
              return (
                <div 
                  key={rule.id} 
                  className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all ${
                    isEvaluating ? 'border-blue-500 shadow-lg ring-2 ring-blue-200 dark:ring-blue-900' : 
                    isMatched ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
                    'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div 
                    className="flex items-center justify-between px-4 py-3 cursor-pointer"
                    onClick={() => !isRunning && toggleRuleExpanded(rule.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isEvaluating && <RotateCcw className="w-5 h-5 text-blue-500 animate-spin" />}
                      {isMatched && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {!isEvaluating && !isMatched && <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">{index + 1}</div>}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rule.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); !isRunning && removeRule(rule.id); }}
                        className="p-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:p-1 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button className="p-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:p-1 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        {rule.expanded ? <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  
                  {rule.expanded && (
                    <div className="px-4 pb-4 space-y-3">
                      {rule.conditions.map((condition, idx) => (
                        <div key={condition.id} className="flex flex-col md:flex-row md:items-center gap-2">
                          {idx > 0 && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => updateCondition(rule.id, condition.id, { logicalOperator: condition.logicalOperator === 'AND' ? 'OR' : 'AND' })}
                                className={`min-h-[44px] md:min-h-0 px-3 md:px-2 py-2 md:py-1 rounded text-xs font-medium ${condition.logicalOperator === 'AND' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700'}`}
                              >
                                AND
                              </button>
                              <button
                                onClick={() => updateCondition(rule.id, condition.id, { logicalOperator: condition.logicalOperator === 'OR' ? 'AND' : 'OR' })}
                                className={`min-h-[44px] md:min-h-0 px-3 md:px-2 py-2 md:py-1 rounded text-xs font-medium ${condition.logicalOperator === 'OR' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700'}`}
                              >
                                OR
                              </button>
                            </div>
                          )}

                          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-auto">
                              <button
                                onClick={() => setShowFieldDropdown(showFieldDropdown === `${rule.id}-${condition.id}` ? null : `${rule.id}-${condition.id}`)}
                                className="flex items-center justify-between md:justify-start gap-1 w-full md:w-auto min-h-[44px] md:min-h-0 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 text-sm text-gray-900 dark:text-gray-100"
                              >
                                <span>{getFieldLabel(condition.field)}</span>
                                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              </button>
                              {showFieldDropdown === `${rule.id}-${condition.id}` && (
                                <div className="absolute top-full left-0 mt-2 w-full md:w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                  {Object.entries(groupedFields).map(([category, fields]) => (
                                    <div key={category}>
                                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">{category}</div>
                                      {fields.map(field => (
                                        <button key={field.id} onClick={() => handleFieldSelect(rule.id, condition.id, field.id)} className="w-full min-h-[44px] md:min-h-0 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100">
                                          {field.label}
                                        </button>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="relative w-full md:w-auto">
                              <button
                                onClick={() => setShowOperatorDropdown(showOperatorDropdown === `${rule.id}-${condition.id}` ? null : `${rule.id}-${condition.id}`)}
                                className="flex items-center justify-between md:justify-start gap-1 w-full md:w-auto min-h-[44px] md:min-h-0 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 text-sm"
                              >
                                <span className={getOperatorsForField(condition.field).find(o => o.id === condition.operator)?.color}>
                                  {getOperatorsForField(condition.field).find(o => o.id === condition.operator)?.label}
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              </button>
                              {showOperatorDropdown === `${rule.id}-${condition.id}` && (
                                <div className="absolute top-full left-0 mt-2 w-full md:w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                                  {getOperatorsForField(condition.field).map(op => (
                                    <button
                                      key={op.id}
                                      onClick={() => { updateCondition(rule.id, condition.id, { operator: op.id }); setShowOperatorDropdown(null); }}
                                      className="w-full min-h-[44px] md:min-h-0 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      <span className={op.color}>{op.label}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                              {ENUM_VALUES[condition.field] ? (
                                <select
                                  value={condition.value}
                                  onChange={(e) => updateCondition(rule.id, condition.id, { value: e.target.value })}
                                  className="min-h-[44px] md:min-h-0 w-full md:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                  <option value="">Select...</option>
                                  {ENUM_VALUES[condition.field].map(val => (
                                    <option key={val} value={val}>{val}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={getFieldType(condition.field) === 'number' ? 'number' : 'text'}
                                  value={condition.value}
                                  onChange={(e) => updateCondition(rule.id, condition.id, { value: e.target.value })}
                                  placeholder="Value"
                                  className="min-h-[44px] md:min-h-0 w-full md:w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                />
                              )}

                              <button
                                onClick={() => removeCondition(rule.id, condition.id)}
                                className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => addCondition(rule.id)}
                        className="min-h-[44px] md:min-h-0 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 mt-2"
                      >
                        <Plus className="w-4 h-4" /> Add Condition
                      </button>

                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">3DS Decision</label>
                        <div className="relative">
                          <button
                            onClick={() => setShowDecisionDropdown(showDecisionDropdown === rule.id ? null : rule.id)}
                            className="flex items-center gap-2 min-h-[44px] md:min-h-0 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 w-full max-w-md text-gray-900 dark:text-gray-100"
                          >
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">{getDecisionDetails(rule.decision).label}</span>
                            <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-auto" />
                          </button>
                          {showDecisionDropdown === rule.id && (
                            <div className="absolute top-full left-0 mt-2 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                              {THREE_DS_DECISIONS.map(decision => (
                                <button
                                  key={decision.id}
                                  onClick={() => { updateRuleDecision(rule.id, decision.id); setShowDecisionDropdown(null); }}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{decision.label}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{decision.description}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            <button
              onClick={addRule}
              className="w-full py-3 min-h-[44px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Rule
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Simulation</h3>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={runScenario}
                disabled={isRunning}
                className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50"
              >
                {isRunning ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                Run Scenario {currentScenario + 1}/{SIMULATION_SCENARIOS.length}
              </button>
              {simulationResults.length > 0 && (
                <button onClick={resetAll} className="min-h-[44px] md:min-h-0 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center justify-center sm:justify-start gap-1">
                  <RotateCcw className="w-4 h-4" /> Reset All
                </button>
              )}
            </div>

            {simulationResults.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Results</h4>
                {simulationResults.map((result, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900 dark:text-white">{result.scenario.name}</h5>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Scenario {SIMULATION_SCENARIOS.findIndex(s => s.id === result.scenario.id) + 1}</span>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-3 mb-3">
                      <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm">
                        <div><span className="text-gray-500 dark:text-gray-400">Amount:</span> <span className="font-medium text-gray-900 dark:text-white">${result.scenario.transaction.amount / 100}</span></div>
                        <div><span className="text-gray-500 dark:text-gray-400">Card:</span> <span className="font-medium text-gray-900 dark:text-white">{result.scenario.transaction.card_network}</span></div>
                        <div><span className="text-gray-500 dark:text-gray-400">Country:</span> <span className="font-medium text-gray-900 dark:text-white">{result.scenario.transaction.issuer_country}</span></div>
                      </div>
                    </div>

                    <div className={`rounded-lg border-2 p-3 ${result.primaryMatch ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-green-500 bg-green-50 dark:bg-green-900/20'}`}>
                      <div className="flex items-center gap-3">
                        {result.primaryMatch ? <ShieldAlert className="w-6 h-6 text-amber-500" /> : <ShieldCheck className="w-6 h-6 text-green-500" />}
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{getDecisionDetails(result.decision).label}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {result.primaryMatch 
                              ? `Matched ${result.matchedRules.length} rule(s): ${result.matchedRules.map(r => r.name).join(', ')}`
                              : 'No rules matched - default applied'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDSDecisionManager;
