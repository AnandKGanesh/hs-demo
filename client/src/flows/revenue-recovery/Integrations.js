import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Play } from 'lucide-react';
import SetupPanel from './SetupPanel';
import SimulationView from './SimulationView';

const Integrations = () => {
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [billingConfig, setBillingConfig] = useState(null);
  const [viewMode, setViewMode] = useState('setup');
  const [setupCollapsed, setSetupCollapsed] = useState(false);

  const bothConnected = !!(paymentConfig?.webhookUrl && billingConfig?.webhookUrl);

  const handleProceed = () => {
    setSetupCollapsed(true);
    setViewMode('simulation');
  };

  const handleBackToSetup = () => {
    setSetupCollapsed(false);
    setViewMode('setup');
  };

  return (
    <div className="flex flex-col min-h-0 gap-5" style={{ flex: 1, minHeight: 0 }}>
      {viewMode === 'setup' ? (
        <>
          <SetupPanel
            paymentConfig={paymentConfig}
            billingConfig={billingConfig}
            onPaymentConnect={setPaymentConfig}
            onBillingConnect={setBillingConfig}
            isCollapsed={false}
            onToggleCollapse={() => {}}
          />

          {bothConnected && (
            <div className="flex justify-center" style={{ flexShrink: 0 }}>
              <button
                onClick={handleProceed}
                className="text-white font-semibold"
                style={{
                  fontSize: '13px',
                  background: '#0066FF',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '10px 18px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,102,255,.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Play size={14} /> Proceed to Simulation
              </button>
            </div>
          )}

          {!bothConnected && (
            <div
              className="text-center"
              style={{
                fontSize: '12.5px',
                color: '#9099a8',
                padding: '24px 0',
              }}
            >
              Connect both payment and billing processors to proceed to the simulation.
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ flexShrink: 0 }}>
            <SetupPanel
              paymentConfig={paymentConfig}
              billingConfig={billingConfig}
              onPaymentConnect={setPaymentConfig}
              onBillingConnect={setBillingConfig}
              isCollapsed={setupCollapsed}
              onToggleCollapse={() => setSetupCollapsed((prev) => !prev)}
            />
          </div>

          <div className="flex justify-start" style={{ flexShrink: 0 }}>
            <button
              onClick={handleBackToSetup}
              className="flex items-center gap-1.5 font-medium"
              style={{
                fontSize: '12.5px',
                color: '#5e6573',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
              }}
            >
              <ArrowLeft size={16} /> Back to Setup
            </button>
          </div>

          <div className="min-h-0 flex flex-col" style={{ flex: 1 }}>
            <SimulationView paymentConfig={paymentConfig} billingConfig={billingConfig} />
          </div>
        </>
      )}
    </div>
  );
};

export default Integrations;
