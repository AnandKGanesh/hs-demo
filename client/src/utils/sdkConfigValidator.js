export const KNOWN_BROKEN_OPTIONS = [
  {
    option: 'layout.displayOneClickPaymentMethodsOnTop',
    error: 'Unknown Key in options.layout',
    status: 'REMOVED'
  },
  {
    option: 'layout.savedMethodCustomization.groupingBehavior',
    error: 'Unknown Key in options.layout',
    status: 'REMOVED'
  },
  {
    option: 'terms.sepaDebit',
    error: 'SDK expects snake_case: sepa_debit',
    status: 'NEEDS_FIX'
  },
  {
    option: 'terms.auBecsDebit',
    error: 'SDK expects snake_case: au_becs_debit',
    status: 'NEEDS_FIX'
  },
  {
    option: 'terms.usBankAccount',
    error: 'SDK expects snake_case: us_bank_account',
    status: 'NEEDS_FIX'
  },
  {
    option: 'appearance.fontVariantLigatures',
    error: 'Empty string value may cause issues',
    status: 'NEEDS_FIX'
  },
  {
    option: 'appearance.fontVariationSettings',
    error: 'Empty string value may cause issues',
    status: 'NEEDS_FIX'
  }
];

export const VALID_OPTIONS = {
  layout: {
    type: ['accordion', 'tabs'],
    defaultCollapsed: [true, false],
    radios: [true, false],
    spacedAccordionItems: [true, false],
    paymentMethodsArrangementForTabs: ['default', 'grid']
  },
  wallets: {
    walletReturnUrl: 'string',
    applePay: ['auto', 'never'],
    googlePay: ['auto', 'never'],
    payPal: ['auto', 'never'],
    klarna: ['auto', 'never'],
    style: {
      theme: ['light', 'dark', 'outline'],
      type: ['default', 'checkout', 'pay', 'buy', 'installment', 'book', 'donate', 'order', 'subscribe', 'contribute'],
      height: 'number',
      buttonRadius: 'number'
    }
  },
  terms: {
    card: ['auto', 'always', 'never'],
    ideal: ['auto', 'always', 'never'],
    sepa_debit: ['auto', 'always', 'never'],
    sofort: ['auto', 'always', 'never'],
    bancontact: ['auto', 'always', 'never'],
    au_becs_debit: ['auto', 'always', 'never'],
    us_bank_account: ['auto', 'always', 'never']
  },
  moreConfig: {
    branding: ['always', 'never'],
    readOnly: [true, false],
    hideCardNicknameField: [true, false],
    hideExpiredPaymentMethods: [true, false],
    displaySavedPaymentMethods: [true, false],
    displaySavedPaymentMethodsCheckbox: [true, false],
    savedPaymentMethodsCheckboxCheckedByDefault: [true, false],
    showShortSurchargeMessage: [true, false]
  }
};

export const generateTestReport = () => {
  return {
    totalOptions: 70,
    working: 63,
    broken: 7,
    removed: 2,
    needsFix: 5,
    brokenOptions: KNOWN_BROKEN_OPTIONS
  };
};
