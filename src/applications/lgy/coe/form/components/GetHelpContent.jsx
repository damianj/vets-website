import React from 'react';
import { CONTACTS } from '@department-of-veterans-affairs/component-library/contacts';

export const GetHelpContent = () => (
  <>
    <p>
      <span className="vads-u-font-weight--bold">
        If you need help or have questions about your COE,
      </span>{' '}
      call the VA loan guaranty program at <va-telephone contact="8778273702" />
      . We’re here Monday through Friday, 8:00 a.m. to 6:00 p.m. ET.
    </p>

    <p className="vads-u-margin-top--0">
      <span className="vads-u-font-weight--bold">
        If you need help with a general or technical question,
      </span>{' '}
      you can call the VA’s main information line at{' '}
      <va-telephone contact="8006982411" /> (
      <va-telephone contact={CONTACTS[711]} tty />
      ). We’re available 24/7.
    </p>

    <p className="vads-u-margin-top--0">
      <span className="vads-u-font-weight--bold">
        If you need help gathering your information or submitting your request,
      </span>{' '}
      you can appoint a VA accredited representative.
    </p>

    <va-link
      href="/get-help-from-accredited-representative/"
      text="Get help submitting a request"
    />

    <p>
      <span className="vads-u-font-weight--bold">
        If you have benefit related questions, you can ask online through AskVA.
      </span>{' '}
      Select the category and topic for the VA benefit this form is related to.
    </p>

    <va-link
      href="/contact-us/ask-va/introduction/"
      text="Contact us online through Ask VA"
    />

    <hr className="vads-u-margin-top--4 vads-u-margin-bottom--2" />
  </>
);
