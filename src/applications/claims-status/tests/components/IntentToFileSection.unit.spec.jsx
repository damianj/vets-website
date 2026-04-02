import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { expect } from 'chai';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom-v5-compat';
import IntentToFileSection from '../../components/IntentToFileSection';
import { renderWithRouter } from '../utils';

const getStore = (cstIntentsToFileEnabled = false) =>
  createStore(() => ({
    featureToggles: {
      // eslint-disable-next-line camelcase
      cst_intents_to_file: cstIntentsToFileEnabled,
    },
  }));

describe('<IntentToFileSection>', () => {
  context('when cstIntentsToFile feature toggle is disabled', () => {
    it('should not render the section', () => {
      const screen = renderWithRouter(
        <Provider store={getStore(false)}>
          <IntentToFileSection />
        </Provider>,
      );

      expect(screen.queryByText('Your intents to file')).to.be.null;
    });
  });

  context('when cstIntentsToFile feature toggle is enabled', () => {
    it('should render the section with heading, link, and description', () => {
      const screen = renderWithRouter(
        <Provider store={getStore(true)}>
          <IntentToFileSection />
        </Provider>,
      );

      screen.getByText('Your intents to file');

      const vaLink = screen.container.querySelector('va-link');
      expect(vaLink).to.exist;
      expect(vaLink).to.have.attr(
        'href',
        '/track-claims/your-claims/intent-to-file',
      );
      expect(vaLink).to.have.attr(
        'text',
        'Review your intents to file or learn how to start one',
      );

      screen.getByText(
        'An intent to file sets a potential start date for your VA disability, pension, or Dependency and Indemnity Compensation (DIC) benefits.',
      );
    });

    it('should navigate to the intent-to-file page when the link is clicked', async () => {
      const screen = render(
        <Provider store={getStore(true)}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<IntentToFileSection />} />
              <Route
                path="/your-claims/intent-to-file"
                element={<div data-testid="itf-route">ITF</div>}
              />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );

      const vaLink = screen.container.querySelector('va-link');
      expect(vaLink).to.exist;

      await userEvent.click(vaLink);

      expect(await screen.findByTestId('itf-route')).to.exist;
    });
  });
});
