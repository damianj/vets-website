import React from 'react';
import { VaAlert } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import BasicLink from './BasicLink';

const SHA_CHOICE_PAGE_PATH = 'supporting-evidence/separation-health-assessment';

export default function BddShaAlert() {
  return (
    <VaAlert status="warning" visible>
      <h2 slot="headline">Submit your Separation Health Assessment</h2>
      <p>
        Make sure you submit a Separation Health Assessment (self-assessment,
        also called "Part A").
      </p>
      <p>
        Submitting this assessment now will help us process your claim faster.
        It'll also ensure you're considered for the Benefits Delivery at
        Discharge (BDD) program.
      </p>
      <p>
        <BasicLink
          path={SHA_CHOICE_PAGE_PATH}
          text="Check if you've uploaded a Separation Health Assessment"
        />
      </p>
    </VaAlert>
  );
}
