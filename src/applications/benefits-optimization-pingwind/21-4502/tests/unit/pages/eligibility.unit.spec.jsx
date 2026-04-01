import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { expect } from 'chai';
import EligibilityFormPage from '../../../pages/eligibility';

describe('21-4502 EligibilityFormPage', () => {
  let goForwardCalls;
  const defaultProps = {
    goBack: () => {},
  };

  beforeEach(() => {
    goForwardCalls = [];
  });

  it('renders', () => {
    const { container } = render(<EligibilityFormPage {...defaultProps} />);
    expect(container.textContent).to.include('Is this the form I need');
  });

  it('renders "Already know" section', () => {
    const { container } = render(<EligibilityFormPage {...defaultProps} />);
    expect(container.textContent).to.include(
      'Already know this is the right form',
    );
  });

  it('allows continuing without answering', () => {
    const { getByTestId } = render(
      <EligibilityFormPage
        {...defaultProps}
        goForward={payload => goForwardCalls.push(payload)}
      />,
    );

    fireEvent.click(getByTestId('eligibility-continue-button'));

    expect(goForwardCalls).to.deep.equal([{ formData: {} }]);
  });
});
