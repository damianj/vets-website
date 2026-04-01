import React from 'react';
import { expect } from 'chai';
import ProviderSelection from './ProviderSelection';
import { renderWithStoreAndRouter } from '../../tests/mocks/setup';

describe('VAOS Page: ProviderSelection', () => {
  const initialState = {
    featureToggles: {
      vaOnlineSchedulingCCDirectScheduling: true,
    },
  };

  it('should render the heading', () => {
    const screen = renderWithStoreAndRouter(<ProviderSelection />, {
      initialState,
    });
    expect(screen.getByTestId('referral-layout-heading')).to.exist;
    expect(screen.getByTestId('referral-layout-heading').textContent).to.equal(
      'Which provider or clinic do you want to schedule with?',
    );
  });

  it('should render the eyebrow text', () => {
    const screen = renderWithStoreAndRouter(<ProviderSelection />, {
      initialState,
    });
    expect(screen.getByText('New Appointment')).to.exist;
  });

  it('should render the description paragraph', () => {
    const screen = renderWithStoreAndRouter(<ProviderSelection />, {
      initialState,
    });
    expect(
      screen.getByText(
        'You can schedule into VA or CC care within 25 miles of your home address.',
      ),
    ).to.exist;
  });

  it('should render the provider selection list with cards', () => {
    const screen = renderWithStoreAndRouter(<ProviderSelection />, {
      initialState,
    });
    const list = screen.container.querySelector(
      'ul.usa-unstyled-list.vaos-appts__list',
    );
    expect(list).to.exist;
    const cards = screen.getAllByTestId('provider-selection-card');
    expect(cards.length).to.equal(5);
  });

  it('should render the show more providers button', () => {
    const screen = renderWithStoreAndRouter(<ProviderSelection />, {
      initialState,
    });
    expect(screen.getByTestId('show-more-providers-button')).to.exist;
  });

  it('should render the "Need a different time?" section', () => {
    const screen = renderWithStoreAndRouter(<ProviderSelection />, {
      initialState,
    });
    expect(screen.getByText('Need a different time?')).to.exist;
  });
});
