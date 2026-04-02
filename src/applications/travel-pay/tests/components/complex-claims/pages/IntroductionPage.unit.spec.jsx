import React from 'react';
import { expect } from 'chai';
import { useSelector } from 'react-redux';
import { waitFor } from '@testing-library/react';

import { $ } from 'platform/forms-system/src/js/utilities/ui';

import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import {
  MemoryRouter,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom-v5-compat';
import sinon from 'sinon';

import { TOGGLE_NAMES } from 'platform/utilities/feature-toggles';
import * as actions from '../../../../redux/actions';

import reducer from '../../../../redux/reducer';
import IntroductionPage from '../../../../components/complex-claims/pages/IntroductionPage';
import ComplexClaimRedirect from '../../../../components/complex-claims/pages/ComplexClaimRedirect';
import { BTSSS_PORTAL_URL } from '../../../../constants';

// Mock component for navigation testing
const ChooseExpenseType = () => (
  <div data-testid="choose-expense-page">Choose Expense</div>
);

describe('Travel Pay – IntroductionPage', () => {
  const LocationDisplay = () => {
    const location = useLocation();
    return <div data-testid="location-display">{location.pathname}</div>;
  };

  const baseAppointment = {
    id: '12345',
    localStartTime: '2026-02-15T06:30:00.000-04:00',
    location: { id: '123', attributes: { name: 'Test Facility' } },
    isCompAndPen: false,
    isCC: false,
  };

  const getData = () => ({
    travelPay: {
      claimSubmission: { isSubmitting: false, error: null, data: null },
      appointment: {
        isLoading: false,
        error: null,
        data: {
          ...baseAppointment,
        },
      },
      complexClaim: {
        claim: {
          creation: {
            isLoading: false,
            error: null,
          },
          submission: {
            id: '',
            isSubmitting: false,
            error: null,
            data: null,
          },
          data: null,
        },
        expenses: {
          creation: {
            isLoading: false,
            error: null,
          },
          update: {
            id: '',
            isLoading: false,
            error: null,
          },
          delete: {
            id: '',
            isLoading: false,
            error: null,
          },
          data: [],
        },
      },
    },
  });

  const buildState = ({
    isCC = false,
    communityCareEnabled = false,
    travelPayApptAddV4Upgrade = false,
  } = {}) => {
    const ccOverrides = isCC
      ? {
          facilityName: 'Community Care Clinic',
          kind: 'cc',
          locationId: '534',
          location: {
            id: '534',
            attributes: { name: 'Community Care Clinic' },
          },
        }
      : {};

    return {
      ...getData(),
      featureToggles: {
        loading: false,
        [TOGGLE_NAMES.travelPayEnableCommunityCare]: communityCareEnabled,
        [TOGGLE_NAMES.travelPayApptAddV4Upgrade]: travelPayApptAddV4Upgrade,
      },
      travelPay: {
        ...getData().travelPay,
        appointment: {
          ...getData().travelPay.appointment,
          data: {
            ...baseAppointment,
            isCC,
            ...ccOverrides,
          },
        },
      },
    };
  };

  const initialRoute = '/file-new-claim/12345';

  const renderPage = state =>
    renderWithStoreAndRouter(
      <MemoryRouter initialEntries={[initialRoute]}>
        <IntroductionPage />
      </MemoryRouter>,
      { initialState: state, reducers: reducer },
    );

  context('when rendering the IntroductionPage', () => {
    context('when community care flag is disabled', () => {
      it('renders the IntroductionPage with correct structure', () => {
        const { getByRole, container } = renderPage(buildState());

        // Main heading
        expect(
          getByRole('heading', {
            name: /file a travel reimbursement claim/i,
          }),
        ).to.exist;

        // Process list and step headers
        expect(container.querySelectorAll('va-process-list').length).to.equal(
          1,
        );
        expect(
          container.querySelectorAll('va-process-list-item').length,
        ).to.equal(3);
        expect(
          $(
            'va-process-list-item[header*="Check your travel reimbursement eligibility"]',
            container,
          ),
        ).to.exist;
        expect(
          $('va-process-list-item[header*="Set up direct deposit"]', container),
        ).to.exist;
        expect($('va-process-list-item[header*="File your claim"]', container))
          .to.exist;
      });

      it('renders all important VA links with expected hrefs', () => {
        const { container } = renderPage(buildState());

        expect(
          $(
            'va-link[href="/health-care/get-reimbursed-for-travel-pay/#eligibility-for-general-health"]',
            container,
          ),
        ).to.exist;

        expect(
          $(
            'va-link[href="/resources/how-to-set-up-direct-deposit-for-va-travel-pay-reimbursement/"]',
            container,
          ),
        ).to.exist;

        const btsssPortalLink = $(
          `va-link[href="${BTSSS_PORTAL_URL}"]`,
          container,
        );
        expect(btsssPortalLink).to.exist;
        expect(btsssPortalLink).to.have.attribute('external');

        expect($('a[href="/claims/"]', container)).to.exist;
      });

      it('renders OMB info', () => {
        const { container } = renderPage(buildState());

        expect($('va-omb-info[exp-date="11/30/2027"]'), container).to.exist;
        expect($('va-omb-info[omb-number="2900-0798"]'), container).to.exist;
        expect($('va-omb-info[res-burden="10"]'), container).to.exist;
      });

      it('renders correctly even if appointment prop is missing', () => {
        const { getByTestId } = renderPage(buildState());

        expect(getByTestId('introduction-page')).to.exist;
      });

      it('renders ComplexClaimRedirect when no skipRedirect state is present', () => {
        const stateWithCreatedClaim = {
          ...getData(),
          travelPay: {
            ...getData().travelPay,
            complexClaim: {
              ...getData().travelPay.complexClaim,
              claim: {
                ...getData().travelPay.complexClaim.claim,
                data: {
                  claimId: '45678',
                },
              },
            },
          },
        };

        const { container } = renderWithStoreAndRouter(
          <MemoryRouter initialEntries={[initialRoute]}>
            <IntroductionPage />
          </MemoryRouter>,
          {
            initialState: stateWithCreatedClaim,
            reducers: reducer,
          },
        );

        // The redirect component should be rendered (and it will redirect)
        // We can't directly test for the component, but we can verify the page structure
        expect(container.querySelector('[data-testid="introduction-page"]')).to
          .exist;
      });

      it('does NOT render ComplexClaimRedirect when skipRedirect state is true', () => {
        const stateWithCreatedClaim = {
          ...getData(),
          travelPay: {
            ...getData().travelPay,
            complexClaim: {
              ...getData().travelPay.complexClaim,
              claim: {
                ...getData().travelPay.complexClaim.claim,
                data: {
                  claimId: '45678',
                },
              },
            },
          },
        };

        const { getByTestId, queryByTestId } = renderWithStoreAndRouter(
          <MemoryRouter
            initialEntries={[
              { pathname: initialRoute, state: { skipRedirect: true } },
            ]}
          >
            <IntroductionPage />
          </MemoryRouter>,
          {
            initialState: stateWithCreatedClaim,
            reducers: reducer,
          },
        );

        // The introduction page should render
        expect(getByTestId('introduction-page')).to.exist;

        // The page should NOT redirect to choose-expense because skipRedirect is true
        expect(queryByTestId('choose-expense-page')).to.not.exist;
      });

      it('shows original BTSSS text and no POA text', () => {
        const { getByText, queryByText } = renderPage(buildState());

        expect(
          getByText(
            /if your trip was one way, or if you started from somewhere other than your home address/i,
          ),
        ).to.exist;
        expect(queryByText(/caregiver,/i)).to.not.exist;
        expect(queryByText(/proof of attendance/i)).to.not.exist;
      });

      it('shows the start button when appointment is not community care', () => {
        const { container } = renderPage(buildState());

        // Verify the start button exists
        const startButton = $(
          'va-link-action[text="Start your travel reimbursement claim"]',
          container,
        );
        expect(startButton).to.exist;
      });

      context('when appointment is community care', () => {
        it('shows the start button for a CC appointment when the feature flag is enabled', () => {
          const state = buildState({ isCC: true, communityCareEnabled: true });

          const { container } = renderWithStoreAndRouter(
            <MemoryRouter initialEntries={[initialRoute]}>
              <Routes>
                <Route
                  path="/file-new-claim/:apptId"
                  element={<IntroductionPage />}
                />
              </Routes>
            </MemoryRouter>,
            { initialState: state, reducers: reducer },
          );

          expect(
            $(
              'va-link-action[text="Start your travel reimbursement claim"]',
              container,
            ),
          ).to.exist;
        });

        it('doesnt show the start button when appointment is community care (isCC)', () => {
          const { container } = renderPage(buildState({ isCC: true }));

          // Verify the start button does not exist
          const startButton = $(
            'va-link-action[text="Start your travel reimbursement claim"]',
            container,
          );
          expect(startButton).to.not.exist;
        });

        it('navigates to choose-expense (not proof-of-attendance) for a non-CC appointment with an existing claim', async () => {
          // Base state for a non-CC appointment
          const baseState = buildState();

          // Merge in existing claim
          const stateWithNonCCClaim = {
            ...baseState,
            travelPay: {
              ...baseState.travelPay,
              complexClaim: {
                ...baseState.travelPay.complexClaim,
                claim: {
                  ...baseState.travelPay.complexClaim.claim,
                  data: { claimId: 'non-cc-claim-456' },
                },
              },
            },
          };

          const { getByTestId } = renderWithStoreAndRouter(
            <MemoryRouter initialEntries={[initialRoute]}>
              <Routes>
                <Route
                  path="/file-new-claim/:apptId"
                  element={<IntroductionPage />}
                />
                <Route
                  path="/file-new-claim/:apptId/:claimId/choose-expense"
                  element={<ChooseExpenseType />}
                />
              </Routes>
              <LocationDisplay />
            </MemoryRouter>,
            { initialState: stateWithNonCCClaim, reducers: reducer },
          );

          await waitFor(() => {
            expect(getByTestId('location-display').textContent).to.equal(
              '/file-new-claim/12345/non-cc-claim-456/choose-expense',
            );
          });
        });
      });
    });

    context('when community care flag is enabled', () => {
      context('when appointment is community care', () => {
        const ProofOfAttendancePage = () => (
          <div data-testid="proof-of-attendance-page">Proof of Attendance</div>
        );
        it('shows caregiver text and hides proof-of-attendance for non-CC appointments', () => {
          const { getByText, queryByText } = renderPage(
            buildState({ communityCareEnabled: true }),
          );

          expect(getByText(/caregiver,/i)).to.exist;
          expect(queryByText(/proof of attendance/i)).to.not.exist;
        });

        it('shows caregiver text AND proof-of-attendance for CC appointments', () => {
          const { getByText } = renderPage(
            buildState({ isCC: true, communityCareEnabled: true }),
          );

          expect(getByText(/caregiver,/i)).to.exist;
          expect(getByText(/proof of attendance/i)).to.exist;
        });

        it('shows the start button when appointment is community care (isCC)', () => {
          const { container } = renderPage(
            buildState({ isCC: true, communityCareEnabled: true }),
          );

          // Verify the start button does not exist
          const startButton = $(
            'va-link-action[text="Start your travel reimbursement claim"]',
            container,
          );
          expect(startButton).to.exist;
        });

        it('shows the start button when appointment is not community care', () => {
          const { container } = renderPage(
            buildState({ communityCareEnabled: true }),
          );

          // Verify the start button exists
          const startButton = $(
            'va-link-action[text="Start your travel reimbursement claim"]',
            container,
          );
          expect(startButton).to.exist;
        });

        it('navigates to proof-of-attendance when a CC claim already exists', async () => {
          const stateWithCCClaim = {
            ...buildState({ isCC: true, communityCareEnabled: true }),
            travelPay: {
              ...buildState({ isCC: true, communityCareEnabled: true })
                .travelPay,
              complexClaim: {
                ...buildState({ isCC: true, communityCareEnabled: true })
                  .travelPay.complexClaim,
                claim: {
                  ...buildState({ isCC: true, communityCareEnabled: true })
                    .travelPay.complexClaim.claim,
                  data: { claimId: 'cc-claim-999' },
                },
              },
            },
          };

          const { getByTestId } = renderWithStoreAndRouter(
            <MemoryRouter initialEntries={[initialRoute]}>
              <Routes>
                <Route
                  path="/file-new-claim/:apptId"
                  element={<IntroductionPage />}
                />
                <Route
                  path="/file-new-claim/:apptId/:claimId/proof-of-attendance"
                  element={<ProofOfAttendancePage />}
                />
              </Routes>
              <LocationDisplay />
            </MemoryRouter>,
            { initialState: stateWithCCClaim, reducers: reducer },
          );

          await waitFor(() => {
            expect(getByTestId('location-display').textContent).to.equal(
              '/file-new-claim/12345/cc-claim-999/proof-of-attendance',
            );
          });
        });
      });
    });
  });

  context('when navigating', () => {
    it('navigates to choose-expense when a claim already exists', async () => {
      // Set up initial state with a created claim
      const stateWithCreatedClaim = {
        ...getData(),
        travelPay: {
          ...getData().travelPay,
          complexClaim: {
            ...getData().travelPay.complexClaim,
            claim: {
              ...getData().travelPay.complexClaim.claim,
              data: {
                claimId: '45678',
              },
            },
          },
        },
      };

      const { getByTestId } = renderWithStoreAndRouter(
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route
              path="/file-new-claim/:apptId"
              element={<IntroductionPage />}
            />
            <Route
              path="/file-new-claim/:apptId/:claimId/choose-expense"
              element={<ChooseExpenseType />}
            />
          </Routes>
          <LocationDisplay />
        </MemoryRouter>,
        {
          initialState: stateWithCreatedClaim,
          reducers: reducer,
        },
      );

      // ComplexClaimRedirect should automatically redirect to choose-expense
      await waitFor(() => {
        expect(getByTestId('location-display').textContent).to.equal(
          '/file-new-claim/12345/45678/choose-expense',
        );
      });
    });

    it('navigates using appointment claim ID when complexClaim data is null', async () => {
      // Set up state with claim ID on appointment but null complexClaim data
      const stateWithAppointmentClaim = {
        ...getData(),
        travelPay: {
          ...getData().travelPay,
          appointment: {
            ...getData().travelPay.appointment,
            data: {
              ...baseAppointment,
              travelPayClaim: {
                claim: {
                  id: '99999',
                },
              },
            },
          },
          complexClaim: {
            ...getData().travelPay.complexClaim,
            claim: {
              ...getData().travelPay.complexClaim.claim,
              data: null,
            },
          },
        },
      };

      const { getByTestId, container } = renderWithStoreAndRouter(
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route
              path="/file-new-claim/:apptId"
              element={<IntroductionPage />}
            />
            <Route
              path="/file-new-claim/:apptId/:claimId"
              element={<ComplexClaimRedirect />}
            />
            <Route
              path="/file-new-claim/:apptId/:claimId/choose-expense"
              element={<ChooseExpenseType />}
            />
          </Routes>
          <LocationDisplay />
        </MemoryRouter>,
        {
          initialState: stateWithAppointmentClaim,
          reducers: reducer,
        },
      );

      const startButton = $(
        'va-link-action[text="Start your travel reimbursement claim"]',
        container,
      );
      expect(startButton).to.exist;
      startButton.click();

      await waitFor(() => {
        expect(getByTestId('location-display').textContent).to.equal(
          '/file-new-claim/12345/99999/choose-expense',
        );
      });
    });

    it('does NOT redirect when navigating from choose-expense with skipRedirect state', () => {
      const stateWithCreatedClaim = {
        ...getData(),
        travelPay: {
          ...getData().travelPay,
          complexClaim: {
            ...getData().travelPay.complexClaim,
            claim: {
              ...getData().travelPay.complexClaim.claim,
              data: {
                claimId: '45678',
              },
            },
          },
        },
      };

      const { getByTestId, container } = renderWithStoreAndRouter(
        <MemoryRouter
          initialEntries={[
            { pathname: initialRoute, state: { skipRedirect: true } },
          ]}
        >
          <Routes>
            <Route
              path="/file-new-claim/:apptId"
              element={<IntroductionPage />}
            />
            <Route
              path="/file-new-claim/:apptId/:claimId/choose-expense"
              element={<ChooseExpenseType />}
            />
          </Routes>
          <LocationDisplay />
        </MemoryRouter>,
        {
          initialState: stateWithCreatedClaim,
          reducers: reducer,
        },
      );

      // Should stay on intro page
      expect(getByTestId('introduction-page')).to.exist;

      // Verify we're still on the intro route
      expect(getByTestId('location-display').textContent).to.equal(
        '/file-new-claim/12345',
      );

      // Verify the start button is still present
      const startButton = $(
        'va-link-action[text="Start your travel reimbursement claim"]',
        container,
      );
      expect(startButton).to.exist;
    });

    it('renders ComplexClaimRedirect on browser reload (no location state)', async () => {
      const stateWithCreatedClaim = {
        ...getData(),
        travelPay: {
          ...getData().travelPay,
          complexClaim: {
            ...getData().travelPay.complexClaim,
            claim: {
              ...getData().travelPay.complexClaim.claim,
              data: {
                claimId: '45678',
              },
            },
          },
        },
      };

      const { getByTestId } = renderWithStoreAndRouter(
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route
              path="/file-new-claim/:apptId"
              element={<IntroductionPage />}
            />
            <Route
              path="/file-new-claim/:apptId/:claimId/choose-expense"
              element={<ChooseExpenseType />}
            />
          </Routes>
          <LocationDisplay />
        </MemoryRouter>,
        {
          initialState: stateWithCreatedClaim,
          reducers: reducer,
        },
      );

      // ComplexClaimRedirect should automatically redirect to choose-expense
      // because there's no skipRedirect state (simulating a browser reload)
      await waitFor(() => {
        expect(getByTestId('location-display').textContent).to.equal(
          '/file-new-claim/12345/45678/choose-expense',
        );
      });
    });

    it('creates claim and navigates to choose-expense when Start button is clicked', async () => {
      // Set up state with NO existing claim
      const stateWithoutClaim = getData();

      const { getByTestId, container } = renderWithStoreAndRouter(
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route
              path="/file-new-claim/:apptId"
              element={<IntroductionPage />}
            />
            <Route
              path="/file-new-claim/:apptId/:claimId/choose-expense"
              element={<ChooseExpenseType />}
            />
          </Routes>
          <LocationDisplay />
        </MemoryRouter>,
        {
          initialState: stateWithoutClaim,
          reducers: reducer,
        },
      );

      // Verify the intro page renders (no redirect happens)
      expect(getByTestId('introduction-page')).to.exist;

      // Click the start button
      const startButton = $(
        'va-link-action[text="Start your travel reimbursement claim"]',
        container,
      );
      expect(startButton).to.exist;
      startButton.click();
    });

    it('dispatches setExpenseBackDestination with "intro" when start button is clicked', async () => {
      const stateWithExistingClaim = {
        travelPay: {
          ...getData().travelPay,
          complexClaim: {
            ...getData().travelPay.complexClaim,
            claim: {
              ...getData().travelPay.complexClaim.claim,
              data: {
                claimId: '45678',
              },
            },
          },
        },
      };

      const fakeClaimResult = { claimId: '99999' };
      const createComplexClaimStub = sinon
        .stub(actions, 'createComplexClaim')
        .callsFake(() => {
          return () => Promise.resolve(fakeClaimResult);
        });

      const dispatchSpy = sinon.spy();

      // Component to verify Redux state
      const StateDisplay = () => {
        const expenseBackDestination = useSelector(
          state => state.travelPay.complexClaim.expenseBackDestination,
        );
        return (
          <div data-testid="expense-back-destination">
            {expenseBackDestination || 'none'}
          </div>
        );
      };

      const { container, getByTestId } = renderWithStoreAndRouter(
        <MemoryRouter
          initialEntries={[
            { pathname: initialRoute, state: { skipRedirect: true } },
          ]}
        >
          <Routes>
            <Route
              path="/file-new-claim/:apptId"
              element={<IntroductionPage />}
            />
          </Routes>
          <StateDisplay />
        </MemoryRouter>,
        {
          initialState: stateWithExistingClaim,
          reducers: reducer,
          useDispatch: () => dispatchSpy,
        },
      );

      // Find and click the start button
      const startButton = $(
        'va-link-action[text="Start your travel reimbursement claim"]',
        container,
      );
      expect(startButton).to.exist;
      startButton.click();

      // Verify Redux state is updated
      await waitFor(() => {
        expect(getByTestId('expense-back-destination').textContent).to.equal(
          'intro',
        );
      });
      sinon.assert.calledOnce(createComplexClaimStub);

      createComplexClaimStub.restore();
    });
  });

  context('when v4 upgrade flag is disabled', () => {
    it('dispatches createComplexClaim with non-V4 params when V4 FF is disabled', async () => {
      // Set up state with no existing claim and V4 FF disabled
      const stateWithoutV4FF = buildState({ travelPayApptAddV4Upgrade: false });

      // Stub createComplexClaim to resolve a fake claimId
      const fakeClaimResult = { claimId: 'non-v4-claim-456' };
      const createComplexClaimStub = sinon
        .stub(actions, 'createComplexClaim')
        .callsFake(params => {
          expect(params).to.not.have.property('appointmentName'); // V4 param should be absent'
          expect(params).to.not.have.property('facilityName'); // V4 param should be absent
          expect(params).to.include.keys(
            'appointmentDateTime',
            'facilityStationNumber',
            'appointmentType',
            'isComplete',
          );
          return () => Promise.resolve(fakeClaimResult);
        });

      // Spy on dispatch
      const dispatchSpy = sinon.spy();

      const { container } = renderWithStoreAndRouter(
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route
              path="/file-new-claim/:apptId"
              element={<IntroductionPage />}
            />
          </Routes>
        </MemoryRouter>,
        {
          initialState: stateWithoutV4FF,
          reducers: reducer,
          useDispatch: () => dispatchSpy,
        },
      );

      // Click the start button
      const startButton = $(
        'va-link-action[text="Start your travel reimbursement claim"]',
        container,
      );
      expect(startButton).to.exist;
      startButton.click();

      // Wait for the stub to be called
      await waitFor(() => {
        sinon.assert.calledOnce(createComplexClaimStub);
      });

      createComplexClaimStub.restore();
    });
  });

  context('when v4 upgrade flag is enabled', () => {
    it('dispatches createComplexClaim with V4 params when V4 FF is enabled', async () => {
      // Set up state with no existing claim and V4 FF enabled
      const stateWithV4FF = buildState({ travelPayApptAddV4Upgrade: true });

      // Stub createComplexClaim to just resolve a fake claimId
      const fakeClaimResult = { claimId: 'v4-claim-123' };
      const createComplexClaimStub = sinon
        .stub(actions, 'createComplexClaim')
        .callsFake(params => {
          expect(params).to.include.keys(
            'appointmentName',
            'appointmentDateTime',
            'facilityStationNumber',
            'facilityName',
            'appointmentType',
            'isComplete',
          );
          return () => Promise.resolve(fakeClaimResult);
        });

      // Spy on dispatch
      const dispatchSpy = sinon.spy();

      const { container } = renderWithStoreAndRouter(
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route
              path="/file-new-claim/:apptId"
              element={<IntroductionPage />}
            />
          </Routes>
        </MemoryRouter>,
        {
          initialState: stateWithV4FF,
          reducers: reducer,
          useDispatch: () => dispatchSpy,
        },
      );

      // Click the start button
      const startButton = $(
        'va-link-action[text="Start your travel reimbursement claim"]',
        container,
      );
      expect(startButton).to.exist;
      startButton.click();

      // Wait for the stub to be called
      await waitFor(() => {
        sinon.assert.calledOnce(createComplexClaimStub);
      });

      createComplexClaimStub.restore();
    });
  });

  context('when appointment is out of bounds', () => {
    it('shows OutOfBoundsAppointmentAlert when appointment is out of bounds', () => {
      const stateWithOutOfBoundsAppointment = {
        ...getData(),
        travelPay: {
          ...getData().travelPay,
          appointment: {
            ...getData().travelPay.appointment,
            data: {
              id: '12345',
              facilityName: 'Test Facility',
              isOutOfBounds: true,
            },
          },
        },
      };

      const { getByRole } = renderWithStoreAndRouter(
        <MemoryRouter initialEntries={[initialRoute]}>
          <IntroductionPage />
        </MemoryRouter>,
        {
          initialState: stateWithOutOfBoundsAppointment,
          reducers: reducer,
        },
      );

      // Verify the alert is displayed
      expect(
        getByRole('heading', {
          name: /your appointment happened more than 30 days ago/i,
        }),
      ).to.exist;
    });

    it('does not show OutOfBoundsAppointmentAlert when appointment is not out of bounds', () => {
      const stateWithInBoundsAppointment = {
        ...getData(),
        travelPay: {
          ...getData().travelPay,
          appointment: {
            ...getData().travelPay.appointment,
            data: {
              id: '12345',
              facilityName: 'Test Facility',
              isOutOfBounds: false,
            },
          },
        },
      };

      const { queryByRole } = renderWithStoreAndRouter(
        <MemoryRouter initialEntries={[initialRoute]}>
          <IntroductionPage />
        </MemoryRouter>,
        {
          initialState: stateWithInBoundsAppointment,
          reducers: reducer,
        },
      );

      // Verify the alert is NOT displayed
      expect(
        queryByRole('heading', {
          name: /your appointment happened more than 30 days ago/i,
        }),
      ).to.not.exist;
    });
  });
});
