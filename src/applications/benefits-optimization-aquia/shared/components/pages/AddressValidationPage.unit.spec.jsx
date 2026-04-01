import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { render, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { createAddressValidationPage } from './AddressValidationPage';
import * as addressValidationUtils from '../../utils/validators/address-validation';

const buildStore = formData =>
  createStore(
    (
      state = {
        form: { data: formData },
      },
    ) => state,
  );

describe('AddressValidationPage', () => {
  let fetchSuggestedAddressStub;

  beforeEach(() => {
    fetchSuggestedAddressStub = sinon.stub(
      addressValidationUtils,
      'fetchSuggestedAddress',
    );
  });

  afterEach(() => {
    fetchSuggestedAddressStub.restore();
    cleanup();
  });

  it('renders exact-match confirmation and waits for manual continue when confidence is 100', async () => {
    const addressPath = 'applicant.mailingAddress';
    const originalAddress = {
      street: '37 N 1st St',
      city: 'Brooklyn',
      state: 'NY',
      postalCode: '11249',
      country: 'USA',
    };
    const suggestedAddress = {
      street: '37 North 1st Street',
      city: 'Brooklyn',
      state: 'NY',
      postalCode: '11249',
      country: 'USA',
    };
    const formData = {
      applicant: {
        mailingAddress: originalAddress,
      },
    };

    fetchSuggestedAddressStub.resolves({
      suggestedAddress,
      showSuggestions: false,
      confidenceScore: 100,
    });

    const goBack = sinon.spy();
    const goForward = sinon.spy();
    const CustomPage = createAddressValidationPage({
      addressPath,
      title: 'Confirm mailing address',
    });

    const view = render(
      <Provider store={buildStore(formData)}>
        <CustomPage
          goBack={goBack}
          goForward={goForward}
          contentBeforeButtons={null}
          contentAfterButtons={null}
        />
      </Provider>,
    );

    await waitFor(() => {
      expect(fetchSuggestedAddressStub.calledOnce).to.equal(true);
    });

    expect(goBack.called).to.equal(false);
    expect(goForward.called).to.equal(false);
    expect(fetchSuggestedAddressStub.firstCall.args[0]).to.deep.equal(
      originalAddress,
    );
    expect(
      view.getByText('Your address was an exact match').textContent,
    ).to.not.equal('');

    fireEvent.click(view.getByText('Continue'));

    await waitFor(() => {
      expect(goForward.calledOnce).to.equal(true);
    });
    expect(goForward.firstCall.args[0]).to.deep.equal(formData);
  });

  it('does not auto-forward on remount for confidence 100, allowing back navigation', async () => {
    const addressPath = 'applicant.mailingAddress';
    const formData = {
      applicant: {
        mailingAddress: {
          street: '37 N 1st St',
          city: 'Brooklyn',
          state: 'NY',
          postalCode: '11249',
          country: 'USA',
        },
      },
    };

    fetchSuggestedAddressStub.resolves({
      suggestedAddress: {
        street: '37 North 1st Street',
        city: 'Brooklyn',
        state: 'NY',
        postalCode: '11249',
        country: 'USA',
      },
      showSuggestions: false,
      confidenceScore: 100,
    });

    const CustomPage = createAddressValidationPage({
      addressPath,
      title: 'Confirm mailing address',
    });

    const goBack = sinon.spy();
    const goForward = sinon.spy();

    const firstRender = render(
      <Provider store={buildStore(formData)}>
        <CustomPage
          goBack={goBack}
          goForward={goForward}
          contentBeforeButtons={null}
          contentAfterButtons={null}
        />
      </Provider>,
    );

    await waitFor(() => {
      expect(fetchSuggestedAddressStub.calledOnce).to.equal(true);
    });

    firstRender.unmount();

    render(
      <Provider store={buildStore(formData)}>
        <CustomPage
          goBack={goBack}
          goForward={goForward}
          contentBeforeButtons={null}
          contentAfterButtons={null}
        />
      </Provider>,
    );

    await waitFor(() => {
      expect(fetchSuggestedAddressStub.calledTwice).to.equal(true);
    });

    expect(goBack.called).to.equal(false);
    expect(goForward.called).to.equal(false);
  });

  it('shows warning confirmation when API validation returns fallback (no suggested address)', async () => {
    const addressPath = 'applicant.mailingAddress';
    const formData = {
      applicant: {
        mailingAddress: {
          street: '37 N 1st St',
          city: 'Brooklyn',
          state: 'NY',
          postalCode: '11249',
          country: 'USA',
        },
      },
    };

    fetchSuggestedAddressStub.resolves({
      suggestedAddress: null,
      showSuggestions: false,
      confidenceScore: null,
    });

    const goBack = sinon.spy();
    const goForward = sinon.spy();
    const CustomPage = createAddressValidationPage({
      addressPath,
      title: 'Confirm mailing address',
    });

    const view = render(
      <Provider store={buildStore(formData)}>
        <CustomPage
          goBack={goBack}
          goForward={goForward}
          contentBeforeButtons={null}
          contentAfterButtons={null}
        />
      </Provider>,
    );

    await waitFor(() => {
      expect(fetchSuggestedAddressStub.calledOnce).to.equal(true);
    });

    expect(
      view.getByText('Check the address you entered').textContent,
    ).to.not.equal('');
    expect(view.container.querySelector('va-additional-info')).to.exist;
    expect(goForward.called).to.equal(false);
  });

  it('shows suggestion radio flow for confidence below 100 and allows manual continue', async () => {
    const addressPath = 'applicant.mailingAddress';
    const formData = {
      applicant: {
        mailingAddress: {
          street: '37 N 1st St',
          city: 'Brooklyn',
          state: 'NY',
          postalCode: '11249',
          country: 'USA',
        },
      },
    };

    fetchSuggestedAddressStub.resolves({
      suggestedAddress: {
        street: '37 North 1st Street',
        city: 'Brooklyn',
        state: 'NY',
        postalCode: '11249',
        country: 'USA',
      },
      showSuggestions: true,
      confidenceScore: 85,
    });

    const goBack = sinon.spy();
    const goForward = sinon.spy();
    const CustomPage = createAddressValidationPage({
      addressPath,
      title: 'Confirm mailing address',
    });

    const view = render(
      <Provider store={buildStore(formData)}>
        <CustomPage
          goBack={goBack}
          goForward={goForward}
          contentBeforeButtons={null}
          contentAfterButtons={null}
        />
      </Provider>,
    );

    await waitFor(() => {
      expect(fetchSuggestedAddressStub.calledOnce).to.equal(true);
    });

    const radio = view.container.querySelector('va-radio');
    expect(radio).to.exist;
    expect(radio.getAttribute('label')).to.equal(
      "Tell us which address you'd like to use.",
    );
    expect(goForward.called).to.equal(false);

    fireEvent.click(view.getByText('Continue'));

    await waitFor(() => {
      expect(goForward.calledOnce).to.equal(true);
    });
  });
});
