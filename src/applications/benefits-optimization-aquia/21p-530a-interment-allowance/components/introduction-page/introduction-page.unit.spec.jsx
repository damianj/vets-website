/**
 * @module tests/containers/introduction-page.unit.spec
 * @description Unit tests for IntroductionPage component
 */

import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import formConfig from '@bio-aquia/21p-530a-interment-allowance/config/form';
import { IntroductionPage } from './introduction-page';

const aquiaBioAuthRequiredKey = 'aquia_bio_auth_required';

const props = {
  route: {
    path: 'introduction',
    pageList: [],
    formConfig,
  },
  router: { push: sinon.spy() },
};

const createMockStore = (overrides = {}) => {
  const defaultState = {
    user: {
      login: {
        currentlyLoggedIn: false,
      },
      profile: {
        savedForms: [],
        prefillsAvailable: [],
        loa: { current: 3, highest: 3 },
        verified: true,
        dob: '1957-03-25',
        claims: { appeals: false },
      },
    },
    form: {
      formId: formConfig.formId,
      loadedStatus: 'success',
      savedStatus: '',
      loadedData: { metadata: {} },
      data: {},
    },
    featureToggles: {
      loading: false,
      [aquiaBioAuthRequiredKey]: false,
    },
    scheduledDowntime: {
      globalDowntime: null,
      isReady: true,
      isPending: false,
      serviceMap: { get() {} },
      dismissedDowntimeWarnings: [],
    },
    ...overrides,
  };

  return {
    getState: () => defaultState,
    subscribe: () => {},
    dispatch: () => {},
  };
};

describe('IntroductionPage', () => {
  it('should render', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <IntroductionPage {...props} />
      </Provider>,
    );
    expect(container).to.exist;
  });

  describe('when auth feature flag is off', () => {
    it('should render the direct start link', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...props} />
        </Provider>,
      );

      const startLink = container.querySelector(
        'va-link-action[data-testid="start-burial-allowance-link"]',
      );
      expect(startLink).to.exist;
    });
  });

  describe('when auth feature flag is on', () => {
    it('should show start button when user is logged in (IAL1, no verification required)', () => {
      const store = createMockStore({
        user: {
          login: { currentlyLoggedIn: true },
          profile: {
            savedForms: [],
            prefillsAvailable: [],
            loa: { current: 1, highest: 1 },
            verified: false,
            dob: '1957-03-25',
            claims: { appeals: false },
          },
        },
        featureToggles: { loading: false, [aquiaBioAuthRequiredKey]: true },
      });

      const { getByText } = render(
        <Provider store={store}>
          <IntroductionPage {...props} />
        </Provider>,
      );

      const startButton = getByText(
        'Start the state and tribal organization interment allowance benefits application',
      );
      expect(startButton).to.exist;
    });

    it('should not show direct start link when user is not logged in', () => {
      const store = createMockStore({
        featureToggles: { loading: false, [aquiaBioAuthRequiredKey]: true },
      });
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...props} />
        </Provider>,
      );

      const startLink = container.querySelector(
        'va-link-action[data-testid="start-burial-allowance-link"]',
      );
      expect(startLink).to.not.exist;
    });
  });
});
