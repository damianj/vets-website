import React from 'react';
import { useSelector } from 'react-redux';
import { CONTACTS } from '@department-of-veterans-affairs/component-library/contacts';
import { resetStoredSubTask } from '@department-of-veterans-affairs/platform-forms/sub-task';
import { SubmissionAlert } from 'platform/forms-system/src/js/components/ConfirmationView';
import { selectProfile } from 'platform/user/selectors';
import { useFeatureToggle } from 'platform/utilities/feature-toggles';

// Content
import { title995 } from '../content/title';
import { PrivateDetailsDisplay } from './evidence/PrivateDetailsDisplay';
import { PrivateDetailsConfirmation } from './evidence/PrivateDetailsConfirmation';
import { EvidenceUploadContent } from './EvidenceUploadContent';
import { VaDetailsDisplay } from './evidence/VaDetailsDisplay';
import { VaDetailsConfirmation } from './evidence/VaDetailsConfirmation';
import { content as notice5103Content } from '../content/notice5103';
import { facilityTypeTitle, facilityTypeList } from '../content/facilityTypes';
import { content as evidenceContent } from '../content/evidence/summary';
import { optionForMstTitle } from '../content/optionForMst';
import {
  optionIndicatorLabel,
  optionIndicatorChoices,
} from '../content/optionIndicator';

// Utils
import {
  getArrayBuilderPrivateEvidence,
  getArrayBuilderVAEvidence,
  getOtherEvidence,
  getPrivateEvidence,
  getVAEvidence,
} from '../utils/form-data-retrieval';
import { APP_NAME, HAS_PRIVATE_LIMITATION } from '../constants';
import { getReadableDateFromTimestamp } from '../../shared/utils/dates';

// Components
import {
  ConfirmationSummary,
  ConfirmationReturnLink,
} from '../../shared/components/ConfirmationSummary';
import { ConfirmationAlert } from '../../shared/components/ConfirmationAlert';
import { ConfirmationTitle } from '../../shared/components/ConfirmationTitle';
import ConfirmationPersonalInfo from '../../shared/components/ConfirmationPersonalInfo';
import ConfirmationIssues from '../../shared/components/ConfirmationIssues';
import { LivingSituation } from './LivingSituation';
import { convertBoolResponseToYesNo } from '../../shared/utils/form-data-display';
import { redesignActive } from '../utils';
import {
  CHAPTER_HEADER_CLASSES,
  LABEL_CLASSES,
  VALUE_CLASSES,
} from '../../shared/constants';

