import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import * as uiModule from 'platform/utilities/ui';
import ClaimantSearchHasPOA from '../../../components/ClaimantSearchHasPOA';

describe('ClaimantSearchHasPOA', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(uiModule, 'focusElement');
  });

  afterEach(() => {
    sandbox.restore();
  });

  const searchData = {
    /* eslint-disable camelcase */
    first_name: 'John',
    last_name: 'Doe',
    /* eslint-enable camelcase */
    dob: '1990-01-15',
    ssn: '123-45-6789',
  };

  const baseClaimant = {
    id: '456',
    firstName: 'John',
    lastName: 'Doe',
    city: 'Washington',
    state: 'DC',
    postalCode: '20001',
    representative: 'Test Organization',
    poaRequests: [
      {
        id: '123',
        resolution: null,
      },
    ],
  };

  it('renders the review link when canAccept is true', () => {
    const claimant = {
      ...baseClaimant,
      poaRequests: [{ id: '123', resolution: null, canAccept: true }],
    };

    const { container } = render(
      <ClaimantSearchHasPOA searchData={searchData} claimant={claimant} />,
    );

    const link = container.querySelector(
      'va-link-action[text="Review the representation request"]',
    );
    expect(link).to.exist;
  });

  it('renders the review link when canAccept is undefined', () => {
    const { container } = render(
      <ClaimantSearchHasPOA searchData={searchData} claimant={baseClaimant} />,
    );

    const link = container.querySelector(
      'va-link-action[text="Review the representation request"]',
    );
    expect(link).to.exist;
  });

  it('does not render the review link when canAccept is false', () => {
    const claimant = {
      ...baseClaimant,
      poaRequests: [{ id: '123', resolution: null, canAccept: false }],
    };

    const { container } = render(
      <ClaimantSearchHasPOA searchData={searchData} claimant={claimant} />,
    );

    const link = container.querySelector(
      'va-link-action[text="Review the representation request"]',
    );
    expect(link).to.not.exist;
  });
});
