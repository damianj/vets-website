import { expect } from 'chai';
import sinon from 'sinon';
import { combineReducers, applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { commonReducer } from 'platform/startup/store';
import {
  mockFetch,
  resetFetch,
  setFetchJSONResponse,
  setFetchJSONFailure,
} from 'platform/testing/unit/helpers';

import { vassApi } from './vassApi';
import reducers from '../reducers';
import * as authUtils from '../../utils/auth';
import { TOKEN_ERROR_CODES, SERVER_ERROR_CODES } from '../../utils/constants';
import { defaultFormState } from '../../utils/form';

const createTestStore = (vassFormOverrides = {}) =>
  createStore(
    combineReducers({ ...commonReducer, ...reducers }),
    {
      vassForm: {
        ...defaultFormState,
        uuid: 'test-uuid',
        lastName: 'Smith',
        dob: '1990-01-15',
        ...vassFormOverrides,
      },
    },
    applyMiddleware(thunk, vassApi.middleware),
  );

describe('vassApi', () => {
  beforeEach(() => {
    mockFetch();
  });

  afterEach(() => {
    resetFetch();
  });

  describe('when no VASS token exists', () => {
    let getVassTokenStub;

    beforeEach(() => {
      getVassTokenStub = sinon
        .stub(authUtils, 'getVassToken')
        .returns(undefined);
    });

    afterEach(() => {
      getVassTokenStub.restore();
    });

    it('postAppointment returns INVALID_TOKEN error', async () => {
      const store = createTestStore();
      const result = await store.dispatch(
        vassApi.endpoints.postAppointment.initiate({
          topics: ['Education'],
          dtStartUtc: '2025-01-15T10:00:00.000Z',
          dtEndUtc: '2025-01-15T11:00:00.000Z',
        }),
      );

      expect(result.error).to.exist;
      expect(result.error.code).to.equal(TOKEN_ERROR_CODES.INVALID_TOKEN);
    });

    it('getTopics returns INVALID_TOKEN error', async () => {
      const store = createTestStore();
      const result = await store.dispatch(
        vassApi.endpoints.getTopics.initiate(),
      );

      expect(result.error).to.exist;
      expect(result.error.code).to.equal(TOKEN_ERROR_CODES.INVALID_TOKEN);
    });

    it('getAppointmentAvailability returns INVALID_TOKEN error', async () => {
      const store = createTestStore();
      const result = await store.dispatch(
        vassApi.endpoints.getAppointmentAvailability.initiate(),
      );

      expect(result.error).to.exist;
      expect(result.error.code).to.equal(TOKEN_ERROR_CODES.INVALID_TOKEN);
    });

    it('cancelAppointment returns INVALID_TOKEN error', async () => {
      const store = createTestStore();
      const result = await store.dispatch(
        vassApi.endpoints.cancelAppointment.initiate({
          appointmentId: 'appt-123',
        }),
      );

      expect(result.error).to.exist;
      expect(result.error.code).to.equal(TOKEN_ERROR_CODES.INVALID_TOKEN);
    });
  });

  describe('api error normalization', () => {
    it('normalizes a non-standard error response into the expected errors shape', async () => {
      setFetchJSONFailure(global.fetch.onCall(0), {
        status: 500,
        error: 'Internal Server Error',
      });

      const store = createTestStore();
      const result = await store.dispatch(
        vassApi.endpoints.postAuthentication.initiate({
          uuid: 'test-uuid',
          lastName: 'Smith',
          dob: '1990-01-15',
        }),
      );

      expect(result.error).to.exist;
      expect(result.error.code).to.equal(SERVER_ERROR_CODES.SERVICE_ERROR);
      expect(result.error.detail).to.equal('Internal Server Error');
    });

    it('passes through a standard vets-api error unchanged', async () => {
      setFetchJSONFailure(global.fetch.onCall(0), {
        errors: [
          {
            code: 'invalid_credentials',
            detail: 'Could not match credentials',
          },
        ],
      });

      const store = createTestStore();
      const result = await store.dispatch(
        vassApi.endpoints.postAuthentication.initiate({
          uuid: 'test-uuid',
          lastName: 'Smith',
          dob: '1990-01-15',
        }),
      );

      expect(result.error).to.exist;
      expect(result.error.code).to.equal('invalid_credentials');
      expect(result.error.detail).to.equal('Could not match credentials');
    });
  });

  describe('postOTPVerification onQueryStarted', () => {
    it('does not call setVassToken when response has no token', async () => {
      const setVassTokenSpy = sinon.spy(authUtils, 'setVassToken');

      setFetchJSONResponse(global.fetch.onCall(0), {
        data: {
          message: 'Authenticated successfully',
        },
      });

      const store = createTestStore();
      await store.dispatch(
        vassApi.endpoints.postOTPVerification.initiate({ otp: '123456' }),
      );

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(setVassTokenSpy.called).to.be.false;
      setVassTokenSpy.restore();
    });
  });
});
