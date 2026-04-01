import React from 'react';

export const headerCopy = 'Submit your Separation Health Assessment';

export const SeparationHealthAssessmentWarningAlert = () => {
  return (
    <div className="vads-u-margin-top--2">
      <va-alert status="warning">
        <h3 slot="headline">{headerCopy}</h3>
        <p>
          You must submit a Separation Health Assessment (self-assessment, also
          called “Part A”).
        </p>
        <p>
          Submitting this assessment now will help us process your claim faster.
          It’ll also ensure you’re considered for the Benefits Delivery at
          Discharge (BDD) program.
        </p>
        <p>
          <va-link
            href="https://www.benefits.va.gov/compensation/dbq_publicdbqs.asp"
            text="Download your Separation Health Assessment"
            external
          />
        </p>
      </va-alert>
    </div>
  );
};
