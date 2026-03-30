import React, { useState, useEffect } from 'react';
import { CreditCard, Repeat, Shield, AlertTriangle, Database, ChevronRight, Lock, ChevronDown, ChevronUp, RefreshCw, Zap, GitBranch } from 'lucide-react';

const flowCategories = [
  {
    id: 'payment',
    name: 'Payment Flows',
    icon: CreditCard,
    flows: [
      { id: 'automatic', name: 'Automatic Capture', description: 'Standard one-time payment' },
      { id: 'manual', name: 'Manual Capture', description: 'Authorize now, capture later' },
      { id: 'manual_partial', name: 'Manual Partial Capture', description: 'Capture $50 of $100 authorized' },
      { id: 'repeat_user', name: 'Repeat User', description: 'Use saved customer ID', disabled: true },
      { id: 'payment_links', name: 'Payment Links', description: 'Generate shareable payment links' },
      { id: 'split_settlement', name: 'Split Settlement', description: 'Distribute funds between accounts', disabled: true },
    ],
  },
  {
    id: 'recurring',
    name: 'Recurring Flows',
    icon: Repeat,
    flows: [
      { id: 'zero_setup', name: '$0 Setup Recurring', description: 'Setup recurring with $0 authorization' },
      { id: 'setup_and_charge', name: 'Setup Recurring and Charge', description: 'Charge $100 and setup recurring' },
      { id: 'recurring_charge', name: 'Recurring Charge', description: 'Charge using saved payment method' },
      { id: 'recurring_charge_ntid', name: 'Recurring Charge with Network Transaction ID', description: 'Charge using NTID with card entry', disabled: true },
      { id: 'recurring_charge_psp', name: 'Recurring Charge with PSP Token', description: 'Charge using PSP mandate token' },
    ],
  },
  {
    id: 'threeds',
    name: '3DS Flows',
    icon: Shield,
    flows: [
      { id: 'three_ds_psp', name: 'Authenticate with 3DS via PSP', description: '3D Secure authentication via PSP' },
      { id: 'three_ds_import', name: 'Import 3D Secure Results', description: 'Import existing 3DS authentication' },
      { id: 'three_ds_standalone', name: 'Standalone 3D Secure', description: 'Standalone 3DS via Hyperswitch' },
    ],
  },
  {
    id: 'frm',
    name: 'FRM Flows',
    icon: AlertTriangle,
    flows: [
      { id: 'frm_pre', name: 'FRM Pre-Auth', description: 'Fraud check before authorization' },
      { id: 'chargeback_unification', name: 'Chargeback Unification', description: 'List and manage disputes/chargebacks' },
      { id: 'frm_post', name: 'FRM Post-Auth', description: 'Fraud check after authorization', disabled: true },
    ],
  },
  {
    id: 'relay',
    name: 'Relay',
    icon: RefreshCw,
    flows: [
      { id: 'relay_capture', name: 'Relay - Capture', description: 'Capture via relay API' },
      { id: 'relay_refund', name: 'Relay - Refund', description: 'Refund via relay API' },
      { id: 'relay_void', name: 'Relay - Void', description: 'Void via relay API' },
      { id: 'relay_incremental', name: 'Relay - Incremental Auth', description: 'Incremental authorization via relay', disabled: true },
    ],
  },
  {
    id: 'vault',
    name: 'Vault Flows',
    icon: Lock,
    flows: [
      { id: 'vault_3', name: 'HS managed SDK + External Vaulting', description: 'Hyperswitch vault SDK with external storage', disabled: false },
      { id: 'vault_5', name: 'Integrated Third-Party Vaulting', description: 'External vault in HS SDK with external storage', disabled: true },
      { id: 'vault_4', name: 'Standalone Third-Party Vaulting', description: 'External vault SDK with Hyperswitch', disabled: true },
      { id: 'vault_1', name: 'HS managed SDK & Vault with Proxy', description: 'Hyperswitch vault with PSP payload', disabled: true },
      { id: 'vault_2', name: 'HS managed SDK & Vault with Unified payments', description: 'Hyperswitch vault with unified payload', disabled: true },
    ],
  },
  {
    id: 'smart_retry',
    name: 'Smart Retries',
    icon: Zap,
    flows: [
      { id: 'smart_retry_playground', name: 'Smart Retry Playground', description: 'Simulate intelligent retry strategies' },
    ],
  },
  {
    id: 'intelligent_routing',
    name: 'Intelligent Routing',
    icon: GitBranch,
    flows: [
      { id: 'routing_simulator', name: 'Routing Simulator', description: 'Watch transactions flow through eligibility, rules, and overrides' },
      { id: 'decision_engine', name: 'Decision Engine', description: 'Success rate-based dynamic routing simulation' },
    ],
  },
  {
    id: 'decision_manager',
    name: 'Decision Manager',
    icon: Shield,
    flows: [
      { id: 'three_ds_decision', name: '3DS Decision Manager', description: 'Balance fraud prevention with checkout friction. See how risk scores determine when to challenge, skip, or block transactions using smart 3DS authentication rules.', disabled: true },
    ],
  },
  {
    id: 'organization',
    name: 'Organization',
    icon: Database,
    flows: [
      { id: 'organization_manager', name: 'Organization Manager', description: 'Mock organization structure and merchant management' },
    ],
  },
];

const getCategoryForFlow = (flowId) => {
  for (const category of flowCategories) {
    if (category.flows.some(f => f.id === flowId)) {
      return category.id;
    }
  }
  return null;
};

const Sidebar = ({ onFlowSelect, currentFlow }) => {
  // Initialize with current flow's category expanded
  const [expandedCategories, setExpandedCategories] = useState(() => {
    const currentCategory = currentFlow ? getCategoryForFlow(currentFlow.id) : null;
    return {
      payment: currentCategory === 'payment',
      recurring: currentCategory === 'recurring',
      threeds: currentCategory === 'threeds',
      frm: currentCategory === 'frm',
      relay: currentCategory === 'relay',
      vault: currentCategory === 'vault',
      smart_retry: currentCategory === 'smart_retry',
      intelligent_routing: currentCategory === 'intelligent_routing',
      decision_manager: currentCategory === 'decision_manager',
      organization: currentCategory === 'organization',
    };
  });

  // Update expanded state when currentFlow changes (e.g., on page load from URL)
  useEffect(() => {
    if (currentFlow) {
      const categoryId = getCategoryForFlow(currentFlow.id);
      if (categoryId && !expandedCategories[categoryId]) {
        setExpandedCategories(prev => ({
          ...prev,
          [categoryId]: true
        }));
      }
    }
  }, [currentFlow]);

  const handleFlowClick = (flow) => {
    if (flow.disabled) return;
    
    const url = new URL(window.location.href);
    url.searchParams.set('flow', flow.id);
    window.location.href = url.toString();
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Flow Categories
        </h2>
        
        {flowCategories.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategories[category.id];
          
          return (
            <div key={category.id} className="mb-4">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {Icon && <Icon size={18} className="text-gray-500 dark:text-gray-400" />}
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                    {category.name}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="mt-2 space-y-1 pl-2">
                  {category.flows.map((flow) => (
                    <button
                      key={flow.id}
                      onClick={() => handleFlowClick(flow)}
                      disabled={flow.disabled}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        flow.disabled 
                          ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600' 
                          : currentFlow?.id === flow.id
                            ? 'bg-primary text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="break-words leading-tight">{flow.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
