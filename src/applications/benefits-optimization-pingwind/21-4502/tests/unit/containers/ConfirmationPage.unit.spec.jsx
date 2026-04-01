import React from 'react';
import { expect } from 'chai';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { cleanup, render } from '@testing-library/react';
import { createInitialState } from '@department-of-veterans-affairs/platform-forms-system/state/helpers';
import formConfig from '../../../config/form';
import ConfirmationPage from '../../../containers/ConfirmationPage';

const mockStore = state => createStore(() => state);

const initConfirmationPage = (
  formData,
  response = { confirmationNumber: '1234567890' },
) => {
  const store = mockStore({
    form: {
      ...createInitialState(formConfig),
      submission: {
        response,
        timestamp: new Date(),
      },
      data: formData,
    },
  });

  return render(
    <Provider store={store}>
      <ConfirmationPage route={{ formConfig }} />
    </Provider>,
  );
};

describe('21-4502 ConfirmationPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('should show success alert and confirmation number', () => {
    const formData = {
      veteran: {
        fullName: {
          first: 'Jane',
          last: 'Doe',
        },
      },
    };
    const { container } = initConfirmationPage(formData);
    const alert = container.querySelector('va-alert');
    expect(alert).to.have.attribute('status', 'success');
    expect(alert).to.contain.text('Your confirmation number is 1234567890');
  });

  it('should show thank you message for automobile or adaptive equipment', () => {
    const formData = {
      veteran: {
        fullName: {
          first: 'Jane',
          last: 'Doe',
        },
      },
    };
    const { container } = initConfirmationPage(formData);
    expect(container).to.contain.text(
      'Thank you for submitting your application for automobile or adaptive equipment',
    );
  });
});
