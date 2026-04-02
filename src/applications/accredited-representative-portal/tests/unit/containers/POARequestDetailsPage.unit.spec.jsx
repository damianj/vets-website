import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import * as uiModule from 'platform/utilities/ui';

import POARequestDetailsPage from '../../../containers/POARequestDetailsPage';

describe('POARequestDetailsPage', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(uiModule, 'focusElement');
  });

  afterEach(() => {
    sandbox.restore();
  });

  const renderPage = ({ loaderData }) => {
    const router = createMemoryRouter(
      [
        {
          path: '/representation-requests/:id',
          loader: async () => loaderData,
          element: (
            <POARequestDetailsPage
              title={{ title: 'Representation request' }}
            />
          ),
        },
      ],
      {
        initialEntries: ['/representation-requests/123'],
      },
    );

    return render(<RouterProvider router={router} />);
  };

  it('renders 403 warning alert when loader returns error403', async () => {
    const { findByTestId, container } = renderPage({
      loaderData: { error403: true },
    });

    const alert = await findByTestId('poa-request-details-403');
    expect(alert).to.exist;
    expect(alert.getAttribute('status')).to.equal('warning');

    const text = container.textContent;
    expect(text).to.include('review this representation request');
    expect(text).to.include(
      'Your Veterans Service Organization only allows you to review details of requests where you are the preferred representative.',
    );
  });
});
