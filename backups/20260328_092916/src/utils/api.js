import API_BASE_URL from '../config';

export const makeAuthenticatedRequest = async (endpoint, options = {}, mode = 'demo', debugCreds = null, onApiCall = null) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (mode === 'debug' && debugCreds) {
    headers['X-Debug-Mode'] = 'true';
    headers['X-Publishable-Key'] = debugCreds.publishableKey;
    headers['X-Secret-Key'] = debugCreds.secretKey;
    headers['X-Profile-Id'] = debugCreds.profileId;
    headers['X-Merchant-Id'] = debugCreds.merchantId;
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  const requestDetails = {
    method: options.method || 'GET',
    url: endpoint,
    headers: { ...headers },
    body: options.body ? JSON.parse(options.body) : undefined,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  const responseHeaders = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });
  
  const data = await response.json();
  
  const responseDetails = {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    body: data,
  };
  
  if (onApiCall) {
    onApiCall(requestDetails, responseDetails);
  }
  
  if (!response.ok) {
    throw new Error(data.error?.message || `Server error: ${response.status}`);
  }
  
  return data;
};

export const createPaymentIntent = async (flowType, amount, customerId, mode = 'demo', debugCreds = null, onApiCall = null) => {
  return makeAuthenticatedRequest('/api/create-intent', {
    method: 'POST',
    body: JSON.stringify({
      flowType,
      amount,
      customer_id: customerId,
    }),
  }, mode, debugCreds, onApiCall);
};

export const createCustomer = async (mode = 'demo', debugCreds = null, onApiCall = null) => {
  return makeAuthenticatedRequest('/api/create-customer', {
    method: 'POST',
  }, mode, debugCreds, onApiCall);
};