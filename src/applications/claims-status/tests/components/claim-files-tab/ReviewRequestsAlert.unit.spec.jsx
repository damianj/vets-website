import React from 'react';
import { expect } from 'chai';

import ReviewRequestsAlert from '../../../components/claim-files-tab/ReviewRequestsAlert';
import { renderWithRouter } from '../../utils';

describe('<ReviewRequestsAlert>', () => {
  it('renders a warning alert', () => {
    const { container } = renderWithRouter(<ReviewRequestsAlert />);
    const alert = container.querySelector('va-alert[status="warning"]');

    expect(alert).to.exist;
  });

  it('renders the headline', () => {
    const { getByRole } = renderWithRouter(<ReviewRequestsAlert />);

    expect(getByRole('heading', { name: 'Review your requests', level: 3 })).to
      .exist;
  });

  it('renders the body text', () => {
    const { getByText } = renderWithRouter(<ReviewRequestsAlert />);

    expect(
      getByText(
        "You may have evidence requests you haven't responded to yet. Review them before uploading additional evidence here.",
      ),
    ).to.exist;
  });

  it('renders the Review requests action link', () => {
    const { container } = renderWithRouter(<ReviewRequestsAlert />);
    const link = container.querySelector(
      'va-link-action[text="Review requests"]',
    );

    expect(link).to.exist;
    expect(link.getAttribute('type')).to.equal('secondary');
    expect(link.getAttribute('href')).to.equal('../status');
  });
});
