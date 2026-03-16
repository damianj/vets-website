import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import BddShaAlert from '../../components/BddShaAlert';

describe('BddShaAlert', () => {
  const renderComponent = () => render(<BddShaAlert />);

  it('renders a va-alert with warning status', () => {
    const { container } = renderComponent();
    const alert = container.querySelector('va-alert');

    expect(alert).to.exist;
    expect(alert.getAttribute('status')).to.equal('warning');
  });

  it('renders the correct headline', () => {
    const { getByText } = renderComponent();

    getByText('Submit your Separation Health Assessment');
  });

  it('renders the body text explaining the SHA requirement', () => {
    const { getByText } = renderComponent();

    getByText(/Make sure you submit a Separation Health Assessment/);
    getByText(
      /Submitting this assessment now will help us process your claim faster/,
    );
  });

  it('renders a link to the supporting evidence page', () => {
    const { container } = renderComponent();
    const link = container.querySelector('va-link');

    expect(link).to.exist;
    expect(link.getAttribute('text')).to.equal(
      "Check if you've uploaded a Separation Health Assessment",
    );
    expect(link.getAttribute('href')).to.equal(
      '/supporting-evidence/separation-health-assessment',
    );
  });
});
