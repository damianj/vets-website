// yarn mock-api --responses ./src/applications/benefits-optimization-aquia/21-4192-employment-information/tests/fixtures/mocks/local-mock-responses.js
const mockUser = require('./user.json');
const featureToggles = require('./feature-toggles.json');
const addressValidationConfidence70 = require('../../../../shared/tests/mocks/address-validation-confidence-70.json');

const proxy = {
  'GET /v0/user': mockUser,
  'GET /v0/feature_toggles': featureToggles,
  'GET /data/cms/vamc-ehr.json': { data: [] },
  'POST /v0/profile/address_validation': (_req, res) => {
    return res.json(addressValidationConfidence70);
  },
};

module.exports = proxy;
