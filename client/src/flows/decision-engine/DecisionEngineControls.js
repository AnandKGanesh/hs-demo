import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import {
  PAYMENT_METHODS,
  LOCALSTORAGE_SUCCESS_CARD_KEY,
  LOCALSTORAGE_FAILURE_CARD_KEY,
  DEFAULT_EXPLORATION_PERCENT,
  DEFAULT_BUCKET_SIZE,
  DEFAULT_NUMBER_OF_BATCHES,
  DEFAULT_BATCH_SIZE,
  DEFAULT_FAILURE_PERCENTAGE,
} from './deConstants';

const loadGlobalCardDetailsFromStorage = () => {
  const loaded = {};
  if (typeof window !== 'undefined' && typeof localStorage?.getItem === 'function') {
    try {
      const storedSuccess = localStorage.getItem(LOCALSTORAGE_SUCCESS_CARD_KEY);
      if (storedSuccess) {
        const parsed = JSON.parse(storedSuccess);
        loaded.successCardNumber = parsed.cardNumber;
        loaded.successCardExpMonth = parsed.expMonth;
        loaded.successCardExpYear = parsed.expYear;
        loaded.successCardHolderName = parsed.holderName;
        loaded.successCardCvc = parsed.cvc;
      }
      const storedFailure = localStorage.getItem(LOCALSTORAGE_FAILURE_CARD_KEY);
      if (storedFailure) {
        const parsed = JSON.parse(storedFailure);
        loaded.failureCardNumber = parsed.cardNumber;
        loaded.failureCardExpMonth = parsed.expMonth;
        loaded.failureCardExpYear = parsed.expYear;
        loaded.failureCardHolderName = parsed.holderName;
        loaded.failureCardCvc = parsed.cvc;
      }
    } catch (e) {
      console.error('Error loading card details from localStorage', e);
    }
  }
  return loaded;
};

