/**
 * SDK Customization Tooltips
 * Clear, concise tooltips for all configuration options in SDK Customization
 */

export const sdkTooltips = {
  // Layout Section
  layout: {
    type: {
      title: 'Layout Type',
      description: 'Controls how payment methods are displayed. Tabs show methods in a tabbed interface. Accordion stacks them vertically.',
    },
    paymentMethodsArrangementForTabs: {
      title: 'Payment Method Arrangement',
      description: 'Controls the order of payment methods within tabs. Use "Default" for automatic ordering or "Card followed by payment methods" to prioritize cards.',
    },
    defaultCollapsed: {
      title: 'Default Collapsed',
      description: 'When enabled, accordion sections start collapsed and users must expand them to see payment options.',
    },
    radios: {
      title: 'Show Radios',
      description: 'Display radio buttons next to payment methods for explicit selection.',
    },
    spacedAccordionItems: {
      title: 'Spaced Items',
      description: 'Adds extra spacing between accordion items for better visual separation.',
    },
  },

  // Wallets Section
  wallets: {
    applePay: {
      title: 'Apple Pay',
      description: '"Auto" shows Apple Pay when the user has it configured. "Never" hides it completely.',
    },
    googlePay: {
      title: 'Google Pay',
      description: '"Auto" shows Google Pay when available on the device. "Never" hides it completely.',
    },
    payPal: {
      title: 'PayPal',
      description: '"Auto" shows PayPal as a payment option. "Never" hides it completely.',
    },
    style: {
      title: 'Wallet Button Style',
      description: 'Customize the appearance of wallet buttons (Apple Pay, Google Pay, PayPal).',
    },
    theme: {
      title: 'Button Theme',
      description: 'Light, dark, or outline theme for wallet buttons. Choose what matches your checkout design.',
    },
    type: {
      title: 'Button Type',
      description: 'The call-to-action text on the button (Pay, Buy, Checkout, Donate, etc.).',
    },
    height: {
      title: 'Button Height',
      description: 'Height of wallet buttons in pixels. Minimum recommended is 40px for touch accessibility.',
    },
  },

  // Appearance - Colors
  appearance: {
    colorPrimary: {
      title: 'Primary Color',
      description: 'Main brand color used for buttons, selected states, and interactive elements.',
    },
    colorBackground: {
      title: 'Background Color',
      description: 'Background color of the payment form. Use white or a very light color for best readability.',
    },
    colorText: {
      title: 'Text Color',
      description: 'Primary text color for labels and content. Should have good contrast with background.',
    },
    colorDanger: {
      title: 'Danger Color',
      description: 'Color for error messages and invalid states. Typically red.',
    },
    colorSuccess: {
      title: 'Success Color',
      description: 'Color for success states and valid inputs. Typically green.',
    },
    colorWarning: {
      title: 'Warning Color',
      description: 'Color for warning messages and attention states. Typically orange or yellow.',
    },
    colorTextSecondary: {
      title: 'Secondary Text',
      description: 'Color for helper text, descriptions, and less important information.',
    },
    colorTextPlaceholder: {
      title: 'Placeholder Text',
      description: 'Color for input placeholders. Should be subtle but readable.',
    },
  },

  // Appearance - Typography
  typography: {
    fontFamily: {
      title: 'Font Family',
      description: 'The font used throughout the payment form. Leave empty to use system default.',
    },
    fontSizeBase: {
      title: 'Base Font Size',
      description: 'Base font size that scales other text elements. Default is 16px.',
    },
    borderRadius: {
      title: 'Border Radius',
      description: 'Corner roundness for inputs, buttons, and containers. 0px for square, 4px+ for rounded.',
    },
    spacingUnit: {
      title: 'Spacing Unit',
      description: 'Base unit for spacing throughout the form. Affects padding and margins.',
    },
  },

  // Button Styles
  button: {
    buttonBackgroundColor: {
      title: 'Button Background',
      description: 'Background color of the primary action button (Pay button).',
    },
    buttonHeight: {
      title: 'Button Height',
      description: 'Height of the main payment button. Recommended minimum 44px for mobile accessibility.',
    },
    buttonWidth: {
      title: 'Button Width',
      description: 'Width of the payment button. Use "100%" for full-width or specific pixel values.',
    },
    buttonBorderRadius: {
      title: 'Button Border Radius',
      description: 'Corner roundness of the payment button.',
    },
    buttonBorderColor: {
      title: 'Button Border Color',
      description: 'Border color of the payment button. Typically matches background or is transparent.',
    },
    buttonTextColor: {
      title: 'Button Text Color',
      description: 'Text color on the payment button. Should contrast well with button background.',
    },
    buttonTextFontSize: {
      title: 'Button Text Size',
      description: 'Font size of the text on the payment button.',
    },
    buttonTextFontWeight: {
      title: 'Button Text Weight',
      description: 'Font weight (boldness) of button text. 400 is normal, 600 is semi-bold, 700 is bold.',
    },
    buttonBorderWidth: {
      title: 'Button Border Width',
      description: 'Thickness of the button border. Use 0 for no border.',
    },
  },

  // Currency & Language
  currency: {
    title: 'Transaction Currency',
    description: 'The currency for this payment. Changing currency reloads the SDK with payment methods that support the selected currency.',
  },
  locale: {
    title: 'Locale',
    description: 'Language and regional settings for the payment form. "Auto-detect" uses the browser language.',
  },

  // More Configurations
  moreConfig: {
    branding: {
      title: 'Branding',
      description: 'Show or hide the Hyperswitch branding/logo in the payment form.',
    },
    paymentMethodsHeaderText: {
      title: 'Payment Methods Header',
      description: 'Custom text displayed above the list of payment methods. Leave empty for default.',
    },
    savedPaymentMethodsHeaderText: {
      title: 'Saved Methods Header',
      description: 'Custom text displayed above saved payment methods section. Leave empty for default.',
    },
    paymentMethodOrder: {
      title: 'Payment Method Order',
      description: 'Comma-separated list controlling the display order. "card" should be first. Example: card, ideal, sepaDebit',
    },
    hideCardNicknameField: {
      title: 'Hide Card Nickname',
      description: 'Remove the optional "Save card as" field that lets users name their saved cards.',
    },
    hideExpiredPaymentMethods: {
      title: 'Hide Expired Methods',
      description: 'Automatically hide saved payment methods that have expired.',
    },
    displaySavedPaymentMethods: {
      title: 'Display Saved Methods',
      description: 'Show saved payment methods from previous purchases for quick selection.',
    },
    displaySavedPaymentMethodsCheckbox: {
      title: 'Show Save Checkbox',
      description: 'Display the checkbox that lets users choose to save their payment method for future use.',
    },
    savedPaymentMethodsCheckboxCheckedByDefault: {
      title: 'Checkbox Checked by Default',
      description: 'The "Save payment method" checkbox starts checked. Users must uncheck to opt out.',
    },
    readOnly: {
      title: 'Read Only Mode',
      description: 'Display payment form in read-only mode. Useful for reviewing payment details before confirmation.',
    },
    showShortSurchargeMessage: {
      title: 'Short Surcharge Message',
      description: 'Show abbreviated surcharge/fee information instead of detailed breakdowns.',
    },
  },

  // CSS Rules
  rules: {
    inspectorMode: {
      title: 'Element Inspector',
      description: 'Click to enable inspector mode, then click any element in the preview to see its CSS selector.',
    },
    tabSelected: {
      title: '.Tab--selected',
      description: 'Styling for the currently selected/active tab in tabbed layout.',
    },
    tabHover: {
      title: '.Tab:hover',
      description: 'Styling applied when hovering over a tab.',
    },
    input: {
      title: '.Input',
      description: 'Base styling for all text input fields (card number, expiry, CVC).',
    },
    inputInvalid: {
      title: '.Input--invalid',
      description: 'Styling for inputs with validation errors.',
    },
    inputPlaceholder: {
      title: '.Input::placeholder',
      description: 'Styling for placeholder text inside input fields.',
    },
    label: {
      title: '.Label',
      description: 'Styling for field labels (Card Number, Expiry, etc.).',
    },
    checkboxChecked: {
      title: '.Checkbox--checked',
      description: 'Styling for checked checkboxes (like "Save card").',
    },
    orPayUsingLabel: {
      title: '.OrPayUsingLabel',
      description: 'Styling for the "Or pay using" divider text between wallet buttons and card form.',
    },
    termsTextLabel: {
      title: '.TermsTextLabel',
      description: 'Styling for terms and conditions text.',
    },
  },
};

export default sdkTooltips;
