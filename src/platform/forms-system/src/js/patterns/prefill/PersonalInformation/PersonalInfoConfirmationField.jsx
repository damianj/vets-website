import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { format, isValid } from 'date-fns';
import { selectProfile } from 'platform/user/selectors';
import { reviewEntry } from 'platform/forms-system/src/js/components/ConfirmationView/ChapterSectionCollection';
import SSNWidget from 'platform/forms-system/src/js/review/SSNWidget';
import VAFileNumberWidget from 'platform/forms-system/src/js/review/VAFileNumberWidget';
import { adaptFormData } from './adapter';
import {
  parseDateToDateObj,
  FORMAT_READABLE_DATE_FNS,
  FORMAT_YMD_DATE_FNS,
} from './utils';
import { defaultConfig } from './PersonalInformationReview';

/**
 * Creates a confirmation-page field component for the personal information
 * prefill page. Reads name and date of birth from the Redux profile selector
 * and uses the dataAdapter to locate SSN / VA file number in formData.
 *
 * Intended to be attached as `ui:confirmationField` on the page returned by
 * `profilePersonalInfoPage` so that ChapterSectionCollection can render it on
 * the post-submit confirmation page.
 *
 * @param {Object} options
 * @param {import('./PersonalInformationReview').PersonalInformationConfig} options.config - merged field-visibility config
 * @param {import('./adapter').DataAdapter} options.dataAdapter
 * @returns {React.FC}
 */
export const createPersonalInfoConfirmationField = ({
  config = {},
  dataAdapter = {},
} = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  const PersonalInfoConfirmationField = ({ formData }) => {
    const profile = useSelector(selectProfile);
    const { ssn, vaFileLastFour } = adaptFormData(formData, dataAdapter);
    const { first, middle, last } = profile.userFullName || {};
    const { dob } = profile;
    const dobDateObj = parseDateToDateObj(dob || null, FORMAT_YMD_DATE_FNS);
    const fullName = [first, middle, last].filter(Boolean).join(' ') || null;

    return (
      <>
        {finalConfig.name?.show &&
          reviewEntry(null, 'name', {}, 'Name', fullName)}
        {finalConfig.dateOfBirth?.show &&
          isValid(dobDateObj) &&
          reviewEntry(
            null,
            'dob',
            {},
            'Date of birth',
            format(dobDateObj, FORMAT_READABLE_DATE_FNS),
          )}
        {finalConfig.ssn?.show &&
          ssn &&
          reviewEntry(
            null,
            'ssn',
            {},
            'Last 4 digits of Social Security number',
            <SSNWidget value={ssn} />,
          )}
        {finalConfig.vaFileNumber?.show &&
          vaFileLastFour &&
          reviewEntry(
            null,
            'vaFileNumber',
            {},
            'Last 4 digits of VA file number',
            <VAFileNumberWidget value={vaFileLastFour} />,
          )}
      </>
    );
  };

  PersonalInfoConfirmationField.propTypes = {
    formData: PropTypes.object,
  };

  return PersonalInfoConfirmationField;
};
