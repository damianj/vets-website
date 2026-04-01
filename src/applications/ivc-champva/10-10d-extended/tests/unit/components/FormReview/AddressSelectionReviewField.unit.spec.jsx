import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import AddressSelectionReviewField, {
  formatDataValue,
  REVIEW_OPTION_NO,
} from '../../../../components/FormReview/AddressSelectionReviewField';
import { NOT_SHARED } from '../../../../components/FormFields/AddressSelectionField';

const MOCK_ADDRESS = {
  street: '123 Main St',
  city: 'Portland',
  state: 'OR',
  postalCode: '97201',
  country: 'USA',
};

describe('1010d <AddressSelectionReviewField>', () => {
  const subject = ({ formData = '', title = 'Test Title' } = {}) => {
    const childElement = (
      <div formData={formData} uiSchema={{ 'ui:title': title }} />
    );
    const { container } = render(
      <AddressSelectionReviewField>{childElement}</AddressSelectionReviewField>,
    );
    return {
      reviewRow: container.querySelector('.review-row'),
      titleEl: container.querySelector('dt'),
      valueEl: container.querySelector('dd'),
    };
  };

  it('should return "No" for empty-like values', () => {
    ['', null, undefined].forEach(value => {
      expect(formatDataValue(value)).to.equal(REVIEW_OPTION_NO);
    });
  });

  it('should return "No" for NOT_SHARED value', () => {
    expect(formatDataValue(NOT_SHARED)).to.equal(REVIEW_OPTION_NO);
  });

  it('should format valid JSON address', () => {
    const result = formatDataValue(JSON.stringify(MOCK_ADDRESS));
    expect(result).to.include('Yes');
    expect(result).to.include('123 Main St');
    expect(result).to.include('Portland, OR');
  });

  it('should handle invalid JSON gracefully', () => {
    const result = formatDataValue('not-json-string');
    expect(result).to.include('Yes');
    expect(result).to.include('not-json-string');
  });

  it('should render title from uiSchema', () => {
    const { titleEl } = subject({ title: 'Custom Title' });
    expect(titleEl.textContent).to.equal('Custom Title');
  });

  it('should render "No" for NOT_SHARED value', () => {
    const { valueEl } = subject({ formData: NOT_SHARED });
    expect(valueEl.textContent).to.equal(REVIEW_OPTION_NO);
  });

  it('should render formatted address for valid JSON', () => {
    const { valueEl } = subject({
      formData: JSON.stringify(MOCK_ADDRESS),
    });
    expect(valueEl.textContent).to.include('Yes');
    expect(valueEl.textContent).to.include('123 Main St');
  });

  it('should have proper CSS classes and data attributes', () => {
    const { reviewRow, valueEl } = subject();
    expect(reviewRow).to.exist;
    expect(valueEl).to.have.class('dd-privacy-hidden');
    expect(valueEl).to.have.attr('data-dd-action-name', 'data value');
  });
});
