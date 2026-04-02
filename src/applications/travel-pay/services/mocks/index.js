const delay = require('mocker-api/lib/delay');

const {
  getExpenseHandler,
  createExpenseHandler,
  updateExpenseHandler,
  deleteExpenseHandler,
} = require('./expenses/expenseHandlers');
const { expensesStore } = require('./mockStore');
const {
  getClaimsHandler,
  getClaimByIdHandler,
  updateClaimHandler,
  createClaimHandler,
  submitClaimHandler,
} = require('./claims/claimHandlers');
const {
  getAppointmentsHandler,
  getAppointmentByIdHandler,
} = require('./vaos/appointmentHandlers');
const {
  uploadDocumentHandler,
  deleteDocumentHandler,
  downloadDocumentHandler,
} = require('./documents/documentHandlers');
const { EXPENSE_TYPES } = require('./constants');
const TOGGLE_NAMES = require('../../../../platform/utilities/feature-toggles/featureFlagNames.json');

const user = {
  withAddress: require('./user.json'),
  noAddress: require('./user-no-address.json'),
};
const maintenanceWindows = {
  none: require('./maintenance-windows/none.json'),
  enabled: require('./maintenance-windows/enabled.json'),
};

const featureTogglesResponse = {
  data: {
    type: 'feature_toggles',
    features: [
      // Travel Pay feature flags
      TOGGLE_NAMES.travelPayPowerSwitch,
      TOGGLE_NAMES.travelPayViewClaimDetails,
      TOGGLE_NAMES.travelPaySubmitMileageExpense,
      TOGGLE_NAMES.travelPayClaimsManagement,
      TOGGLE_NAMES.travelPayClaimsManagementDecisionReason,
      TOGGLE_NAMES.travelPayEnableComplexClaims,
      TOGGLE_NAMES.travelPayEnableHeicConversion,
      TOGGLE_NAMES.travelPayEnableCommunityCare,
      TOGGLE_NAMES.travelPayApptAddV4Upgrade,
    ]
      .map(name => ({ name, value: true }))
      .concat([
        // VAOS camelCase flags
        { name: 'vaOnlineScheduling', value: true },
        { name: 'travelPayViewClaimDetails', value: true },
        { name: 'travelPaySubmitMileageExpense', value: true },
      ]),
  },
};

