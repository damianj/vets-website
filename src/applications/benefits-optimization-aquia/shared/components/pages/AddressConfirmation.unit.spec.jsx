import React from 'react';
import { expect } from 'chai';
import { render, cleanup } from '@testing-library/react';
import AddressConfirmation from './AddressConfirmation';

describe('AddressConfirmation', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows a success confirmation for exact matches', () => {
    const { getByText, container } = render(
      <AddressConfirmation
        subHeader="Confirm employer address"
        userAddress={{
          street: '37 N 1st St',
          city: 'Brooklyn',
          state: 'NY',
          postalCode: '11249',
          country: 'USA',
        }}
        isExactMatch
      />,
    );

    expect(getByText('Your address was an exact match')).to.exist;
    expect(container.querySelector('va-additional-info')).to.not.exist;
  });

  it('shows a warning confirmation for non-exact matches', () => {
    const { getByText, container } = render(
      <AddressConfirmation
        subHeader="Confirm employer address"
        userAddress={{
          street: '37 N 1st St',
          city: 'Brooklyn',
          state: 'NY',
          postalCode: '11249',
          country: 'USA',
        }}
        isExactMatch={false}
      />,
    );

    expect(getByText('Check the address you entered')).to.exist;
    const additionalInfo = container.querySelector('va-additional-info');
    expect(additionalInfo).to.exist;
    expect(additionalInfo.getAttribute('trigger')).to.equal(
      "Why we can't confirm the address you entered",
    );
  });

  it('renders non-USA country label in the address block', () => {
    const { container } = render(
      <AddressConfirmation
        subHeader="Confirm employer address"
        userAddress={{
          street: '123 Main St',
          city: 'Toronto',
          state: 'ON',
          postalCode: 'M5V 2T6',
          country: 'CAN',
        }}
        isExactMatch={false}
      />,
    );

    expect(container.textContent).to.include('Canada');
  });
});
