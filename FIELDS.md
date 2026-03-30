# Hyperswitch Demo App - Field Mappings by Flow

**Last Updated:** 2026-03-29  
**Purpose:** Define which fields should be displayed in APIResponsePanel for each flow type in both Demo Mode and Debug Mode

---

## FIELD CATEGORIES

### Core Payment Fields (Always Present)
- `payment_id` - Unique payment identifier
- `status` - Payment status (requires_confirmation, succeeded, failed, etc.)
- `amount` - Payment amount in minor units
- `currency` - ISO currency code
- `client_secret` - SDK confirmation secret
- `created_at` - Payment creation timestamp
- `metadata` - Custom metadata object

### Authentication Fields (3DS Flows)
- `authentication_type` - no_three_ds, three_ds, etc.
- `authentication_status` - Authentication result status
- `external_authentication_details` - 3DS provider response
- `electronic_commerce_indicator` - 3DS ECI value
- `ds_transaction_id` - Directory server transaction ID
- `acs_transaction_id` - ACS transaction ID
- `three_ds_version` - 3DS protocol version
- `cavv` - Cardholder authentication verification value
- `authentication_flow` - challenge, frictionless, etc.

### Recurring/Mandate Fields
- `mandate_id` - Mandate identifier
- `network_transaction_id` - Network token ID
- `setup_future_usage` - on_session, off_session
- `mandate_data` - Mandate configuration
- `customer_acceptance` - Customer acceptance details
- `recurring_details` - Recurring payment configuration
- `processor_payment_token` - PSP token for recurring

### Vault Fields
- `vault_id` - Vault identifier
- `payment_method_id` - Saved payment method ID
- `payment_token` - Tokenized payment data
- `vault_storage_method` - Storage type used
- `connector_mandate_id` - Connector-specific mandate ID

### FRM Fields
- `frm_enabled` - Fraud check enabled flag
- `frm_check_type` - pre, post, etc.
- `frm_score` - Fraud risk score
- `frm_reason` - Fraud check reason
- `frm_metadata` - FRM provider metadata

### Relay Fields
- `relay_reference` - Relay transaction reference
- `psp_reference` - PSP transaction reference
- `relay_status` - Relay operation status
- `relay_amount` - Relay operation amount

### Organization Fields
- `organization_id` - Organization identifier
- `merchant_id` - Merchant identifier
- `profile_id` - Business profile identifier
- `merchant_connector_id` - Connector account ID
- `connector_name` - PSP name (stripe, adyen, etc.)
- `connector_type` - payment_processor, etc.
- `connector_enabled` - Connector status
- `customer_id` - Customer identifier

### 3DS Decision Manager Fields
- `routing_id` - 3DS routing algorithm ID
- `decision` - NoThreeDs, ChallengeRequested, ChallengePreferred, etc.
- `issuer_name` - Card issuer name
- `issuer_country` - Issuer country code
- `acquirer_country` - Acquirer country code
- `acquirer_fraud_rate` - Acquirer fraud rate
- `customer_device_platform` - Web, Android, iOS
- `customer_device_type` - Mobile, Tablet, Desktop
- `customer_device_display_size` - Display dimensions
- `card_network` - Visa, Mastercard, Amex, etc.
- `rule_conditions` - Array of rule conditions
- `rule_operator` - AND, OR
- `rule_field` - Field being evaluated
- `rule_comparison` - EQUAL_TO, GREATER_THAN, LESS_THAN, IS, IS_NOT, etc.
- `rule_value` - Value to compare against

---

## FLOW-SPECIFIC FIELD MAPPINGS

### 1. AUTOMATIC CAPTURE (automatic)
**Mode:** Demo Mode
```javascript
{
  payment_id: "pay_xxx",
  status: "requires_confirmation",
  amount: 10000,
  currency: "USD",
  client_secret: "pay_xxx_secret_xxx",
  capture_method: "automatic"
}
```

