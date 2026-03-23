const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5252;

app.use(cors());
app.use(express.json());

// Config endpoint
app.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.HYPERSWITCH_PUBLISHABLE_KEY,
    profileId: process.env.PROFILE_ID,
  });
});

// URLs endpoint
app.get('/urls', (req, res) => {
  res.json({
    serverUrl: process.env.HYPERSWITCH_SERVER_URL,
    clientUrl: process.env.HYPERSWITCH_CLIENT_URL,
  });
});

// Create customer endpoint
app.post('/api/create-customer', async (req, res) => {
  try {
    const customerData = {
      name: 'Customer ' + Date.now(),
      email: 'customer' + Date.now() + '@example.com',
      phone: '9999999999',
      phone_country_code: '+1',
    };

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
      },
      body: JSON.stringify(customerData),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create payment intent endpoint
app.post('/api/create-intent', async (req, res) => {
  try {
    const { flowType, amount = 10000, currency = 'USD', customer_id } = req.body;
    
    // Use external vault profile ID for vault_3 flow
    const profileId = flowType === 'vault_3' 
      ? 'pro_ukJVFiPH0bzYFZwBPi9j' 
      : process.env.PROFILE_ID;
    
    let paymentData = {
      amount: amount,
      currency: currency,
      confirm: false,
      customer_id: customer_id || process.env.CUSTOMER_ID,
      profile_id: profileId,
      capture_method: 'automatic',
      authentication_type: flowType === 'three_ds_psp' ? 'three_ds' : 'no_three_ds',
    };

    // Adjust based on flow type
    if (flowType === 'manual' || flowType === 'manual_partial') {
      paymentData.capture_method = 'manual';
    }

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
        ...(flowType === 'vault_3' && { 'X-Profile-Id': 'pro_ukJVFiPH0bzYFZwBPi9j' }),
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    res.json({
      clientSecret: data.client_secret,
      paymentId: data.payment_id,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      captureMethod: data.capture_method,
      customerId: data.customer_id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Capture payment endpoint
app.post('/api/capture-payment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount_to_capture } = req.body;

    const captureData = {
      amount_to_capture: amount_to_capture,
    };

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/payments/${id}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
      },
      body: JSON.stringify(captureData),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error capturing payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payment details endpoint
app.get('/api/payment/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/payments/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create customer endpoint (simplified)
app.post('/api/create-customer', async (req, res) => {
  try {
    const customerData = {
      name: 'Customer ' + Date.now(),
      email: 'customer' + Date.now() + '@example.com',
      phone: '9999999999',
      phone_country_code: '+1',
    };

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
      },
      body: JSON.stringify(customerData),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create recurring charge (server-side, no SDK)
app.post('/api/create-recurring-charge', async (req, res) => {
  try {
    const { customer_id, payment_method_id, amount = 10000 } = req.body;

    const paymentData = {
      amount: amount,
      currency: 'USD',
      confirm: true,
      customer_id: customer_id,
      profile_id: process.env.PROFILE_ID,
      capture_method: 'automatic',
      authentication_type: 'no_three_ds',
      off_session: true,
      recurring_details: {
        type: 'payment_method_id',
        data: payment_method_id,
      },
    };

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Hyperswitch error:', data.error);
      return res.status(400).json({ error: data.error });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error creating recurring charge:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create recurring charge with Network Transaction ID (server-side, no SDK)
app.post('/api/create-recurring-charge-ntid', async (req, res) => {
  try {
    const { customer_id, network_transaction_id, amount = 10000, card_data } = req.body;

    const paymentData = {
      amount: amount,
      currency: 'USD',
      confirm: true,
      customer_id: customer_id,
      profile_id: process.env.PROFILE_ID,
      capture_method: 'automatic',
      authentication_type: 'no_three_ds',
      off_session: true,
      recurring_details: {
        type: 'network_transaction_id_and_card_details',
        data: {
          network_transaction_id: network_transaction_id,
          card_number: card_data.card_number,
          card_exp_month: card_data.card_exp_month,
          card_exp_year: card_data.card_exp_year,
        },
      },
    };

    console.log('Creating recurring charge with NTID:', { customer_id, network_transaction_id });

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Hyperswitch error:', data.error);
      return res.status(400).json({ error: data.error });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error creating recurring charge with NTID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create recurring charge with PSP Token (server-side, no SDK)
app.post('/api/create-recurring-charge-psp', async (req, res) => {
  try {
    // Frontend now sends the full payment payload with recurring_details
    const paymentData = {
      ...req.body,
      confirm: true,
      profile_id: process.env.PROFILE_ID,
      capture_method: 'automatic',
      authentication_type: 'no_three_ds',
    };

    console.log('Creating recurring charge with PSP token:', paymentData.recurring_details);

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Hyperswitch error:', data.error);
      return res.status(400).json({ error: data.error });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error creating recurring charge with PSP token:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RELAY FLOWS - Adyen Direct + Hyperswitch Relay
// ============================================

// Step 1: Adyen Authorization (authorize only - for Capture, Void, Incremental Auth)
app.post('/api/adyen/authorize', async (req, res) => {
  try {
    const { amount = 10000, card_data } = req.body;
    
    const adyenPayload = {
      amount: {
        currency: 'USD',
        value: amount
      },
      reference: `relay_auth_${Date.now()}`,
      merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
      paymentMethod: {
        type: 'scheme',
        number: card_data.card_number,
        expiryMonth: card_data.card_exp_month,
        expiryYear: card_data.card_exp_year,
        cvc: card_data.card_cvc,
        holderName: card_data.card_holder_name || 'John Doe'
      },
      shopperInteraction: 'Ecommerce',
      recurringProcessingModel: 'CardOnFile'
    };

    console.log('Step 1: Creating Adyen authorization...');

    const response = await fetch(`${process.env.ADYEN_BASE_URL}/pal/servlet/Payment/v68/authorise`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ADYEN_API_KEY,
      },
      body: JSON.stringify(adyenPayload),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Adyen error:', data.error);
      return res.status(400).json({ error: data.error });
    }

    console.log('Step 1 Complete - Adyen Transaction ID:', data.pspReference);
    
    res.json({
      adyenTransactionId: data.pspReference,
      adyenResponse: data,
    });
  } catch (error) {
    console.error('Error creating Adyen authorization:', error);
    res.status(500).json({ error: error.message });
  }
});

// Step 1b: Adyen Authorization + Capture (for Refund)
app.post('/api/adyen/authorize-capture', async (req, res) => {
  try {
    const { amount = 10000, card_data } = req.body;
    
    const adyenPayload = {
      amount: {
        currency: 'USD',
        value: amount
      },
      reference: `relay_capture_${Date.now()}`,
      merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
      paymentMethod: {
        type: 'scheme',
        number: card_data.card_number,
        expiryMonth: card_data.card_exp_month,
        expiryYear: card_data.card_exp_year,
        cvc: card_data.card_cvc,
        holderName: card_data.card_holder_name || 'John Doe'
      },
      shopperInteraction: 'Ecommerce',
      recurringProcessingModel: 'CardOnFile',
      captureDelayHours: 0 // Auto capture
    };

    console.log('Step 1: Creating Adyen authorization with capture...');

    const response = await fetch(`${process.env.ADYEN_BASE_URL}/pal/servlet/Payment/v68/authorise`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ADYEN_API_KEY,
      },
      body: JSON.stringify(adyenPayload),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Adyen error:', data.error);
      return res.status(400).json({ error: data.error });
    }

    console.log('Step 1 Complete - Adyen Transaction ID:', data.pspReference);
    
    res.json({
      adyenTransactionId: data.pspReference,
      adyenResponse: data,
    });
  } catch (error) {
    console.error('Error creating Adyen auth+capture:', error);
    res.status(500).json({ error: error.message });
  }
});

// Step 2: Relay - Capture
app.post('/api/relay/capture', async (req, res) => {
  try {
    const { adyen_transaction_id, amount = 10000 } = req.body;
    
    const relayPayload = {
      connector_id: process.env.MERCHANT_CONNECTOR_ID,
      connector_resource_id: adyen_transaction_id,
      type: 'capture',
      data: {
        capture: {
          authorized_amount: amount,
          amount_to_capture: amount,
          currency: 'USD',
          capture_method: 'automatic'
        }
      }
    };

    console.log('Step 2: Relay Capture - Using Adyen Transaction ID:', adyen_transaction_id);

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/relay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
        'X-Profile-Id': process.env.PROFILE_ID,
      },
      body: JSON.stringify(relayPayload),
    });

    const data = await response.json();
    
    console.log('Step 2 Complete - Relay Capture response:', data);
    
    if (data.error) {
      console.error('Relay error:', data.error);
      return res.status(400).json({ error: data.error });
    }

    res.json({
      relayId: data.relay_id,
      status: data.status,
      type: data.type,
      connectorId: data.connector_id,
      connectorResourceId: data.connector_resource_id,
      adyenTransactionId: adyen_transaction_id,
    });
  } catch (error) {
    console.error('Error in Relay Capture:', error);
    res.status(500).json({ error: error.message });
  }
});

// Step 2: Relay - Refund
app.post('/api/relay/refund', async (req, res) => {
  try {
    const { adyen_transaction_id, amount = 10000 } = req.body;
    
    const relayPayload = {
      connector_id: process.env.MERCHANT_CONNECTOR_ID,
      connector_resource_id: adyen_transaction_id,
      type: 'refund',
      data: {
        refund: {
          amount: amount,
          currency: 'USD',
          reason: 'Customer request'
        }
      }
    };

    console.log('Step 2: Relay Refund - Using Adyen Transaction ID:', adyen_transaction_id);

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/relay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
        'X-Profile-Id': process.env.PROFILE_ID,
      },
      body: JSON.stringify(relayPayload),
    });

    const data = await response.json();
    
    console.log('Step 2 Complete - Relay Refund response:', data);
    
    if (data.error) {
      console.error('Relay error:', data.error);
      return res.status(400).json({ error: data.error });
    }

    res.json({
      relayId: data.relay_id,
      status: data.status,
      type: data.type,
      connectorId: data.connector_id,
      connectorResourceId: data.connector_resource_id,
      adyenTransactionId: adyen_transaction_id,
    });
  } catch (error) {
    console.error('Error in Relay Refund:', error);
    res.status(500).json({ error: error.message });
  }
});

// Step 2: Relay - Void
app.post('/api/relay/void', async (req, res) => {
  try {
    const { adyen_transaction_id } = req.body;
    
    const relayPayload = {
      connector_id: process.env.MERCHANT_CONNECTOR_ID,
      connector_resource_id: adyen_transaction_id,
      type: 'void',
      data: {
        void: {}
      }
    };

    console.log('Step 2: Relay Void - Using Adyen Transaction ID:', adyen_transaction_id);

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/relay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
        'X-Profile-Id': process.env.PROFILE_ID,
      },
      body: JSON.stringify(relayPayload),
    });

    const data = await response.json();
    
    console.log('Step 2 Complete - Relay Void response:', data);
    
    if (data.error) {
      console.error('Relay error:', data.error);
      return res.status(400).json({ error: data.error });
    }

    res.json({
      relayId: data.relay_id,
      status: data.status,
      type: data.type,
      connectorId: data.connector_id,
      connectorResourceId: data.connector_resource_id,
      adyenTransactionId: adyen_transaction_id,
    });
  } catch (error) {
    console.error('Error in Relay Void:', error);
    res.status(500).json({ error: error.message });
  }
});

// Step 2: Relay - Incremental Authorization
app.post('/api/relay/incremental-auth', async (req, res) => {
  try {
    const { adyen_transaction_id, additional_amount = 5000 } = req.body;
    
    const relayPayload = {
      connector_id: process.env.MERCHANT_CONNECTOR_ID,
      connector_resource_id: adyen_transaction_id,
      type: 'incremental_authorization',
      data: {
        incremental_authorization: {
          total_amount: 15000,
          additional_amount: additional_amount,
          currency: 'USD'
        }
      }
    };

    console.log('Step 2: Relay Incremental Auth - Using Adyen Transaction ID:', adyen_transaction_id);

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/relay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
        'X-Profile-Id': process.env.PROFILE_ID,
      },
      body: JSON.stringify(relayPayload),
    });

    const data = await response.json();
    
    console.log('Step 2 Complete - Relay Incremental Auth response:', data);
    
    if (data.error) {
      console.error('Relay error:', data.error);
      return res.status(400).json({ error: data.error });
    }

    res.json({
      relayId: data.relay_id,
      status: data.status,
      type: data.type,
      connectorId: data.connector_id,
      connectorResourceId: data.connector_resource_id,
      adyenTransactionId: adyen_transaction_id,
    });
  } catch (error) {
    console.error('Error in Relay Incremental Auth:', error);
    res.status(500).json({ error: error.message });
  }
});

// Standalone 3DS Payment endpoint
app.post('/api/create-intent-3ds', async (req, res) => {
  try {
    const paymentData = req.body;

    console.log('Creating standalone 3DS payment intent...');

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Hyperswitch error:', data.error);
      return res.status(400).json({ error: data.error });
    }

    res.json({
      clientSecret: data.client_secret,
      paymentId: data.payment_id,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
    });
  } catch (error) {
    console.error('Error creating 3DS payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Import 3DS Results - server-side payment with confirm: true
app.post('/api/import-3ds-results', async (req, res) => {
  try {
    const { amount = 10000, currency = 'USD', customer_id, three_ds_data, card_data } = req.body;
    
    let paymentData = {
      amount: amount,
      currency: currency,
      confirm: true,
      customer_id: customer_id || process.env.CUSTOMER_ID,
      profile_id: process.env.PROFILE_ID,
      capture_method: 'automatic',
      authentication_type: 'three_ds',
      three_ds_data: three_ds_data,
      payment_method: 'card',
      payment_method_type: 'credit',
      payment_method_data: {
        card: {
          card_number: card_data.card_number,
          card_exp_month: card_data.card_exp_month,
          card_exp_year: card_data.card_exp_year,
          card_cvc: card_data.card_cvc,
          card_holder_name: card_data.card_holder_name || 'John Doe',
        },
      },
      browser_info: {
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        accept_header: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        language: "en-US",
        color_depth: 24,
        screen_height: 1080,
        screen_width: 1920,
        time_zone: -330,
        java_enabled: true,
        java_script_enabled: true,
      },
    };

    console.log('Importing 3DS results and creating payment:', { customer_id, three_ds_data });

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    
    console.log('Hyperswitch API response for Import 3DS:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.error('Hyperswitch API error:', data.error);
      return res.status(400).json({ error: data.error });
    }

    res.json(data);
  } catch (error) {
    console.error('Error importing 3DS results:', error);
    res.status(500).json({ error: error.message });
  }
});

// Payment Links endpoint
app.post('/api/create-payment-link', async (req, res) => {
  try {
    const { amount = 10000, currency = 'USD', description = 'Payment Link' } = req.body;

    const paymentData = {
      amount: amount,
      currency: currency,
      confirm: false,
      profile_id: process.env.PROFILE_ID,
      capture_method: 'automatic',
      authentication_type: 'no_three_ds',
      payment_link: true,
      return_url: 'https://www.google.com',
      description: description,
      customer: {
        id: 'customer_123',
        name: 'John Doe',
        email: 'customer@example.com',
      },
      billing: {
        address: {
          line1: '1467',
          line2: 'Harrison Street',
          city: 'San Fransico',
          state: 'California',
          zip: '94122',
          country: 'US',
        },
      },
    };

    console.log('Creating payment link...');

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Hyperswitch error:', data.error);
      return res.status(400).json({ error: data.error });
    }

    res.json({
      payment_id: data.payment_id,
      status: data.status,
      payment_link: data.payment_link,
    });
  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ error: error.message });
  }
});

// Disputes - List endpoint
app.get('/api/list-disputes', async (req, res) => {
  try {
    console.log('Fetching disputes list...');

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/disputes/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
      },
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Hyperswitch error:', data.error);
      return res.status(400).json({ error: data.error });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching disputes:', error);
    res.status(500).json({ error: error.message });
  }
});

// HS SDK + External Vault Storage endpoint
app.post('/api/create-external-vault-payment', async (req, res) => {
  try {
    const { amount = 10000, currency = 'USD', description = 'Default value' } = req.body;

    const paymentData = {
      amount: amount,
      currency: currency,
      profile_id: 'pro_ukJVFiPH0bzYFZwBPi9j',
      customer_id: 'hyperswitch_sdk_demo_id',
      description: description,
      capture_method: 'automatic',
      email: 'guest@example.com',
      setup_future_usage: 'on_session',
      request_external_three_ds_authentication: false,
      billing: {
        address: {
          line1: '1600',
          line2: 'Amphitheatre Parkway',
          city: 'Mountain View',
          state: 'California',
          zip: '94043',
          country: 'US',
          first_name: 'John',
          last_name: 'Doe',
        },
        phone: {
          number: '6502530000',
          country_code: '+1',
        },
      },
      shipping: {
        address: {
          line1: '1600',
          line2: 'Amphitheatre Parkway',
          city: 'Mountain View',
          state: 'California',
          zip: '94043',
          country: 'US',
          first_name: 'John',
          last_name: 'Doe',
        },
        phone: {
          number: '6502530000',
          country_code: '+1',
        },
      },
    };

    console.log('Creating payment with external vault...');

    const response = await fetch(`${process.env.HYPERSWITCH_SERVER_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.HYPERSWITCH_SECRET_KEY,
        'X-Profile-Id': 'pro_ukJVFiPH0bzYFZwBPi9j',
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Hyperswitch error:', data.error);
      return res.status(400).json({ error: data.error });
    }

    res.json({
      payment_id: data.payment_id,
      status: data.status,
      client_secret: data.client_secret,
      amount: data.amount,
      currency: data.currency,
    });
  } catch (error) {
    console.error('Error creating external vault payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from client/dist
app.use(express.static(path.join(__dirname, '../client/dist')));

// Serve index.html for all routes (SPA)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
