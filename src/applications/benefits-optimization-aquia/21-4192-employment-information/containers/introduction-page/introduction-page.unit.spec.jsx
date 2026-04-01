import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import * as uiUtils from 'platform/utilities/ui';
import formConfig from '@bio-aquia/21-4192-employment-information/config/form';
import { IntroductionPage } from '@bio-aquia/21-4192-employment-information/containers/introduction-page';

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

describe('IntroductionPage', () => {
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

  it('should render the form title and subtitle', () => {
    const store = createMockStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <IntroductionPage {...defaultProps} />
      </Provider>,
    );

    const title = getByTestId('form-title');
    expect(title).to.exist;
    expect(title.textContent).to.include('Provide Employment Information');

    const subtitle = getByTestId('form-subtitle');
    expect(subtitle).to.exist;
    expect(subtitle.textContent).to.include('VA Form 21-4192');
  });

  it('should render process list with steps', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <IntroductionPage {...defaultProps} />
      </Provider>,
    );

    const processItems = container.querySelectorAll('va-process-list-item');
    expect(processItems).to.have.lengthOf(3);
  });

  it('should render the required information lists', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <IntroductionPage {...defaultProps} />
      </Provider>,
    );

    expect(container.textContent).to.include('social security number');
    expect(container.textContent).to.include('date of birth');
    expect(container.textContent).to.include(
      'The business name of the employer',
    );
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

  it('should display OMB information', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <IntroductionPage {...defaultProps} />
      </Provider>,
    );

    const ombInfo = container.querySelector('va-omb-info');
    expect(ombInfo).to.exist;
    expect(ombInfo.getAttribute('res-burden')).to.equal('15');
    expect(ombInfo.getAttribute('omb-number')).to.equal('2900-0065');
    expect(ombInfo.getAttribute('exp-date')).to.equal('08/31/2027');
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
        'va-link-action[data-testid="start-employment-info-link"]',
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
        /submit employment information in connection with claim for individual unemployability/i,
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
        'va-link-action[data-testid="start-employment-info-link"]',
      );
      expect(startLink).to.not.exist;
    });
  });
});
