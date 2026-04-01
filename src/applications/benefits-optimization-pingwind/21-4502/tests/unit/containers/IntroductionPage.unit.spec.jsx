import React from 'react';
import { Provider } from 'react-redux';
import { render, cleanup } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import * as ui from 'platform/utilities/ui';
import * as formTitleMod from 'platform/forms-system/src/js/components/FormTitle';
import formConfig from '../../../config/form';
import IntroductionPage from '../../../containers/IntroductionPage';

describe('21-4502 IntroductionPage', () => {
  let sandbox;

  const props = {
    route: {
      path: 'introduction',
      pageList: [
        { pageKey: 'introduction', path: '/introduction' },
        { pageKey: 'personal-information', path: '/personal-information' },
        { pageKey: 'review', path: '/review-and-submit' },
      ],
      formConfig,
    },
  };

  const makeStore = ({ loggedIn = false, loa = 3 } = {}) => ({
    getState: () => ({
      user: {
        login: { currentlyLoggedIn: loggedIn },
        profile: {
          loa: { current: loa },
          verified: loa === 3,
          savedForms: [],
          prefillsAvailable: [formConfig.formId],
          dob: '2000-01-01',
        },
      },
      form: {
        formId: formConfig.formId,
        loadedStatus: 'success',
        savedStatus: '',
        loadedData: { metadata: {} },
        data: {},
      },
      scheduledDowntime: {
        globalDowntime: null,
        isReady: true,
        isPending: false,
        serviceMap: { get() {} },
        dismissedDowntimeWarnings: [],
      },
    }),
    subscribe: () => {},
    dispatch: () => {},
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(ui, 'focusElement').callsFake(() => {});
    sandbox.stub(formTitleMod, 'default').callsFake(({ title, subTitle }) => (
      <div>
        <h1 data-testid="form-title">{title}</h1>
        {subTitle ? <div data-testid="form-subtitle">{subTitle}</div> : null}
      </div>
    ));
  });

  afterEach(() => {
    sandbox.restore();
    cleanup();
  });

  it('renders', () => {
    const store = makeStore();
    const { container } = render(
      <Provider store={store}>
        <IntroductionPage {...props} />
      </Provider>,
    );
    expect(container).to.exist;
  });

  it('shows SaveInProgress when a user is LOA3', () => {
    const store = makeStore({ loggedIn: true, loa: 3 });
    const { getByText } = render(
      <Provider store={store}>
        <IntroductionPage {...props} />
      </Provider>,
    );
    expect(getByText('Start the application')).to.exist;
  });

  it('hides SaveInProgress when a user is logged in but not verified', () => {
    const store = makeStore({ loggedIn: true, loa: 1 });
    const { queryByText } = render(
      <Provider store={store}>
        <IntroductionPage {...props} />
      </Provider>,
    );
    expect(queryByText('Start the application')).to.be.null;
  });
});
