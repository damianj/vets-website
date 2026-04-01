/* eslint-disable camelcase */
// yarn mock-api --responses ./src/applications/simple-forms/21-4138/tests/e2e/fixtures/mocks/local-mock-responses-veteran.js
const mockUser = require('./user-veteran.json');
const mockSipGet = require('./sip-get-4138-veteran.json');
const mockSipPut = require('./sip-put-4138.json');
const mockFeatureToggles = require('./featureToggles.json');
const mockSubmit = require('../../../../../shared/tests/e2e/fixtures/mocks/application-submit.json');
const commonResponses = require('../../../../../../../platform/testing/local-dev-mock-api/common');

module.exports = {
  ...commonResponses,
  'GET /v0/user': mockUser,

  'OPTIONS /v0/maintenance_windows': 'OK',
  'GET /v0/maintenance_windows': { data: [] },

  'GET /v0/feature_toggles': mockFeatureToggles,

  'GET /data/cms/vamc-ehr.json': { data: [] },

  'GET /v0/in_progress_forms/21-4138': mockSipGet,
  'PUT /v0/in_progress_forms/21-4138': mockSipPut,

  'POST /simple_forms_api/v1/simple_forms': mockSubmit,
};
/* eslint-enable camelcase */
