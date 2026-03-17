# Hyperswitch Demo App

A comprehensive demonstration playground for all Hyperswitch payment flows including SDK-based payments, recurring payments, 3D Secure, FRM, Relay, Vault configurations, and Chargeback management.

## Features

### Payment Flows
- **Automatic Capture**: Standard one-time payment
- **Manual Capture**: Authorize now, capture later via server
- **Manual Partial Capture**: Capture $50 of $100 authorized
- **Repeat User**: Use saved customer ID for returning users

### Recurring Flows
- **$0 Setup Recurring**: Setup recurring mandate with $0 authorization
- **Setup Recurring and Charge**: Charge and setup recurring simultaneously
- **Recurring Charge**: Charge using saved mandate ID
- **Recurring Charge (NTID)**: Charge using Network Transaction ID
- **Recurring Charge (PSP Token)**: Charge using PSP mandate token

### 3D Secure Flows
- **Authenticate with 3DS via PSP**: 3D Secure authentication through PSP
- **Import 3D Secure Results**: Import existing 3DS authentication
- **Standalone 3D Secure**: Standalone 3DS via Hyperswitch

### FRM Flows
- **FRM Pre-Auth**: Fraud check before authorization

### Relay Flows
- **Relay Capture**: Capture via relay API
- **Relay Refund**: Refund via relay API
- **Relay Void**: Void via relay API
- **Relay Incremental Auth**: Incremental authorization via relay

### Vault Flows
- **HS Vault SDK & Storage with PSP payload** (vault_1)
- **HS Vault SDK & Storage with HS payload** (vault_2)
- **HS SDK + External Vault Storage** (vault_3) ⭐ Enabled
- **External Vault SDK & Vault Storage with HS core** (vault_4)
- **External Vault SDK in HS SDK & External Storage** (vault_5)

### Other Flows
- **Payment Links**: Generate shareable payment URLs
- **Chargeback Unification**: List and manage disputes

## Test Data

Use the following test card for all SDK flows:
- **Card**: 4111111111111111
- **Expiry**: 03/30
- **CVC**: 737
- **Name**: John Doe

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Hyperswitch sandbox account with API keys

### Installation

```bash
# Clone or navigate to the project
cd hyperswitch-demo-app

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Hyperswitch credentials
```

### Environment Variables

Create a `.env` file with:

```env
# Hyperswitch Configuration
HYPERSWITCH_SERVER_URL=https://sandbox.hyperswitch.io
HYPERSWITCH_SECRET_KEY=your_secret_key
HYPERSWITCH_PUBLISHABLE_KEY=your_publishable_key
CLIENT_URL=https://sandbox.hyperswitch.io

# Default Profile and Customer IDs
PROFILE_ID=your_profile_id
CUSTOMER_ID=your_customer_id

# For External Vault Flow (vault_3)
# Profile ID: pro_ukJVFiPH0bzYFZwBPi9j

# For Relay Flows (optional)
ADYEN_BASE_URL=https://your-adyen-endpoint
ADYEN_API_KEY=your_adyen_key
MERCHANT_CONNECTOR_ID=your_connector_id
```

### Running the Application

```bash
# Start the development server
npm start

# Or run both frontend and backend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5252

## Testing

### Run All Tests
```bash
./test-suite.sh
```

This comprehensive test suite validates:
- All SDK payment flows
- Server-side flows (Payment Links, 3DS Import, Disputes, etc.)
- Frontend routing

### Manual Testing
Navigate to any flow using the sidebar or direct URL:
```
http://localhost:3000/flow/{flow_id}
```

Available flow IDs: `automatic`, `manual`, `manual_partial`, `repeat_user`, `payment_links`, `zero_setup`, `setup_and_charge`, `recurring_charge`, `recurring_charge_ntid`, `recurring_charge_psp`, `three_ds_psp`, `three_ds_import`, `three_ds_standalone`, `frm_pre`, `chargeback_unification`, `relay_capture`, `relay_refund`, `relay_void`, `relay_incremental`, `vault_1`, `vault_2`, `vault_3`, `vault_4`, `vault_5`

## Project Structure

```
hyperswitch-demo-app/
├── src/
│   ├── components/       # React components
│   │   ├── PaymentForm.js      # Main SDK payment form
│   │   ├── APIResponsePanel.js # API logs display
│   │   ├── Sidebar.js          # Flow navigation
│   │   ├── Layout.js           # App layout
│   │   └── ...
│   ├── flows/           # Individual flow components
│   │   ├── PaymentLinks.js
│   │   ├── ChargebackUnification.js
│   │   ├── RecurringChargePSP.js
│   │   └── ...
│   ├── utils/           # Utilities and state
│   └── App.js           # Main application
├── server.js            # Express backend
├── test-suite.sh        # E2E test script
└── package.json
```

## Key Files

- **AGENTS.md**: Guidelines for developers and AI assistants
- **FLOW_MAPPINGS_V2.md**: Complete API mapping for all flows
- **server.js**: Backend API endpoints (920+ lines)
- **test-suite.sh**: Comprehensive test suite

## Important Notes

### External Vault (vault_3)
The vault_3 flow uses a special profile ID (`pro_ukJVFiPH0bzYFZwBPi9j`) for external vault storage integration. When "Save card details" is checked in the SDK, the card is stored in VGS vault (sandbox).

### Payment Links
Payment links cannot be directly opened in a browser tab - they are embedded within the iframe of a trusted domain for security.

### Manual Capture Flows
These flows have 4 steps:
1. Create Customer
2. Create Payment Intent
3. SDK Payment Confirmation (authorize)
4. Server Capture (click "Complete on Server")

### Chargeback Unification
Returns an array of dispute objects directly from the `/disputes/list` endpoint. No profile ID required.

## Documentation

- [FLOW_MAPPINGS_V2.md](./FLOW_MAPPINGS_V2.md) - Complete flow documentation with API request/response structures
- [AGENTS.md](./AGENTS.md) - Development guidelines and testing checklist

## Troubleshooting

### SDK Not Loading
Check browser console for HyperLoader.js loading errors. Verify `CLIENT_URL` in .env.

### Customer Not Found (Repeat User)
The static customer ID must exist in Hyperswitch. Create it first or use a different flow.

### Relay Flows Failing
Relay flows require valid Adyen credentials and a valid PSP reference.

### Payment Links Not Working
Ensure `return_url` is set in the request (using `https://www.google.com` by default).

## Support

For issues or questions:
- Check the [FLOW_MAPPINGS_V2.md](./FLOW_MAPPINGS_V2.md) for API details
- Review server logs: `tail -f server.log`
- Run test suite to identify failures: `./test-suite.sh`

## License

MIT

---

**Last Updated**: 2026-03-16  
**Version**: V21
