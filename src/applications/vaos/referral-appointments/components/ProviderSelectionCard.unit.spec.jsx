import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import ProviderSelectionCard from './ProviderSelectionCard';
import { mockProviderDetails } from '../utils/mocks';

describe('VAOS Component: ProviderSelectionCard', () => {
  // TODO: Update tests to use real provider data shapes once the API integration is complete
  const defaultProps = {
    provider: mockProviderDetails,
    index: 0,
    referralId: 'ref-1',
  };

  it('should return null when provider is falsy', () => {
    const screen = render(
      <ProviderSelectionCard provider={null} index={0} referralId="ref-1" />,
    );
    expect(screen.container.innerHTML).to.equal('');
  });

  it('should render ListItem component', () => {
    const screen = render(<ProviderSelectionCard {...defaultProps} />);
    expect(screen.getByTestId('appointment-list-item')).to.exist;
  });

  it('should apply borderTop class when index is 0', () => {
    const screen = render(<ProviderSelectionCard {...defaultProps} />);
    const listItem = screen.getByTestId('appointment-list-item');
    expect(listItem.className).to.contain('vads-u-border-top--1px');
  });

  it('should not apply borderTop class when index is not 0', () => {
    const screen = render(
      <ProviderSelectionCard {...defaultProps} index={1} />,
    );
    const listItem = screen.getByTestId('appointment-list-item');
    expect(listItem.className).to.not.contain('vads-u-border-top--1px');
  });

  it('should render provider name', () => {
    const screen = render(<ProviderSelectionCard {...defaultProps} />);
    expect(screen.getByTestId('provider-name')).to.exist;
    expect(screen.getByTestId('provider-name').textContent).to.equal(
      'Dr. Kristina Jones',
    );
  });

  it('should render COMMUNITY CARE type', () => {
    const screen = render(<ProviderSelectionCard {...defaultProps} />);
    expect(screen.getByTestId('provider-type')).to.exist;
    expect(screen.getByTestId('provider-type').textContent).to.equal(
      'COMMUNITY CARE',
    );
  });

  it('should render facility name', () => {
    const screen = render(<ProviderSelectionCard {...defaultProps} />);
    expect(screen.getByTestId('facility-name')).to.exist;
    expect(screen.getByTestId('facility-name').textContent).to.equal(
      'Facility Name',
    );
  });

  it('should render drive time', () => {
    const screen = render(<ProviderSelectionCard {...defaultProps} />);
    expect(screen.getByTestId('drive-time')).to.exist;
    expect(screen.getByTestId('drive-time').textContent).to.equal(
      '7 minute drive (2 miles)',
    );
  });

  it('should render next available label and date', () => {
    const screen = render(<ProviderSelectionCard {...defaultProps} />);
    expect(screen.getByTestId('next-available-label')).to.exist;
    expect(screen.getByTestId('next-available-label').textContent).to.equal(
      'Next available:',
    );
    expect(screen.getByTestId('next-available-date')).to.exist;
    expect(screen.getByTestId('next-available-date').textContent).to.equal(
      'March 26, 2026 at 10:00 AM',
    );
  });

  it('should render va-link with correct href using referralId and provider uuid', () => {
    const screen = render(<ProviderSelectionCard {...defaultProps} />);
    const link = screen.container.querySelector('va-link');
    expect(link).to.exist;
    expect(link.getAttribute('href')).to.equal(
      'date-time?id=ref-1&provider=123456',
    );
  });

  it('should render va-link with fallback ids when referralId and provider uuid are missing', () => {
    const screen = render(<ProviderSelectionCard provider={{}} index={0} />);
    const link = screen.container.querySelector('va-link');
    expect(link).to.exist;
    expect(link.getAttribute('href')).to.equal(
      'date-time?id=123456&provider=123456',
    );
  });

  it('should render va-link with correct text', () => {
    const screen = render(<ProviderSelectionCard {...defaultProps} />);
    const link = screen.container.querySelector('va-link');
    expect(link).to.exist;
    expect(link.getAttribute('text')).to.equal('Review available appointments');
  });
});
