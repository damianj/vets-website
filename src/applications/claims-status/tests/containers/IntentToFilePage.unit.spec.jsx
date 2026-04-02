import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom-v5-compat';

import IntentToFilePage from '../../containers/IntentToFilePage';
import { LINKS } from '../../constants';

const expectVaLink = (container, text, href) => {
  const link = Array.from(container.querySelectorAll('va-link')).find(
    el => el.getAttribute('text') === text,
  );
  expect(link, `va-link with text "${text}"`).to.exist;
  expect(link).to.have.attr('href', href);
  expect(link).to.not.have.attr('external');
};

const getStore = (cstIntentsToFileEnabled = true) =>
  createStore(() => ({
    featureToggles: {
      // eslint-disable-next-line camelcase
      cst_intents_to_file: cstIntentsToFileEnabled,
    },
  }));

const renderWithRouterAtPath = (store, path = '/your-claims/intent-to-file') =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="your-claims/intent-to-file"
            element={<IntentToFilePage />}
          />
          <Route
            path="/your-claims"
            element={<div data-testid="claims-index">Claims Index</div>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

describe('<IntentToFilePage>', () => {
  context('when cstIntentsToFile feature toggle is enabled', () => {
    it('should render the page content and empty state', () => {
      const screen = renderWithRouterAtPath(getStore(true));

      screen.getByRole('heading', { level: 1, name: 'Your intents to file' });
      screen.getByText(
        'If you have active intents to file (ITF) a claim for VA benefits, you can review them here.',
      );
      screen.getByText('Intents to file on record');
      screen.getByText(
        'We don’t have any intents to file on record for you in our system.',
      );
    });

    it('should render the "Start a new intent to file" section', () => {
      const screen = renderWithRouterAtPath(getStore(true));

      screen.getByText('Start a new intent to file');
      screen.getByText(
        'You can create an intent to file if you plan to file a claim for these types of benefits:',
      );
      screen.getByText(/Disability compensation/);
      screen.getByText(/Veterans pension/);
      screen.getByText(/Dependency and Indemnity Compensation \(DIC\)/);
      screen.getByText(
        'For any of these benefits, you can submit a separate form to let us know that you intend to file a claim.',
      );
      screen.getByText(
        'If you have an accredited representative, they may also create an intent to file for you.',
      );
    });

    it('should render the informational sections', () => {
      const screen = renderWithRouterAtPath(getStore(true));

      screen.getByText('Why can’t I find my intent to file?');
      screen.getByText(
        /An intent to file expires 1 year after it’s recorded\./,
      );
      screen.getByText('What is an intent to file?');
      expect(screen.container.querySelector('va-need-help')).to.exist;
    });

    it('should render va-link elements with correct hrefs', () => {
      const screen = renderWithRouterAtPath(getStore(true));
      const links = screen.container.querySelectorAll('va-link');

      expect(links).to.have.length(5);
      expectVaLink(
        screen.container,
        'Start a claim for disability compensation online',
        LINKS.disabilityCompensationClaimIntro,
      );
      expectVaLink(
        screen.container,
        'Start an application for Veterans Pension online',
        LINKS.veteransPensionOnlineIntro,
      );
      expectVaLink(
        screen.container,
        'Submit an intent to file online',
        LINKS.intentToFileForm0966,
      );
      expectVaLink(
        screen.container,
        'Submit an intent to file (VA Form 21-0966) online',
        LINKS.intentToFileForm0966,
      );
      expectVaLink(
        screen.container,
        'Learn more about an intent to file a claim',
        LINKS.intentToFileAboutClaim,
      );
    });

    it('should render breadcrumbs', () => {
      const screen = renderWithRouterAtPath(getStore(true));
      expect(screen.container.querySelector('va-breadcrumbs')).to.exist;
    });
  });

  context('when cstIntentsToFile feature toggle is disabled', () => {
    it('should redirect to the claims index page', () => {
      const screen = renderWithRouterAtPath(getStore(false));
      expect(screen.queryByText('Your intents to file')).to.be.null;
      screen.getByTestId('claims-index');
    });
  });
});
