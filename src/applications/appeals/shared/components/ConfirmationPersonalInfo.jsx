import React from 'react';
import PropTypes from 'prop-types';
import { ConfirmationVeteranID } from './ConfirmationVeteranID';
import { ConfirmationVeteranContact } from './ConfirmationVeteranContact';
import { convertBoolResponseToYesNo } from '../utils/form-data-display';
import { APP_NAME as SC_NAME } from '../../995/constants';
import {
  CHAPTER_HEADER_CLASSES,
  LABEL_CLASSES,
  VALUE_CLASSES,
} from '../constants';

const ConfirmationPersonalInfo = data => {
  const {
    appName = '',
    dob = '',
    homeless = null,
    hasHomeAndMobilePhone = false,
    userFullName = {},
    veteran = {},
  } = data;
  const { vaFileLastFour = '' } = veteran;

  if (!data) {
    return null;
  }

  return (
    <>
      <h3 className={CHAPTER_HEADER_CLASSES}>Personal information</h3>
      <dl className="vads-u-margin-top--0">
        <ConfirmationVeteranID
          dob={dob}
          userFullName={userFullName}
          vaFileLastFour={vaFileLastFour}
        />
        {appName !== SC_NAME && (
          <>
            <dt className={LABEL_CLASSES}>
              Are you experiencing homelessness?
            </dt>
            <dd className={VALUE_CLASSES} data-dd-action-name="homeless">
              {convertBoolResponseToYesNo(homeless)}
            </dd>
          </>
        )}
        <ConfirmationVeteranContact
          veteran={veteran}
          hasHomeAndMobilePhone={hasHomeAndMobilePhone}
        />
      </dl>
    </>
  );
};

ConfirmationPersonalInfo.propTypes = {
  dob: PropTypes.string,
  hasHomeAndMobilePhone: PropTypes.bool,
  hasLivingSituationChapter: PropTypes.bool,
  homeless: PropTypes.bool,
  userFullName: PropTypes.shape({}),
  veteran: PropTypes.shape({
    vaFileLastFour: PropTypes.string,
    address: PropTypes.shape({}),
    email: PropTypes.string,
    phone: PropTypes.shape({}),
    homePhone: PropTypes.shape({}),
    mobilephone: PropTypes.shape({}),
  }),
};

export default ConfirmationPersonalInfo;