const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const DecisionEngineControls = ({
  onFormChange,
  onRoutingParamsChange,
  initialValues,
  merchantConnectors,
  connectorToggleStates,
  onConnectorToggleChange,
  activeTab = 'general',
}) => {
  const [formData, setFormData] = useState({
    totalPayments: 100,
    selectedPaymentMethods: [...PAYMENT_METHODS],
    processorMatrix: {},
    processorIncidents: {},
    processorWiseSuccessRates: {},
    isSuccessBasedRoutingEnabled: true,
    connectorWiseFailurePercentage: {},
    connectorWiseTestCards: {},
    explorationPercent: DEFAULT_EXPLORATION_PERCENT,
    bucketSize: DEFAULT_BUCKET_SIZE,
    selectedRoutingParams: {
      PaymentMethod: true,
      PaymentMethodType: true,
      AuthenticationType: true,
      Currency: true,
      Country: true,
      CardNetwork: true,
      CardBin: true,
    },
    numberOfBatches: DEFAULT_NUMBER_OF_BATCHES,
    batchSize: DEFAULT_BATCH_SIZE,
    ...initialValues,
  });

  const [expandedConnectors, setExpandedConnectors] = useState({});
  const routingParamsDebounceRef = useRef(null);

  const dynamicDefaults = useMemo(() => {
    const matrix = {};
    const incidents = {};
    const rates = {};
    const connectorWiseFailurePercentage = {};
    const connectorWiseTestCardsInit = {};

    const globalStoredCards = loadGlobalCardDetailsFromStorage();

    (merchantConnectors || []).forEach((connector) => {
      const key = connector.merchant_connector_id || connector.connector_name;
      matrix[key] = PAYMENT_METHODS.reduce((acc, method) => {
        acc[method] = false;
        return acc;
      }, {});
      incidents[key] = null;
      rates[key] = {
        sr: 0,
        srDeviation: 5,
        volumeShare: 0,
        successfulPaymentCount: 0,
        totalPaymentCount: 0,
      };
      if (connector.disabled === false) {
        connectorWiseFailurePercentage[connector.connector_name] = DEFAULT_FAILURE_PERCENTAGE;
      }
      connectorWiseTestCardsInit[key] = {
        successCard: {
          cardNumber: globalStoredCards.successCardNumber || '4242424242424242',
          expMonth: globalStoredCards.successCardExpMonth || '10',
          expYear: globalStoredCards.successCardExpYear || '27',
          holderName: globalStoredCards.successCardHolderName || 'Joseph Doe',
          cvc: globalStoredCards.successCardCvc || '123',
        },
        failureCard: {
          cardNumber: globalStoredCards.failureCardNumber || '4000000000000002',
          expMonth: globalStoredCards.failureCardExpMonth || '12',
          expYear: globalStoredCards.failureCardExpYear || '26',
          holderName: globalStoredCards.failureCardHolderName || 'Jane Roe',
          cvc: globalStoredCards.failureCardCvc || '999',
        },
      };
    });

    return { matrix, incidents, rates, connectorWiseFailurePercentage, connectorWiseTestCardsInit };
  }, [merchantConnectors]);

  useEffect(() => {
    if (merchantConnectors && merchantConnectors.length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
        processorMatrix: dynamicDefaults.matrix,
        processorIncidents: dynamicDefaults.incidents,
        processorWiseSuccessRates: dynamicDefaults.rates,
        connectorWiseFailurePercentage: {
          ...dynamicDefaults.connectorWiseFailurePercentage,
          ...(initialValues?.connectorWiseFailurePercentage || {}),
          ...(prev.connectorWiseFailurePercentage || {}),
        },
        connectorWiseTestCards: dynamicDefaults.connectorWiseTestCardsInit,
      }));
    }
  }, [merchantConnectors, dynamicDefaults, initialValues]);

  useEffect(() => {
    const total = formData.numberOfBatches * formData.batchSize;
    setFormData((prev) => ({ ...prev, totalPayments: total }));
  }, [formData.numberOfBatches, formData.batchSize]);

  const triggerRoutingParamsUpdate = useCallback(
    (explorationPercent, bucketSize) => {
      if (routingParamsDebounceRef.current) {
        clearTimeout(routingParamsDebounceRef.current);
      }
      routingParamsDebounceRef.current = setTimeout(() => {
        if (onRoutingParamsChange) {
          onRoutingParamsChange(explorationPercent, bucketSize);
        }
      }, 800);
    },
    [onRoutingParamsChange]
  );

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      onFormChange(newData);
      return newData;
    });
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value,
        },
      };
      onFormChange(newData);
      return newData;
    });
  };

  const handleDeepNestedChange = (parent, connector, type, field, value) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [parent]: {
          ...prev[parent],
          [connector]: {
            ...prev[parent][connector],
            [type]: {
              ...prev[parent][connector]?.[type],
              [field]: value,
            },
          },
        },
      };
      onFormChange(newData);
      return newData;
    });
  };

  const handleSuccessBasedRoutingToggle = (enabled) => {
    handleInputChange('isSuccessBasedRoutingEnabled', enabled);
  };

  const toggleConnectorAccordion = (connectorId) => {
    setExpandedConnectors((prev) => ({
      ...prev,
      [connectorId]: !prev[connectorId],
    }));
  };

  const calculatedTotal = formData.numberOfBatches * formData.batchSize;

  const payloadExample = `{\n  "amount": 6540,\n  "currency": "USD",\n  "confirm": true,\n  "profile_id": "YOUR_PROFILE_ID",\n  "capture_method": "automatic",\n  "authentication_type": "no_three_ds",\n  "customer": {\n    "id": "cus_sim_TIMESTAMP_INDEX",\n    "name": "John Doe",\n    "email": "customer@example.com",\n    "phone": "9999999999",\n    "phone_country_code": "+1"\n  },\n  "payment_method": "card",\n  "payment_method_type": "credit",\n  "payment_method_data": {\n    "card": {\n      "card_number": "SUCCESS_OR_FAILURE_CARD_NUMBER",\n      "card_exp_month": "SUCCESS_OR_FAILURE_EXP_MONTH",\n      "card_exp_year": "SUCCESS_OR_FAILURE_EXP_YEAR",\n      "card_holder_name": "SUCCESS_OR_FAILURE_HOLDER_NAME",\n      "card_cvc": "SUCCESS_OR_FAILURE_CVC"\n    },\n    "billing": {\n      "address": {\n        "line1": "1467",\n        "line2": "Harrison Street",\n        "line3": "Harrison Street",\n        "city": "San Francisco",\n        "state": "California",\n        "zip": "94122",\n        "country": "US",\n        "first_name": "Joseph",\n        "last_name": "Doe"\n      },\n      "phone": {\n        "number": "8056594427",\n        "country_code": "+91"\n      },\n      "email": "guest@example.com"\n    }\n  }\n}`;

  const copyPayloadToClipboard = () => {
    navigator.clipboard.writeText(payloadExample);
  };

  const renderGeneralTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Total Payments (Calculated)
        </label>
        <input
          type="number"
          value={calculatedTotal}
          disabled
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formData.numberOfBatches} batches × {formData.batchSize} payments/batch = {calculatedTotal} total
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Number of Batches
        </label>
        <input
          type="number"
          value={formData.numberOfBatches}
          onChange={(e) => handleInputChange('numberOfBatches', parseInt(e.target.value) || 0)}
          placeholder="e.g., 100"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Batch Size
        </label>
        <input
          type="number"
          value={formData.batchSize}
          onChange={(e) => handleInputChange('batchSize', parseInt(e.target.value) || 0)}
          placeholder="e.g., 10"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Payment Methods
        </label>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked disabled className="rounded" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Card (Selected by default)</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Currently, Card is the only enabled payment method.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 p-4 w-full overflow-x-auto">
        <div className="text-sm font-semibold mb-2 flex items-center justify-between">
          <span>Payment Request Payload (Example)</span>
          <button
            type="button"
            onClick={copyPayloadToClipboard}
            className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-500"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <div className="h-80 overflow-y-auto">
          <pre className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all text-gray-800 dark:text-gray-100">
            {payloadExample}
          </pre>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          This is an example of the payload sent to the /payments API.
        </div>
      </div>
    </div>
  );

  const renderProcessorsTab = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-2 flex flex-col flex-grow">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Processor Toggle</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Enable/disable connectors for simulation</p>
      </div>
      <div className="flex flex-col gap-2">
        {(merchantConnectors || []).map((connector) => {
          const connectorId = connector.merchant_connector_id || connector.connector_name;
          const connectorDisplayName = connector.connector_name;
          return (
            <div key={connectorId} className="border border-gray-200 dark:border-gray-600 p-2 rounded-md flex items-center justify-between">
              <label htmlFor={`toggle-pm-${connectorId}`} className="font-medium text-sm text-gray-700 dark:text-gray-300 truncate" title={connectorDisplayName}>
                {connectorDisplayName}
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id={`toggle-pm-${connectorId}`}
                  checked={connectorToggleStates[connectorId] ?? false}
                  onChange={(e) => onConnectorToggleChange(connectorId, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          );
        })}
        {(!merchantConnectors || merchantConnectors.length === 0) && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No connectors available. Please configure API credentials.</p>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Toggle connectors on/off. This status is reflected in the simulation.
      </p>
    </div>
  );

  const renderRoutingTab = () => (
    <div className="flex flex-col gap-6">
      <div>
        <div className="pb-3">
          <div className="flex items-center">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Routing Parameters</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
            Select and configure intelligent routing strategies.
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
          <div className="flex flex-row items-center justify-between">
            <label className="text-base font-normal text-gray-700 dark:text-gray-300">
              Success Based Routing
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isSuccessBasedRoutingEnabled || false}
                onChange={(e) => handleSuccessBasedRoutingToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
        {formData.isSuccessBasedRoutingEnabled && (
          <div className="flex flex-col gap-4 border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
            <div>
              <label className="text-xs text-gray-700 dark:text-gray-300 mb-1 block">
                Exploration Percent: {formData.explorationPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={formData.explorationPercent}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  handleInputChange('explorationPercent', value);
                  triggerRoutingParamsUpdate(value, formData.bucketSize);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Percentage of traffic for exploring new routes.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">
                Success Rate Window Parameters
              </h4>
              <div>
                <label className="text-xs text-gray-700 dark:text-gray-300 mb-1 block">Bucket Size</label>
                <input
                  type="number"
                  value={formData.bucketSize}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    handleInputChange('bucketSize', value);
                    triggerRoutingParamsUpdate(formData.explorationPercent, value);
                  }}
                  min="0"
                  placeholder="e.g., 30"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Bucket size for SR calculation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
        <div className="mb-2">
          <span className="text-base font-medium text-gray-900 dark:text-white">Routing Parameters</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Select parameters to consider for routing decisions.
        </div>
        <div className="flex flex-col gap-3 pt-2">
          {[
            'PaymentMethod',
            'PaymentMethodType',
            'AuthenticationType',
            'Currency',
            'Country',
            'CardNetwork',
            'CardBin',
          ].map((param) => (
            <div key={param} className="flex flex-row items-center space-x-2">
              <input
                type="checkbox"
                id={`routing-param-${param}`}
                checked={formData.selectedRoutingParams?.[param] || false}
                onChange={(e) =>
                  handleNestedChange('selectedRoutingParams', param, e.target.checked)
                }
                className="rounded"
              />
              <label
                htmlFor={`routing-param-${param}`}
                className="text-base font-normal cursor-pointer text-gray-700 dark:text-gray-300"
              >
                {param.replace(/([A-Z])/g, ' $1').trim()}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTestPaymentDataTab = () => (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Connector Failure Percentages
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Set the likelihood of a transaction failing for each connector.
          </p>
        </div>
        <div className="p-4 space-y-4">
          {(merchantConnectors || [])
            .filter((connector) => connector.disabled === false)
            .map((connector) => {
              const connectorId = connector.connector_name;
              const watchedFailureRate = formData.connectorWiseFailurePercentage?.[connectorId] ?? 0;

              return (
                <div key={connectorId}>
                  <label className="text-sm text-gray-700 dark:text-gray-300 block mb-1">
                    {connector.connector_name} Failure Rate: {watchedFailureRate}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={watchedFailureRate}
                    onChange={(e) =>
                      handleNestedChange(
                        'connectorWiseFailurePercentage',
                        connectorId,
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
              );
            })}
          {(!merchantConnectors || merchantConnectors.length === 0) && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No connectors loaded to configure failure percentages.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Connector-Specific Test Cards
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Configure test card details for each connector.
          </p>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {(merchantConnectors || []).map((connector) => {
              const connectorId = connector.connector_name;
              const isExpanded = expandedConnectors[connectorId];

              return (
                <div key={connectorId} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => toggleConnectorAccordion(connectorId)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{connector.connector_name}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="p-3 space-y-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="space-y-3 border border-gray-200 dark:border-gray-600 p-3 rounded-md bg-green-50/50 dark:bg-green-900/20">
                        <h4 className="text-sm font-semibold text-green-600">Success Card</h4>
                        <div>
                          <label className="text-xs text-gray-700 dark:text-gray-300 block mb-1">Name on card</label>
                          <input
                            type="text"
                            value={formData.connectorWiseTestCards?.[connectorId]?.successCard?.holderName || ''}
                            onChange={(e) =>
                              handleDeepNestedChange(
                                'connectorWiseTestCards',
                                connectorId,
                                'successCard',
                                'holderName',
                                e.target.value
                              )
                            }
                            placeholder="Default: Joseph Doe"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-700 dark:text-gray-300 block mb-1">Card number</label>
                          <input
                            type="text"
                            value={formatCardNumber(
                              formData.connectorWiseTestCards?.[connectorId]?.successCard?.cardNumber || ''
                            )}
                            onChange={(e) =>
                              handleDeepNestedChange(
                                'connectorWiseTestCards',
                                connectorId,
                                'successCard',
                                'cardNumber',
                                formatCardNumber(e.target.value)
                              )
                            }
                            maxLength={19}
                            placeholder="Default: 4242..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-700 dark:text-gray-300 block mb-1">MM</label>
                            <input
                              type="text"
                              value={formData.connectorWiseTestCards?.[connectorId]?.successCard?.expMonth || ''}
                              onChange={(e) =>
                                handleDeepNestedChange(
                                  'connectorWiseTestCards',
                                  connectorId,
                                  'successCard',
                                  'expMonth',
                                  e.target.value
                                )
                              }
                              maxLength={2}
                              placeholder="10"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-700 dark:text-gray-300 block mb-1">YY</label>
                            <input
                              type="text"
                              value={formData.connectorWiseTestCards?.[connectorId]?.successCard?.expYear || ''}
                              onChange={(e) =>
                                handleDeepNestedChange(
                                  'connectorWiseTestCards',
                                  connectorId,
                                  'successCard',
                                  'expYear',
                                  e.target.value
                                )
                              }
                              maxLength={2}
                              placeholder="27"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-700 dark:text-gray-300 block mb-1">CVC</label>
                          <input
                            type="text"
                            value={formData.connectorWiseTestCards?.[connectorId]?.successCard?.cvc || ''}
                            onChange={(e) =>
                              handleDeepNestedChange(
                                'connectorWiseTestCards',
                                connectorId,
                                'successCard',
                                'cvc',
                                e.target.value
                              )
                            }
                            maxLength={4}
                            placeholder="123"
                            className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 border border-gray-200 dark:border-gray-600 p-3 rounded-md bg-red-50/50 dark:bg-red-900/20">
                        <h4 className="text-sm font-semibold text-red-600">Failure Card</h4>
                        <div>
                          <label className="text-xs text-gray-700 dark:text-gray-300 block mb-1">Name on card</label>
                          <input
                            type="text"
                            value={formData.connectorWiseTestCards?.[connectorId]?.failureCard?.holderName || ''}
                            onChange={(e) =>
                              handleDeepNestedChange(
                                'connectorWiseTestCards',
                                connectorId,
                                'failureCard',
                                'holderName',
                                e.target.value
                              )
                            }
                            placeholder="Default: Jane Roe"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-700 dark:text-gray-300 block mb-1">Card number</label>
                          <input
                            type="text"
                            value={formatCardNumber(
                              formData.connectorWiseTestCards?.[connectorId]?.failureCard?.cardNumber || ''
                            )}
                            onChange={(e) =>
                              handleDeepNestedChange(
                                'connectorWiseTestCards',
                                connectorId,
                                'failureCard',
                                'cardNumber',
                                formatCardNumber(e.target.value)
                              )
                            }
                            maxLength={19}
                            placeholder="Default: 4000..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-700 dark:text-gray-300 block mb-1">MM</label>
                            <input
                              type="text"
                              value={formData.connectorWiseTestCards?.[connectorId]?.failureCard?.expMonth || ''}
                              onChange={(e) =>
                                handleDeepNestedChange(
                                  'connectorWiseTestCards',
                                  connectorId,
                                  'failureCard',
                                  'expMonth',
                                  e.target.value
                                )
                              }
                              maxLength={2}
                              placeholder="12"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-700 dark:text-gray-300 block mb-1">YY</label>
                            <input
                              type="text"
                              value={formData.connectorWiseTestCards?.[connectorId]?.failureCard?.expYear || ''}
                              onChange={(e) =>
                                handleDeepNestedChange(
                                  'connectorWiseTestCards',
                                  connectorId,
                                  'failureCard',
                                  'expYear',
                                  e.target.value
                                )
                              }
                              maxLength={2}
                              placeholder="26"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-700 dark:text-gray-300 block mb-1">CVC</label>
                          <input
                            type="text"
                            value={formData.connectorWiseTestCards?.[connectorId]?.failureCard?.cvc || ''}
                            onChange={(e) =>
                              handleDeepNestedChange(
                                'connectorWiseTestCards',
                                connectorId,
                                'failureCard',
                                'cvc',
                                e.target.value
                              )
                            }
                            maxLength={4}
                            placeholder="999"
                            className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm z-20 min-w-[300px] w-80 p-4 overflow-y-auto">
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'processors' && renderProcessorsTab()}
        {activeTab === 'routing' && renderRoutingTab()}
        {activeTab === 'test-payment-data' && renderTestPaymentDataTab()}
      </div>
    </div>
  );
};

export default DecisionEngineControls;
