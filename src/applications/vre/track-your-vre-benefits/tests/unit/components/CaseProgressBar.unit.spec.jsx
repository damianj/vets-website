import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import sinon from 'sinon';

import * as AppointmentScheduledAlertMod from '../../../components/AppointmentScheduledAlert';
import * as CaseProgressDescriptionMod from '../../../components/CaseProgressDescription';
import CaseProgressBar from '../../../components/CaseProgressBar';

const sandbox = sinon.createSandbox();

describe('CaseProgressBar', () => {
  let appointmentAlertProps;
  let descriptionProps;

  beforeEach(() => {
    appointmentAlertProps = null;
    descriptionProps = null;

    sandbox.stub(AppointmentScheduledAlertMod, 'default').callsFake(props => {
      appointmentAlertProps = props;
      return <div data-testid="appointment-scheduled-alert" />;
    });
    sandbox.stub(CaseProgressDescriptionMod, 'default').callsFake(props => {
      descriptionProps = props;
      return <div data-testid="case-progress-description" />;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('renders the progress bar with the expected attributes', () => {
    const attributes = {
      foo: 'bar',
      orientationAppointmentDetails: {
        appointmentDateTime: '2026-03-10T14:00:00Z',
        appointmentPlace: 'VA Regional Office',
      },
    };
    const stepLabels = ['Apply', 'Eligibility', 'Orientation'];

    const { container, getByTestId } = render(
      <CaseProgressBar
        current={4}
        stepLabels={stepLabels}
        attributes={attributes}
      />,
    );

    const description = getByTestId('case-progress-description');
    const alert = getByTestId('appointment-scheduled-alert');
    const alertContainer = alert.parentElement;

    const progressBar = container.querySelector('va-segmented-progress-bar');
    expect(progressBar).to.exist;
    expect(progressBar.getAttribute('counters')).to.equal('small');
    expect(progressBar.getAttribute('current')).to.equal('4');
    expect(progressBar.getAttribute('header-level')).to.equal('2');
    expect(progressBar.getAttribute('heading-text')).to.equal('VA Benefits');
    expect(progressBar.getAttribute('labels')).to.equal(
      'Apply;Eligibility;Orientation',
    );
    expect(progressBar.getAttribute('total')).to.equal('3');
    expect(progressBar.parentElement.nextElementSibling).to.equal(
      alertContainer,
    );
    expect(alertContainer.nextElementSibling).to.equal(description);
    expect(appointmentAlertProps).to.deep.equal({
      appointmentDateTime: '2026-03-10T14:00:00Z',
      appointmentPlace: 'VA Regional Office',
    });
    expect(descriptionProps).to.deep.equal({
      step: 4,
      attributes,
    });
  });

  it('defaults the current step status to PENDING when state data is missing', () => {
    const { queryByTestId } = render(
      <CaseProgressBar current={1} stepLabels={['Apply']} />,
    );

    expect(queryByTestId('appointment-scheduled-alert')).to.equal(null);
    expect(descriptionProps).to.deep.equal({
      step: 1,
      attributes: {},
    });
  });
});
