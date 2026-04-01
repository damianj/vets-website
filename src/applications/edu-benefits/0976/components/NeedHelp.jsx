import React from 'react';

export default function NeedHelp() {
  return (
    <div className="usa-width-two-thirds medium-8 columns print-full-width">
      <va-need-help>
        <div slot="content">
          <p>
            <strong>
              If you need help gathering your information or filling out your
              form,
            </strong>{' '}
            contact{' '}
            <va-link
              href="mailto:Federal.Approvals@va.gov"
              text="Federal.Approvals@va.gov"
            />
          </p>
        </div>
      </va-need-help>
    </div>
  );
}
