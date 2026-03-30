/**
 * Field Mappings - FLOW_MAPPINGS_V1.md Compliance
 * Centralized field filtering to ensure all flows display ONLY key fields
 */

// FLOW_MAPPINGS_V1.md Key Fields Definitions
export const FIELD_MAPPINGS = {
  // Payment Flows: Automatic, Manual, Manual Partial, Repeat User
  payment: {
    step1_customer: ['customer_id'],
    step2_payment_intent: ['payment_id', 'client_secret', 'status', 'capture_method', 'amount', 'customer_id'],
    step3_sdk: ['status', 'payment_id'],
    step4_capture: ['payment_id', 'status'],
    step4_partial_capture: ['payment_id', 'status'],
  },

  // Recurring Flows
  recurring: {
    step1_customer: ['customer_id'],
    step2_payment_intent: ['payment_id', 'client_secret', 'status', 'capture_method', 'amount', 'customer_id'],
    step3_sdk: ['status', 'payment_id', 'payment_method_id', 'mandate_id', 'connector_mandate_id', 'network_transaction_id'],
  },

  // Recurring Charge (Server-side)
  recurring_charge: {
    step2_server: ['payment_id', 'status', 'payment_method_id', 'connector_mandate_id', 'network_transaction_id', 'customer_id'],
  },

  // 3DS Flows
  three_ds: {
    step1_customer: ['customer_id'],
    step2_payment_intent: ['payment_id', 'client_secret', 'status', 'capture_method', 'amount', 'customer_id'],
    step3_sdk: ['status', 'payment_id', 'authentication_type'],
  },

  // Import 3DS Results
  import_3ds: {
    step2_payment_intent: ['payment_id', 'client_secret', 'status', 'capture_method', 'amount', 'customer_id'],
    step3_sdk: ['status', 'payment_id', 'authentication_type'],
  },

  // FRM Flows
  frm: {
    step1_customer: ['customer_id'],
    step2_payment_intent: ['payment_id', 'client_secret', 'status', 'capture_method', 'amount', 'customer_id'],
    step3_sdk: ['status', 'payment_id', 'frm_message'],
  },

  // FRM Message Sub-fields
  frm_message: ['frm_name', 'frm_transaction_id', 'frm_transaction_type', 'frm_status', 'frm_score', 'frm_reason', 'frm_error'],

  // Relay Flows
  relay: {
    step1_server: ['payment_id', 'status', 'amount', 'amount_capturable', 'amount_received'],
  },

  // Vault Flows
  vault: {
    step1_customer: ['customer_id'],
    step2_payment_intent: ['payment_id', 'client_secret', 'status', 'capture_method', 'amount', 'customer_id'],
    step3_sdk: ['status', 'payment_id', 'customer_id', 'connector_transaction_id', 'network_transaction_id'],
  },

  // Payment Links
  payment_links: {
    step1: ['payment_id', 'status', 'payment_link'],
  },
};

/**
 * Filter an object to only include specified keys
 * @param {Object} obj - Source object
 * @param {Array} allowedKeys - Keys to keep
 * @returns {Object} Filtered object
 */
export const filterFields = (obj, allowedKeys) => {
  if (!obj || typeof obj !== 'object') return obj;

  const filtered = {};
  allowedKeys.forEach(key => {
    if (key === 'frm_message' && obj[key]) {
      // Special handling for FRM message - filter its sub-fields
      filtered[key] = filterFields(obj[key], FIELD_MAPPINGS.frm_message);
    } else if (obj[key] !== undefined) {
      filtered[key] = obj[key];
    }
  });
  return filtered;
};

/**
 * Filter API response to match FLOW_MAPPINGS_V1.md
 * @param {Object} response - Full API response
 * @param {string} flowType - Flow category (payment, recurring, three_ds, etc.)
 * @param {string} step - Step identifier (step1_customer, step2_payment_intent, etc.)
 * @returns {Object} Filtered response with only key fields
 */
export const filterApiResponse = (response, flowType, step) => {
  if (!response) return response;

  // Handle string responses
  if (typeof response === 'string') return response;

  // Get allowed fields for this flow and step
  const flowConfig = FIELD_MAPPINGS[flowType];
  if (!flowConfig) {
    console.warn(`No field mapping found for flow type: ${flowType}`);
    return response;
  }

  const allowedFields = flowConfig[step];
  if (!allowedFields) {
    console.warn(`No field mapping found for step: ${step} in flow: ${flowType}`);
    return response;
  }

  // Extract body from response structure
  let body = response.body || response;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return response;
    }
  }

  // Filter the body
  const filteredBody = filterFields(body, allowedFields);

  // Return in same structure as input
  if (response.body !== undefined) {
    return {
      ...response,
      body: filteredBody,
    };
  }

  return filteredBody;
};

/**
 * Convenience filters for common response types
 */
export const filters = {
  // Customer creation response
  customer: (response) => filterApiResponse(response, 'payment', 'step1_customer'),

  // Payment intent creation response
  paymentIntent: (response) => filterApiResponse(response, 'payment', 'step2_payment_intent'),

  // SDK confirmation response for payment flows
  paymentSDK: (response) => filterApiResponse(response, 'payment', 'step3_sdk'),

  // SDK confirmation for recurring flows
  recurringSDK: (response) => filterApiResponse(response, 'recurring', 'step3_sdk'),

  // SDK confirmation for 3DS flows
  threeDsSDK: (response) => filterApiResponse(response, 'three_ds', 'step3_sdk'),

  // SDK confirmation for FRM flows
  frmSDK: (response) => filterApiResponse(response, 'frm', 'step3_sdk'),

  // Server capture response
  capture: (response, isPartial = false) => {
    const step = isPartial ? 'step4_partial_capture' : 'step4_capture';
    return filterApiResponse(response, 'payment', step);
  },

  // Recurring charge server response
  recurringCharge: (response) => filterApiResponse(response, 'recurring_charge', 'step2_server'),

  // Vault SDK response
  vaultSDK: (response) => filterApiResponse(response, 'vault', 'step3_sdk'),

  // Relay response
  relay: (response) => filterApiResponse(response, 'relay', 'step1_server'),

  // Payment links response
  paymentLinks: (response) => filterApiResponse(response, 'payment_links', 'step1'),
};

export default {
  FIELD_MAPPINGS,
  filterFields,
  filterApiResponse,
  filters,
};