const responses = {
  'OPTIONS /v0/maintenance_windows': 'OK',
  'GET /v0/maintenance_windows': maintenanceWindows.none,
  'GET /v0/user': user.withAddress,
  'GET /v0/feature_toggles': featureTogglesResponse,

  // Get travel-pay appointment - handle specific IDs first
  'GET /vaos/v2/appointments/:id': getAppointmentByIdHandler(),
  // 'GET /vaos/v2/appointments/:id': (req, res) => {
  //   return res.status(503).json({
  //     errors: [
  //       {
  //         title: 'Service unavailable',
  //         status: 503,
  //         detail: 'An unknown error has occured.',
  //         code: 'VA900',
  //       },
  //     ],
  //   });
  // },

  // Get appointments - handles both date range queries and list view
  'GET /vaos/v2/appointments': getAppointmentsHandler(),

  // Simulate getAppointmentDataByDateTime failing on the claim details page
  // 'GET /vaos/v2/appointments': (req, res) => {
  //   const { start, end } = req.query;
  //   if (start && end) {
  //     return res.status(500).json({
  //       errors: [
  //         {
  //           title: 'Server error',
  //           status: 500,
  //           detail: 'Internal Server Error',
  //         },
  //       ],
  //     });
  //   }
  //   // Normal appointments list
  //   return getAppointmentsHandler()(req, res);
  // },

  // Get all claims
  // 'GET /travel_pay/v0/claims'
  'GET /travel_pay/v0/claims': getClaimsHandler(),
  // 'GET /travel_pay/v0/claims': (req, res) => {
  //   return res.status(503).json({
  //     errors: [
  //       {
  //         title: 'Server error',
  //         status: 503,
  //         detail: 'An unknown server error has occurred.',
  //         code: 'VA900',
  //       },
  //     ],
  //   });
  // },
  // 'GET /travel_pay/v0/claims': (req, res) => {
  //   return res.status(400).json({
  //     errors: [
  //       {
  //         title: 'Bad request',
  //         status: 400,
  //         detail: 'There is not an ICN in the auth token.',
  //         code: 'VA900',
  //       },
  //     ],
  //   });
  // },
  // 'GET /travel_pay/v0/claims': (req, res) => {
  //   return res.status(403).json({
  //     errors: [
  //       {
  //         title: 'Forbidden',
  //         status: 403,
  //         detail: 'The user is not a Veteran.',
  //         code: 'VA900',
  //       },
  //     ],
  //   });
  // },
  //

  // Get claim
  // GET /travel_pay/v0/claims/:id
  'GET /travel_pay/v0/claims/:id': getClaimByIdHandler({ expensesStore }),
  //
  // 'GET /travel_pay/v0/claims/:id': (req, res) => {
  //   return res.status(403).json({
  //     errors: [
  //       {
  //         title: 'Forbidden',
  //         status: 403,
  //         detail: 'Forbidden.',
  //         code: 'VA900',
  //       },
  //     ],
  //   });
  // },

  // Update the complex claim
  'PATCH /travel_pay/v0/claims/:id': updateClaimHandler(),

  // Create a new claim
  // POST /travel_pay/v0/claims
  'POST /travel_pay/v0/claims': createClaimHandler(),
  // 'POST /travel_pay/v0/claims': (req, res) => {
  //   return res.status(502).json({
  //     errors: [
  //       {
  //         title: 'Service unavailable',
  //         status: 503,
  //         detail: 'An unknown error has occured.',
  //         code: 'VA900',
  //       },
  //     ],
  //   });
  // },

  // Create a new complex claim
  // POST /travel_pay/v0/complex_claims
  'POST /travel_pay/v0/complex_claims': createClaimHandler(),

  // Submitting a complex claim
  // PATCH /travel_pay/v0/complex_claims/:claimId/submit
  'PATCH /travel_pay/v0/complex_claims/:claimId/submit': submitClaimHandler(),

  // Upload proof of attendance document
  // POST /travel_pay/v0/claims/:claimId/documents
  'POST /travel_pay/v0/claims/:claimId/documents': uploadDocumentHandler(),

  // Deleting documents
  // DELETE /travel_pay/v0/claims/:claimId/documents/:documentId
  'DELETE /travel_pay/v0/claims/:claimId/documents/:documentId': deleteDocumentHandler(),

  // Document download
  // GET /travel_pay/v0/claims/:claimId/documents/:docId
  'GET /travel_pay/v0/claims/:claimId/documents/:docId': downloadDocumentHandler(),
};

EXPENSE_TYPES.forEach(type => {
  // Create new expenses
  responses[
    `POST /travel_pay/v0/claims/:claimId/expenses/${type}`
  ] = createExpenseHandler(type);
  // Error condition example:
  // responses[`POST /travel_pay/v0/claims/:claimId/expenses/${type}`] = (
  //   req,
  //   res,
  // ) => {
  //   return res.status(500).json({
  //     errors: [
  //       {
  //         title: 'Server error',
  //         status: 500,
  //         detail: 'Failed to create expense',
  //         code: 'VA900',
  //       },
  //     ],
  //   });
  // };

  // Get individual expense
  responses[
    `GET /travel_pay/v0/claims/:claimId/expenses/${type}/:expenseId`
  ] = getExpenseHandler(type);

  // Update expense
  responses[
    `PATCH /travel_pay/v0/expenses/${type}/:expenseId`
  ] = updateExpenseHandler();

  // Delete expense
  responses[
    `DELETE /travel_pay/v0/expenses/${type}/:expenseId`
  ] = deleteExpenseHandler();
});
module.exports = delay(responses, 1000);
