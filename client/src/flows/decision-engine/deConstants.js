/**
 * Constants for the Decision Engine Playground
 * @module deConstants
 */

/** LocalStorage keys for API credentials */
export const LOCALSTORAGE_API_KEY = 'hyperswitch_apiKey';
export const LOCALSTORAGE_PROFILE_ID = 'hyperswitch_profileId';
export const LOCALSTORAGE_MERCHANT_ID = 'hyperswitch_merchantId';
export const LOCALSTORAGE_ROUTING_ID = 'hyperswitch_routingId';
export const LOCALSTORAGE_BASE_URL = 'hyperswitch_baseUrl';

/** LocalStorage keys for test card details */
export const LOCALSTORAGE_SUCCESS_CARD_KEY = 'hyperswitch_successCardDetails';
export const LOCALSTORAGE_FAILURE_CARD_KEY = 'hyperswitch_failureCardDetails';

/** Payment methods supported */
export const PAYMENT_METHODS = ['Card'];

/** Default values */
export const DEFAULT_BASE_URL = 'https://sandbox.hyperswitch.io';
export const DEFAULT_EXPLORATION_PERCENT = 20;
export const DEFAULT_BUCKET_SIZE = 30;
export const DEFAULT_NUMBER_OF_BATCHES = 100;
export const DEFAULT_BATCH_SIZE = 10;
export const DEFAULT_FAILURE_PERCENTAGE = 50;

/** Chart colors for recharts */
export const CHART_COLORS = [
  'hsl(44, 96%, 51%)',
  'hsl(218, 57%, 54%)',
  'hsl(354, 70%, 50%)',
  'hsl(112, 16%, 52%)',
  'hsl(274, 74%, 66%)',
];

/** Connector color mapping for UI */
export const CONNECTOR_COLORS = {
  stripe: 'bg-blue-500',
  adyen: 'bg-green-500',
  checkout: 'bg-amber-500',
  braintree: 'bg-red-500',
  paypal: 'bg-purple-500',
};
