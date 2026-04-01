import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { $$ } from '@department-of-veterans-affairs/platform-forms-system/ui';
import TrainingAndWebinar from '../../../../components/MainContent/Update/TrainingAndWebinar';

describe('TrainingAndWebinar', () => {
  it('renders Covered Educational Institutions directly after Training requirements', () => {
    const { container, unmount } = render(<TrainingAndWebinar />);
    const links = $$('va-link', container);
    const linkTexts = links.map(link => link.getAttribute('text'));

    expect(linkTexts).to.deep.equal([
      'Training requirements',
      'Covered Educational Institutions',
      'SCO Training Portal',
      'Office Hours and webinars',
      'Sign up for trainings, webinars, and office hours updates',
      'GovDelivery Message Archive',
    ]);

    unmount();
  });
});