**Mode:** Debug Mode
```javascript
{
  // All core payment fields
  // Plus: customer_id, metadata, profile_id
  // Plus: connector details if available
}
```

### 2. MANUAL CAPTURE (manual)
**Mode:** Demo Mode
```javascript
{
  payment_id: "pay_xxx",
  status: "requires_capture",
  amount: 10000,
  currency: "USD",
  capture_method: "manual"
}
```

**Mode:** Debug Mode
```javascript
{
  // All core payment fields
  // Plus: capture_method, authorization_id
}
```

### 3. MANUAL PARTIAL CAPTURE (manual_partial)
**Mode:** Demo Mode
```javascript
{
  payment_id: "pay_xxx",
  status: "partially_captured",
  amount: 10000,
  captured_amount: 5000,
  currency: "USD"
}
```

**Mode:** Debug Mode
```javascript
{
  // All manual capture fields
  // Plus: captured_amount, uncaptured_amount
}
```

### 4. REPEAT USER (repeat_user)
**Mode:** Demo Mode
```javascript
{
  payment_id: "pay_xxx",
  status: "requires_confirmation",
  customer_id: "cus_xxx",
  amount: 10000,
  currency: "USD"
}
```

**Mode:** Debug Mode
```javascript
{
  // All core payment fields
  // Plus: customer details, saved payment methods
}
```

### 5. PAYMENT LINKS (payment_links)
**Mode:** Demo Mode
```javascript
{
  payment_link_id: "plink_xxx",
  payment_link: "https://...",
  status: "active",
  amount: 10000,
  currency: "USD"
}
```

**Mode:** Debug Mode
```javascript
{
  // Payment link details
  // Plus: expiry, return_url, metadata
}
```

### 6. $0 SETUP RECURRING (zero_setup)
**Mode:** Demo Mode
```javascript
{
  payment_id: "pay_xxx",
  status: "requires_confirmation",
  amount: 0,
  setup_future_usage: "off_session",
  mandate_data: { ... }
}
```

**Mode:** Debug Mode
```javascript
{
  // All core payment fields
  // Plus: mandate_id (after setup)
  // Plus: mandate_data configuration
}
```

### 7. SETUP AND CHARGE (setup_and_charge)
**Mode:** Demo Mode
```javascript
{
  payment_id: "pay_xxx",
  status: "requires_confirmation",
  amount: 10000,
  setup_future_usage: "off_session",
  mandate_data: { ... }
}
```

**Mode:** Debug Mode
```javascript
{
  // All zero_setup fields
  // Plus: charge amount details
}
```

### 8. RECURRING CHARGE (recurring_charge)
**Mode:** Demo Mode
```javascript
{
  payment_id: "pay_xxx",
  status: "succeeded",
  amount: 5000,
  mandate_id: "mnt_xxx",
  recurring: true
}
```

**Mode:** Debug Mode
```javascript
{
  // All core payment fields
  // Plus: mandate_details, network_transaction_id
}
```

### 9. RECURRING CHARGE NTID (recurring_charge_ntid)
**Mode:** Demo Mode
```javascript
{
  payment_id: "pay_xxx",
  status: "succeeded",
  amount: 5000,
  network_transaction_id: "NTID_xxx",
  recurring: true
}
```

**Mode:** Debug Mode
```javascript
{
  // All recurring fields
  // Plus: network_token_details
}
```

### 10. RECURRING CHARGE PSP (recurring_charge_psp)
**Mode:** Demo Mode
```javascript
{
  payment_id: "pay_xxx",
  status: "succeeded",
  amount: 10000,
  processor_payment_token: "TOKEN_xxx",
  recurring: true
}
```

**Mode:** Debug Mode
```javascript
{
  // All recurring fields
  // Plus: processor_token_details
}
```

### 11. 3DS VIA PSP (three_ds_psp)
**Mode:** Demo Mode
```javascript
{
  payment_id: "pay_xxx",
  status: "requires_customer_action",
  authentication_type: "three_ds",
  external_authentication_details: {
    authentication_flow: "challenge",
    status: "pending",
    version: "2.1.0"
  }
}
```

