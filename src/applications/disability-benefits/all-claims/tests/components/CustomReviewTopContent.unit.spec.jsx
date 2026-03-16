import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import CustomReviewTopContent from '../../components/CustomReviewTopContent';
import * as utils from '../../utils';

const buildState = ({
  disability526NewBddShaEnforcementWorkflowEnabled = true,
  separationHealthAssessmentUploads = [],
} = {}) => ({
  form: {
    data: {
      disability526NewBddShaEnforcementWorkflowEnabled,
      separationHealthAssessmentUploads,
    },
  },
});

const renderComponent = state => {
  const store = createStore(() => state);
  return render(
    <Provider store={store}>
      <CustomReviewTopContent />
    </Provider>,
  );
};

function assertShaAlertExists({ container, getByText }) {
  getByText('A Separation Health Assessment (SHA) Part A is required');
  getByText(/If you do not include a SHA Part A/);
  const link = container.querySelector('va-link');
  expect(link).to.exist;
  expect(link.getAttribute('text')).to.equal(
    "Check if you've uploaded a SHA Part A document",
  );
}

function assertShaAlertNotExists({ container, queryByText }) {
  expect(queryByText('A Separation Health Assessment (SHA) Part A is required'))
    .to.not.exist;
  expect(queryByText(/If you do not include a SHA Part A/)).to.not.exist;
  expect(container.querySelector('va-link')).to.not.exist;
}

describe('CustomReviewTopContent', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('renders the SHA alert for a BDD claim with feature flag enabled and no SHA upload', () => {
    sandbox.stub(utils, 'isBDD').returns(true);
    const state = buildState();

    const result = renderComponent(state);

    expect(result.container.querySelector('va-alert')).to.exist;
    assertShaAlertExists(result);
  });

  it('does not render the SHA alert when feature flag is disabled', () => {
    sandbox.stub(utils, 'isBDD').returns(true);
    const state = buildState({
      disability526NewBddShaEnforcementWorkflowEnabled: false,
    });

    const result = renderComponent(state);

    assertShaAlertNotExists(result);
  });

  it('does not render the SHA alert when a SHA document has been uploaded', () => {
    sandbox.stub(utils, 'isBDD').returns(true);
    const state = buildState({
      separationHealthAssessmentUploads: [
        { name: 'sha-part-a.pdf', confirmationCode: 'abc123' },
      ],
    });

    const result = renderComponent(state);

    assertShaAlertNotExists(result);
  });

  it('does not render the SHA alert for a non-BDD claim', () => {
    sandbox.stub(utils, 'isBDD').returns(false);
    const state = buildState();

    const result = renderComponent(state);

    assertShaAlertNotExists(result);
  });
});
