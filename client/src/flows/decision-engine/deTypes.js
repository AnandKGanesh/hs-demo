/**
 * Type definitions for the Decision Engine Playground (JSDoc)
 * @module deTypes
 */

/**
 * @typedef {'Card'} PaymentMethod
 */

/**
 * @typedef {Object} ProcessorPaymentMethodMatrix
 * @property {Object.<string, Object.<PaymentMethod, boolean>>} processorId
 */

/**
 * @typedef {Object} ProcessorIncidentStatus
 * @property {number|null} processorId
 */

/**
 * @typedef {'paymentMethod'} ConditionField
 */

/**
 * @typedef {'EQUALS'} ConditionOperator
 */

/**
 * @typedef {Object} Condition
 * @property {ConditionField} field
 * @property {ConditionOperator} operator
 * @property {PaymentMethod} value
 */

/**
 * @typedef {Object} StructuredRule
 * @property {string} id
 * @property {Condition} condition
 * @property {Object} action
 * @property {'ROUTE_TO_PROCESSOR'} action.type
 * @property {string} action.processorId
 */

/**
 * @typedef {Object} ProcessorSuccessRateData
 * @property {number} sr
 * @property {number} srDeviation
 * @property {number} volumeShare
 * @property {number} successfulPaymentCount
 * @property {number} totalPaymentCount
 */

/**
 * @typedef {Object} ControlsState
 * @property {number} totalPayments
 * @property {PaymentMethod[]} selectedPaymentMethods
 * @property {ProcessorPaymentMethodMatrix} processorMatrix
 * @property {StructuredRule|null} structuredRule
 * @property {ProcessorIncidentStatus} processorIncidents
 * @property {number} overallSuccessRate
 * @property {Object.<string, ProcessorSuccessRateData>} processorWiseSuccessRates
 * @property {boolean} [isSuccessBasedRoutingEnabled]
 * @property {number} [numberOfBatches]
 * @property {number} [batchSize]
 */

/**
 * @typedef {Object} FormValues
 * @extends ControlsState
 * @property {number} totalPayments
 * @property {PaymentMethod[]} selectedPaymentMethods
 * @property {ProcessorPaymentMethodMatrix} processorMatrix
 * @property {StructuredRule|null} structuredRule
 * @property {ProcessorIncidentStatus} processorIncidents
 * @property {number} overallSuccessRate
 * @property {Object.<string, ProcessorSuccessRateData>} processorWiseSuccessRates
 * @property {boolean} [isSuccessBasedRoutingEnabled]
 * @property {number} [explorationPercent]
 * @property {number} [bucketSize]
 * @property {number} [numberOfBatches]
 * @property {number} [batchSize]
 * @property {Object.<string, number>} [connectorWiseFailurePercentage]
 * @property {Object.<string, TestCardDetails>} [connectorWiseTestCards]
 * @property {Object.<string, boolean>} [selectedRoutingParams]
 */

/**
 * @typedef {Object} TestCardDetails
 * @property {Object} [successCard]
 * @property {string} [successCard.cardNumber]
 * @property {string} [successCard.expMonth]
 * @property {string} [successCard.expYear]
 * @property {string} [successCard.holderName]
 * @property {string} [successCard.cvc]
 * @property {Object} [failureCard]
 * @property {string} [failureCard.cardNumber]
 * @property {string} [failureCard.expMonth]
 * @property {string} [failureCard.expYear]
 * @property {string} [failureCard.holderName]
 * @property {string} [failureCard.cvc]
 */

/**
 * @typedef {Object} ProcessorSuccessRate
 * @property {string} processor
 * @property {number} sr
 * @property {number} successfulPaymentCount
 * @property {number} totalPaymentCount
 */

/**
 * @typedef {Object} TimeSeriesDataPoint
 * @property {number} time
 */

/**
 * @typedef {TimeSeriesDataPoint[]} ProcessorMetricsHistory
 */

/**
 * @typedef {Object} OverallSRHistoryDataPoint
 * @property {number} time
 * @property {number} overallSR
 */

/**
 * @typedef {OverallSRHistoryDataPoint[]} OverallSRHistory
 */

/**
 * @typedef {Object} MerchantConnector
 * @property {string} connector_name
 * @property {string} merchant_connector_id
 * @property {boolean} [disabled]
 * @property {string} [connector_type]
 */

/**
 * @typedef {Object} TransactionLogEntry
 * @property {number} transactionNumber
 * @property {string} status
 * @property {string} connector
 * @property {number} timestamp
 * @property {'exploration'|'exploitation'|'default'|'unknown'|'N/A'} [routingApproach]
 * @property {Object.<string, number>} [sr_scores]
 */

/**
 * @typedef {Object} SinglePaymentOutcome
 * @property {boolean} isSuccess
 * @property {string|null} routedProcessorId
 * @property {TransactionLogEntry|null} logEntry
 */

/**
 * @typedef {Object} GlobalCardDetailsFromStorage
 * @property {string} [successCardNumber]
 * @property {string} [successCardExpMonth]
 * @property {string} [successCardExpYear]
 * @property {string} [successCardHolderName]
 * @property {string} [successCardCvc]
 * @property {string} [failureCardNumber]
 * @property {string} [failureCardExpMonth]
 * @property {string} [failureCardExpYear]
 * @property {string} [failureCardHolderName]
 * @property {string} [failureCardCvc]
 */

export {};