**Mode:** Debug Mode
```javascript
{
  // All core payment fields
  // Plus: full external_authentication_details
  // Plus: acs_url, challenge_request
}
```

### 12. IMPORT 3DS RESULTS (three_ds_import)
**Mode:** Demo Mode
```javascript
{
  payment_id: "pay_xxx",
  status: "succeeded",
  authentication_status: "success",
  three_ds_data: {
    transaction_status: "Y",
    eci: "05",
    cavv: "xxx"
  }
}
```

**Mode:** Debug Mode
```javascript
{
  // All core payment fields
  // Plus: complete three_ds_data
  // Plus: ds_trans_id, acs_trans_id
}
```

### 13. STANDALONE 3DS (three_ds_standalone)
**Mode:** Demo Mode
```javascript
{
  payment_id: "pay_xxx",
  status: "requires_customer_action",
  authentication_type: "three_ds",
  authentication_flow: "challenge"
}
```

**Mode:** Debug Mode
```javascript
{
  // All 3DS fields
  // Plus: standalone authentication details
}
```

### 14. FRM PRE-AUTH (frm_pre)
**Mode:** Demo Mode
```javascript
{
  payment_id: "pay_xxx",
  status: "requires_confirmation",
  frm_enabled: true,
  frm_check_type: "pre",
  frm_score: 25
}
```

**Mode:** Debug Mode
```javascript
{
  // All core payment fields
  // Plus: frm_score, frm_reason, frm_metadata
}
```

### 15. CHARGEBACK UNIFICATION (chargeback_unification)
**Mode:** Demo Mode
```javascript
{
  disputes: [
    {
      dispute_id: "dp_xxx",
      payment_id: "pay_xxx",
      amount: "10000",
      currency: "USD",
      dispute_status: "dispute_opened"
    }
  ]
}
```

**Mode:** Debug Mode
```javascript
{
  // Full dispute details
  // Plus: evidence, dispute_stage, reason
}
```

### 16. RELAY CAPTURE (relay_capture)
**Mode:** Demo Mode
```javascript
{
  relay_reference: "relay_xxx",
  psp_reference: "PSP_xxx",
  status: "succeeded",
  amount: 10000
}
```

**Mode:** Debug Mode
```javascript
{
  // All relay fields
  // Plus: connector_response, raw_psp_response
}
```

### 17. RELAY REFUND (relay_refund)
**Mode:** Demo Mode
```javascript
{
  refund_id: "ref_xxx",
  relay_reference: "relay_xxx",
  status: "succeeded",
  amount: 10000
}
```

**Mode:** Debug Mode
```javascript
{
  // All relay capture fields
  // Plus: refund_reason
}
```

### 18. RELAY VOID (relay_void)
**Mode:** Demo Mode
```javascript
{
  relay_reference: "relay_xxx",
  status: "succeeded",
  void_reason: "customer_request"
}
```

**Mode:** Debug Mode
```javascript
{
  // All relay fields
  // Plus: void timestamp, authorization_reversal
}
```

### 19. RELAY INCREMENTAL AUTH (relay_incremental)
**Mode:** Demo Mode
```javascript
{
  relay_reference: "relay_xxx",
  status: "succeeded",
  additional_amount: 5000,
  total_authorized: 15000
}
```

**Mode:** Debug Mode
```javascript
{
  // All relay fields
  // Plus: incremental_auth_details
}
```

### 20. VAULT HS SDK + EXTERNAL (vault_3)
**Mode:** Demo Mode
```javascript
{
  payment_id: "pay_xxx",
  status: "requires_confirmation",
  client_secret: "pay_xxx_secret_xxx",
  vault_storage_method: "external"
}
```

**Mode:** Debug Mode
```javascript
{
  // All core payment fields
  // Plus: vault_id, payment_method_id
  // Plus: external_vault_response
}
```

