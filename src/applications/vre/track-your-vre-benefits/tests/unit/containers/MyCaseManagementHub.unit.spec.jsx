/* eslint-disable camelcase */
/* eslint-disable no-shadow */
import React from 'react';
import { expect } from 'chai';
import { render, waitFor } from '@testing-library/react';
import sinon from 'sinon';
import { MemoryRouter } from 'react-router-dom';
import { CompatRouter, useLocation } from 'react-router-dom-v5-compat';
import { Provider } from 'react-redux';

import * as UI from 'platform/utilities/ui';
import * as actions from '../../../actions/ch31-case-status-details';

import MyCaseManagementHub from '../../../containers/MyCaseManagementHub';

import * as CaseProgressBarMod from '../../../components/CaseProgressBar';
import * as HubCardListMod from '../../../components/HubCardList';
import * as NeedHelpMod from '../../../components/NeedHelp';
import * as DiscontinuedMod from '../../../components/ApplicationDiscontinuedAlert';
import * as InterruptedMod from '../../../components/ApplicationInterruptedAlert';
import * as LoadFailedMod from '../../../components/LoadCaseDetailsFailedAlert';

const sandbox = sinon.createSandbox();
let caseProgressBarProps;

const makeStore = state => {
  const dispatch = sandbox.spy();
  return {
    getState: () => state,
    subscribe: () => () => {},
    dispatch,
  };
};

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

const renderPage = (state, initialEntries = ['/'], showLocation = false) =>
  render(
    <Provider store={makeStore(state)}>
      <MemoryRouter initialEntries={initialEntries}>
        <CompatRouter>
          <MyCaseManagementHub />
          {showLocation && <LocationDisplay />}
        </CompatRouter>
      </MemoryRouter>
    </Provider>,
  );

const makeState = ({
  toggleOn = true,
  loading = false,
  error = null,
  attrs = null,
} = {}) => ({
  featureToggles: {
    loading: false,
    vre_eligibility_status_phase_2_updates: toggleOn,
  },
  ch31CaseStatusDetails: {
    loading,
    error,
    data: attrs ? { attributes: attrs } : null,
  },
});

const activeBenefitsStateList = [
  { stepCode: 'APPL', status: 'COMPLETED' },
  { stepCode: 'ELGLDET', status: 'COMPLETED' },
  { stepCode: 'ORICMPT', status: 'COMPLETED' },
  { stepCode: 'INTAKE', status: 'COMPLETED' },
  { stepCode: 'ENTLDET', status: 'COMPLETED' },
  { stepCode: 'PLANSELECT', status: 'COMPLETED' },
  { stepCode: 'BFSACT', status: 'ACTIVE' },
];

