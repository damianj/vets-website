import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';

import { $ } from '@department-of-veterans-affairs/platform-forms-system/ui';

import {
  homelessRiskTitle,
  homelessReviewField,
} from '../../../shared/content/homeless';

describe('homelessReviewField', () => {
  const Field = homelessReviewField;

  it('should render "Yes" when the question is answered "Yes"', () => {
    const { container } = render(
      <Field>
        <div formData />
      </Field>,
    );

    expect($('dt', container).textContent).to.equal(homelessRiskTitle);
    expect($('dd', container).textContent).to.equal('Yes');
  });

  it('should render "No" when the question is answered "No"', () => {
    const { container } = render(
      <Field>
        <div formData={false} />
      </Field>,
    );

    expect($('dt', container).textContent).to.equal(homelessRiskTitle);
    expect($('dd', container).textContent).to.equal('No');
  });

  it('should render "Not answered" when the question is skipped', () => {
    const { container } = render(<Field />);

    expect($('dt', container).textContent).to.equal(homelessRiskTitle);
    expect($('dd', container).textContent).to.equal('Not answered');
  });
});
