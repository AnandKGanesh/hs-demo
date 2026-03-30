import React, { useState, useEffect, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { Palette, Layout, Type, Globe, Settings, Eye, Wallet, Languages, ChevronDown, ChevronUp } from 'lucide-react';
import { makeAuthenticatedRequest } from '../utils/api';
import { demoModeState, debugCredentialsState } from '../utils/atoms';

const SDKCustomization = ({ hyper }) => {
  const mode = useRecoilValue(demoModeState);
  const debugCreds = useRecoilValue(debugCredentialsState);
  const [activeTab, setActiveTab] = useState('layout');
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentElement, setPaymentElement] = useState(null);
  const [error, setError] = useState(null);
  const [showCode, setShowCode] = useState(false);
  
  // Layout Options
  const [layoutType, setLayoutType] = useState('accordion');
  const [defaultCollapsed, setDefaultCollapsed] = useState(false);
  const [radios, setRadios] = useState(true);
  const [spacedItems, setSpacedItems] = useState(false);
  const [visibleItemsCount, setVisibleItemsCount] = useState(5);
  const [paymentMethodsArrangement, setPaymentMethodsArrangement] = useState('default');
  const [displayOneClickOnTop, setDisplayOneClickOnTop] = useState(true);
  
  // Appearance - Colors
  const [colorPrimary, setColorPrimary] = useState('#0066FF');
  const [colorBackground, setColorBackground] = useState('#FFFFFF');
  const [colorText, setColorText] = useState('#1A1A1A');
  const [colorDanger, setColorDanger] = useState('#DC3545');
  const [colorSuccess, setColorSuccess] = useState('#28A745');
  const [borderRadius, setBorderRadius] = useState(4);
  
  // Typography
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSizeBase, setFontSizeBase] = useState(16);
  const [spacingUnit, setSpacingUnit] = useState(4);
  
  // Wallets
  const [applePay, setApplePay] = useState('auto');
  const [googlePay, setGooglePay] = useState('auto');
  const [walletTheme, setWalletTheme] = useState('dark');
  const [walletType, setWalletType] = useState('default');
  
  // Language
  const [locale, setLocale] = useState('auto');
  
  // Features
  const [branding, setBranding] = useState('always');
  const [displaySavedMethods, setDisplaySavedMethods] = useState(true);
  const [displaySaveCheckbox, setDisplaySaveCheckbox] = useState(true);
  const [paymentMethodsHeader, setPaymentMethodsHeader] = useState('Select Payment Method');
  const [savedMethodsHeader, setSavedMethodsHeader] = useState('Saved Payment Methods');

  const generateAppearance = useCallback(() => ({
    variables: {
      colorPrimary,
      colorBackground,
      colorText,
      colorDanger,
      colorSuccess,
      borderRadius: `${borderRadius}px`,
      fontFamily,
      fontSizeBase: `${fontSizeBase}px`,
      spacingUnit: `${spacingUnit}px`,
    },
  }), [colorPrimary, colorBackground, colorText, colorDanger, colorSuccess, borderRadius, fontFamily, fontSizeBase, spacingUnit]);

  const generateOptions = useCallback(() => {
    const layout = layoutType === 'accordion' ? {
      type: 'accordion',
      defaultCollapsed,
      radios,
      spacedAccordionItems: spacedItems,
      visibleAccordionItemsCount: visibleItemsCount,
      displayOneClickPaymentMethodsOnTop: displayOneClickOnTop,
    } : {
      type: 'tabs',
      paymentMethodsArrangementForTabs: paymentMethodsArrangement,
      displayOneClickPaymentMethodsOnTop: displayOneClickOnTop,
    };

    return {
      layout,
      wallets: {
        applePay,
        googlePay,
        style: {
          theme: walletTheme,
          type: walletType,
        },
      },
      locale: locale === 'auto' ? 'auto' : locale,
      branding,
      displaySavedPaymentMethods: displaySavedMethods,
      displaySavedPaymentMethodsCheckbox: displaySaveCheckbox,
      paymentMethodsHeaderText: paymentMethodsHeader,
      savedPaymentMethodsHeaderText: savedMethodsHeader,
    };
  }, [layoutType, defaultCollapsed, radios, spacedItems, visibleItemsCount, displayOneClickOnTop, paymentMethodsArrangement, applePay, googlePay, walletTheme, walletType, locale, branding, displaySavedMethods, displaySaveCheckbox, paymentMethodsHeader, savedMethodsHeader]);

  const initializeSDK = useCallback(async () => {
    if (!hyper) {
      setError('Hyperswitch SDK not loaded');
      return;
    }
    
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
      
      if (!intentData.client_secret) {
        throw new Error('No client_secret returned from server');
      }
      
      setClientSecret(intentData.client_secret);

      const appearance = generateAppearance();
      const elements = hyper.elements({
        clientSecret: intentData.client_secret,
        appearance,
        locale: locale === 'auto' ? undefined : locale,
      });

      const paymentElementOptions = generateOptions();
      const paymentEl = elements.create('payment', paymentElementOptions);
      
      const container = document.getElementById('sdk-customization-payment-element');
      if (container) {
        container.innerHTML = '';
        paymentEl.mount('#sdk-customization-payment-element');
        setPaymentElement(paymentEl);
      } else {
        setError('Payment element container not found');
      }
    } catch (err) {
      console.error('SDK Initialization error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [hyper, generateAppearance, generateOptions, locale, mode, debugCreds]);

  useEffect(() => {
    if (hyper && !clientSecret) {
      initializeSDK();
    }
  }, [hyper, clientSecret, initializeSDK]);

  useEffect(() => {
    if (paymentElement && hyper && clientSecret) {
      paymentElement.update({
        layout: layoutType === 'accordion' ? {
          type: 'accordion',
          defaultCollapsed,
          radios,
          spacedAccordionItems: spacedItems,
          visibleAccordionItemsCount: visibleItemsCount,
          displayOneClickPaymentMethodsOnTop: displayOneClickOnTop,
        } : {
          type: 'tabs',
          paymentMethodsArrangementForTabs: paymentMethodsArrangement,
          displayOneClickPaymentMethodsOnTop: displayOneClickOnTop,
        },
      });
    }
  }, [paymentElement, layoutType, defaultCollapsed, radios, spacedItems, visibleItemsCount, displayOneClickOnTop, paymentMethodsArrangement, hyper, clientSecret]);

  const generateCode = () => {
    const appearance = generateAppearance();
    const options = generateOptions();
    
    return `const appearance = ${JSON.stringify(appearance, null, 2)};

const paymentElementOptions = ${JSON.stringify(options, null, 2)};

const elements = hyper.elements({ 
  clientSecret, 
  appearance,
  locale: '${locale}'
});

const paymentElement = elements.create('payment', paymentElementOptions);
paymentElement.mount('#payment-element');`;
  };

  const tabs = [
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'wallets', label: 'Wallets', icon: Wallet },
    { id: 'language', label: 'Language', icon: Languages },
    { id: 'features', label: 'Features', icon: Settings },
  ];

  const renderControls = () => {
    switch (activeTab) {
      case 'layout':
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Layout Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLayoutType('accordion')}
                  className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    layoutType === 'accordion'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Accordion
                </button>
                <button
                  onClick={() => setLayoutType('tabs')}
                  className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    layoutType === 'tabs'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Tabs
                </button>
              </div>
            </div>
            
            {layoutType === 'accordion' ? (
              <>
                <div className="flex items-center justify-between py-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Default Collapsed</label>
                  <input type="checkbox" checked={defaultCollapsed} onChange={(e) => setDefaultCollapsed(e.target.checked)} className="w-5 h-5 rounded" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Show Radios</label>
                  <input type="checkbox" checked={radios} onChange={(e) => setRadios(e.target.checked)} className="w-5 h-5 rounded" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Spaced Items</label>
                  <input type="checkbox" checked={spacedItems} onChange={(e) => setSpacedItems(e.target.checked)} className="w-5 h-5 rounded" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Visible Items (0 = all)</label>
                  <input type="number" value={visibleItemsCount} onChange={(e) => setVisibleItemsCount(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Arrangement</label>
                <select value={paymentMethodsArrangement} onChange={(e) => setPaymentMethodsArrangement(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="default">Default (dropdown)</option>
                  <option value="grid">Grid</option>
                </select>
              </div>
            )}
            
            <div className="flex items-center justify-between py-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">One-Click Methods on Top</label>
              <input type="checkbox" checked={displayOneClickOnTop} onChange={(e) => setDisplayOneClickOnTop(e.target.checked)} className="w-5 h-5 rounded" />
            </div>
          </div>
        );
        
      case 'appearance':
        return (
          <div className="space-y-5">
            {[
              { label: 'Primary', value: colorPrimary, setter: setColorPrimary },
              { label: 'Background', value: colorBackground, setter: setColorBackground },
              { label: 'Text', value: colorText, setter: setColorText },
              { label: 'Danger', value: colorDanger, setter: setColorDanger },
              { label: 'Success', value: colorSuccess, setter: setColorSuccess },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} Color</label>
                <div className="flex gap-2">
                  <input type="color" value={value} onChange={(e) => setter(e.target.value)} className="w-10 h-10 rounded border-0 cursor-pointer" />
                  <input type="text" value={value} onChange={(e) => setter(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm uppercase" />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Border Radius</label>
              <input type="range" min="0" max="20" value={borderRadius} onChange={(e) => setBorderRadius(parseInt(e.target.value))} className="w-full" />
              <span className="text-xs text-gray-500">{borderRadius}px</span>
            </div>
          </div>
        );
        
      case 'typography':
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Font Family</label>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option>Inter</option><option>Roboto</option><option>Open Sans</option><option>Poppins</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Font Size</label>
              <input type="range" min="12" max="20" value={fontSizeBase} onChange={(e) => setFontSizeBase(parseInt(e.target.value))} className="w-full" />
              <span className="text-xs text-gray-500">{fontSizeBase}px</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Spacing Unit</label>
              <input type="range" min="2" max="8" value={spacingUnit} onChange={(e) => setSpacingUnit(parseInt(e.target.value))} className="w-full" />
              <span className="text-xs text-gray-500">{spacingUnit}px</span>
            </div>
          </div>
        );
        
      case 'wallets':
        return (
          <div className="space-y-5">
            {[
              { label: 'Apple Pay', value: applePay, setter: setApplePay },
              { label: 'Google Pay', value: googlePay, setter: setGooglePay },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <select value={value} onChange={(e) => setter(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="auto">Auto</option>
                  <option value="never">Never</option>
                </select>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wallet Theme</label>
              <select value={walletTheme} onChange={(e) => setWalletTheme(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="outline">Outline</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button Type</label>
              <select value={walletType} onChange={(e) => setWalletType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                {['default', 'checkout', 'pay', 'buy', 'donate', 'subscribe'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        );
        
      case 'language':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Locale</label>
            <select value={locale} onChange={(e) => setLocale(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="auto">Auto (detect browser)</option>
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="es">Spanish</option>
              <option value="it">Italian</option>
              <option value="ja">Japanese</option>
              <option value="pt">Portuguese</option>
              <option value="ru">Russian</option>
              <option value="zh">Chinese</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
        );
        
      case 'features':
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branding</label>
              <select value={branding} onChange={(e) => setBranding(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="always">Always show</option>
                <option value="never">Never show</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">Display Saved Methods</label>
              <input type="checkbox" checked={displaySavedMethods} onChange={(e) => setDisplaySavedMethods(e.target.checked)} className="w-5 h-5 rounded" />
            </div>
            <div className="flex items-center justify-between py-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">Save Card Checkbox</label>
              <input type="checkbox" checked={displaySaveCheckbox} onChange={(e) => setDisplaySaveCheckbox(e.target.checked)} className="w-5 h-5 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Methods Header</label>
              <input type="text" value={paymentMethodsHeader} onChange={(e) => setPaymentMethodsHeader(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Saved Methods Header</label>
              <input type="text" value={savedMethodsHeader} onChange={(e) => setSavedMethodsHeader(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
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
        {/* Left Panel - Controls */}
        <div className="w-80 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 py-3 px-3 text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
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

        {/* Right Panel - Live SDK */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Eye size={18} />
                Live Preview
              </h3>
              <button
                onClick={() => setShowCode(!showCode)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {showCode ? 'Hide Code' : 'Show Code'}
                {showCode ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
                <button onClick={initializeSDK} className="mt-2 text-sm text-red-600 underline">Retry</button>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div 
                  id="sdk-customization-payment-element"
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 min-h-[400px]"
                />
                
                {showCode && (
                  <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Generated Code</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(generateCode())}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                      <code>{generateCode()}</code>
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDKCustomization;
