import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import AddressSelectionField, {
  NOT_SHARED,
} from '../../../../components/FormFields/AddressSelectionField';

const MOCK_ADDRESS = {
  street: '123 Certifier St',
  city: 'Certifier',
  state: 'MD',
  postalCode: '12345',
  country: 'USA',
};

const MOCK_ADDRESS_2 = {
  street: '456 Sponsor St',
  city: 'Sponsor',
  state: 'MD',
  postalCode: '12345',
  country: 'USA',
};

const MOCK_ADDRESS_3 = {
  street: '789 Applicant Blvd',
  city: 'Applicant',
  state: 'VA',
  postalCode: '54321',
  country: 'USA',
};

const DEFAULT_UI_OPTIONS = {
  destinationKey: 'applicantAddress',
  sourceKeys: ['certifierAddress', 'sponsorAddress'],
};

describe('1010d <AddressSelectionField>', () => {
  const subject = ({
    formData = '',
    index = null,
    uiOptions = DEFAULT_UI_OPTIONS,
    storeData = {},
  } = {}) => {
    const mockStore = {
      getState: () => ({
        form: {
          data: {
            certifierAddress: MOCK_ADDRESS,
            sponsorAddress: MOCK_ADDRESS_2,
            applicants: [],
            ...storeData,
          },
        },
      }),
      subscribe: () => {},
      dispatch: sinon.spy(),
    };

    const childrenProps = {
      formData,
      name: 'view:sharesAddressWith',
      onChange: sinon.spy(),
      schema: { type: 'string' },
      idSchema: { $id: 'root_view:sharesAddressWith' },
    };

    const props = { childrenProps, index, uiOptions };
    const { container } = render(
      <Provider store={mockStore}>
        <AddressSelectionField {...props} />
      </Provider>,
    );

    const selectors = () => ({
      vaRadio: container.querySelector('va-radio'),
      vaRadioOptions: container.querySelectorAll('va-radio-option'),
      notSharedOption: container.querySelector(`[value="${NOT_SHARED}"]`),
    });

    return { selectors, mockStore, childrenProps };
  };

  describe('rendering', () => {
    it('should render radio options from sourceKeys', () => {
      const { selectors } = subject();
      const { vaRadioOptions } = selectors();
      expect(vaRadioOptions).to.have.length.at.least(2);
    });

    it('should render NOT_SHARED option', () => {
      const { selectors } = subject();
      const { notSharedOption } = selectors();
      expect(notSharedOption).to.exist;
    });

    it('should exclude current applicant in array mode', () => {
      const { selectors } = subject({
        index: '0',
        uiOptions: {
          destinationKey: 'applicantAddress',
          sourceKeys: ['certifierAddress', 'applicants.applicantAddress'],
        },
        storeData: {
          applicants: [
            { applicantAddress: MOCK_ADDRESS },
            { applicantAddress: MOCK_ADDRESS_2 },
          ],
        },
      });
      const { vaRadioOptions } = selectors();
      expect(vaRadioOptions.length).to.equal(3);
    });

    it('should handle string sourceKeys', () => {
      const { selectors } = subject({
        uiOptions: {
          destinationKey: 'applicantAddress',
          sourceKeys: 'certifierAddress',
        },
      });
      const { vaRadioOptions } = selectors();
      expect(vaRadioOptions.length).to.equal(2);
    });

    it('should handle array notation in sourceKeys', () => {
      const { selectors } = subject({
        uiOptions: {
          destinationKey: 'applicantAddress',
          sourceKeys: ['applicants.applicantAddress'],
        },
        storeData: {
          certifierAddress: null, // Don't include default addresses
          sponsorAddress: null,
          applicants: [
            { applicantAddress: MOCK_ADDRESS },
            { applicantAddress: MOCK_ADDRESS_3 },
          ],
        },
      });
      const { vaRadioOptions } = selectors();
      expect(vaRadioOptions.length).to.equal(3);
    });
  });

  context('data updates', () => {
    it('should dispatch setData and call onChange on selection', () => {
      const { selectors, mockStore, childrenProps } = subject();
      const { vaRadio } = selectors();

      vaRadio.__events.vaValueChange({
        detail: { value: JSON.stringify(MOCK_ADDRESS) },
      });

      sinon.assert.calledWith(
        childrenProps.onChange,
        JSON.stringify(MOCK_ADDRESS),
      );
      sinon.assert.called(mockStore.dispatch);
    });

    it('should update applicants array in array mode', () => {
      const { selectors, mockStore } = subject({
        index: '0',
        storeData: { applicants: [{ 'view:sharesAddressWith': '' }] },
      });
      const { vaRadio } = selectors();

      vaRadio.__events.vaValueChange({
        detail: { value: JSON.stringify(MOCK_ADDRESS) },
      });

      sinon.assert.called(mockStore.dispatch);
      const dispatchCall = mockStore.dispatch.firstCall;
      if (dispatchCall && dispatchCall.args[0]) {
        const { data } = dispatchCall.args[0];
        expect(data.applicants[0]).to.have.property('applicantAddress');
      }
    });

    it('should delete destinationKey when NOT_SHARED selected', () => {
      const { selectors, mockStore } = subject({
        formData: JSON.stringify(MOCK_ADDRESS),
      });
      const { vaRadio } = selectors();

      vaRadio.__events.vaValueChange({
        detail: { value: NOT_SHARED },
      });

      sinon.assert.called(mockStore.dispatch);
      const dispatchCall = mockStore.dispatch.firstCall;
      if (dispatchCall && dispatchCall.args[0]) {
        const { data } = dispatchCall.args[0];
        expect(data).to.not.have.property('applicantAddress');
      }
    });

    it('should not update when value unchanged', () => {
      const { selectors, mockStore, childrenProps } = subject({
        formData: NOT_SHARED,
      });
      const { vaRadio } = selectors();

      vaRadio.__events.vaValueChange({
        detail: { value: NOT_SHARED },
      });

      sinon.assert.notCalled(childrenProps.onChange);
      sinon.assert.notCalled(mockStore.dispatch);
    });
  });
});
