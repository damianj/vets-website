import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect } from 'chai';
import POARequestSearchCard from '../../../components/POARequestSearchCard';

describe('POARequestSearchCard', () => {
  const basePoaRequest = {
    id: '123',
    createdAt: '2026-01-15T10:00:00Z',
    powerOfAttorneyForm: {
      claimant: {
        name: { first: 'John', last: 'Doe' },
      },
    },
    powerOfAttorneyHolder: { name: 'Test Organization' },
    resolution: null,
  };

  const renderCard = poaRequest => {
    return render(
      <MemoryRouter>
        <POARequestSearchCard poaRequest={poaRequest} />
      </MemoryRouter>,
    );
  };

  it('renders the view link when canAccept is true', () => {
    const { container } = renderCard({ ...basePoaRequest, canAccept: true });

    const link = container.querySelector('a.vads-c-action-link--gray');
    expect(link).to.exist;
    expect(link.textContent).to.include('View POA request');
  });

  it('renders the view link when canAccept is undefined', () => {
    const { container } = renderCard(basePoaRequest);

    const link = container.querySelector('a.vads-c-action-link--gray');
    expect(link).to.exist;
  });

  it('does not render the view link when canAccept is false', () => {
    const { container } = renderCard({ ...basePoaRequest, canAccept: false });

    const link = container.querySelector('a.vads-c-action-link--gray');
    expect(link).to.not.exist;
  });
});
