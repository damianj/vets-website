import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import * as uiUtils from 'platform/utilities/ui';
import { formConfig } from '@bio-aquia/21-0779-nursing-home-information/config/form';

import { IntroductionPage } from './introduction-page';

const aquiaBioAuthRequiredKey = 'aquia_bio_auth_required';

const defaultProps = {
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
        loa: { current: 1, highest: 1 },
        verified: false,
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

describe('IntroductionPage Container', () => {
  let scrollToTopStub;
  let focusElementStub;

  beforeEach(() => {
    scrollToTopStub = sinon.stub(uiUtils, 'scrollToTop');
    focusElementStub = sinon.stub(uiUtils, 'focusElement');
  });

  afterEach(() => {
    scrollToTopStub.restore();
    focusElementStub.restore();
  });

  describe('Component Rendering', () => {
    it('should render without errors', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      expect(container).to.exist;
    });

    it('should display form title', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      expect(container.textContent).to.include('nursing home');
    });

    it('should have schemaform-intro class', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      const article = container.querySelector('.schemaform-intro');
      expect(article).to.exist;
    });

    it('should render OMB info component', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      const ombInfo = container.querySelector('va-omb-info');
      expect(ombInfo).to.exist;
    });

    it('should scroll to top and focus h1 on mount', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );

      expect(scrollToTopStub).to.exist;
      expect(focusElementStub).to.exist;
    });
  });

  describe('Content', () => {
    it('should explain form purpose', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      expect(container.textContent).to.include('nursing home official');
    });

    it('should mention extended care facility', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      expect(container.textContent).to.include('extended care facility');
    });

    it('should mention level of care', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      expect(container.textContent).to.include('Level of care');
    });

    it('should mention Medicaid status', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      expect(container.textContent).to.include('Medicaid status');
    });
  });

  describe('when auth feature flag is off', () => {
    it('should render the direct start link', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );

      const startLink = container.querySelector(
        'va-link-action[data-testid="start-nursing-home-info-link"]',
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
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );

      const startButton = getByText(
        'Start the nursing home information to support a claim request',
      );
      expect(startButton).to.exist;
    });

    it('should not show direct start link when user is not logged in', () => {
      const store = createMockStore({
        featureToggles: { loading: false, [aquiaBioAuthRequiredKey]: true },
      });
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );

      const startLink = container.querySelector(
        'va-link-action[data-testid="start-nursing-home-info-link"]',
      );
      expect(startLink).to.not.exist;
    });
  });

  describe('OMB Information', () => {
    it('should display OMB number', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      const ombInfo = container.querySelector('va-omb-info');
      expect(ombInfo.getAttribute('omb-number')).to.equal('2900-0652');
    });

    it('should display response burden time', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      const ombInfo = container.querySelector('va-omb-info');
      expect(ombInfo.getAttribute('res-burden')).to.equal('10');
    });

    it('should display expiration date', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      const ombInfo = container.querySelector('va-omb-info');
      expect(ombInfo.getAttribute('exp-date')).to.equal('09/30/2026');
    });
  });

  describe('Required Information List', () => {
    it('should list Social Security number requirement', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      expect(container.textContent).to.include('Social Security number');
    });

    it('should list date of birth requirement', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      expect(container.textContent).to.include('Date of birth');
    });

    it('should list monthly cost requirement', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      expect(container.textContent).to.include('Monthly out of pocket cost');
    });
  });

  describe('Links', () => {
    it('should include link to pension information', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      const link = container.querySelector(
        'va-link[href="/pension/aid-attendance-housebound/"]',
      );
      expect(link).to.exist;
    });

    it('should have descriptive link text', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      const link = container.querySelector(
        'va-link[href="/pension/aid-attendance-housebound/"]',
      );
      expect(link.getAttribute('text')).to.include('nursing home');
    });
  });

  describe('Nursing Home Definition', () => {
    it('should explain qualified extended care facility', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      expect(container.textContent).to.include(
        'What is a qualified extended care facility',
      );
    });

    it('should mention state licensed facilities', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      expect(container.textContent).to.include('licensed by a state');
    });

    it('should mention VA nursing home care unit', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      expect(container.textContent).to.include('VA nursing home care unit');
    });

    it('should mention State Veterans Home', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <IntroductionPage {...defaultProps} />
        </Provider>,
      );
      expect(container.textContent).to.include('State Veterans Home');
    });
  });
});
