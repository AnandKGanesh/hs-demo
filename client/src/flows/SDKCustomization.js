import React, { useState, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Palette, Layout, Type, Eye, Wallet, Languages, ChevronDown, ChevronUp } from 'lucide-react';
import { makeAuthenticatedRequest } from '../utils/api';
import { hyperState, demoModeState, debugCredentialsState, apiResponseState } from '../utils/atoms';
import { filters } from '../utils/fieldMappings';

const SDKCustomization = () => {
  const hyper = useRecoilValue(hyperState);
  const mode = useRecoilValue(demoModeState);
  const debugCreds = useRecoilValue(debugCredentialsState);
  const setApiResponse = useSetRecoilState(apiResponseState);
  
  const [activeTab, setActiveTab] = useState('layout');
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);
  const [showCode, setShowCode] = useState(false);
  
  // Layout
  const [layoutType, setLayoutType] = useState('accordion');
  const [defaultCollapsed, setDefaultCollapsed] = useState(false);
  const [radios, setRadios] = useState(true);
  const [spacedItems, setSpacedItems] = useState(false);
  const [visibleItemsCount, setVisibleItemsCount] = useState(5);
  const [displayOneClickOnTop, setDisplayOneClickOnTop] = useState(true);
  
  // Appearance
  const [colorPrimary, setColorPrimary] = useState('#0066FF');
  const [borderRadius, setBorderRadius] = useState(4);
  
  // Wallets
  const [applePay, setApplePay] = useState('auto');
  const [googlePay, setGooglePay] = useState('auto');
  
  // Language
  const [locale, setLocale] = useState('auto');

  useEffect(() => {
    if (!hyper) return;

    const initializeSDK = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const customerData = await makeAuthenticatedRequest('/api/create-customer', {
          method: 'POST',
        }, mode, debugCreds);

        const intentData = await makeAuthenticatedRequest('/api/create-intent', {
          method: 'POST',
          body: JSON.stringify({
            flowType: 'automatic',
            amount: 10000,
            customer_id: customerData.customer_id,
          }),
        }, mode, debugCreds);

        if (intentData.error) {
          throw new Error(intentData.error.message);
        }

        if (!intentData.client_secret) {
          throw new Error('No client secret returned from server');
        }

        setClientSecret(intentData.client_secret);

        setApiResponse({
          steps: [
            {
              title: 'Step 1: Create Customer',
              request: { method: 'POST', url: '/customers' },
              response: filters.customer(customerData),
            },
            {
              title: 'Step 2: Create Payment Intent',
              request: { method: 'POST', url: '/payments', body: { amount: 10000, currency: 'USD' } },
              response: filters.paymentIntent(intentData),
            },
          ],
          currentStep: 1,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSDK();
  }, [hyper, mode, debugCreds, setApiResponse]);

  useEffect(() => {
    if (!hyper || !clientSecret) return;

    const elements = hyper.elements({
      clientSecret,
      appearance: {
        theme: 'default',
        variables: {
          colorPrimary,
          borderRadius: `${borderRadius}px`,
        },
      },
      locale: locale === 'auto' ? undefined : locale,
    });

    const paymentElement = elements.create('payment', {
      layout: {
        type: layoutType,
        defaultCollapsed,
        radios,
        spacedAccordionItems: spacedItems,
        visibleAccordionItemsCount: visibleItemsCount,
        displayOneClickPaymentMethodsOnTop: displayOneClickOnTop,
      },
      wallets: {
        applePay,
        googlePay,
      },
    });
    
    paymentElement.mount('#sdk-customization-payment-element');

    return () => {
      paymentElement.destroy();
    };
  }, [hyper, clientSecret, layoutType, defaultCollapsed, radios, spacedItems, visibleItemsCount, displayOneClickOnTop, applePay, googlePay, colorPrimary, borderRadius, locale]);

  const tabs = [
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'wallets', label: 'Wallets', icon: Wallet },
    { id: 'language', label: 'Language', icon: Languages },
  ];

  const renderControls = () => {
    switch (activeTab) {
      case 'layout':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Layout Type</label>
              <div className="flex gap-2">
                <button onClick={() => setLayoutType('accordion')} className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium ${layoutType === 'accordion' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-300'}`}>Accordion</button>
                <button onClick={() => setLayoutType('tabs')} className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium ${layoutType === 'tabs' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-300'}`}>Tabs</button>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <label className="text-sm">Default Collapsed</label>
              <input type="checkbox" checked={defaultCollapsed} onChange={(e) => setDefaultCollapsed(e.target.checked)} className="w-5 h-5 rounded" />
            </div>
            <div className="flex items-center justify-between py-2">
              <label className="text-sm">Show Radios</label>
              <input type="checkbox" checked={radios} onChange={(e) => setRadios(e.target.checked)} className="w-5 h-5 rounded" />
            </div>
            <div className="flex items-center justify-between py-2">
              <label className="text-sm">Spaced Items</label>
              <input type="checkbox" checked={spacedItems} onChange={(e) => setSpacedItems(e.target.checked)} className="w-5 h-5 rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Visible Items</label>
              <input type="number" value={visibleItemsCount} onChange={(e) => setVisibleItemsCount(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex items-center justify-between py-2">
              <label className="text-sm">One-Click on Top</label>
              <input type="checkbox" checked={displayOneClickOnTop} onChange={(e) => setDisplayOneClickOnTop(e.target.checked)} className="w-5 h-5 rounded" />
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Primary Color</label>
              <div className="flex gap-2">
                <input type="color" value={colorPrimary} onChange={(e) => setColorPrimary(e.target.value)} className="w-10 h-10 rounded border-0 cursor-pointer" />
                <input type="text" value={colorPrimary} onChange={(e) => setColorPrimary(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm uppercase" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Border Radius</label>
              <input type="range" min="0" max="20" value={borderRadius} onChange={(e) => setBorderRadius(parseInt(e.target.value))} className="w-full" />
              <span className="text-xs text-gray-500">{borderRadius}px</span>
            </div>
          </div>
        );
      case 'wallets':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Apple Pay</label>
              <select value={applePay} onChange={(e) => setApplePay(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="auto">Auto</option>
                <option value="never">Never</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Google Pay</label>
              <select value={googlePay} onChange={(e) => setGooglePay(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="auto">Auto</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
        );
      case 'language':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">Locale</label>
            <select value={locale} onChange={(e) => setLocale(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="auto">Auto</option>
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="es">Spanish</option>
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  if (!hyper) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Hyperswitch SDK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 flex flex-col bg-white border-r">
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 py-3 px-3 text-xs font-medium whitespace-nowrap ${activeTab === tab.id ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' : 'text-gray-600'}`}>
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {renderControls()}
          </div>
        </div>

        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye size={18} />
                Live Preview
              </h3>
            </div>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-2 text-sm text-red-600 underline">Retry</button>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div id="sdk-customization-payment-element" className="bg-white rounded-lg shadow-sm p-4 min-h-[400px]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDKCustomization;
