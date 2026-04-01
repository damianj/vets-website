import React from 'react';

const BirthSexAddtlInfo = () => (
  <va-additional-info trigger="Why we ask for birth sex information">
    <div>
      <p className="vads-u-margin-top--0">
        We require this information to confirm the applicant’s eligibility for
        certain medical claims.
      </p>
      <p>
        <strong>Example:</strong> We pay for uterine cancer screenings only if
        they were assigned female at birth. And we pay for prostate exams only
        if they were assigned male at birth.
      </p>
      <p className="vads-u-margin-bottom--0">
        This information won’t affect their eligibility for CHAMPVA benefits.
        And we won’t share it with anyone outside of VA.
      </p>
    </div>
  </va-additional-info>
);

export default BirthSexAddtlInfo;
