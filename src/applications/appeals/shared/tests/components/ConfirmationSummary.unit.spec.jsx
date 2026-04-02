import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { $ } from '@department-of-veterans-affairs/platform-forms-system/ui';
import {
  ConfirmationSummary,
  ConfirmationReturnLink,
} from '../../components/ConfirmationSummary';

describe('ConfirmationSummary', () => {
  it('should render the print section without the download summary', () => {
    const { container } = render(
      <ConfirmationSummary name="Higher-Level Review" downloadUrl="" />,
    );

    expect($('va-summary-box', container)).to.not.exist;
    expect($('h2', container).textContent).to.equal(
      'Print a copy of your Higher-Level Review',
    );
    expect($('va-button', container).getAttribute('text')).to.include(
      'Print this page',
    );
  });

  it('should render the download summary when downloadUrl is provided', () => {
    const { container } = render(
      <ConfirmationSummary name="Higher-Level Review" downloadUrl="test" />,
    );

    const summaryBox = $('va-summary-box', container);
    expect(summaryBox).to.exist;
    expect($('h3[slot="headline"]', summaryBox).textContent).to.equal(
      'Save a PDF copy of your Higher-Level Review request',
    );
    expect($('h2', container).textContent).to.equal(
      'Print a copy of your Higher-Level Review',
    );
  });
});

describe('ConfirmationReturnLink', () => {
  it('should render the return link to VA.gov', () => {
    const { container } = render(<ConfirmationReturnLink />);
    const link = $('va-link-action', container);

    expect(link).to.exist;
    expect(link.getAttribute('href')).to.equal('/');
    expect(link.getAttribute('text')).to.equal('Go back to VA.gov homepage');
  });
});
