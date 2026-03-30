import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Pause, Square, Loader2, Settings, BarChart3, Activity, CreditCard } from 'lucide-react';
import DecisionEngineControls from './DecisionEngineControls';
import DecisionEngineStats from './DecisionEngineStats';
import DecisionEngineCharts from './DecisionEngineCharts';
import {
  LOCALSTORAGE_API_KEY,
  LOCALSTORAGE_PROFILE_ID,
  LOCALSTORAGE_MERCHANT_ID,
  LOCALSTORAGE_ROUTING_ID,
  LOCALSTORAGE_BASE_URL,
  DEFAULT_BASE_URL,
} from './deConstants';

const safeLocalStorage = {
  getItem: (key) => {
    if (typeof window === 'undefined') return null;
    if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') return null;
    return localStorage.getItem(key);
  },
  setItem: (key, value) => {
    if (typeof window === 'undefined') return;
    if (typeof localStorage === 'undefined' || typeof localStorage.setItem !== 'function') return;
    localStorage.setItem(key, value);
  },
};

const DecisionEnginePlayground = () => {
  const [currentControls, setCurrentControls] = useState(null);
  const [simulationState, setSimulationState] = useState('idle');
  const [processedPaymentsCount, setProcessedPaymentsCount] = useState(0);
  const [successRateHistory, setSuccessRateHistory] = useState([]);
  const [volumeHistory, setVolumeHistory] = useState([]);
  const [overallSuccessRateHistory, setOverallSuccessRateHistory] = useState([]);
  const [isApiCredentialsModalOpen, setIsApiCredentialsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [profileId, setProfileId] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [merchantConnectors, setMerchantConnectors] = useState([]);
  const [connectorToggleStates, setConnectorToggleStates] = useState({});
  const [isLoadingMerchantConnectors, setIsLoadingMerchantConnectors] = useState(false);
  const [transactionLogs, setTransactionLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('general');
  const [contentTab, setContentTab] = useState('stats');

  const apiCallAbortControllerRef = useRef(null);
  const isStoppingRef = useRef(false);
  const isProcessingBatchRef = useRef(false);
  const accumulatedProcessorStatsRef = useRef({});
  const accumulatedGlobalStatsRef = useRef({ totalSuccessful: 0, totalFailed: 0 });
  const transactionCounterRef = useRef(0);
  const routingParamsDebounceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedApiKey = safeLocalStorage.getItem(LOCALSTORAGE_API_KEY);
      const storedProfileId = safeLocalStorage.getItem(LOCALSTORAGE_PROFILE_ID);
      const storedMerchantId = safeLocalStorage.getItem(LOCALSTORAGE_MERCHANT_ID);
      const storedBaseUrl = safeLocalStorage.getItem(LOCALSTORAGE_BASE_URL);

      if (storedApiKey) setApiKey(storedApiKey);
      if (storedProfileId) setProfileId(storedProfileId);
      if (storedMerchantId) setMerchantId(storedMerchantId);
      if (storedBaseUrl) setBaseUrl(storedBaseUrl);

      setIsApiCredentialsModalOpen(true);
    }
  }, []);

  const showToast = (title, description, variant = 'default') => {
    console.log(`[${variant.toUpperCase()}] ${title}: ${description}`);
  };

  const activateRoutingAlgorithm = useCallback(
    async (routingAlgoId) => {
      try {
        const response = await fetch(`/api/de-proxy/routing/${routingAlgoId}/activate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-base-url': baseUrl,
            'x-api-key': safeLocalStorage.getItem(LOCALSTORAGE_API_KEY) || '',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to activate routing algorithm.' }));
          showToast('Routing Activation Error', errorData.message || `HTTP ${response.status}`, 'destructive');
          return false;
        } else {
          showToast('Routing Algorithm Activated', 'Routing algorithm activated successfully.');
          return true;
        }
      } catch (error) {
        showToast('Routing Activation Network Error', error.message, 'destructive');
        return false;
      }
    },
    [baseUrl]
  );

  const setVolumeSplit = useCallback(
    async (currentMerchantId, currentProfileId, currentApiKey, currentBaseUrl) => {
      if (!currentMerchantId || !currentProfileId || !currentApiKey) {
        showToast('Error', 'Merchant ID, Profile ID and API Key are required to set volume split.', 'destructive');
        return;
      }
      try {
        const response = await fetch(
          `${currentBaseUrl}/account/${currentMerchantId}/business_profile/${currentProfileId}/dynamic_routing/set_volume_split?split=100`,
          {
            method: 'POST',
            headers: {
              'api-key': currentApiKey,
            },
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to set volume split.' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        showToast('Success', 'Volume split set.');
      } catch (error) {
        showToast('Failed to Set Volume Split', error.message, 'destructive');
      }
    },
    []
  );

  const updateRuleConfiguration = useCallback(
    async (currentMerchantId, currentProfileId, explorationPercent, bucketSize, toggleRoutingId) => {
      if (!currentProfileId) {
        console.warn('[updateRuleConfiguration] Missing profileId.');
        return;
      }

      const payload = {
        decision_engine_configs: {
          defaultLatencyThreshold: 90,
          defaultSuccessRate: 100,
          defaultBucketSize: 200,
          defaultHedgingPercent: 5,
          subLevelInputConfig: [
            {
              paymentMethod: 'card',
              bucketSize: bucketSize,
              hedgingPercent: explorationPercent,
            },
          ],
        },
      };

      try {
        const response = await fetch(
          `/api/de-proxy/account/${currentMerchantId}/business_profile/${currentProfileId}/dynamic_routing/success_based/config/${toggleRoutingId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'x-base-url': baseUrl,
              'x-api-key': safeLocalStorage.getItem(LOCALSTORAGE_API_KEY) || '',
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to update rule configuration.' }));
          showToast('Rule Update Error', errorData.message || `HTTP ${response.status}`, 'destructive');
        } else {
          const responseData = await response.json();
          showToast('Rule Configuration Updated', 'Success Rate Configuration updated successfully.');

          if (responseData && responseData.id) {
            const storedApiKey = safeLocalStorage.getItem(LOCALSTORAGE_API_KEY) || '';
            await setVolumeSplit(currentMerchantId, currentProfileId, storedApiKey, baseUrl);
            await activateRoutingAlgorithm(responseData.id);
          }
        }
      } catch (error) {
        showToast('Rule Update Network Error', error.message, 'destructive');
      }
    },
    [baseUrl, activateRoutingAlgorithm, setVolumeSplit]
  );

  const handleRoutingParamsChange = useCallback(
    (explorationPercent, bucketSize) => {
      if (!merchantId || !profileId) {
        showToast('Credentials Missing', 'Enter API credentials first.', 'destructive');
        return;
      }
      const routingId = safeLocalStorage.getItem(LOCALSTORAGE_ROUTING_ID);
      if (!routingId) {
        showToast('Routing ID Missing', 'Enable Success Based Routing first.', 'destructive');
        return;
      }
      updateRuleConfiguration(merchantId, profileId, explorationPercent, bucketSize, routingId);
    },
    [merchantId, profileId, updateRuleConfiguration]
  );

  const decideGateway = useCallback(
    async (currentControls, activeConnectorLabels, currentProfileId, paymentId) => {
      if (!currentControls || activeConnectorLabels.length === 0 || !currentProfileId) {
        return { selectedConnector: null, routingApproach: 'unknown', srScores: undefined };
      }

      const formattedEligibleGateways = merchantConnectors
        .filter((mc) => {
          const connectorKey = mc.merchant_connector_id || mc.connector_name;
          const isActive = connectorToggleStates[connectorKey];
          const hasRequiredFields = mc.connector_name && mc.merchant_connector_id;
          return isActive && hasRequiredFields;
        })
        .map((mc) => `${mc.connector_name}:${mc.merchant_connector_id}`);

      const payload = {
        merchantId: currentProfileId,
        eligibleGatewayList: formattedEligibleGateways,
        rankingAlgorithm: 'SR_BASED_ROUTING',
        eliminationEnabled: false,
        paymentInfo: {
          paymentId: paymentId,
          amount: 1000,
          currency: 'USD',
          customerId: 'CUST12345',
          paymentType: 'ORDER_PAYMENT',
          paymentMethodType: 'credit',
          paymentMethod: 'card',
        },
      };

      try {
        const response = await fetch('/api/de-proxy/routing/evaluate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': safeLocalStorage.getItem(LOCALSTORAGE_API_KEY) || '',
            'x-base-url': safeLocalStorage.getItem(LOCALSTORAGE_BASE_URL) || DEFAULT_BASE_URL,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        let gatewayPriorityArray = [];
        if (data.gateway_priority_map && typeof data.gateway_priority_map === 'object' && !Array.isArray(data.gateway_priority_map)) {
          for (const gatewayName in data.gateway_priority_map) {
            if (Object.prototype.hasOwnProperty.call(data.gateway_priority_map, gatewayName)) {
              const score = data.gateway_priority_map[gatewayName];
              if (typeof score === 'number') {
                gatewayPriorityArray.push({ label: gatewayName, score: parseFloat(score.toFixed(2)) });
              }
            }
          }
        }

        let srScoresForLog = undefined;
        if (gatewayPriorityArray.length > 0) {
          srScoresForLog = gatewayPriorityArray.reduce((acc, item) => {
            acc[item.label] = item.score * 100;
            return acc;
          }, {});
        }

        const routingApproachForLog =
          data.routing_approach === 'SR_SELECTION_V3_ROUTING'
            ? 'exploitation'
            : data.routing_approach === 'SR_V3_HEDGING'
            ? 'exploration'
            : 'default';

        if (data.decided_gateway && srScoresForLog && srScoresForLog[data.decided_gateway] !== undefined) {
          return {
            selectedConnector: data.decided_gateway,
            routingApproach: routingApproachForLog,
            srScores: srScoresForLog,
          };
        } else if (data.decided_gateway) {
          return {
            selectedConnector: data.decided_gateway,
            routingApproach: routingApproachForLog,
            srScores: srScoresForLog,
          };
        } else {
          return { selectedConnector: null, routingApproach: routingApproachForLog, srScores: srScoresForLog };
        }
      } catch (error) {
        showToast('Decide Gateway Network Error', error.message, 'destructive');
        return { selectedConnector: null, routingApproach: 'unknown', srScores: undefined };
      }
    },
    [merchantConnectors, connectorToggleStates]
  );

  const updateGatewayScore = useCallback(
    async (currentProfileId, connectorNameForApi, paymentSuccessStatus, controls, paymentId) => {
      if (!currentProfileId || !connectorNameForApi) {
        console.warn('[UpdateSuccessRateWindow] Missing profileId or connectorName.');
        return;
      }
      if (!controls) {
        console.warn('[UpdateSuccessRateWindow] Missing controls data.');
        return;
      }

      const apiStatus = paymentSuccessStatus ? 'CHARGED' : 'FAILURE';
      const payload = {
        merchantId: currentProfileId,
        gateway: connectorNameForApi,
        gatewayReferenceId: null,
        status: apiStatus,
        paymentId: paymentId,
        enforceDynamicRoutingFailure: null,
      };

      try {
        await fetch('/api/de-proxy/routing/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': safeLocalStorage.getItem(LOCALSTORAGE_API_KEY) || '',
            'x-base-url': safeLocalStorage.getItem(LOCALSTORAGE_BASE_URL) || DEFAULT_BASE_URL,
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error('[UpdateSuccessRateWindow] Fetch Error:', error);
      }
    },
    []
  );

  const getCardDetailsForPayment = (currentControls, connectorNameToUse) => {
    let cardDetailsToUse;
    const randomNumber = Math.random() * 100;

    const failurePercentageForConnector = currentControls.connectorWiseFailurePercentage?.[connectorNameToUse];
    const effectiveFailurePercentage = typeof failurePercentageForConnector === 'number' ? failurePercentageForConnector : 0;

    const connectorCards = currentControls.connectorWiseTestCards?.[connectorNameToUse];

    if (randomNumber < effectiveFailurePercentage) {
      cardDetailsToUse = {
        card_number: connectorCards?.failureCard?.cardNumber || '4000000000000002',
        card_exp_month: connectorCards?.failureCard?.expMonth || '12',
        card_exp_year: connectorCards?.failureCard?.expYear || '26',
        card_holder_name: connectorCards?.failureCard?.holderName || 'Jane Roe',
        card_cvc: connectorCards?.failureCard?.cvc || '999',
      };
    } else {
      cardDetailsToUse = {
        card_number: connectorCards?.successCard?.cardNumber || '4242424242424242',
        card_exp_month: connectorCards?.successCard?.expMonth || '10',
        card_exp_year: connectorCards?.successCard?.expYear || '27',
        card_holder_name: connectorCards?.successCard?.holderName || 'Joseph Doe',
        card_cvc: connectorCards?.successCard?.cvc || '123',
      };
    }
    return cardDetailsToUse;
  };

  const processSinglePayment = useCallback(
    async (paymentIndex, signal) => {
      if (!currentControls || !apiKey || !profileId || !merchantId) {
        throw new Error('Missing required configuration');
      }

      const paymentId = `PAY${Math.floor(Math.random() * 100000)}_${paymentIndex}`;

      let connectorNameToUseForCardSR = '';
      let routingApproach = 'N/A';
      let returnedConnectorLabel = null;
      let srScores = undefined;

      const activeConnectorLabels = merchantConnectors
        .filter((mc) => connectorToggleStates[mc.merchant_connector_id || mc.connector_name])
        .map((mc) => mc.connector_name);

      if (currentControls.isSuccessBasedRoutingEnabled) {
        if (activeConnectorLabels.length > 0 && profileId && merchantId && apiKey) {
          const decisionResult = await decideGateway(currentControls, activeConnectorLabels, profileId, paymentId);
          returnedConnectorLabel = decisionResult.selectedConnector;
          routingApproach = decisionResult.routingApproach;
          srScores = decisionResult.srScores;

          if (returnedConnectorLabel) {
            const connectorNameFromLabel = returnedConnectorLabel.includes(':')
              ? returnedConnectorLabel.split(':')[0]
              : returnedConnectorLabel;

            const matchedConnector = merchantConnectors.find((mc) => mc.connector_name === connectorNameFromLabel);
            if (matchedConnector) {
              connectorNameToUseForCardSR = matchedConnector.connector_name;
            } else {
              if (activeConnectorLabels.length > 0) {
                connectorNameToUseForCardSR = activeConnectorLabels[0];
              }
            }
          } else {
            if (activeConnectorLabels.length > 0) {
              connectorNameToUseForCardSR = activeConnectorLabels[0];
            }
          }
        } else {
          if (activeConnectorLabels.length > 0) {
            connectorNameToUseForCardSR = activeConnectorLabels[0];
          }
        }
      }

      const cardDetailsForPayment = getCardDetailsForPayment(currentControls, connectorNameToUseForCardSR);

      const paymentData = {
        amount: 6540,
        payment_id: paymentId,
        currency: 'USD',
        confirm: true,
        profile_id: profileId,
        capture_method: 'automatic',
        authentication_type: 'no_three_ds',
        customer: {
          id: `cus_sim_${Date.now()}_${paymentIndex}`,
          name: 'John Doe',
          email: 'customer@example.com',
          phone: '9999999999',
          phone_country_code: '+1',
        },
        payment_method: 'card',
        payment_method_type: 'credit',
        payment_method_data: {
          card: cardDetailsForPayment,
          billing: {
            address: {
              line1: '1467',
              line2: 'Harrison Street',
              line3: 'Harrison Street',
              city: 'San Francisco',
              state: 'California',
              zip: '94122',
              country: 'US',
              first_name: 'Joseph',
              last_name: 'Doe',
            },
            phone: { number: '8056594427', country_code: '+91' },
            email: 'guest@example.com',
          },
        },
      };

      if (currentControls.isSuccessBasedRoutingEnabled && returnedConnectorLabel) {
        const connectorNameForRouting = returnedConnectorLabel.includes(':')
          ? returnedConnectorLabel.split(':')[0]
          : returnedConnectorLabel;

        const matchedConnectorForRoutingObject = merchantConnectors.find(
          (mc) => mc.connector_name === connectorNameForRouting
        );
        if (matchedConnectorForRoutingObject) {
          paymentData.routing = {
            type: 'single',
            data: {
              connector: matchedConnectorForRoutingObject.connector_name,
              merchant_connector_id: matchedConnectorForRoutingObject.merchant_connector_id,
            },
          };
        }
      }

      let isSuccess = false;
      let routedProcessorId = null;
      let logEntry = null;

      try {
        const response = await fetch(`${baseUrl}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'api-key': apiKey,
          },
          body: JSON.stringify(paymentData),
          signal,
        });

        const paymentStatusHeader = response.headers.get('x-simulation-payment-status');
        const connectorHeader = response.headers.get('x-simulation-payment-connector');
        const responseData = await response.json();

        isSuccess =
          response.ok &&
          (responseData.status === 'succeeded' ||
            responseData.status === 'requires_capture' ||
            responseData.status === 'processing');

        let rawConnectorName = connectorHeader || responseData.connector_name || responseData.merchant_connector_id || 'unknown';
        let displayConnectorName = rawConnectorName;

        if (rawConnectorName !== 'unknown') {
          if (rawConnectorName.includes(':')) {
            displayConnectorName = rawConnectorName.split(':')[0];
          } else {
            const foundConnector = merchantConnectors.find(
              (mc) => mc.merchant_connector_id === rawConnectorName || mc.connector_name === rawConnectorName
            );
            if (foundConnector) {
              displayConnectorName = foundConnector.connector_name;
            }
          }
        }

        let cleanedSrScores = undefined;
        if (srScores) {
          cleanedSrScores = {};
          Object.entries(srScores).forEach(([key, value]) => {
            const cleanKey = key.includes(':') ? key.split(':')[0] : key;
            cleanedSrScores[cleanKey] = value;
          });
        }

        if (paymentStatusHeader || responseData.status) {
          transactionCounterRef.current += 1;
          logEntry = {
            transactionNumber: transactionCounterRef.current,
            status: paymentStatusHeader || responseData.status,
            connector: displayConnectorName,
            timestamp: Date.now(),
            routingApproach,
            sr_scores: cleanedSrScores,
          };
        }

        if (responseData.connector_name) {
          const mc = merchantConnectors.find((m) => m.connector_name === responseData.connector_name);
          if (mc) routedProcessorId = mc.merchant_connector_id || mc.connector_name;
        } else if (responseData.merchant_connector_id) {
          routedProcessorId = responseData.merchant_connector_id;
        }

        if (!routedProcessorId && displayConnectorName !== 'unknown') {
          const mc = merchantConnectors.find((m) => m.connector_name === displayConnectorName);
          if (mc) routedProcessorId = mc.merchant_connector_id || mc.connector_name;
          else routedProcessorId = displayConnectorName;
        }

        if (merchantId && displayConnectorName !== 'unknown') {
          const foundConnector = merchantConnectors.find(
            (mc) => mc.connector_name === displayConnectorName || mc.merchant_connector_id === displayConnectorName
          );
          const connectorNameForUpdate = foundConnector
            ? `${foundConnector.connector_name}:${foundConnector.merchant_connector_id}`
            : displayConnectorName;
          await updateGatewayScore(profileId, connectorNameForUpdate, isSuccess, currentControls, paymentId);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error during payment API call:', error);
        }
        throw error;
      }

      return { isSuccess, routedProcessorId, logEntry };
    },
    [currentControls, apiKey, profileId, merchantId, merchantConnectors, connectorToggleStates, baseUrl, decideGateway, updateGatewayScore]
  );

  const processTransactionBatch = useCallback(async () => {
    if (isStoppingRef.current || simulationState !== 'running' || isProcessingBatchRef.current) {
      return;
    }

    isProcessingBatchRef.current = true;

    try {
      if (!currentControls || !apiKey || !profileId || !merchantId) {
        if (simulationState === 'running') {
          setSimulationState('paused');
          showToast('Credentials Missing', 'Enter API Key, Profile ID, and Merchant ID.', 'destructive');
        }
        return;
      }

      if (processedPaymentsCount >= currentControls.totalPayments) {
        if (!isStoppingRef.current) {
          isStoppingRef.current = true;
          setSimulationState('idle');
          showToast('Simulation Completed', `All ${currentControls.totalPayments} payments processed.`);
        }
        return;
      }

      apiCallAbortControllerRef.current = new AbortController();
      const { signal } = apiCallAbortControllerRef.current;

      const batchSize = currentControls.batchSize || 1;
      const remainingPayments = currentControls.totalPayments - processedPaymentsCount;
      const paymentsToProcessInBatch = Math.min(batchSize, remainingPayments);

      if (paymentsToProcessInBatch <= 0) {
        isProcessingBatchRef.current = false;
        return;
      }

      const batchIndices = Array.from({ length: paymentsToProcessInBatch }, (_, i) => processedPaymentsCount + i);
      let paymentsProcessedThisBatch = 0;
      let batchResults = [];
      const batchSpecificProcessorStats = {};

      try {
        batchResults = await Promise.all(
          batchIndices.map((paymentIndex) =>
            processSinglePayment(paymentIndex, signal).catch((error) => {
              if (error.name === 'AbortError') throw error;
              console.error(`Error processing payment ${paymentIndex}:`, error);
              return { isSuccess: false, routedProcessorId: null, logEntry: null };
            })
          )
        );

        if (isStoppingRef.current || signal.aborted) return;

        const newLogsForThisBatch = [];
        batchResults.forEach((result) => {
          if (result.logEntry) {
            newLogsForThisBatch.push(result.logEntry);
          }

          if (result.routedProcessorId) {
            if (!batchSpecificProcessorStats[result.routedProcessorId]) {
              batchSpecificProcessorStats[result.routedProcessorId] = { successful: 0, failed: 0 };
            }
            if (result.isSuccess) {
              batchSpecificProcessorStats[result.routedProcessorId].successful++;
            } else {
              batchSpecificProcessorStats[result.routedProcessorId].failed++;
            }
          }

          if (result.routedProcessorId) {
            if (!accumulatedProcessorStatsRef.current[result.routedProcessorId]) {
              accumulatedProcessorStatsRef.current[result.routedProcessorId] = {
                successful: 0,
                failed: 0,
                volumeShareRaw: 0,
              };
            }
            if (result.isSuccess) {
              accumulatedProcessorStatsRef.current[result.routedProcessorId].successful++;
            } else {
              accumulatedProcessorStatsRef.current[result.routedProcessorId].failed++;
            }
          }

          if (result.isSuccess) {
            accumulatedGlobalStatsRef.current.totalSuccessful++;
          } else {
            accumulatedGlobalStatsRef.current.totalFailed++;
          }

          paymentsProcessedThisBatch++;
        });

        if (newLogsForThisBatch.length > 0) {
          setTransactionLogs((prevLogs) => [...prevLogs, ...newLogsForThisBatch]);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Batch processing aborted');
          return;
        }
        console.error('Error in batch processing:', error);
      }

      if (paymentsProcessedThisBatch > 0) {
        setProcessedPaymentsCount((prev) => {
          const newTotalProcessed = prev + paymentsProcessedThisBatch;
          if (currentControls && newTotalProcessed >= currentControls.totalPayments && !isStoppingRef.current) {
            isStoppingRef.current = true;
            setSimulationState('idle');
            showToast('Simulation Completed', `All ${currentControls.totalPayments} payments processed.`);
          }
          return newTotalProcessed;
        });

        if (currentControls) {
          const currentTime = Date.now();
          const newSuccessRateDataPoint = { time: currentTime };
          const newVolumeDataPoint = { time: currentTime };

          merchantConnectors.forEach((connector) => {
            const key = connector.merchant_connector_id || connector.connector_name;

            const batchStats = batchSpecificProcessorStats[key] || { successful: 0, failed: 0 };
            const batchTotalForProcessor = batchStats.successful + batchStats.failed;
            newSuccessRateDataPoint[key] = batchTotalForProcessor > 0 ? (batchStats.successful / batchTotalForProcessor) * 100 : 0;

            const cumulativeStats = accumulatedProcessorStatsRef.current[key] || { successful: 0, failed: 0 };
            const cumulativeTotalForProcessor = cumulativeStats.successful + cumulativeStats.failed;
            newVolumeDataPoint[key] = cumulativeTotalForProcessor;
          });

          setSuccessRateHistory((prev) => [...prev, newSuccessRateDataPoint]);
          setVolumeHistory((prev) => [...prev, newVolumeDataPoint]);

          const totalProcessedOverall = accumulatedGlobalStatsRef.current.totalSuccessful + accumulatedGlobalStatsRef.current.totalFailed;
          const currentOverallSR = totalProcessedOverall > 0 ? (accumulatedGlobalStatsRef.current.totalSuccessful / totalProcessedOverall) * 100 : 0;
          setOverallSuccessRateHistory((prev) => [...prev, { time: currentTime, overallSR: currentOverallSR }]);

          setCurrentControls((prevControls) => {
            if (!prevControls) return prevControls;
            const newPwsr = { ...prevControls.processorWiseSuccessRates };
            let totalVolumeAcrossProcessors = 0;

            const allProcessorKeys = new Set([
              ...Object.keys(newPwsr),
              ...merchantConnectors.map((mc) => mc.merchant_connector_id || mc.connector_name),
              ...Object.keys(accumulatedProcessorStatsRef.current),
            ]);

            allProcessorKeys.forEach((procId) => {
              if (!newPwsr[procId]) {
                const connectorInfo = merchantConnectors.find((mc) => (mc.merchant_connector_id || mc.connector_name) === procId);
                newPwsr[procId] = {
                  sr: connectorInfo ? prevControls.processorWiseSuccessRates[procId]?.sr || 0 : 0,
                  srDeviation: prevControls.processorWiseSuccessRates[procId]?.srDeviation || 0,
                  volumeShare: 0,
                  successfulPaymentCount: 0,
                  totalPaymentCount: 0,
                };
              }
              const stats = accumulatedProcessorStatsRef.current[procId] || { successful: 0, failed: 0 };
              totalVolumeAcrossProcessors += stats.successful + stats.failed;
            });

            allProcessorKeys.forEach((procId) => {
              const currentProcessorStats = accumulatedProcessorStatsRef.current[procId] || { successful: 0, failed: 0 };
              const currentTotalForProcessor = currentProcessorStats.successful + currentProcessorStats.failed;
              newPwsr[procId] = {
                ...newPwsr[procId],
                successfulPaymentCount: currentProcessorStats.successful,
                totalPaymentCount: currentTotalForProcessor,
                volumeShare: totalVolumeAcrossProcessors > 0 ? (currentTotalForProcessor / totalVolumeAcrossProcessors) * 100 : 0,
              };
            });
            return { ...prevControls, processorWiseSuccessRates: newPwsr, overallSuccessRate: currentOverallSR };
          });
        }
      }
    } catch (error) {
      console.error('Unexpected error in processTransactionBatch:', error);
    } finally {
      isProcessingBatchRef.current = false;
    }
  }, [
    currentControls,
    simulationState,
    apiKey,
    profileId,
    merchantId,
    merchantConnectors,
    processedPaymentsCount,
    processSinglePayment,
  ]);

  useEffect(() => {
    if (simulationState === 'running') {
      const timer = setTimeout(() => {
        processTransactionBatch();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [simulationState, processedPaymentsCount, processTransactionBatch]);

  const fetchMerchantConnectors = async (currentMerchantId, currentApiKey, currentBaseUrl) => {
    if (!currentMerchantId || !currentApiKey) {
      showToast('Error', 'Merchant ID and API Key are required to fetch connectors.', 'destructive');
      return [];
    }
    setIsLoadingMerchantConnectors(true);
    try {
      if (!profileId) {
        showToast('Error', 'Profile ID is missing. Cannot fetch connectors.', 'destructive');
        setIsLoadingMerchantConnectors(false);
        return [];
      }

      const fetchUrl = `${currentBaseUrl}/account/${currentMerchantId}/profile/connectors`;
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: { 'api-key': currentApiKey, 'x-profile-id': profileId },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch connectors.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const responseData = await response.json();

      let connectorsData = [];
      if (Array.isArray(responseData)) {
        connectorsData = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        connectorsData = responseData.data;
      } else if (responseData.connectors && Array.isArray(responseData.connectors)) {
        connectorsData = responseData.connectors;
      }

      const validConnectors = connectorsData.filter((connector) => connector && connector.connector_name && connector.merchant_connector_id);

      setMerchantConnectors(validConnectors);

      const initialToggleStates = {};
      const initialProcessorWiseSuccessRates = {};

      connectorsData.forEach((connector) => {
        const key = connector.merchant_connector_id || connector.connector_name;
        if (key) {
          initialToggleStates[key] = !(connector.disabled === true);
          initialProcessorWiseSuccessRates[key] = {
            sr: 0,
            srDeviation: 0,
            volumeShare: 0,
            successfulPaymentCount: 0,
            totalPaymentCount: 0,
          };
        }
      });

      setConnectorToggleStates(initialToggleStates);

      setCurrentControls((prev) => {
        const base = prev || {
          totalPayments: 1000,
          selectedPaymentMethods: ['Card'],
          processorMatrix: {},
          processorIncidents: {},
          overallSuccessRate: 0,
          processorWiseSuccessRates: {},
          structuredRule: null,
          numberOfBatches: 100,
          batchSize: 10,
          isSuccessBasedRoutingEnabled: true,
        };
        return {
          ...base,
          processorWiseSuccessRates: initialProcessorWiseSuccessRates,
          overallSuccessRate: base.overallSuccessRate || 0,
        };
      });

      showToast('Success', 'Merchant connectors fetched.');
      return connectorsData;
    } catch (error) {
      console.error('Error fetching merchant connectors:', error);
      setMerchantConnectors([]);
      setConnectorToggleStates({});
      showToast('Failed to Fetch Connectors', error.message, 'destructive');
      return [];
    } finally {
      setIsLoadingMerchantConnectors(false);
    }
  };

  const toggleSrRule = async (currentMerchantId, currentProfileId, currentApiKey, currentBaseUrl) => {
    if (!currentMerchantId || !currentProfileId || !currentApiKey) {
      showToast('Error', 'Merchant ID, Profile ID and API Key are required.', 'destructive');
      return;
    }
    try {
      const response = await fetch(
        `${currentBaseUrl}/account/${currentMerchantId}/business_profile/${currentProfileId}/dynamic_routing/success_based/toggle?enable=dynamic_connector_selection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'api-key': currentApiKey,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to toggle SR rule.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const responseData = await response.json();
      showToast('Success', 'SR rule toggled.');
      return responseData;
    } catch (error) {
      showToast('Failed to Toggle SR Rule', error.message, 'destructive');
      return null;
    }
  };

  const handleConnectorToggleChange = useCallback(
    async (connectorId, newState) => {
      const originalState = connectorToggleStates[connectorId];
      setConnectorToggleStates((prev) => ({ ...prev, [connectorId]: newState }));

      if (!merchantId || !apiKey) {
        showToast('API Credentials Missing', 'Cannot update connector status.', 'destructive');
        setConnectorToggleStates((prev) => ({ ...prev, [connectorId]: originalState }));
        return;
      }

      const connectorToUpdate = merchantConnectors.find((c) => (c.merchant_connector_id || c.connector_name) === connectorId);
      const connectorTypeForAPI = connectorToUpdate?.connector_type || 'payment_processor';

      try {
        const response = await fetch(`${baseUrl}/account/${merchantId}/connectors/${connectorId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'api-key': apiKey,
          },
          body: JSON.stringify({ connector_type: connectorTypeForAPI, disabled: !newState }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to update.' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        showToast('Connector Status Updated', `Connector ${connectorId} ${newState ? 'enabled' : 'disabled'}.`);
      } catch (error) {
        showToast('Update Failed', error.message, 'destructive');
        setConnectorToggleStates((prev) => ({ ...prev, [connectorId]: originalState }));
      }
    },
    [connectorToggleStates, merchantId, apiKey, merchantConnectors, baseUrl]
  );

  const handleApiCredentialsSubmit = async () => {
    if (!apiKey || !profileId || !merchantId) {
      showToast('API Credentials Required', 'Please enter all API credentials.', 'destructive');
      return;
    }

    setIsApiCredentialsModalOpen(false);

    await fetchMerchantConnectors(merchantId, apiKey, baseUrl);

    const toggleResponse = await toggleSrRule(merchantId, profileId, apiKey, baseUrl);

    if (toggleResponse && toggleResponse.id) {
      const storedRoutingId = safeLocalStorage.getItem(LOCALSTORAGE_ROUTING_ID);
      if (storedRoutingId !== toggleResponse.id) {
        safeLocalStorage.setItem(LOCALSTORAGE_ROUTING_ID, toggleResponse.id);
        await setVolumeSplit(merchantId, profileId, apiKey, baseUrl);
      }
    }

    safeLocalStorage.setItem(LOCALSTORAGE_API_KEY, apiKey);
    safeLocalStorage.setItem(LOCALSTORAGE_PROFILE_ID, profileId);
    safeLocalStorage.setItem(LOCALSTORAGE_MERCHANT_ID, merchantId);
    safeLocalStorage.setItem(LOCALSTORAGE_BASE_URL, baseUrl);
  };

  const resetSimulationState = () => {
    setProcessedPaymentsCount(0);
    setSuccessRateHistory([]);
    setVolumeHistory([]);
    setOverallSuccessRateHistory([]);
    isStoppingRef.current = false;
    accumulatedProcessorStatsRef.current = {};
    accumulatedGlobalStatsRef.current = { totalSuccessful: 0, totalFailed: 0 };
    setTransactionLogs([]);
    transactionCounterRef.current = 0;

    setCurrentControls((prev) => {
      if (!prev) {
        return {
          totalPayments: 1000,
          selectedPaymentMethods: ['Card'],
          processorMatrix: {},
          processorIncidents: {},
          overallSuccessRate: 0,
          processorWiseSuccessRates: {},
          structuredRule: null,
          numberOfBatches: 100,
          batchSize: 10,
          isSuccessBasedRoutingEnabled: true,
        };
      }
      const newPwsr = {};
      Object.keys(prev.processorWiseSuccessRates).forEach((procId) => {
        newPwsr[procId] = {
          ...prev.processorWiseSuccessRates[procId],
          volumeShare: 0,
          successfulPaymentCount: 0,
          totalPaymentCount: 0,
        };
      });
      return { ...prev, overallSuccessRate: 0, processorWiseSuccessRates: newPwsr };
    });
  };

  const handleStartSimulation = useCallback(() => {
    if (!apiKey || !profileId || !merchantId) {
      setIsApiCredentialsModalOpen(true);
      return;
    }
    resetSimulationState();
    setSimulationState('running');
    showToast('Simulation Started', `Processing ${currentControls?.totalPayments || 0} payments.`);
  }, [apiKey, profileId, merchantId, currentControls]);

  const handleResumeSimulation = useCallback(() => {
    if (simulationState === 'paused') {
      isStoppingRef.current = false;
      setSimulationState('running');
      showToast('Simulation Resumed', '');
    }
  }, [simulationState]);

  const handlePauseSimulation = useCallback(() => {
    if (simulationState === 'running') {
      isStoppingRef.current = true;
      setSimulationState('paused');
      if (apiCallAbortControllerRef.current) {
        apiCallAbortControllerRef.current.abort();
      }
      showToast('Simulation Paused', '');
    }
  }, [simulationState]);

  const handleStopSimulation = useCallback(() => {
    if (simulationState !== 'idle') {
      isStoppingRef.current = true;
      setSimulationState('idle');
      if (apiCallAbortControllerRef.current) {
        apiCallAbortControllerRef.current.abort();
      }
      resetSimulationState();
      showToast('Simulation Stopped', '');
    }
  }, [simulationState]);

  const handleControlsChange = useCallback((data) => {
    setCurrentControls((prev) => {
      const existingOverallSuccessRate = prev ? prev.overallSuccessRate : 0;
      return {
        ...(prev || {}),
        ...data,
        overallSuccessRate: data.overallSuccessRate !== undefined ? data.overallSuccessRate : existingOverallSuccessRate,
      };
    });
  }, []);

  const sidebarTabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'processors', label: 'Processors', icon: CreditCard },
    { id: 'routing', label: 'Routing', icon: Activity },
    { id: 'test-payment-data', label: 'Test Cards', icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Decision Engine Playground</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Simulate and test intelligent payment routing</p>
          </div>
          <div className="flex items-center gap-2">
            {simulationState === 'idle' && (
              <button
                onClick={handleStartSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm"
              >
                <Play className="w-4 h-4" />
                Start Simulation
              </button>
            )}
            {simulationState === 'running' && (
              <>
                <button
                  onClick={handlePauseSimulation}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium text-sm"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
                <button
                  onClick={handleStopSimulation}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </button>
              </>
            )}
            {simulationState === 'paused' && (
              <>
                <button
                  onClick={handleResumeSimulation}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
                <button
                  onClick={handleStopSimulation}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </button>
              </>
            )}
            <button
              onClick={() => setIsApiCredentialsModalOpen(true)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
            >
              API Credentials
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Configuration</h2>
          </div>
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {sidebarTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {simulationState === 'running' && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
              <div className="mt-1">
                Processed: {processedPaymentsCount} / {currentControls?.totalPayments || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-x-auto">
          <DecisionEngineControls
            onFormChange={handleControlsChange}
            onRoutingParamsChange={handleRoutingParamsChange}
            initialValues={currentControls}
            merchantConnectors={merchantConnectors}
            connectorToggleStates={connectorToggleStates}
            onConnectorToggleChange={handleConnectorToggleChange}
            activeTab={activeTab}
          />

          <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-start p-4 pb-0">
              <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                <button
                  onClick={() => setContentTab('stats')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    contentTab === 'stats'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Stats
                </button>
                <button
                  onClick={() => setContentTab('analytics')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    contentTab === 'analytics'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {contentTab === 'stats' ? (
                <DecisionEngineStats
                  currentControls={currentControls}
                  merchantConnectors={merchantConnectors}
                  processedPayments={processedPaymentsCount}
                  totalSuccessful={accumulatedGlobalStatsRef.current.totalSuccessful}
                  totalFailed={accumulatedGlobalStatsRef.current.totalFailed}
                  overallSuccessRateHistory={overallSuccessRateHistory}
                />
              ) : (
                <DecisionEngineCharts
                  successRateHistory={successRateHistory}
                  volumeHistory={volumeHistory}
                  merchantConnectors={merchantConnectors}
                  connectorToggleStates={connectorToggleStates}
                />
              )}
            </div>
          </div>

          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Logs</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {transactionLogs.length > 0 ? (
                <div className="space-y-3">
                  {[...transactionLogs].reverse().map((log) => (
                    <div key={log.transactionNumber} className="text-xs p-3 border border-gray-200 dark:border-gray-600 rounded-md font-mono break-all bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">Transaction #{log.transactionNumber}</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div>
                          <span className="font-semibold">Processor:</span> {log.connector}
                        </div>
                        <div>
                          <span className="font-semibold">Status:</span>{' '}
                          <span
                            className={`${
                              log.status === 'succeeded' || log.status === 'requires_capture'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold">Routing:</span>{' '}
                          <span
                            className={`${
                              log.routingApproach === 'exploration'
                                ? 'text-blue-600 dark:text-blue-400'
                                : log.routingApproach === 'exploitation'
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {log.routingApproach}
                          </span>
                        </div>
                      </div>
                      {log.sr_scores && Object.keys(log.sr_scores).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                          <span className="font-semibold">SR Scores:</span>
                          <div className="pl-2 mt-1">
                            {Object.entries(log.sr_scores).map(([name, score]) => (
                              <div key={name} className="text-gray-700 dark:text-gray-300">
                                {name}: {score.toFixed(2)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8">Log entries will appear here...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {isApiCredentialsModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Credentials</h2>
              <button onClick={() => setIsApiCredentialsModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API Key"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile ID</label>
                <input
                  type="text"
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  placeholder="Enter Profile ID"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Merchant ID</label>
                <input
                  type="text"
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  placeholder="Enter Merchant ID"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base URL</label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://sandbox.hyperswitch.io"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsApiCredentialsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApiCredentialsSubmit}
                disabled={isLoadingMerchantConnectors}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {isLoadingMerchantConnectors ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionEnginePlayground;
