import React from 'react';
import { expect } from 'chai';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { cleanup, render, fireEvent } from '@testing-library/react';
import { createInitialState } from '@department-of-veterans-affairs/platform-forms-system/state/helpers';
import sinon from 'sinon';
import formConfig from '../../config/form';
import ConfirmationPage from '../../containers/ConfirmationPage';

const mockStore = state => createStore(() => state);

const initConfirmationPage = ({ formData } = {}) => {
  const store = mockStore({
    form: {
      ...createInitialState(formConfig),
      submission: {
        response: {
          id: '123abc',
          attributes: {
            confirmationNumber: 'EBC-123',
          },
        },
        timestamp: new Date(),
      },
      data: formData || {},
    },
  });

  return render(
    <Provider store={store}>
      <ConfirmationPage route={{ formConfig }} />
    </Provider>,
  );
};

describe('ConfirmationPage', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    cleanup();
  });

  it('should show success alert, h2, and confirmation number if present', () => {
    const { container } = initConfirmationPage();
    const alert = container.querySelector('va-alert');
    expect(alert).to.have.attribute('status', 'success');
    expect(alert.querySelector('h2')).to.contain.text(
      'Form submission started',
    );
    expect(alert).to.contain.text('Your confirmation number is EBC-123');
  });

  it('should call window.print when print button is clicked', () => {
    window.print = window.print || (() => {});
    const printSpy = sandbox.stub(window, 'print');
    const { getByTestId } = initConfirmationPage();
    fireEvent.click(getByTestId('print-page'));
    expect(printSpy.calledOnce).to.be.true;
  });

  it('handles blank submissions', () => {
    const store = mockStore({
      form: {
        ...createInitialState(formConfig),
        submission: null,
        data: {},
      },
    });

    const { container } = render(
      <Provider store={store}>
        <ConfirmationPage route={{ formConfig }} />
      </Provider>,
    );
    const alert = container.querySelector('va-alert');
    expect(alert).to.have.attribute('status', 'success');
  });
});
