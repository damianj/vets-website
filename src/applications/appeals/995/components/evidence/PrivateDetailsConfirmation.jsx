import React from 'react';
import PropTypes from 'prop-types';
import { content as authContent } from '../4142/Authorization';
import { confirmationText } from '../../content/evidence/private';
import { detailsQuestion as limitedConsentDetailsQuestion } from '../../pages/limitedConsentDetails';
import { promptQuestion as limitedConsentPromptQuestion } from '../../pages/limitedConsentPrompt';
import { HAS_PRIVATE_LIMITATION } from '../../constants';
import {
  LABEL_CLASSES,
  SECTION_HEADER_CLASSES,
  VALUE_CLASSES,
  VALUE_CLASSES_NO_MB,
} from '../../../shared/constants';
import {
  getFormattedIssues,
  getSelectedIssues,
  getTreatmentRange,
  renderAddress,
} from '../../utils/evidence';

export const PrivateDetailsConfirmation = ({ data }) => {
  if (!data) {
    return null;
  }

  const { limitedConsent, privateEvidence } = data;
  const lcPrompt = data[HAS_PRIVATE_LIMITATION];

  return (
    <>
      <h4 className={SECTION_HEADER_CLASSES}>{confirmationText.authLCTitle}</h4>
      <dl>
        <dt className={LABEL_CLASSES}>{authContent.title}</dt>
        <dd className={VALUE_CLASSES}>
          {confirmationText.authAcknowledgement}
        </dd>
        <dt className={LABEL_CLASSES}>{limitedConsentPromptQuestion}</dt>
        <dd className={VALUE_CLASSES}>{lcPrompt ? 'Yes' : 'No'}</dd>
        {lcPrompt && (
          <>
            <dt className={LABEL_CLASSES}>{limitedConsentDetailsQuestion}</dt>
            <dd className={VALUE_CLASSES}>{limitedConsent}</dd>
          </>
        )}
      </dl>
      <h4 className={SECTION_HEADER_CLASSES}>
        {confirmationText.privateTitle}
      </h4>
      {privateEvidence.map((facility, index) => {
        const {
          address,
          privateTreatmentLocation,
          treatmentEnd,
          treatmentStart,
          issues,
        } = facility || {};

        const selectedIssues = getSelectedIssues(issues);
        const formattedIssues = getFormattedIssues(selectedIssues);

        return (
          <div
            key={privateTreatmentLocation + index}
            className={`vads-u-margin-bottom--2${
              index === privateEvidence.length - 1
                ? ' vads-u-margin-bottom--3'
                : ''
            }`}
          >
            <h5 className="vads-u-margin-top--2 vads-u-font-family--sans vads-u-font-size--md">
              {privateTreatmentLocation}
            </h5>
            {renderAddress(address, true)}
            <p className={VALUE_CLASSES_NO_MB}>{formattedIssues}</p>
            <p className="vads-u-margin-top--0 vads-u-margin-bottom--3">
              {getTreatmentRange(treatmentStart, treatmentEnd)}
            </p>
          </div>
        );
      })}
    </>
  );
};

PrivateDetailsConfirmation.propTypes = {
  data: PropTypes.shape({
    privacyAgreementAccepted: PropTypes.bool,
    limitedConsent: PropTypes.string,
    lcPrompt: PropTypes.string,
    privateEvidence: PropTypes.arrayOf(
      PropTypes.shape({
        address: {
          'view:militaryBaseDescription': PropTypes.string,
          city: PropTypes.string,
          country: PropTypes.string,
          postalCode: PropTypes.string,
          state: PropTypes.string,
          street: PropTypes.string,
          street2: PropTypes.string,
        },
        issues: PropTypes.arrayOf(PropTypes.string),
        privateTreatmentLocation: PropTypes.string,
        treatmentEnd: PropTypes.string,
        treatmentStart: PropTypes.string,
      }),
    ),
  }),
};
