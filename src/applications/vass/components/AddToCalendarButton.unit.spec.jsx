import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { render, fireEvent } from '@testing-library/react';

import AddToCalendarButton from './AddToCalendarButton';
import { createAppointmentData } from '../utils/appointments';

describe('VASS Component: AddToCalendarButton', () => {
  const mockAppointment = createAppointmentData();

  let createObjectURLStub;
  let revokeObjectURLStub;

  beforeEach(() => {
    createObjectURLStub = sinon
      .stub(URL, 'createObjectURL')
      .returns('blob:mock-url');
    revokeObjectURLStub = sinon.stub(URL, 'revokeObjectURL');
  });

  afterEach(() => {
    createObjectURLStub.restore();
    revokeObjectURLStub.restore();
  });

  it('should render the add to calendar button', () => {
    const { getByTestId } = render(
      <AddToCalendarButton appointment={mockAppointment} />,
    );

    expect(getByTestId('add-to-calendar-button')).to.exist;
  });

  it('should not render a hidden link element', () => {
    const { queryByTestId } = render(
      <AddToCalendarButton appointment={mockAppointment} />,
    );

    expect(queryByTestId('add-to-calendar-link')).to.be.null;
  });

  it('should trigger a calendar file download when the button is clicked', () => {
    const { getByTestId } = render(
      <AddToCalendarButton appointment={mockAppointment} />,
    );

    const button = getByTestId('add-to-calendar-button');
    fireEvent.click(button);

    expect(createObjectURLStub.calledOnce).to.be.true;
    const blobArg = createObjectURLStub.firstCall.args[0];
    expect(blobArg).to.be.instanceOf(Blob);
    expect(blobArg.type).to.equal('text/calendar;charset=utf-8');

    expect(revokeObjectURLStub.calledOnce).to.be.true;
    expect(revokeObjectURLStub.calledWith('blob:mock-url')).to.be.true;
  });
});
