import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import { MemoryRouter } from 'react-router-dom';
import * as uiModule from 'platform/utilities/ui';

import HelpPage from '../../../containers/HelpPage';

describe('HelpPage', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(uiModule, 'focusElement');
  });

  afterEach(() => {
    sandbox.restore();
  });

  const renderPage = ({ initialEntries = ['/'] } = {}) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <HelpPage title="Get help with the Accredited Representative Portal" />
      </MemoryRouter>,
    );
  };

  it('renders the page heading', () => {
    const { getByTestId } = renderPage();

    expect(getByTestId('get-help-page-heading').textContent).to.equal(
      'Get help with the Accredited Representative Portal',
    );
  });

  it('renders establishing representation copy', () => {
    const { container } = renderPage();

    const text = container.textContent;

    expect(text).to.include(
      'You can quickly establish representation (power of attorney) using the Representation Requests feature in the portal.',
    );
    expect(text).to.include(
      'Veterans Service Organizations (VSOs) have to activate the Representation Requests feature for their organization if they want to receive requests in the portal.',
    );
    expect(text).to.include('Here’s how to receive requests in the portal:');
    expect(text).to.include(
      'The portal shows a list of requests for your Veterans Service Organization (VSO) that have been received in the portal over the last 60 days.',
    );
  });

  it('renders searching for claimants you represent copy', () => {
    const { container } = renderPage();

    const text = container.textContent;

    expect(text).to.include('Searching for claimants you represent');
    expect(text).to.include(
      'You can find claimants who have recently requested representation or who have existing representation with you or one of your VSOs.',
    );
    expect(text).to.include(
      'To search for a claimant, you’ll need to enter their first name, last name, date of birth, and Social Security number.',
    );
    expect(text).to.include(
      'The portal doesn’t currently check for limited representation.',
    );
    expect(text).to.include(
      'We are exploring search for limited representation as a future enhancement.',
    );
  });

  it('renders submitting VA forms copy', () => {
    const { container } = renderPage();

    const text = container.textContent;

    expect(text).to.include('Submitting VA forms');
    expect(text).to.include(
      'There are two methods the portal uses for submissions.',
    );
    expect(text).to.include(
      'Prior to submission, the system will verify that you or your Veterans Service Organization (VSO) currently represent the claimant.',
    );
    expect(text).to.include(
      'Fill out the required steps in the portal for VA Form 21-0966, and then submit.',
    );
    expect(text).to.include(
      'Upload the completed VA Form 21-526EZ PDF, and then submit.',
    );
    expect(text).to.include(
      'Upload the completed VA Form 21-686c PDF and any supporting evidence, and then submit.',
    );
    expect(text).to.include(
      'The portal isn’t able to establish dependents within 24 hours at this time.',
    );
  });
});
