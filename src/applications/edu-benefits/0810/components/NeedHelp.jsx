import React from 'react';

import { CONTACTS } from '@department-of-veterans-affairs/component-library/contacts';

export default function NeedHelp() {
  return (
    <div className="usa-width-two-thirds medium-8 print-full-width">
      <va-need-help>
        <div slot="content">
          <p>
            If you need help completing this form, call us at 1-888-GI-BILL-1 (
            <va-telephone contact={CONTACTS.GI_BILL} international />
            ). If you have hearing loss, call <va-telephone contact="711" tty />
            .
          </p>
        </div>
      </va-need-help>
    </div>
  );
}
