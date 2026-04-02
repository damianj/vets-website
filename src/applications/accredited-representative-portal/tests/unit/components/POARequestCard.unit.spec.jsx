import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import POARequestCard from '../../../components/POARequestCard';

describe('POARequestCard', () => {
  const basePoaRequest = {
    id: '123',
    claimantId: '456',
    createdAt: '2026-01-15T10:00:00Z',
    expiresAt: '2026-03-15T10:00:00Z',
    powerOfAttorneyForm: {
      authorizations: {
        recordDisclosure: false,
        recordDisclosureLimitations: [],
        addressChange: false,
      },
      claimant: {
        name: { first: 'John', middle: null, last: 'Doe' },
        address: {
          addressLine1: '123 Main St',
          city: 'Washington',
          stateCode: 'DC',
          country: 'US',
          zipCode: '20001',
        },
        phone: '202-555-1234',
        email: 'john@example.com',
      },
    },
    powerOfAttorneyHolder: {
      type: 'veteran_service_organization',
      name: 'Test Organization',
      id: '789',
    },
    accreditedIndividual: {
      fullName: 'Jane Smith',
      id: '012',
    },
    resolution: null,
  };

  it('renders the view link when canAccept is true', () => {
    const poaRequest = { ...basePoaRequest, canAccept: true };
    const { container } = render(
      <ul>
        <POARequestCard poaRequest={poaRequest} />
      </ul>,
    );

    const link = container.querySelector('va-link');
    expect(link).to.exist;
    expect(link.getAttribute('text')).to.equal('View representation request');
  });

  it('renders the view link when canAccept is undefined', () => {
    const { container } = render(
      <ul>
        <POARequestCard poaRequest={basePoaRequest} />
      </ul>,
    );

    const link = container.querySelector('va-link');
    expect(link).to.exist;
  });

  it('does not render the view link when canAccept is false', () => {
    const poaRequest = { ...basePoaRequest, canAccept: false };
    const { container } = render(
      <ul>
        <POARequestCard poaRequest={poaRequest} />
      </ul>,
    );

    const link = container.querySelector('va-link');
    expect(link).to.not.exist;
  });
});
