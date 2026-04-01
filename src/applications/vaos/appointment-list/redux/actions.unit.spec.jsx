import { expect } from 'chai';
import sinon from 'sinon';
import { mockFetch } from '@department-of-veterans-affairs/platform-testing/helpers';
import {
  fetchFacilitySettings,
  fetchFutureAppointments,
  FETCH_FACILITY_SETTINGS,
  FETCH_FACILITY_SETTINGS_SUCCEEDED,
  FETCH_FACILITY_SETTINGS_FAILED,
  FETCH_FUTURE_APPOINTMENTS_SUCCEEDED,
} from './actions';
import * as appointmentService from '../../services/appointment';
import * as parentActions from '../../redux/actions';
import * as errorUtils from '../../utils/error';
import { mockSchedulingConfigurationsApi } from '../../tests/mocks/mockApis';
import MockSchedulingConfigurationResponse, {
  MockServiceConfiguration,
  MockVaServiceConfiguration,
} from '../../tests/fixtures/MockSchedulingConfigurationResponse';
import { TYPE_OF_CARE_IDS } from '../../utils/constants';

describe('VAOS appointment-list redux actions', () => {
  describe('fetchFacilitySettings', () => {
    beforeEach(() => {
      mockFetch();
    });

    const createState = (useVpg = false) => ({
      user: {
        profile: {
          facilities: [
            { facilityId: '983', isCerner: false },
            { facilityId: '984', isCerner: false },
          ],
        },
      },
      featureToggles: {
        vaOnlineSchedulingUseVpg: useVpg,
      },
    });

    it('should dispatch FETCH_FACILITY_SETTINGS and FETCH_FACILITY_SETTINGS_SUCCEEDED', async () => {
      // Arrange
      const dispatch = sinon.spy();
      const state = createState(false);
      const getState = () => state;

      mockSchedulingConfigurationsApi({
        facilityIds: ['983', '984'],
        response: [
          new MockSchedulingConfigurationResponse({
            facilityId: '983',
            services: [
              new MockServiceConfiguration({
                typeOfCareId: TYPE_OF_CARE_IDS.COVID_VACCINE_ID,
                directEnabled: true,
              }),
            ],
          }),
          new MockSchedulingConfigurationResponse({
            facilityId: '984',
            services: [
              new MockServiceConfiguration({
                typeOfCareId: TYPE_OF_CARE_IDS.COVID_VACCINE_ID,
                directEnabled: false,
              }),
            ],
          }),
        ],
      });

      // Act
      const thunk = fetchFacilitySettings();
      await thunk(dispatch, getState);

      // Assert
      expect(dispatch.firstCall.args[0]).to.deep.equal({
        type: FETCH_FACILITY_SETTINGS,
      });
      expect(dispatch.secondCall.args[0].type).to.equal(
        FETCH_FACILITY_SETTINGS_SUCCEEDED,
      );
      expect(dispatch.secondCall.args[0].settings).to.be.an('array');
    });

    it('should pass useVpg=false to getLocationSettings when feature flag is disabled', async () => {
      // Arrange
      const dispatch = sinon.spy();
      const state = createState(false);
      const getState = () => state;

      mockSchedulingConfigurationsApi({
        facilityIds: ['983', '984'],
        response: [
          new MockSchedulingConfigurationResponse({
            facilityId: '983',
            services: [
              new MockServiceConfiguration({
                typeOfCareId: TYPE_OF_CARE_IDS.COVID_VACCINE_ID,
                directEnabled: true,
              }),
            ],
          }),
        ],
      });

      // Act
      const thunk = fetchFacilitySettings();
      await thunk(dispatch, getState);

      // Assert
      expect(dispatch.secondCall.args[0].type).to.equal(
        FETCH_FACILITY_SETTINGS_SUCCEEDED,
      );
      // Settings should use services format (legacy) when useVpg is false
      const { settings } = dispatch.secondCall.args[0];
      expect(settings).to.be.an('array');
    });

    it('should pass useVpg=true to getLocationSettings when feature flag is enabled', async () => {
      // Arrange
      const dispatch = sinon.spy();
      const state = createState(true);
      const getState = () => state;

      mockSchedulingConfigurationsApi({
        facilityIds: ['983', '984'],
        response: [
          new MockSchedulingConfigurationResponse({
            facilityId: '983',
            services: [
              new MockServiceConfiguration({
                typeOfCareId: TYPE_OF_CARE_IDS.COVID_VACCINE_ID,
                directEnabled: true,
              }),
            ],
            vaServices: [
              new MockVaServiceConfiguration({
                clinicalServiceId: 'covid',
                bookedAppointments: true,
                apptRequests: false,
              }),
            ],
          }),
        ],
      });

      // Act
      const thunk = fetchFacilitySettings();
      await thunk(dispatch, getState);

      // Assert
      expect(dispatch.secondCall.args[0].type).to.equal(
        FETCH_FACILITY_SETTINGS_SUCCEEDED,
      );
      // Settings should use vaServices format (VPG) when useVpg is true
      const { settings } = dispatch.secondCall.args[0];
      expect(settings).to.be.an('array');
    });

    it('should dispatch FETCH_FACILITY_SETTINGS_FAILED on error', async () => {
      // Arrange
      const dispatch = sinon.spy();
      const state = createState(false);
      const getState = () => state;

      mockSchedulingConfigurationsApi({
        facilityIds: ['983', '984'],
        response: [],
        responseCode: 500,
      });

      // Act
      const thunk = fetchFacilitySettings();
      await thunk(dispatch, getState);

      // Assert
      expect(dispatch.firstCall.args[0]).to.deep.equal({
        type: FETCH_FACILITY_SETTINGS,
      });
      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: FETCH_FACILITY_SETTINGS_FAILED,
      });
    });
  });

  describe('fetchFutureAppointments', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    const futureAppointmentsState = () => ({
      user: {
        profile: {
          facilities: [{ facilityId: '983', isCerner: false }],
        },
      },
      featureToggles: {
        vaOnlineSchedulingCCDirectScheduling: false,
      },
    });

    it('calls captureError when a clinic-based video appointment is missing stationId', async () => {
      const captureStub = sandbox.stub(errorUtils, 'captureError');
      sandbox.stub(appointmentService, 'fetchAppointments').resolves([
        {
          videoData: { kind: 'CLINIC_BASED' },
          location: {},
        },
      ]);
      sandbox.stub(parentActions, 'getAdditionalFacilityInfoV2').returns(null);

      const dispatch = sinon.spy();
      const getState = () => futureAppointmentsState();

      await fetchFutureAppointments({ includeRequests: false })(
        dispatch,
        getState,
      );

      const sta6aidMessage = 'VAOS clinic based appointment missing sta6aid';
      const sta6aidCalls = captureStub
        .getCalls()
        .filter(
          call =>
            call.args[0] instanceof Error &&
            call.args[0].message === sta6aidMessage &&
            call.args[1] === true &&
            call.args[2] === sta6aidMessage,
        );
      expect(sta6aidCalls.length).to.equal(1);
      expect(captureStub.callCount).to.equal(1);

      expect(
        dispatch.calledWithMatch({ type: FETCH_FUTURE_APPOINTMENTS_SUCCEEDED }),
      ).to.be.true;
    });
  });
});
