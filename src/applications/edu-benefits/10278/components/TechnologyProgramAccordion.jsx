import React from 'react';

const TechnologyProgramAccordion = () => {
  return (
    <va-accordion open-single>
      <va-accordion-item header="Privacy Act Statement" id="first">
        <p>
          The VA will not disclose information collected on this form to any
          source other than what has been authorized under the Privacy Act of
          1974 or title 38, Code of Federal Regulations, section 1.576 for
          routine uses (i.e., civil or criminal law enforcement, congressional
          communications, epidemiological or research studies, the collection of
          money owed to the United States, litigation in which the United States
          is a party or has an interest, the administration of VA programs and
          delivery of VA benefits, verification of identity and status, and
          personnel administration) as identified in the VA system of records,
          58VA21/22/28, Compensation, Pension, Education, and Veteran Readiness
          and Employment Records - VA, and published in the Federal Register.
          Your obligation to respond is voluntary. VA uses your SSN to identify
          your claim file. Providing your SSN will help ensure that your records
          are properly associated with your claim file. Giving us your SSN
          account information is voluntary. Refusal to provide your SSN by
          itself will not result in the denial of benefits. The VA will not deny
          an individual benefits for refusing to provide his or her SSN unless
          the disclosure of the SSN is required by Federal Statute of law effect
          prior to January 1, 1975, and still in effect.
        </p>
      </va-accordion-item>
      <va-accordion-item header="Respondent Burden" id="second">
        <p>
          An agency may not conduct or sponsor, and a person is not required to
          respond to, a collection of information unless it displays a currently
          valid OMB control number. The OMB control number for this project is
          2900-0914, and it expires 12/31/2028. Public reporting burden for this
          collection of information is estimated to average 5 minutes per
          respondent, per year, including the time for reviewing instructions,
          searching existing data sources, gathering and maintaining the data
          needed, and completing and reviewing the collection of information.
          Send comments regarding this burden estimate and any other aspect of
          this collection of information, including suggestions for reducing the
          burden, to VA Reports Clearance Officer at{' '}
          <a href="mailto:vapra@va.gov" target="_blank" rel="noreferrer">
            vapra@va.gov
          </a>
          . Please refer to OMB Control No. 2900-0914 in any correspondence. Do
          not send your completed VA Form 22-10278 to this email address.
        </p>
      </va-accordion-item>
    </va-accordion>
  );
};

export default TechnologyProgramAccordion;
