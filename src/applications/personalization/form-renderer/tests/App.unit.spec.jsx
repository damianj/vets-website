import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import { Provider } from 'react-redux';
import { $ } from 'platform/forms-system/src/js/utilities/ui';
import * as apiModule from 'platform/utilities/api';
import backendServices from '@department-of-veterans-affairs/platform-user/profile/backendServices';
import * as userSelectors from 'platform/user/selectors';
import App from '../containers/App';

const submission = require('../mocks/testdata');

const user = {
  login: {
    currentlyLoggedIn: true,
  },
  profile: {
    firstName: 'HECTOR',
    lastName: 'ALLEN',
    verified: true,
    signIn: { serviceName: 'idme' },
    loa: { current: 1 },
    services: [backendServices.USER_PROFILE],
  },
};
const getData = ({ featureToggles = {} } = {}) => ({
  mockStore: {
    getState: () => ({
      featureToggles,
    }),
    subscribe: () => {},
    dispatch: () => {},
  },
});

describe('App Component', () => {
  let originalLocation;
  let mockLocation;
  let apiRequestStub;
  let selectUserStub;
  const sinon = require('sinon');

  beforeEach(() => {
    apiRequestStub = sinon.stub(apiModule, 'apiRequest');
    originalLocation = window.location;
    selectUserStub = sinon
      .stub(userSelectors, 'selectUser')
      .callsFake(() => user);

    mockLocation = {
      href: 'http://localhost/',
      assign: sinon.stub(),
      replace: sinon.stub(),
    };

    delete window.location;
    window.location = mockLocation;
  });

  afterEach(() => {
    window.location = originalLocation;
    apiRequestStub.restore();
    selectUserStub.restore();
  });

  it('renders the renderer when the dependents_enable_form_viewer_mfe feature flag is on', async () => {
    const { mockStore } = getData({
      featureToggles: {
        [`dependents_enable_form_viewer_mfe`]: true,
        loading: false,
      },
    });
    const mockParams = { id: '12345' };
    const mockSubmission = {
      submission: submission.data,
      template: submission.config,
    };
    apiRequestStub.resolves(mockSubmission);

    const { container } = render(
      <Provider store={mockStore}>
        <App params={mockParams} />
      </Provider>,
    );

    await waitFor(() => {
      sinon.assert.calledWith(
        apiRequestStub,
        '/digital_forms_api/submissions/12345',
        {
          headers: { 'Content-Type': 'application/json' },
          method: 'GET',
        },
      );
    });

    const loadingIndicator = $('va-loading-indicator', container);

    expect(loadingIndicator).not.to.exist;

    await waitFor(() => {
      expect(container.textContent).to.include(
        'Section 1: Veteran information',
      );
    });
  });

  it('redirects and does NOT render the renderer when the dependents_enable_form_viewer_mfe feature flag is off', async () => {
    const { mockStore } = getData({
      featureToggles: {
        [`dependents_enable_form_viewer_mfe`]: false,
        loading: false,
      },
    });
    const mockParams = { id: 'test-456' };
    const mockSubmission = {
      submission: submission.data,
      template: submission.config,
    };
    apiRequestStub.resolves(mockSubmission);

    const { container } = render(
      <Provider store={mockStore}>
        <App params={mockParams} />
      </Provider>,
    );

    const loadingIndicator = $('va-loading-indicator', container);

    expect(loadingIndicator).to.exist;
    expect(container.textContent).not.to.include(
      'Section 1: Veteran information',
    );
    expect(window.location.href).to.include('/my-va');
  });

  it('shouldnt render anything if the feature toggles are still loading', async () => {
    const { mockStore } = getData({
      featureToggles: {
        [`dependents_enable_form_viewer_mfe`]: true,
        loading: true,
      },
    });
    const mockParams = { id: 'test-123' };
    const mockSubmission = {
      submission: submission.data,
      template: submission.config,
    };
    apiRequestStub.resolves(mockSubmission);

    const { container } = render(
      <Provider store={mockStore}>
        <App params={mockParams} />
      </Provider>,
    );
    const loadingIndicator = $('va-loading-indicator', container);

    expect(loadingIndicator).not.to.exist;

    expect(container.textContent).to.include('');
    expect(container.textContent).not.to.include(
      'Section 1: Veteran information',
    );
  });

  it('renders generic error message for 500 Internal server error', async () => {
    const { mockStore } = getData({
      featureToggles: {
        [`dependents_enable_form_viewer_mfe`]: true,
      },
    });
    const mockParams = { id: '12345' };
    const error = { error: 'Not found' };
    apiRequestStub.rejects(error);

    const { container } = render(
      <Provider store={mockStore}>
        <App params={mockParams} />
      </Provider>,
    );

    await waitFor(() => {
      sinon.assert.calledOnce(apiRequestStub);
    });

    await waitFor(() => {
      expect(container.textContent).to.include(
        'We’re sorry. There’s a problem with our system. Try again later.',
      );
    });
  });

  it('renders generic error message for 404 Not found error', async () => {
    const { mockStore } = getData({
      featureToggles: {
        [`dependents_enable_form_viewer_mfe`]: true,
      },
    });
    const mockParams = { id: '12345' };
    const error = { error: 'Not found' };
    apiRequestStub.rejects(error);

    const { container } = render(
      <Provider store={mockStore}>
        <App params={mockParams} />
      </Provider>,
    );

    await waitFor(() => {
      sinon.assert.calledOnce(apiRequestStub);
    });

    await waitFor(() => {
      expect(container.textContent).to.include(
        'We’re sorry. There’s a problem with our system. Try again later.',
      );
    });
  });

  it('renders Unauthorized error message for 403 Forbidden', async () => {
    const { mockStore } = getData({
      featureToggles: {
        [`dependents_enable_form_viewer_mfe`]: true,
      },
    });
    const mockParams = { id: '12345' };
    const error = { error: 'Forbidden' };
    apiRequestStub.rejects(error);

    const { container } = render(
      <Provider store={mockStore}>
        <App params={mockParams} />
      </Provider>,
    );

    await waitFor(() => {
      sinon.assert.calledOnce(apiRequestStub);
    });

    await waitFor(() => {
      expect(container.textContent).to.include('We can’t match your records');
    });
  });
});