### 21. ORGANIZATION MANAGER (organization_manager)
**Mode:** Demo Mode
```javascript
{
  organization: {
    id: "org_xxx",
    name: "Test Org",
    merchants: [...]
  },
  selected_element: {
    type: "merchant",
    id: "mch_xxx",
    name: "Test Merchant"
  }
}
```

**Mode:** Debug Mode
```javascript
{
  // Full organization structure
  // Plus: all merchants, profiles, connectors
}
```

### 22. ROUTING SIMULATOR (routing_simulator)
**Mode:** Demo Mode
```javascript
{
  simulation_stats: {
    total_transactions: 1000,
    success_rate: 92.5,
    total_cost: 247.50,
    overrides_triggered: 15
  },
  psp_distribution: {
    "PSP 1": 350,
    "PSP 2": 280,
    "PSP 3": 250,
    "PSP 4": 120
  }
}
```

**Mode:** Debug Mode
```javascript
{
  // All simulation stats
  // Plus: per-transaction routing decisions
  // Plus: rule evaluation details
}
```

### 23. 3DS DECISION MANAGER (three_ds_decision)
**Mode:** Demo Mode
```javascript
{
  decision_rules: [
    {
      rule_id: "rule_xxx",
      name: "High Value 3DS",
      conditions: [
        {
          field: "amount",
          operator: "GREATER_THAN",
          value: 10000
        }
      ],
      decision: "ChallengeRequested",
      enabled: true
    }
  ],
  evaluation_result: {
    decision: "ChallengeRequested",
    reason: "Amount threshold exceeded"
  }
}
```

**Mode:** Debug Mode
```javascript
{
  // All rule configurations
  // Plus: transaction context (issuer, device, etc.)
  // Plus: PSD2 compliance checks
  // Plus: exemption eligibility
}
```

### 24. DECISION ENGINE (decision_engine)
**Mode:** Demo Mode
```javascript
{
  simulation_config: {
    total_payments: 1000,
    batch_size: 10,
    connectors: [...]
  },
  stats: {
    processed: 500,
    success_rate: 94.2,
    processor_distribution: { ... }
  }
}
```

**Mode:** Debug Mode
```javascript
{
  // Full simulation configuration
  // Plus: per-payment routing decisions
  // Plus: success rate history
  // Plus: connector performance metrics
}
```

---

## MODE DEFINITIONS

### Demo Mode
- **Purpose:** User-friendly display for demos
- **Behavior:** Shows only essential fields, formatted for readability
- **Use Case:** Sales demos, presentations, screenshots

### Debug Mode
- **Purpose:** Full technical details for debugging
- **Behavior:** Shows all API response fields, nested objects expanded
- **Use Case:** Development, troubleshooting, API exploration

---

## IMPLEMENTATION NOTES

1. **Field Filtering Logic:**
   - Each flow specifies its own set of fields for Demo Mode
   - Debug Mode shows the complete API response
   - Common fields (payment_id, status, amount, currency) always shown

2. **Response Building:**
   - Response data built in PaymentForm.js per flow type
   - APIResponsePanel.js displays the filtered data
   - No filtering logic in APIResponsePanel (clean separation)

3. **Adding New Flows:**
   - Add flow_id to this document
   - Define Demo Mode fields
   - Update PaymentForm.js with response builder

4. **Field Display Order:**
   - Priority: ID → Status → Amount → Currency → Flow-specific fields
   - Group related fields together
   - Use consistent naming conventions

---

## REFERENCES

- Hyperswitch API Docs: https://docs.hyperswitch.io/
- Payment Experience: https://docs.hyperswitch.io/explore-hyperswitch/payment-experience/payment
- 3DS Documentation: https://docs.hyperswitch.io/explore-hyperswitch/workflows/3ds-decision-manager

---

*Document maintained alongside FLOW_MAPPINGS_V2.md*
