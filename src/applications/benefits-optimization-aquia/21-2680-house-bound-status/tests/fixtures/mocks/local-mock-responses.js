// yarn mock-api --responses ./src/applications/{application}/tests/e2e/fixtures/mocks/local-mock-responses.js
const mockUser = require('./user.json');
const featureToggles = require('./feature-toggles.json');
const addressValidationConfidence70 = require('../../../../shared/tests/mocks/address-validation-confidence-70.json');

const responses = {
  'GET /v0/user': mockUser,
  'GET /v0/feature_toggles': featureToggles,
  'POST /v0/profile/address_validation': addressValidationConfidence70,

  // Mock the in-progress forms endpoint for prefill
  'GET /v0/in_progress_forms/21-2680': {
    formData: {},
    metadata: {
      version: 0,
      prefill: true,
      returnUrl: '/veteran-information',
    },
  },
};

module.exports = responses;
