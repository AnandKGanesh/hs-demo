import React from 'react';
import { CreditCard, Repeat, Shield, AlertTriangle, Database, Lock, RefreshCw, Zap, GitBranch, Palette } from 'lucide-react';

const sectionCategories = [
  {
    id: 'payment',
    name: 'Payment Flows',
    icon: CreditCard,
    flowId: 'automatic',
    description: 'Standard payment processing including automatic capture, manual capture, and partial captures.',
    flows: [
      { id: 'automatic', name: 'Automatic Capture', description: 'Standard one-time payment' },
      { id: 'manual', name: 'Manual Capture', description: 'Authorize now, capture later' },
      { id: 'manual_partial', name: 'Manual Partial Capture', description: 'Capture $50 of $100 authorized' },
      { id: 'payment_links', name: 'Payment Links', description: 'Generate shareable payment links' },
    ],
  },
  {
    id: 'recurring',
    name: 'Recurring Flows',
    icon: Repeat,
    flowId: 'zero_setup',
    description: 'Setup and manage recurring payments with various authentication methods.',
    flows: [
      { id: 'zero_setup', name: '$0 Setup Recurring', description: 'Setup recurring with $0 authorization' },
      { id: 'setup_and_charge', name: 'Setup Recurring and Charge', description: 'Charge $100 and setup recurring' },
      { id: 'recurring_charge', name: 'Recurring Charge', description: 'Charge using saved payment method' },
      { id: 'recurring_charge_psp', name: 'Recurring Charge with PSP Token', description: 'Charge using PSP mandate token' },
    ],
  },
  {
    id: 'threeds',
    name: '3DS Flows',
    icon: Shield,
    flowId: 'three_ds_psp',
    description: '3D Secure authentication flows for enhanced payment security.',
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
    flowId: 'frm_pre',
    description: 'Fraud Risk Management (FRM) flows for pre-auth checks and chargeback management.',
    flows: [
      { id: 'frm_pre', name: 'FRM Pre-Auth', description: 'Fraud check before authorization' },
      { id: 'chargeback_unification', name: 'Chargeback Unification', description: 'List and manage disputes/chargebacks' },
    ],
  },
  {
    id: 'relay',
    name: 'Relay',
    icon: RefreshCw,
    flowId: 'relay_capture',
    description: 'Relay API flows for capture, refund, void, and incremental authorization.',
    flows: [
      { id: 'relay_capture', name: 'Relay - Capture', description: 'Capture via relay API' },
      { id: 'relay_refund', name: 'Relay - Refund', description: 'Refund via relay API' },
      { id: 'relay_void', name: 'Relay - Void', description: 'Void via relay API' },
    ],
  },
  {
    id: 'vault',
    name: 'Vault Flows',
    icon: Lock,
    flowId: 'vault_3',
    description: 'Payment vaulting options for secure card storage and tokenization.',
    flows: [
      { id: 'vault_3', name: 'HS managed SDK + External Vaulting', description: 'Hyperswitch vault SDK with external storage' },
    ],
  },
  {
    id: 'customization',
    name: 'Payment Experience',
    icon: Palette,
    flowId: 'sdk_customization',
    description: 'Customize your checkout experience with 100+ SDK customization options.',
    flows: [
      { id: 'sdk_customization', name: 'SDK Customization', description: 'Customize checkout appearance, layout, and behavior' },
    ],
  },
  {
    id: 'smart_retry',
    name: 'Smart Retries',
    icon: Zap,
    flowId: 'smart_retry_playground',
    description: 'Simulate intelligent retry strategies to optimize payment success rates.',
    flows: [
      { id: 'smart_retry_playground', name: 'Smart Retry Playground', description: 'Simulate intelligent retry strategies' },
    ],
  },
  {
    id: 'intelligent_routing',
    name: 'Intelligent Routing',
    icon: GitBranch,
    flowId: 'routing_simulator',
    description: 'Explore routing decisions and dynamic routing based on success rates.',
    flows: [
      { id: 'routing_simulator', name: 'Routing Simulator', description: 'Watch transactions flow through eligibility, rules, and overrides' },
      { id: 'decision_engine', name: 'Decision Engine', description: 'Success rate-based dynamic routing simulation' },
    ],
  },
  {
    id: 'decision_manager',
    name: 'Decision Manager',
    icon: Shield,
    flowId: 'three_ds_decision',
    description: 'Balance fraud prevention with checkout friction using risk-based 3DS rules.',
    flows: [
      { id: 'three_ds_decision', name: '3DS Decision Manager', description: 'Risk-based 3DS authentication decisions' },
    ],
  },
  {
    id: 'organization',
    name: 'Organization',
    icon: Database,
    flowId: 'organization_manager',
    description: 'Mock organization structure and merchant management interface.',
    flows: [
      { id: 'organization_manager', name: 'Organization Manager', description: 'Mock organization structure and merchant management' },
    ],
  },
];

const Readme = () => {
  const handleNavigate = (flowId) => {
    const url = new URL(window.location.href);
    url.searchParams.set('flow', flowId);
    window.location.href = url.toString();
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Hyperswitch Playground
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Experience the core orchestration product features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {sectionCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div
              key={category.id}
              onClick={() => handleNavigate(category.flowId)}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  {Icon && <Icon size={24} className="text-primary" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {category.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {category.flows.slice(0, 3).map((flow) => (
                      <span
                        key={flow.id}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                      >
                        {flow.name}
                      </span>
                    ))}
                    {category.flows.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-500 rounded-full">
                        +{category.flows.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="border-t border-gray-200 dark:border-gray-700 pt-6 pb-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-6">
            <a
              href="https://hyperswitch.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              Website
            </a>
            <a
              href="https://docs.hyperswitch.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              Documentation
            </a>
            <a
              href="https://github.com/juspay/hyperswitch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://docs.hyperswitch.io/api-reference"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              API Reference
            </a>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} Hyperswitch. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://hyperswitch.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 dark:text-gray-500 hover:text-primary transition-colors"
            >
              Juspay Hyperswitch
            </a>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <a
              href="https://hyperswitch.io/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 dark:text-gray-500 hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Readme;
