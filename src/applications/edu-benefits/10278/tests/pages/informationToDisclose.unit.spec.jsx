import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { DefinitionTester } from 'platform/testing/unit/schemaform-utils';
import { $$ } from 'platform/forms-system/src/js/utilities/ui';
import formConfig from '../../config/form';
import { DISCLOSURE_KEYS } from '../../helpers';

describe('22-10278 information to disclose page', () => {
  const {
    schema,
    uiSchema,
  } = formConfig.chapters.informationToDiscloseChapter.pages.informationToDisclose;

  const mockStore = configureStore();

  const renderPage = (formData = {}, storeData = {}) => {
    const store = mockStore({ form: { data: storeData } });

    return render(
      <Provider store={store}>
        <DefinitionTester
          definitions={formConfig.defaultDefinitions}
          schema={schema}
          uiSchema={uiSchema}
          data={formData}
        />
      </Provider>,
    );
  };

  it('renders all checkboxes and descriptions', () => {
    const { container, getByText } = renderPage(
      { claimInformation: {} },
      { claimInformation: {} },
    );

    expect($$('va-checkbox', container).length).to.equal(
      DISCLOSURE_KEYS.length + 1,
    ); // +1 for "Select all"

    expect(container.querySelector('va-checkbox[label="Minor claimants only"]'))
      .to.exist;
    expect(getByText('This is for change of address or direct deposit')).to
      .exist;
  });

  it('renders claimant and third party names from redux state', () => {
    const storeData = {
      claimantPersonalInformation: {
        fullName: { first: 'Taras', last: 'Kurilo' },
      },
      discloseInformation: { authorize: 'person' },
      thirdPartyPersonName: {
        fullName: { first: 'Jane', last: 'Doe' },
      },
    };

    const { container } = renderPage({ claimInformation: {} }, storeData);
    const paragraphText = container.querySelector('p').textContent;

    expect(paragraphText).to.include('Taras Kurilo');
    expect(paragraphText).to.include('Jane Doe');
  });

  it('setAll(false) unselects all checkboxes', () => {
    const formData = {
      statusOfClaim: true,
      currentBenefit: true,
      paymentHistory: true,
      amountOwed: true,
      minor: true,
    };
    const { container } = renderPage({ claimInformation: formData }, formData);

    const selectAllCheckbox = container.querySelector(
      'va-checkbox[label="Select all benefit and claim information"]',
    );
    selectAllCheckbox.dispatchEvent(
      new CustomEvent('vaChange', { detail: { checked: false } }),
    );

    expect($$('va-checkbox[checked="false"]', container).length).to.equal(6);
  });

  it('setOne unchecks input', () => {
    const formData = {
      statusOfClaim: true,
    };
    const { container } = renderPage({ claimInformation: formData }, formData);

    const statusOfClaimCheckbox = container.querySelector(
      'va-checkbox[label="Status of pending claim or appeal"]',
    );
    statusOfClaimCheckbox.dispatchEvent(
      new CustomEvent('vaChange', { detail: { checked: false } }),
    );

    const statusOfClaimInput = container.querySelector(
      'va-checkbox[label="Status of pending claim or appeal"]',
    );
    expect(statusOfClaimInput.checked).to.be.false;
  });
});
