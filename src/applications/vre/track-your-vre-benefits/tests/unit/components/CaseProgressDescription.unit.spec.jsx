import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import sinon from 'sinon';
import { MemoryRouter, useLocation } from 'react-router-dom-v5-compat';

import CaseProgressDescription from '../../../components/CaseProgressDescription';
import * as HubCardListMod from '../../../components/HubCardList';
import * as SelectPreferenceViewMod from '../../../components/SelectPreferenceView';

const sandbox = sinon.createSandbox();
let hubCardProps;

const makeStore = state => {
  const dispatch = sandbox.spy();
  return {
    getState: () => state || {},
    subscribe: () => () => {},
    dispatch,
  };
};

const renderWithProviders = (ui, state = {}) =>
  render(
    <Provider store={makeStore(state)}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>,
  );

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

describe('CaseProgressDescription', () => {
  beforeEach(() => {
    hubCardProps = null;

    sandbox.stub(HubCardListMod, 'default').callsFake(props => {
      hubCardProps = props;
      return <div data-testid="hub-card-list" />;
    });
    sandbox
      .stub(SelectPreferenceViewMod, 'default')
      .callsFake(() => <div data-testid="select-preference-view" />);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('renders step 1 description', () => {
    const { getByText } = renderWithProviders(
      <CaseProgressDescription step={1} />,
    );
    getByText(
      /While we review your application, you can prepare for next steps by using the additional resources on this page to learn more about the VR&E program/i,
    );
  });

  it('renders step 2 description', () => {
    const { getByText } = renderWithProviders(
      <CaseProgressDescription step={2} />,
    );
    getByText(
      /currently reviewing your application to confirm your VR&E Chapter 31 eligibility/i,
    );
  });

  it('renders step 3 description', () => {
    const { getByText, getByTestId } = renderWithProviders(
      <CaseProgressDescription step={3} />,
      { ch31CaseMilestones: undefined },
    );
    getByText(/Before we schedule your initial evaluation counselor meeting/i);
    getByTestId('select-preference-view');
  });

  it('renders the step 4 scheduling message when the appointment is still pending', () => {
    const { getByText } = renderWithProviders(
      <CaseProgressDescription step={4} status="PENDING" />,
    );

    getByText(/We processed your application for VR&E benefits/i);
  });

  it('renders the step 4 scheduled message when appointment details are available', () => {
    const { getByText, queryByTestId } = renderWithProviders(
      <CaseProgressDescription
        step={4}
        status="COMPLETED"
        attributes={{
          orientationAppointmentDetails: {
            appointmentDateTime: '2026-03-03T10:00:00Z',
            appointmentPlace: 'Regional office',
          },
        }}
      />,
    );

    const scheduledMessage = getByText(
      /If you need to reschedule, use the rescheduling link we sent you in the confirmation email and text/i,
    );

    expect(scheduledMessage).to.exist;
    expect(queryByTestId('appointment-scheduled-alert')).to.equal(null);
  });

  it('renders hub cards for steps 6 and 7 when requested', () => {
    const cases = [
      {
        step: 6,
        text: /establish your Chapter 31 Rehabilitation Plan or Career Track/i,
      },
      {
        step: 7,
        text: /We initiated your VR&E/i,
      },
    ];

    cases.forEach(({ step, text }) => {
      const { getByTestId, getByText, unmount } = renderWithProviders(
        <CaseProgressDescription step={step} showHubCards />,
      );

      getByText(text);
      getByTestId('hub-card-list');
      expect(hubCardProps).to.deep.equal({ step });

      unmount();
    });
  });

  it('renders the career planning link for step 5 and routes internally when clicked', () => {
    const { container, getByTestId } = renderWithProviders(
      <>
        <CaseProgressDescription step={5} />
        <LocationDisplay />
      </>,
    );

    const link = container.querySelector('va-link[href="/career-planning"]');

    expect(link).to.exist;
    expect(link.getAttribute('text')).to.equal(
      'Explore career planning tools and resources',
    );

    userEvent.click(link);

    expect(getByTestId('location-display').textContent).to.equal(
      '/career-planning',
    );
  });

  it('returns null for unknown step', () => {
    const { container } = renderWithProviders(
      <CaseProgressDescription step={999} />,
    );
    expect(container.innerHTML.trim()).to.equal('');
  });
});