export const ConfirmationPage = () => {
  resetStoredSubTask();

  const { useToggleValue, TOGGLE_NAMES } = useFeatureToggle();
  const myVADisplayEnabled = useToggleValue(
    TOGGLE_NAMES.decisionReviewsMyVADisplay,
  );

  const form = useSelector(state => state.form || {});
  const profile = useSelector(state => selectProfile(state));
  const isScRedesign = redesignActive(form.data);
  // Fix this after Lighthouse sets up the download URL
  const downloadUrl = ''; // SC_PDF_DOWNLOAD_URL;

  const { submission, data = {} } = form; // maxData;

  let privateEvidence;
  let vaEvidence;

  if (!isScRedesign) {
    vaEvidence = getVAEvidence(data);
    privateEvidence = getPrivateEvidence(data);
  } else {
    vaEvidence = getArrayBuilderVAEvidence(data);
    privateEvidence = getArrayBuilderPrivateEvidence(data);
  }

  const otherEvidence = getOtherEvidence(data);
  const noEvidence =
    vaEvidence.length + privateEvidence.length + otherEvidence.length === 0;

  const submitDate = getReadableDateFromTimestamp(
    submission?.timestamp || new Date().toISOString(),
  );

  return (
    <>
      <ConfirmationTitle pageTitle={title995} />
      {myVADisplayEnabled && (
        <SubmissionAlert
          title="Your Supplemental Claim submission is in progress"
          content={
            <p>
              You submitted on <strong>{submitDate}</strong>. It can take a few
              days for us to receive your submission.
            </p>
          }
        />
      )}
      {!myVADisplayEnabled && (
        <ConfirmationAlert alertTitle="Your Supplemental Claim submission is in progress">
          <p>
            You submitted the request on {submitDate}. It can take a few days
            for us to receive your request. We’ll send you a confirmation letter
            once we’ve processed your request.
          </p>
        </ConfirmationAlert>
      )}
      <ConfirmationSummary
        name="Supplemental Claim"
        downloadUrl={downloadUrl}
      />
      <h2 className="vads-u-margin-top--0 vads-u-margin-bottom--2">
        What to expect next
      </h2>
      <p className="vads-u-margin-top--0">
        If we need more information, we’ll contact you to tell you what other
        information you’ll need to submit. We’ll also tell you if we need to
        schedule an exam for you.
      </p>
      <p>
        When we’ve completed your review, we’ll mail you a decision packet with
        the details of our decision.
      </p>
      <p>
        <va-link
          disable-analytics
          href="/decision-reviews/after-you-request-review/"
          text="Learn more about what happens after you request a decision review"
        />
      </p>
      <p>
        <strong>Note:</strong> You can choose to have a hearing at any point in
        the claims process. Contact us online through Ask VA to request a
        hearing.
      </p>
      <p>
        You can check the status of your request in the claims and appeals
        status tool. It may take <strong>7 to 10 days</strong> to appear there.
      </p>
      <p className="vads-u-margin-bottom--3">
        <va-link
          href="/claim-or-appeal-status/"
          text="Check the status of your Supplemental Claim online"
        />
      </p>
      <h2 className="vads-u-margin-top--0 vads-u-margin-bottom--2">
        How to contact us if you have questions
      </h2>
      <p className="vads-u-margin-top--0">
        Call us at <va-telephone contact={CONTACTS.VA_BENEFITS} /> (
        <va-telephone contact={CONTACTS[711]} tty />
        ). We’re here Monday through Friday, 8:00 a.m. to 8:00 p.m. ET.
      </p>
      <p>
        Or you can ask us a question online through Ask VA. Select the category
        and topic for the VA benefits this form is related to.
      </p>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--3">
        <va-link
          href="https://ask.va.gov/"
          text="Contact us online through Ask VA"
        />
      </p>
      <h2 className="vads-u-margin-top--0 vads-u-margin-bottom--4">
        Your Supplemental Claim request
      </h2>
      <ConfirmationPersonalInfo
        appName={APP_NAME}
        dob={profile.dob}
        formData={data}
        hasHomeAndMobilePhone
        userFullName={profile.userFullName}
        veteran={data.veteran}
      />
      <LivingSituation data={data} />
      <ConfirmationIssues data={data} />
      <h3 className={CHAPTER_HEADER_CLASSES}>New and relevant evidence</h3>
      <dl>
        <dt className={LABEL_CLASSES}>{notice5103Content.confirmationLabel}</dt>
        <dd
          className={VALUE_CLASSES}
          data-testid="confirmation-form-5103"
          data-dd-action-name="notice 5103 reviewed"
        >
          Yes, {notice5103Content.label}
        </dd>
        <dt className={LABEL_CLASSES}>{facilityTypeTitle}</dt>
        <dd
          className={VALUE_CLASSES}
          data-testid="confirmation-facility-types"
          data-dd-action-name="facility types selected"
        >
          {facilityTypeList(data.facilityTypes)}
        </dd>
      </dl>
      {noEvidence && (
        <>
          <h3
            data-testid="confirmation-no-evidence-header"
            className={CHAPTER_HEADER_CLASSES}
          >
            {evidenceContent.summaryTitle}
          </h3>
          <div className="no-evidence">
            {evidenceContent.missingEvidenceReviewText}
          </div>
        </>
      )}
      {!isScRedesign && vaEvidence.length ? (
        <VaDetailsDisplay list={vaEvidence} reviewMode showListOnly />
      ) : null}
      {isScRedesign && vaEvidence.length ? (
        <VaDetailsConfirmation list={vaEvidence} />
      ) : null}
      {!isScRedesign && privateEvidence.length ? (
        <PrivateDetailsDisplay
          limitedConsent={data?.limitedConsent}
          limitedConsentResponse={data?.[HAS_PRIVATE_LIMITATION]}
          list={privateEvidence}
          privacyAgreementAccepted={data.privacyAgreementAccepted}
          reviewMode
          showListOnly
        />
      ) : null}
      {isScRedesign && privateEvidence.length ? (
        <PrivateDetailsConfirmation data={data} />
      ) : null}
      {otherEvidence.length ? (
        <EvidenceUploadContent list={otherEvidence} reviewMode showListOnly />
      ) : null}
      <h3 className={CHAPTER_HEADER_CLASSES}>VHA indicator</h3>
      <dl>
        <dt className={LABEL_CLASSES}>{optionForMstTitle}</dt>
        <dd
          className={VALUE_CLASSES}
          data-testid="confirmation-mst-response"
          data-dd-action-name="option for MST"
        >
          {convertBoolResponseToYesNo(data.mstOption)}
        </dd>
        {data.mstOption && (
          <>
            <dt className={LABEL_CLASSES}>{optionIndicatorLabel}</dt>
            <dd
              className={VALUE_CLASSES}
              data-testid="confirmation-mst-option-indicator"
              data-dd-action-name="MST option indicator"
            >
              {optionIndicatorChoices[data.optionIndicator] ?? 'None selected'}
            </dd>
          </>
        )}
      </dl>
      <ConfirmationReturnLink />
    </>
  );
};

export default ConfirmationPage;
