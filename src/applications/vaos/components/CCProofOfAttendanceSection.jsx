import React from 'react';
import PropTypes from 'prop-types';
import Section from './Section';

const content = (
  <>
    <p>
      To request travel pay for your community care appointment, you’ll need to
      submit proof that you attended the appointment.
    </p>
    <p>Proof of attendance can include these documents:</p>
    <ul>
      <li>A work or school release note from the community provider</li>
      <li>
        A document on the community provider letterhead showing the date your
        appointment was completed
      </li>
    </ul>
  </>
);

export default function CCProofOfAttendanceSection({ confirmation }) {
  if (confirmation) {
    return (
      <>
        <h2>Travel reimbursement claim</h2>
        {content}
      </>
    );
  }

  return <Section heading="Travel reimbursement claim">{content}</Section>;
}

CCProofOfAttendanceSection.propTypes = {
  confirmation: PropTypes.bool,
};