describe('<MyCaseManagementHub>', () => {
  beforeEach(() => {
    caseProgressBarProps = null;
    sandbox.stub(UI, 'scrollToTop');
    sandbox.stub(UI, 'focusElement');

    sandbox
      .stub(actions, 'fetchCh31CaseStatusDetails')
      .returns({ type: 'FETCH_CH31_CASE_STATUS_DETAILS' });

    sandbox.stub(CaseProgressBarMod, 'default').callsFake(props => {
      caseProgressBarProps = props;
      return <div data-testid="case-progress-bar" />;
    });
    sandbox
      .stub(HubCardListMod, 'default')
      .callsFake(() => <div data-testid="hub-card-list" />);
    sandbox
      .stub(NeedHelpMod, 'default')
      .callsFake(() => <div data-testid="need-help" />);
    sandbox
      .stub(DiscontinuedMod, 'default')
      .callsFake(() => <div data-testid="discontinued-alert" />);
    sandbox
      .stub(InterruptedMod, 'default')
      .callsFake(() => <div data-testid="interrupted-alert" />);
    sandbox
      .stub(LoadFailedMod, 'default')
      .callsFake(() => <div data-testid="load-failed-alert" />);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('renders unavailable message when feature toggle is off', () => {
    const { getByRole, getByText } = renderPage(makeState({ toggleOn: false }));
    getByRole('heading', { name: /Your VR&E Benefit Status/i });
    getByText(/This page isn’t available right now/i);
  });

  it('shows loading indicator when loading is true', () => {
    const { getByText, container } = renderPage(makeState({ loading: true }));
    getByText(/Your VR&E Benefit Status/i);
    expect(container.querySelector('va-loading-indicator')).to.exist;
  });

  it('renders the main page heading when toggle is on and not loading', () => {
    const attrs = {
      externalStatus: {
        isDiscontinued: false,
        discontinuedReason: null,
        isInterrupted: false,
        interruptedReason: null,
        stateList: [],
      },
      orientationAppointmentDetails: null,
    };

    const { getByText, queryByText } = renderPage(makeState({ attrs }));
    expect(queryByText(/This page isn’t available right now/i)).to.equal(null);
    getByText(/Your VR&E Benefit Status/i);
  });

  it('passes appointment details to CaseProgressBar for step 4', () => {
    const attrs = {
      orientationAppointmentDetails: {
        appointmentDateTime: '2026-01-14T18:46:18.688Z',
        appointmentPlace: '31223 Corn Drive, Hamilton NJ-21223',
      },
      externalStatus: {
        isDiscontinued: false,
        discontinuedReason: null,
        isInterrupted: false,
        interruptedReason: null,
        stateList: [
          { stepCode: 'APPL', status: 'COMPLETED' },
          { stepCode: 'ELGLDET', status: 'COMPLETED' },
          { stepCode: 'ORICMPT', status: 'COMPLETED' },
          { stepCode: 'INTAKE', status: 'ACTIVE' },
        ],
      },
    };

    const { getByText, getByTestId } = renderPage(makeState({ attrs }));

    const introCopy = getByText(
      /The Veteran Readiness and Employment \(VR&E\) benefits tracker helps you manage your Chapter 31 process on your own/i,
    );
    const progressBar = getByTestId('case-progress-bar');

    expect(introCopy.nextElementSibling).to.equal(progressBar);
    expect(caseProgressBarProps).to.deep.equal({
      current: 4,
      stepLabels: [
        'Application received',
        'Eligibility determination',
        'Orientation video',
        'Initial evaluation counselor meeting',
        'Entitlement determination date',
        'Rehabilitation plan or career track',
        'Benefits initiated',
      ],
      attributes: attrs,
    });
  });

  it('passes the non-step-4 state into CaseProgressBar outside the counselor meeting step', () => {
    const attrs = {
      orientationAppointmentDetails: {
        appointmentDateTime: '2026-01-14T18:46:18.688Z',
        appointmentPlace: '31223 Corn Drive, Hamilton NJ-21223',
      },
      externalStatus: {
        isDiscontinued: false,
        discontinuedReason: null,
        isInterrupted: false,
        interruptedReason: null,
        stateList: activeBenefitsStateList,
      },
    };

    const { queryByTestId } = renderPage(makeState({ attrs }));

    expect(queryByTestId('case-progress-bar')).to.exist;
    expect(caseProgressBarProps.current).to.equal(7);
  });

  it('redirects interrupted cases back to the root route instead of keeping the active step slug', async () => {
    const attrs = {
      orientationAppointmentDetails: {
        appointmentDateTime: '2026-01-14T18:46:18.688Z',
        appointmentPlace: '31223 Corn Drive, Hamilton NJ-21223',
      },
      externalStatus: {
        isDiscontinued: false,
        discontinuedReason: null,
        isInterrupted: true,
        interruptedReason: '079 - Plan Developed/Redeveloped',
        stateList: activeBenefitsStateList,
      },
    };

    const { getByTestId, queryByTestId } = renderPage(
      makeState({ attrs }),
      ['/benefits-initiated'],
      true,
    );

    getByTestId('interrupted-alert');
    expect(queryByTestId('case-progress-bar')).to.equal(null);
    expect(queryByTestId('hub-card-list')).to.equal(null);

    await waitFor(() => {
      expect(getByTestId('location-display').textContent).to.equal('/');
    });
  });

  it('redirects discontinued cases back to the root route instead of keeping the active step slug', async () => {
    const attrs = {
      orientationAppointmentDetails: {
        appointmentDateTime: '2026-01-14T18:46:18.688Z',
        appointmentPlace: '31223 Corn Drive, Hamilton NJ-21223',
      },
      externalStatus: {
        isDiscontinued: true,
        discontinuedReason: '079 - Plan Developed/Redeveloped',
        isInterrupted: false,
        interruptedReason: null,
        stateList: activeBenefitsStateList,
      },
    };

    const { getByTestId, queryByTestId } = renderPage(
      makeState({ attrs }),
      ['/benefits-initiated'],
      true,
    );

    getByTestId('discontinued-alert');
    expect(queryByTestId('case-progress-bar')).to.equal(null);
    expect(queryByTestId('hub-card-list')).to.equal(null);

    await waitFor(() => {
      expect(getByTestId('location-display').textContent).to.equal('/');
    });
  });
});
