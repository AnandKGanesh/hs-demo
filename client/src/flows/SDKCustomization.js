import React, { useState, useEffect, useRef } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { 
  Palette, Layout, Wallet, Languages, Settings, ChevronDown, ChevronUp, 
  Type, CreditCard, ToggleLeft, Eye, Code, Copy, Check
} from 'lucide-react';
import { makeAuthenticatedRequest } from '../utils/api';
import { hyperState, demoModeState, debugCredentialsState, apiResponseState } from '../utils/atoms';
import { filters } from '../utils/fieldMappings';

const SDKCustomization = () => {
  const hyper = useRecoilValue(hyperState);
  const mode = useRecoilValue(demoModeState);
  const debugCreds = useRecoilValue(debugCredentialsState);
  const setApiResponse = useSetRecoilState(apiResponseState);
  
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const paymentElementRef = useRef(null);
  const [sdkErrorLog, setSdkErrorLog] = useState([]);

  const [layout, setLayout] = useState({
    type: 'tabs',
    defaultCollapsed: false,
    radios: true,
    spacedAccordionItems: false,
  });
  const [paymentMethodsArrangementForTabs, setPaymentMethodsArrangementForTabs] = useState('default');
  const [wallets, setWallets] = useState({
    walletReturnUrl: 'https://juspay.github.io/hyperswitch-demo-app',
    applePay: 'auto',
    googlePay: 'auto',
    payPal: 'auto',
    style: {
      theme: 'light',
      type: 'default',
      height: 55,
    },
  });

  const [appearanceVars, setAppearanceVars] = useState({
    fontFamily: '',
    fontSizeBase: '16px',
    spacingUnit: '4px',
    borderRadius: '4px',
    colorPrimary: '#0066FF',
    colorBackground: '#ffffff',
    colorText: '#30313d',
    colorDanger: '#df1b41',
    colorSuccess: '#00d26a',
    colorWarning: '#f5a623',
    colorPrimaryText: '#ffffff',
    colorBackgroundText: '#30313d',
    colorSuccessText: '#ffffff',
    colorDangerText: '#ffffff',
    colorWarningText: '#ffffff',
    colorTextSecondary: '#6b7280',
    colorTextPlaceholder: '#6b7280',
    fontVariantLigatures: '',
    fontVariationSettings: '',
    fontWeightLight: '300',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightBold: '600',
    fontLineHeight: '1.5',
    fontSizeXl: '1.5rem',
    fontSizeLg: '1.125rem',
    fontSizeSm: '0.875rem',
    fontSizeXs: '0.75rem',
    fontSize2Xs: '0.625rem',
    fontSize3Xs: '0.5rem',
  });

  const [buttonVars, setButtonVars] = useState({
    buttonBackgroundColor: '#0066FF',
    buttonHeight: '40px',
    buttonWidth: '100%',
    buttonBorderRadius: '4px',
    buttonBorderColor: '#0066FF',
    buttonTextColor: '#ffffff',
    buttonTextFontSize: '16px',
    buttonTextFontWeight: '600',
    buttonBorderWidth: '1px',
  });

  const [locale, setLocale] = useState('auto');
  const [currency, setCurrency] = useState('USD');

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  ];

  const [moreConfig, setMoreConfig] = useState({
    branding: 'always',
    paymentMethodsHeaderText: '',
    savedPaymentMethodsHeaderText: '',
    hideCardNicknameField: false,
    hideExpiredPaymentMethods: false,
    displaySavedPaymentMethods: true,
    displaySavedPaymentMethodsCheckbox: true,
    savedPaymentMethodsCheckboxCheckedByDefault: false,
    readOnly: false,
    showShortSurchargeMessage: false,
  });

  const [terms, setTerms] = useState({
    card: 'auto',
    ideal: 'auto',
    sofort: 'auto',
    bancontact: 'auto',
  });

  const availableTerms = [
    { key: 'card', label: 'Card' },
    { key: 'ideal', label: 'iDEAL' },
    { key: 'sofort', label: 'Sofort' },
    { key: 'bancontact', label: 'Bancontact' },
  ];

  const availablePaymentMethods = [
    { id: 'card', label: 'Card', icon: '💳' },
    { id: 'klarna', label: 'Klarna', icon: '💰' },
    { id: 'affirm', label: 'Affirm', icon: '✅' },
    { id: 'givex', label: 'Givex', icon: '🎁' },
    { id: 'paypal', label: 'PayPal', icon: '💸' },
    { id: 'google_pay', label: 'Google Pay', icon: '📱' },
    { id: 'apple_pay', label: 'Apple Pay', icon: '🍎' },
    { id: 'ideal', label: 'iDEAL', icon: '🏦' },
    { id: 'sepa_debit', label: 'SEPA Debit', icon: '💶' },
    { id: 'sofort', label: 'Sofort', icon: '🔒' },
    { id: 'bancontact', label: 'Bancontact', icon: '🇧🇪' },
    { id: 'afterpay', label: 'After Pay', icon: '⏰' },
    { id: 'alipay', label: 'Alipay', icon: '🔵' },
    { id: 'wechat', label: 'WeChat', icon: '💬' },
    { id: 'ach_debit', label: 'ACH Debit', icon: '🏛️' },
    { id: 'paysafecard', label: 'Paysafecard', icon: '🎫' },
  ];

  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([
    'card', 'klarna', 'affirm', 'givex', 'paypal', 'google_pay'
  ]);

  const [rules, setRules] = useState({
    '.Tab--selected': {
      background: '',
      color: '',
      borderRadius: '',
    },
    '.Tab:hover': {
      background: '',
      color: '',
    },
    '.Input': {
      borderColor: '',
      borderRadius: '',
    },
    '.Input--invalid': {
      borderColor: '',
      boxShadow: '',
    },
    '.Input::placeholder': {
      color: '',
      fontSize: '',
    },
    '.Label': {
      color: '',
      fontSize: '',
    },
    '.Checkbox--checked': {
      background: '',
      borderColor: '',
    },
    '.OrPayUsingLabel': {
      color: '',
      fontSize: '',
    },
    '.TermsTextLabel': {
      color: '',
      fontSize: '',
    },
  });

  const [expandedSections, setExpandedSections] = useState({
    layout: true,
    wallets: false,
    appearance: false,
    currency: false,
    language: false,
    more: false,
    rules: false,
  });

  const locales = [
    { code: 'auto', label: 'Auto-detect' },
    { code: 'ar', label: 'Arabic' },
    { code: 'ca', label: 'Catalan' },
    { code: 'zh', label: 'Chinese' },
    { code: 'de', label: 'German' },
    { code: 'nl', label: 'Dutch' },
    { code: 'en', label: 'English' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'fr-BE', label: 'French (Belgium)' },
    { code: 'fr', label: 'French' },
    { code: 'he', label: 'Hebrew' },
    { code: 'it', label: 'Italian' },
    { code: 'ja', label: 'Japanese' },
    { code: 'pl', label: 'Polish' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'ru', label: 'Russian' },
    { code: 'es', label: 'Spanish' },
    { code: 'sv', label: 'Swedish' },
  ];

  const walletTypes = [
    { value: 'checkout', label: 'Checkout' },
    { value: 'pay', label: 'Pay' },
    { value: 'buy', label: 'Buy' },
    { value: 'installment', label: 'Installment' },
    { value: 'default', label: 'Default' },
    { value: 'book', label: 'Book' },
    { value: 'donate', label: 'Donate' },
    { value: 'order', label: 'Order' },
    { value: 'subscribe', label: 'Subscribe' },
    { value: 'contribute', label: 'Contribute' },
  ];

  const termOptions = [
    { value: 'auto', label: 'Auto' },
    { value: 'always', label: 'Always' },
    { value: 'never', label: 'Never' },
  ];

  useEffect(() => {
    if (!hyper) return;

    const initializeSDK = async () => {
      setIsLoading(true);
      setError(null);
      setClientSecret(null);

      try {
        const customerData = await makeAuthenticatedRequest('/api/create-customer', {
          method: 'POST',
        }, mode, debugCreds);

        const paymentData = {
          amount: 6500,
          currency: currency,
          confirm: false,
          customer_id: customerData.customer_id,
          profile_id: 'pro_1ZrfdulAlyqvRf0CCROa',
          capture_method: 'automatic',
          authentication_type: 'three_ds',
          request_external_three_ds_authentication: true,
          setup_future_usage: 'on_session',
          email: 'user@gmail.com',
          description: 'Hello this is description',
          return_url: 'https://hyperswitch-demo-store.netlify.app/?isTestingMode=true',
          order_details: [
            {
              product_name: 'Apple iphone 15',
              amount: 6500,
              quantity: 1,
            },
          ],
          metadata: {
            udf1: 'value1',
            login_date: '2019-09-10T10:11:12Z',
            new_customer: 'true',
          },
          billing: {
            address: {
              city: 'San Fransico',
              country: 'US',
              line1: '1467',
              line2: 'Harrison Street',
              line3: 'Harrison Street',
              zip: '94122',
              state: 'California',
              first_name: 'joseph',
              last_name: 'Doe',
            },
            phone: {
              number: '8056594427',
              country_code: '+91',
            },
            email: null,
          },
          shipping: {
            address: {
              city: 'Banglore',
              country: 'US',
              line1: 'sdsdfsdf',
              line2: 'hsgdbhd',
              line3: 'alsksoe',
              zip: '571201',
              state: 'California',
              first_name: 'John',
              last_name: 'Doe',
            },
            phone: {
              number: '123456789',
              country_code: '+1',
            },
            email: null,
          },
        };

        const intentData = await makeAuthenticatedRequest('/api/create-intent-3ds', {
          method: 'POST',
          body: JSON.stringify(paymentData),
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
              request: { method: 'POST', url: '/payments', body: { amount: 6500, currency: 'USD' } },
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
  }, [hyper, mode, debugCreds, currency, setApiResponse]);

  const buildAppearance = () => {
    const vars = {};

    Object.entries(appearanceVars).forEach(([key, value]) => {
      if (value !== '' && value !== undefined) {
        vars[key] = value;
      }
    });
    
    Object.entries(buttonVars).forEach(([key, value]) => {
      if (value !== '' && value !== undefined) {
        vars[key] = value;
      }
    });
    
    return { theme: 'default', variables: vars };
  };

  const buildLayoutOptions = () => {
    const layoutConfig = {
      type: layout.type,
      defaultCollapsed: layout.defaultCollapsed,
      radios: layout.radios,
      spacedAccordionItems: layout.spacedAccordionItems,
    };

    if (layout.type === 'tabs' && paymentMethodsArrangementForTabs !== 'default') {
      layoutConfig.paymentMethodsArrangementForTabs = paymentMethodsArrangementForTabs;
    }

    return layoutConfig;
  };

  const buildWalletOptions = () => {
    const walletConfig = {};
    
    if (wallets.walletReturnUrl) {
      walletConfig.walletReturnUrl = wallets.walletReturnUrl;
      walletConfig.applePay = wallets.applePay;
      walletConfig.googlePay = wallets.googlePay;
      walletConfig.payPal = wallets.payPal;
      walletConfig.style = {
        theme: wallets.style.theme,
        type: wallets.style.type,
        height: wallets.style.height,
      };
    }
    
    return walletConfig;
  };

  const buildOptions = () => {
    const options = {};

    options.layout = buildLayoutOptions();

    const walletConfig = buildWalletOptions();
    if (Object.keys(walletConfig).length > 0) {
      options.wallets = walletConfig;
    }

    if (moreConfig.branding !== 'always') options.branding = moreConfig.branding;
    if (moreConfig.paymentMethodsHeaderText) options.paymentMethodsHeaderText = moreConfig.paymentMethodsHeaderText;
    if (moreConfig.savedPaymentMethodsHeaderText) options.savedPaymentMethodsHeaderText = moreConfig.savedPaymentMethodsHeaderText;
    if (moreConfig.hideCardNicknameField) options.hideCardNicknameField = true;
    if (moreConfig.hideExpiredPaymentMethods) options.hideExpiredPaymentMethods = true;
    if (!moreConfig.displaySavedPaymentMethods) options.displaySavedPaymentMethods = false;
    if (!moreConfig.displaySavedPaymentMethodsCheckbox) options.displaySavedPaymentMethodsCheckbox = false;
    if (moreConfig.savedPaymentMethodsCheckboxCheckedByDefault) options.savedPaymentMethodsCheckboxCheckedByDefault = true;
    if (moreConfig.readOnly) options.readOnly = true;
    if (moreConfig.showShortSurchargeMessage) options.showShortSurchargeMessage = true;

    if (Array.isArray(selectedPaymentMethods) && selectedPaymentMethods.length > 0) {
      const cardIndex = selectedPaymentMethods.indexOf('card');
      let orderList = [...selectedPaymentMethods];
      if (cardIndex > 0) {
        orderList.splice(cardIndex, 1);
        orderList.unshift('card');
      }
      options.paymentMethodOrder = orderList;
    }

    const activeRules = Object.entries(rules).reduce((acc, [selector, styles]) => {
      const activeStyles = Object.entries(styles).reduce((styleAcc, [prop, value]) => {
        if (value && value.trim() !== '') {
          styleAcc[prop] = value;
        }
        return styleAcc;
      }, {});
      if (Object.keys(activeStyles).length > 0) {
        acc[selector] = activeStyles;
      }
      return acc;
    }, {});
    if (Object.keys(activeRules).length > 0) {
      options.rules = activeRules;
    }
    
    return options;
  };

  useEffect(() => {
    if (!hyper || !clientSecret) return;

    const mountPaymentElement = () => {
      const container = document.getElementById('sdk-customization-payment-element');
      if (!container) return;

      const appearance = buildAppearance();
      const options = buildOptions();

      const elementsInstance = hyper.elements({
        clientSecret,
        appearance,
        locale: locale === 'auto' ? undefined : locale,
      });

      const paymentEl = elementsInstance.create('payment', options);
      paymentEl.mount(container);
      paymentElementRef.current = paymentEl;
    };

    mountPaymentElement();

    return () => {
      if (paymentElementRef.current) {
        try {
          paymentElementRef.current.destroy();
        } catch (e) {
          console.log('Payment element already destroyed');
        }
        paymentElementRef.current = null;
      }
    };
  }, [
    hyper, clientSecret, locale, layout, paymentMethodsArrangementForTabs,
    wallets, appearanceVars, buttonVars, currency,
    moreConfig, selectedPaymentMethods, rules
  ]);

  const toggleSection = (section) => {
    setExpandedSections(prev => {
      const isCurrentlyOpen = prev[section];
      const allClosed = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});
      return { ...allClosed, [section]: !isCurrentlyOpen };
    });
  };

  const copyCode = () => {
    const code = generateCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hyper || !clientSecret) return;

    try {
      const { error: confirmError } = await hyper.confirmPayment({
        elements: hyper.elements({ clientSecret }),
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const generateCode = () => {
    const options = buildOptions();
    const appearance = buildAppearance();
    
    return `const elements = hyper.elements({
  clientSecret: '${clientSecret || 'your_client_secret'}',
  appearance: ${JSON.stringify(appearance, null, 2)},
  ${locale !== 'auto' ? `locale: '${locale}',` : ''}
});

const paymentElement = elements.create('payment', ${JSON.stringify(options, null, 2)});
paymentElement.mount('#payment-element');`;
  };

  const SectionHeader = ({ title, icon: Icon, section }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-gray-600" />
        <span className="font-medium text-base">{title}</span>
      </div>
      {expandedSections[section] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
  );

  const renderLayoutSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">Layout Type</label>
        <div className="flex gap-2">
          <button 
            onClick={() => setLayout({...layout, type: 'accordion'})} 
            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium ${layout.type === 'accordion' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-300'}`}
          >Accordion</button>
          <button 
            onClick={() => setLayout({...layout, type: 'tabs'})} 
            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium ${layout.type === 'tabs' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-300'}`}
          >Tabs</button>
        </div>
      </div>
      
      {layout.type === 'tabs' && (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Arrangement</label>
          <select 
            value={paymentMethodsArrangementForTabs} 
            onChange={(e) => setPaymentMethodsArrangementForTabs(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="default">Default (dropdown for excess)</option>
            <option value="grid">Grid (show all)</option>
          </select>
        </div>
      )}
      
      <div className="space-y-2">
        <label className="flex items-center justify-between py-1.5">
          <span className="text-sm">Default Collapsed</span>
          <input 
            type="checkbox" 
            checked={layout.defaultCollapsed} 
            onChange={(e) => setLayout({...layout, defaultCollapsed: e.target.checked})} 
            className="w-4 h-4 rounded" 
          />
        </label>
        <label className="flex items-center justify-between py-1.5">
          <span className="text-sm">Show Radios</span>
          <input 
            type="checkbox" 
            checked={layout.radios} 
            onChange={(e) => setLayout({...layout, radios: e.target.checked})} 
            className="w-4 h-4 rounded" 
          />
        </label>
        <label className="flex items-center justify-between py-1.5">
          <span className="text-sm">Spaced Items</span>
          <input 
            type="checkbox" 
            checked={layout.spacedAccordionItems} 
            onChange={(e) => setLayout({...layout, spacedAccordionItems: e.target.checked})} 
            className="w-4 h-4 rounded" 
          />
        </label>
      </div>
    </div>
  );

  const renderWalletSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">Wallet Return URL</label>
        <input 
          type="text" 
          value={wallets.walletReturnUrl} 
          onChange={(e) => setWallets({...wallets, walletReturnUrl: e.target.value})} 
          placeholder="https://your-site.com/return"
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Apple Pay</label>
          <select 
            value={wallets.applePay} 
            onChange={(e) => setWallets({...wallets, applePay: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="auto">Auto</option>
            <option value="never">Never</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Google Pay</label>
          <select 
            value={wallets.googlePay} 
            onChange={(e) => setWallets({...wallets, googlePay: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="auto">Auto</option>
            <option value="never">Never</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">PayPal</label>
          <select 
            value={wallets.payPal} 
            onChange={(e) => setWallets({...wallets, payPal: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="auto">Auto</option>
            <option value="never">Never</option>
          </select>
        </div>
      </div>
      
      <div className="border-t pt-3">
        <p className="text-sm font-medium text-gray-600 mb-2">Wallet Button Style</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Theme</label>
            <select 
              value={wallets.style.theme} 
              onChange={(e) => setWallets({...wallets, style: {...wallets.style, theme: e.target.value}})}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="outline">Outline</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Type</label>
            <select 
              value={wallets.style.type} 
              onChange={(e) => setWallets({...wallets, style: {...wallets.style, type: e.target.value}})}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              {walletTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Height (px)</label>
            <input 
              type="number" 
              value={wallets.style.height} 
              onChange={(e) => setWallets({...wallets, style: {...wallets.style, height: parseInt(e.target.value) || 0}})}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">Colors</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['colorPrimary', 'Primary'],
            ['colorBackground', 'Background'],
            ['colorText', 'Text'],
            ['colorDanger', 'Danger'],
            ['colorSuccess', 'Success'],
            ['colorWarning', 'Warning'],
            ['colorTextSecondary', 'Text Secondary'],
            ['colorTextPlaceholder', 'Placeholder'],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <input 
                type="color" 
                value={appearanceVars[key] || '#000000'} 
                onChange={(e) => setAppearanceVars({...appearanceVars, [key]: e.target.value})}
                className="w-6 h-6 rounded border-0 cursor-pointer" 
              />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-3">
        <p className="text-sm font-medium text-gray-600 mb-2">Typography</p>
        <div className="space-y-2">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Font Family</label>
            <select
              value={appearanceVars.fontFamily}
              onChange={(e) => setAppearanceVars({...appearanceVars, fontFamily: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">System Default</option>
              <option value="Inter, sans-serif">Inter</option>
              <option value="Roboto, sans-serif">Roboto</option>
              <option value="Open Sans, sans-serif">Open Sans</option>
              <option value="Helvetica Neue, sans-serif">Helvetica Neue</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Times New Roman, serif">Times New Roman</option>
              <option value="Courier New, monospace">Courier New</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Base Size</label>
              <div className="flex items-center">
                <button
                  onClick={() => setAppearanceVars({...appearanceVars, fontSizeBase: (parseInt(appearanceVars.fontSizeBase) - 1) + 'px'})}
                  className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-l-lg border-y border-l"
                >-</button>
                <input
                  type="text"
                  value={appearanceVars.fontSizeBase}
                  onChange={(e) => setAppearanceVars({...appearanceVars, fontSizeBase: e.target.value})}
                  className="w-full px-2 py-2 border-y text-center text-sm"
                />
                <button
                  onClick={() => setAppearanceVars({...appearanceVars, fontSizeBase: (parseInt(appearanceVars.fontSizeBase) + 1) + 'px'})}
                  className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-r-lg border-y border-r"
                >+</button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Border Radius</label>
              <div className="flex items-center">
                <button
                  onClick={() => setAppearanceVars({...appearanceVars, borderRadius: (parseInt(appearanceVars.borderRadius) - 1) + 'px'})}
                  className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-l-lg border-y border-l"
                >-</button>
                <input
                  type="text"
                  value={appearanceVars.borderRadius}
                  onChange={(e) => setAppearanceVars({...appearanceVars, borderRadius: e.target.value})}
                  className="w-full px-2 py-2 border-y text-center text-sm"
                />
                <button
                  onClick={() => setAppearanceVars({...appearanceVars, borderRadius: (parseInt(appearanceVars.borderRadius) + 1) + 'px'})}
                  className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-r-lg border-y border-r"
                >+</button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Spacing Unit</label>
              <div className="flex items-center">
                <button
                  onClick={() => setAppearanceVars({...appearanceVars, spacingUnit: (parseInt(appearanceVars.spacingUnit) - 1) + 'px'})}
                  className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-l-lg border-y border-l"
                >-</button>
                <input
                  type="text"
                  value={appearanceVars.spacingUnit}
                  onChange={(e) => setAppearanceVars({...appearanceVars, spacingUnit: e.target.value})}
                  className="w-full px-2 py-2 border-y text-center text-sm"
                />
                <button
                  onClick={() => setAppearanceVars({...appearanceVars, spacingUnit: (parseInt(appearanceVars.spacingUnit) + 1) + 'px'})}
                  className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-r-lg border-y border-r"
                >+</button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Line Height</label>
              <div className="flex items-center">
                <button
                  onClick={() => setAppearanceVars({...appearanceVars, fontLineHeight: (parseFloat(appearanceVars.fontLineHeight) - 0.1).toFixed(1)})}
                  className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-l-lg border-y border-l"
                >-</button>
                <input
                  type="text"
                  value={appearanceVars.fontLineHeight}
                  onChange={(e) => setAppearanceVars({...appearanceVars, fontLineHeight: e.target.value})}
                  className="w-full px-2 py-2 border-y text-center text-sm"
                />
                <button
                  onClick={() => setAppearanceVars({...appearanceVars, fontLineHeight: (parseFloat(appearanceVars.fontLineHeight) + 0.1).toFixed(1)})}
                  className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-r-lg border-y border-r"
                >+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderButtonSection = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Background</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              value={buttonVars.buttonBackgroundColor} 
              onChange={(e) => setButtonVars({...buttonVars, buttonBackgroundColor: e.target.value})}
              className="w-8 h-8 rounded border-0 cursor-pointer" 
            />
            <input 
              type="text" 
              value={buttonVars.buttonBackgroundColor} 
              onChange={(e) => setButtonVars({...buttonVars, buttonBackgroundColor: e.target.value})}
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Text Color</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              value={buttonVars.buttonTextColor} 
              onChange={(e) => setButtonVars({...buttonVars, buttonTextColor: e.target.value})}
              className="w-8 h-8 rounded border-0 cursor-pointer" 
            />
            <input 
              type="text" 
              value={buttonVars.buttonTextColor} 
              onChange={(e) => setButtonVars({...buttonVars, buttonTextColor: e.target.value})}
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Height</label>
          <div className="flex items-center">
            <button
              onClick={() => setButtonVars({...buttonVars, buttonHeight: (parseInt(buttonVars.buttonHeight) - 1) + 'px'})}
              className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-l-lg border-y border-l"
            >-</button>
            <input
              type="text"
              value={buttonVars.buttonHeight}
              onChange={(e) => setButtonVars({...buttonVars, buttonHeight: e.target.value})}
              className="w-full px-2 py-2 border-y text-center text-sm"
            />
            <button
              onClick={() => setButtonVars({...buttonVars, buttonHeight: (parseInt(buttonVars.buttonHeight) + 1) + 'px'})}
              className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-r-lg border-y border-r"
            >+</button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Width</label>
          <input
            type="text"
            value={buttonVars.buttonWidth}
            onChange={(e) => setButtonVars({...buttonVars, buttonWidth: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Border Radius</label>
          <div className="flex items-center">
            <button
              onClick={() => setButtonVars({...buttonVars, buttonBorderRadius: (parseInt(buttonVars.buttonBorderRadius) - 1) + 'px'})}
              className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-l-lg border-y border-l"
            >-</button>
            <input
              type="text"
              value={buttonVars.buttonBorderRadius}
              onChange={(e) => setButtonVars({...buttonVars, buttonBorderRadius: e.target.value})}
              className="w-full px-2 py-2 border-y text-center text-sm"
            />
            <button
              onClick={() => setButtonVars({...buttonVars, buttonBorderRadius: (parseInt(buttonVars.buttonBorderRadius) + 1) + 'px'})}
              className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-r-lg border-y border-r"
            >+</button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Border Width</label>
          <div className="flex items-center">
            <button
              onClick={() => setButtonVars({...buttonVars, buttonBorderWidth: (parseInt(buttonVars.buttonBorderWidth) - 1) + 'px'})}
              className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-l-lg border-y border-l"
            >-</button>
            <input
              type="text"
              value={buttonVars.buttonBorderWidth}
              onChange={(e) => setButtonVars({...buttonVars, buttonBorderWidth: e.target.value})}
              className="w-full px-2 py-2 border-y text-center text-sm"
            />
            <button
              onClick={() => setButtonVars({...buttonVars, buttonBorderWidth: (parseInt(buttonVars.buttonBorderWidth) + 1) + 'px'})}
              className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-r-lg border-y border-r"
            >+</button>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-gray-500 mb-1">Border Color</label>
        <div className="flex gap-2">
          <input 
            type="color" 
            value={buttonVars.buttonBorderColor} 
            onChange={(e) => setButtonVars({...buttonVars, buttonBorderColor: e.target.value})}
            className="w-8 h-8 rounded border-0 cursor-pointer" 
          />
          <input 
            type="text" 
            value={buttonVars.buttonBorderColor} 
            onChange={(e) => setButtonVars({...buttonVars, buttonBorderColor: e.target.value})}
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Text Size</label>
          <div className="flex items-center">
            <button
              onClick={() => setButtonVars({...buttonVars, buttonTextFontSize: (parseInt(buttonVars.buttonTextFontSize) - 1) + 'px'})}
              className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-l-lg border-y border-l"
            >-</button>
            <input
              type="text"
              value={buttonVars.buttonTextFontSize}
              onChange={(e) => setButtonVars({...buttonVars, buttonTextFontSize: e.target.value})}
              className="w-full px-2 py-2 border-y text-center text-sm"
            />
            <button
              onClick={() => setButtonVars({...buttonVars, buttonTextFontSize: (parseInt(buttonVars.buttonTextFontSize) + 1) + 'px'})}
              className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-r-lg border-y border-r"
            >+</button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Text Weight</label>
          <div className="flex items-center">
            <button
              onClick={() => setButtonVars({...buttonVars, buttonTextFontWeight: (parseInt(buttonVars.buttonTextFontWeight) - 100).toString()})}
              className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-l-lg border-y border-l"
            >-</button>
            <input
              type="text"
              value={buttonVars.buttonTextFontWeight}
              onChange={(e) => setButtonVars({...buttonVars, buttonTextFontWeight: e.target.value})}
              className="w-full px-2 py-2 border-y text-center text-sm"
            />
            <button
              onClick={() => setButtonVars({...buttonVars, buttonTextFontWeight: (parseInt(buttonVars.buttonTextFontWeight) + 100).toString()})}
              className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-r-lg border-y border-r"
            >+</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrencySection = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">Transaction Currency</label>
        <select 
          value={currency} 
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        >
          {currencies.map(c => (
            <option key={c.code} value={c.code}>
              {c.code} - {c.name} ({c.symbol})
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-2">
          Changing currency will reload the SDK with payment methods that support {currency}
        </p>
      </div>
    </div>
  );

  const renderLanguageSection = () => (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">Locale</label>
      <select 
        value={locale} 
        onChange={(e) => setLocale(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm"
      >
        {locales.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
      <p className="text-sm text-gray-500 mt-2">
        The SDK will auto-detect the browser locale if set to "Auto-detect"
      </p>
    </div>
  );

  const renderMoreSection = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">Branding</label>
        <select 
          value={moreConfig.branding} 
          onChange={(e) => setMoreConfig({...moreConfig, branding: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        >
          <option value="always">Always Show</option>
          <option value="never">Never Show</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">Payment Methods Header</label>
        <input 
          type="text" 
          value={moreConfig.paymentMethodsHeaderText} 
          onChange={(e) => setMoreConfig({...moreConfig, paymentMethodsHeaderText: e.target.value})}
          placeholder="Select Payment Method"
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">Saved Methods Header</label>
        <input 
          type="text" 
          value={moreConfig.savedPaymentMethodsHeaderText} 
          onChange={(e) => setMoreConfig({...moreConfig, savedPaymentMethodsHeaderText: e.target.value})}
          placeholder="Saved Payment Methods"
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">Payment Method Order</label>
        <input
          type="text"
          value={selectedPaymentMethods.join(', ')}
          onChange={(e) => {
            const value = e.target.value;
            if (typeof value === 'string') {
              const values = value.split(',').map(s => s.trim()).filter(s => s);
              setSelectedPaymentMethods(values);
            }
          }}
          className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
        />
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          <p>Enter comma-separated payment method IDs. Card must be first.</p>
          <p className="font-medium text-gray-600">Available methods:</p>
          <p className="font-mono text-gray-400">card, klarna, affirm, givex, paypal, google_pay, apple_pay, ideal, sepa_debit, sofort, bancontact, afterpay, alipay, wechat, ach_debit, paysafecard</p>
        </div>
      </div>
      
      <div className="space-y-2 pt-2 border-t">
        <label className="flex items-center justify-between py-1">
          <span className="text-sm">Hide Card Nickname</span>
          <input 
            type="checkbox" 
            checked={moreConfig.hideCardNicknameField} 
            onChange={(e) => setMoreConfig({...moreConfig, hideCardNicknameField: e.target.checked})}
            className="w-4 h-4 rounded" 
          />
        </label>
        <label className="flex items-center justify-between py-1">
          <span className="text-sm">Hide Expired Methods</span>
          <input 
            type="checkbox" 
            checked={moreConfig.hideExpiredPaymentMethods} 
            onChange={(e) => setMoreConfig({...moreConfig, hideExpiredPaymentMethods: e.target.checked})}
            className="w-4 h-4 rounded" 
          />
        </label>
        <label className="flex items-center justify-between py-1">
          <span className="text-sm">Display Saved Methods</span>
          <input 
            type="checkbox" 
            checked={moreConfig.displaySavedPaymentMethods} 
            onChange={(e) => setMoreConfig({...moreConfig, displaySavedPaymentMethods: e.target.checked})}
            className="w-4 h-4 rounded" 
          />
        </label>
        <label className="flex items-center justify-between py-1">
          <span className="text-sm">Show Save Checkbox</span>
          <input 
            type="checkbox" 
            checked={moreConfig.displaySavedPaymentMethodsCheckbox} 
            onChange={(e) => setMoreConfig({...moreConfig, displaySavedPaymentMethodsCheckbox: e.target.checked})}
            className="w-4 h-4 rounded" 
          />
        </label>
        <label className="flex items-center justify-between py-1">
          <span className="text-sm">Checkbox Checked by Default</span>
          <input 
            type="checkbox" 
            checked={moreConfig.savedPaymentMethodsCheckboxCheckedByDefault} 
            onChange={(e) => setMoreConfig({...moreConfig, savedPaymentMethodsCheckboxCheckedByDefault: e.target.checked})}
            className="w-4 h-4 rounded" 
          />
        </label>
      </div>
    </div>
  );

  const renderRulesSection = () => (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-2">Custom CSS rules for granular styling (CSS property names in camelCase)</p>
      
      {Object.entries(rules).map(([selector, styles]) => (
        <div key={selector} className="border rounded-lg p-3 bg-white">
          <p className="text-sm font-medium text-gray-700 mb-2">{selector}</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(styles).map(([prop, value]) => (
              <div key={prop}>
                <label className="block text-xs text-gray-500 mb-1">{prop}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setRules({
                    ...rules,
                    [selector]: { ...styles, [prop]: e.target.value }
                  })}
                  placeholder="e.g., #0066FF"
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTermsSection = () => (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-2">Configure when to display terms for each payment method</p>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(terms).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm text-gray-600 mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
            <select
              value={value}
              onChange={(e) => setTerms({...terms, [key]: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              {termOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );

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
        <div className="w-[28rem] flex flex-col bg-white border-r">
          <div className="p-3 border-b bg-gray-50">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Settings size={16} />
              SDK Customization
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">100+ options to customize your checkout</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div>
              <SectionHeader title="Layout" icon={Layout} section="layout" />
              {expandedSections.layout && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  {renderLayoutSection()}
                </div>
              )}
            </div>

            <div>
              <SectionHeader title="Wallets" icon={Wallet} section="wallets" />
              {expandedSections.wallets && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  {renderWalletSection()}
                </div>
              )}
            </div>

            <div>
              <SectionHeader title="Appearance" icon={Palette} section="appearance" />
              {expandedSections.appearance && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  {renderAppearanceSection()}
                </div>
              )}
            </div>

            <div>
              <SectionHeader title="Currency" icon={CreditCard} section="currency" />
              {expandedSections.currency && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  {renderCurrencySection()}
                </div>
              )}
            </div>

            <div>
              <SectionHeader title="Language" icon={Languages} section="language" />
              {expandedSections.language && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  {renderLanguageSection()}
                </div>
              )}
            </div>

            <div>
              <SectionHeader title="More Configurations" icon={Settings} section="more" />
              {expandedSections.more && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  {renderMoreSection()}
                </div>
              )}
            </div>

            <div>
              <SectionHeader title="CSS Rules" icon={Code} section="rules" />
              {expandedSections.rules && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  {renderRulesSection()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 flex flex-col">
          <div className="p-4 border-b bg-white flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <Eye size={18} />
              Live Preview
            </h3>
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Code size={14} />
              {showCode ? 'Hide Code' : 'View Code'}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
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
              <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-2xl mx-auto" key={currency}>
                <div id="sdk-customization-payment-element" className="bg-white rounded-lg border border-gray-200 p-4" />

                {clientSecret && (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Pay {currencies.find(c => c.code === currency)?.symbol}${(6500 / 100).toFixed(2)}
                  </button>
                )}

                {showCode && (
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">JavaScript</span>
                      <button
                        onClick={copyCode}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      <code>{generateCode()}</code>
                    </pre>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDKCustomization;
