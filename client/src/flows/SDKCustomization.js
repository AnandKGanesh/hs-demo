import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { hyperState } from '../utils/atoms';
import { Palette, Layout, Type, CreditCard, Globe, Settings, Eye, Wallet, Languages, Button } from 'lucide-react';

const SDKCustomization = () => {
  const hyper = useRecoilValue(hyperState);
  const [activeTab, setActiveTab] = useState('layout');
  
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
  
  const generateCode = () => {
    const options = {
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
      appearance: {
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
      },
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
    
    return `const paymentElementOptions = ${JSON.stringify(options, null, 2)};

<PaymentElement id="payment-element" options={paymentElementOptions} />`;
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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Layout Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLayoutType('accordion')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    layoutType === 'accordion'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Accordion
                </button>
                <button
                  onClick={() => setLayoutType('tabs')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    layoutType === 'tabs'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Tabs
                </button>
              </div>
            </div>
            
            {layoutType === 'accordion' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Default Collapsed
                  </label>
                  <input
                    type="checkbox"
                    checked={defaultCollapsed}
                    onChange={(e) => setDefaultCollapsed(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Radios
                  </label>
                  <input
                    type="checkbox"
                    checked={radios}
                    onChange={(e) => setRadios(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Spaced Accordion Items
                  </label>
                  <input
                    type="checkbox"
                    checked={spacedItems}
                    onChange={(e) => setSpacedItems(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Visible Items Count (0 = all)
                  </label>
                  <input
                    type="number"
                    value={visibleItemsCount}
                    onChange={(e) => setVisibleItemsCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
              </>
            )}
            
            {layoutType === 'tabs' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Methods Arrangement
                </label>
                <select
                  value={paymentMethodsArrangement}
                  onChange={(e) => setPaymentMethodsArrangement(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="default">Default (dropdown)</option>
                  <option value="grid">Grid</option>
                </select>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Display One-Click Methods on Top
              </label>
              <input
                type="checkbox"
                checked={displayOneClickOnTop}
                onChange={(e) => setDisplayOneClickOnTop(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300"
              />
            </div>
          </div>
        );
        
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colorPrimary}
                  onChange={(e) => setColorPrimary(e.target.value)}
                  className="w-10 h-10 rounded border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={colorPrimary}
                  onChange={(e) => setColorPrimary(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colorBackground}
                  onChange={(e) => setColorBackground(e.target.value)}
                  className="w-10 h-10 rounded border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={colorBackground}
                  onChange={(e) => setColorBackground(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colorText}
                  onChange={(e) => setColorText(e.target.value)}
                  className="w-10 h-10 rounded border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={colorText}
                  onChange={(e) => setColorText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Border Radius (px)
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={borderRadius}
                onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{borderRadius}px</span>
            </div>
          </div>
        );
        
      case 'typography':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Family
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Poppins">Poppins</option>
                <option value="SF Pro">SF Pro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base Font Size (px)
              </label>
              <input
                type="range"
                min="12"
                max="20"
                value={fontSizeBase}
                onChange={(e) => setFontSizeBase(parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{fontSizeBase}px</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Spacing Unit (px)
              </label>
              <input
                type="range"
                min="2"
                max="8"
                value={spacingUnit}
                onChange={(e) => setSpacingUnit(parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{spacingUnit}px</span>
            </div>
          </div>
        );
        
      case 'wallets':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Apple Pay
              </label>
              <select
                value={applePay}
                onChange={(e) => setApplePay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="auto">Auto (display when supported)</option>
                <option value="never">Never</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Google Pay
              </label>
              <select
                value={googlePay}
                onChange={(e) => setGooglePay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="auto">Auto (display when supported)</option>
                <option value="never">Never</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wallet Button Theme
              </label>
              <select
                value={walletTheme}
                onChange={(e) => setWalletTheme(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="outline">Outline</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wallet Button Type
              </label>
              <select
                value={walletType}
                onChange={(e) => setWalletType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="default">Default</option>
                <option value="checkout">Checkout</option>
                <option value="pay">Pay</option>
                <option value="buy">Buy</option>
                <option value="donate">Donate</option>
                <option value="subscribe">Subscribe</option>
              </select>
            </div>
          </div>
        );
        
      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Locale
              </label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
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
                <option value="he">Hebrew</option>
              </select>
            </div>
          </div>
        );
        
      case 'features':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Branding
              </label>
              <select
                value={branding}
                onChange={(e) => setBranding(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="always">Always show</option>
                <option value="never">Never show</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Display Saved Payment Methods
              </label>
              <input
                type="checkbox"
                checked={displaySavedMethods}
                onChange={(e) => setDisplaySavedMethods(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Display Save Payment Method Checkbox
              </label>
              <input
                type="checkbox"
                checked={displaySaveCheckbox}
                onChange={(e) => setDisplaySaveCheckbox(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Methods Header Text
              </label>
              <input
                type="text"
                value={paymentMethodsHeader}
                onChange={(e) => setPaymentMethodsHeader(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Saved Methods Header Text
              </label>
              <input
                type="text"
                value={savedMethodsHeader}
                onChange={(e) => setSavedMethodsHeader(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          SDK Customization
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize the payment experience to match your brand and UX requirements
        </p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-1/3 flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {renderControls()}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 flex flex-col gap-4">
          {/* SDK Preview */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Eye size={18} />
                Live Preview
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                The SDK will render with your selected options
              </span>
            </div>
            
            <div 
              className="p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: colorBackground }}
            >
              <div className="max-w-md mx-auto">
                {/* Mock Payment Element */}
                <div 
                  className="rounded-lg p-4 shadow-sm"
                  style={{ 
                    backgroundColor: colorBackground,
                    borderRadius: `${borderRadius}px`,
                    fontFamily,
                    fontSize: `${fontSizeBase}px`,
                    color: colorText,
                    border: `1px solid ${colorPrimary}20`,
                  }}
                >
                  {/* Saved Methods Section */}
                  {displaySavedMethods && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2 opacity-80">{savedMethodsHeader}</h4>
                      <div 
                        className="p-3 rounded border cursor-pointer flex items-center gap-3"
                        style={{ 
                          borderRadius: `${borderRadius}px`,
                          borderColor: `${colorPrimary}30`,
                        }}
                      >
                        <CreditCard size={20} style={{ color: colorPrimary }} />
                        <div className="flex-1">
                          <div className="font-medium">•••• 4242</div>
                          <div className="text-xs opacity-60">Expires 12/25</div>
                        </div>
                        <input type="radio" checked readOnly className="w-4 h-4" style={{ accentColor: colorPrimary }} />
                      </div>
                    </div>
                  )}
                  
                  {/* One-Click Wallets */}
                  {displayOneClickOnTop && (applePay !== 'never' || googlePay !== 'never') && (
                    <div className="mb-4 space-y-2">
                      {applePay !== 'never' && (
                        <button
                          className="w-full py-3 rounded font-medium text-white flex items-center justify-center gap-2"
                          style={{ 
                            backgroundColor: walletTheme === 'dark' ? '#000' : '#fff',
                            color: walletTheme === 'dark' ? '#fff' : '#000',
                            borderRadius: `${borderRadius}px`,
                            border: walletTheme === 'outline' ? '1px solid #000' : 'none',
                          }}
                        >
                          <span>Apple Pay</span>
                        </button>
                      )}
                      {googlePay !== 'never' && (
                        <button
                          className="w-full py-3 rounded font-medium text-white flex items-center justify-center gap-2"
                          style={{ 
                            backgroundColor: walletTheme === 'dark' ? '#000' : '#fff',
                            color: walletTheme === 'dark' ? '#fff' : '#000',
                            borderRadius: `${borderRadius}px`,
                            border: walletTheme === 'outline' ? '1px solid #000' : 'none',
                          }}
                        >
                          <span>Google Pay</span>
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Payment Methods Header */}
                  <h4 className="text-sm font-medium mb-3 opacity-80">{paymentMethodsHeader}</h4>
                  
                  {/* Payment Method Tabs/Accordion */}
                  <div className="space-y-2">
                    <div 
                      className="p-3 rounded border"
                      style={{ 
                        borderRadius: `${borderRadius}px`,
                        borderColor: `${colorPrimary}40`,
                        backgroundColor: `${colorPrimary}05`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {radios && layoutType === 'accordion' && (
                          <input 
                            type="radio" 
                            checked 
                            readOnly 
                            className="w-4 h-4" 
                            style={{ accentColor: colorPrimary }}
                          />
                        )}
                        <CreditCard size={18} style={{ color: colorPrimary }} />
                        <span className="font-medium">Card</span>
                      </div>
                      
                      {/* Card Form */}
                      <div className="mt-3 space-y-2">
                        <input
                          type="text"
                          placeholder="Card number"
                          className="w-full p-2 rounded border text-sm"
                          style={{ 
                            borderRadius: `${borderRadius}px`,
                            borderColor: `${colorPrimary}30`,
                            backgroundColor: colorBackground,
                            color: colorText,
                          }}
                          readOnly
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="MM / YY"
                            className="flex-1 p-2 rounded border text-sm"
                            style={{ 
                              borderRadius: `${borderRadius}px`,
                              borderColor: `${colorPrimary}30`,
                              backgroundColor: colorBackground,
                              color: colorText,
                            }}
                            readOnly
                          />
                          <input
                            type="text"
                            placeholder="CVC"
                            className="w-20 p-2 rounded border text-sm"
                            style={{ 
                              borderRadius: `${borderRadius}px`,
                              borderColor: `${colorPrimary}30`,
                              backgroundColor: colorBackground,
                              color: colorText,
                            }}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                    
                    {spacedItems && layoutType === 'accordion' && <div className="h-2" />}
                    
                    <div 
                      className="p-3 rounded border flex items-center gap-2 opacity-60"
                      style={{ 
                        borderRadius: `${borderRadius}px`,
                        borderColor: `${colorPrimary}20`,
                      }}
                    >
                      {radios && layoutType === 'accordion' && (
                        <input 
                          type="radio" 
                          className="w-4 h-4" 
                          style={{ accentColor: colorPrimary }}
                        />
                      )}
                      <span className="font-medium">PayPal</span>
                    </div>
                  </div>
                  
                  {/* Save Card Checkbox */}
                  {displaySaveCheckbox && (
                    <div className="mt-4 flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded"
                        style={{ accentColor: colorPrimary }}
                      />
                      <span className="text-sm opacity-80">Save this card for future payments</span>
                    </div>
                  )}
                  
                  {/* Pay Button */}
                  <button
                    className="w-full mt-4 py-3 rounded font-medium text-white"
                    style={{ 
                      backgroundColor: colorPrimary,
                      borderRadius: `${borderRadius}px`,
                    }}
                  >
                    Pay $100.00
                  </button>
                  
                  {/* Branding */}
                  {branding === 'always' && (
                    <div className="mt-3 text-center text-xs opacity-50">
                      Powered by Hyperswitch
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Code Preview */}
          <div className="h-1/3 bg-gray-900 rounded-lg p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white text-sm">Generated Code</h3>
              <button 
                className="text-xs text-gray-400 hover:text-white transition-colors"
                onClick={() => navigator.clipboard.writeText(generateCode())}
              >
                Copy to clipboard
              </button>
            </div>
            <pre className="text-xs text-green-400 overflow-auto h-full pb-6 font-mono">
              <code>{generateCode()}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDKCustomization;
