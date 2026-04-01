import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import CCProofOfAttendanceSection from './CCProofOfAttendanceSection';

describe('VAOS Component: CCProofOfAttendanceSection', () => {
  it('should render the travel reimbursement claim heading', () => {
    const { getByRole } = render(<CCProofOfAttendanceSection />);
    expect(getByRole('heading', { name: /Travel reimbursement claim/i })).to.be
      .ok;
  });

  it('should render proof of attendance explanation text', () => {
    const { getByText } = render(<CCProofOfAttendanceSection />);
    expect(
      getByText(
        /you’ll need to submit proof that you attended the appointment/i,
      ),
    ).to.be.ok;
  });

  it('should render the list of acceptable proof documents', () => {
    const { getByText } = render(<CCProofOfAttendanceSection />);
    expect(getByText(/work or school release note/i)).to.be.ok;
    expect(getByText(/community provider letterhead/i)).to.be.ok;
  });
});
