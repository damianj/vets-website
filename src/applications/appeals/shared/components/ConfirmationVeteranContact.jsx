import React from 'react';
import PropTypes from 'prop-types';
import { getPhoneString } from '~/platform/forms-system/src/js/utilities/data/profile';
import { LABEL_CLASSES, VALUE_CLASSES } from '../constants';

export const ConfirmationVeteranContact = ({
  veteran,
  hasHomeAndMobilePhone,
}) => {
  const {
    address = {},
    email = '',
    homePhone = {},
    mobilePhone = {},
  } = veteran;
  // Only 995 has both home & mobile phone (currently)
  const phone = hasHomeAndMobilePhone ? mobilePhone : veteran.phone;
  const {
    addressLine1,
    addressLine2,
    addressLine3,
    city,
    countryName,
    internationalPostalCode,
    province,
    stateCode,
    zipCode,
  } = address;

  return (
    <>
      {hasHomeAndMobilePhone && (
        <>
          <dt className={LABEL_CLASSES}>Home phone number</dt>
          <dd className={VALUE_CLASSES} data-dd-action-name="home phone number">
            <va-telephone
              contact={getPhoneString(homePhone)}
              country-code={
                homePhone?.isInternational ? homePhone?.countryCode : undefined
              }
              extension={homePhone?.extension}
              not-clickable
            />
          </dd>
        </>
      )}
      <>
        <dt className={LABEL_CLASSES}>Mobile phone number</dt>
        <dd className={VALUE_CLASSES} data-dd-action-name="mobile phone number">
          <va-telephone
            contact={getPhoneString(phone)}
            country-code={
              phone?.isInternational ? phone?.countryCode : undefined
            }
            extension={phone?.extension}
            not-clickable
          />
        </dd>
      </>
      <>
        <dt className={LABEL_CLASSES}>Email address</dt>
        <dd className={VALUE_CLASSES} data-dd-action-name="email address">
          {email}
        </dd>
      </>
      <>
        <dt className={LABEL_CLASSES}>Mailing address</dt>
        <dd className={VALUE_CLASSES} data-dd-action-name="mailing address">
          {addressLine1 && (
            <>
              <span>{addressLine1}</span>
            </>
          )}
          {addressLine2 && (
            <>
              <br />
              <span>{addressLine2}</span>
            </>
          )}
          {addressLine3 && (
            <>
              <br />
              <span>{addressLine3}</span>
            </>
          )}
          {city &&
            (stateCode || province) && (
              <>
                <br />
                <span>
                  {city}, {stateCode || province || ''}
                </span>
              </>
            )}
          {(zipCode || internationalPostalCode) && (
            <>
              <br />
              <span>{zipCode || internationalPostalCode}</span>
            </>
          )}
          {countryName && (
            <>
              <br />
              <span>{countryName}</span>
            </>
          )}
        </dd>
      </>
    </>
  );
};

ConfirmationVeteranContact.propTypes = {
  hasHomeAndMobilePhone: PropTypes.bool,
  veteran: PropTypes.shape({
    vaFileLastFour: PropTypes.string,
    address: PropTypes.shape({
      addressLine1: PropTypes.string,
      addressLine2: PropTypes.string,
      addressLine3: PropTypes.string,
      addressType: PropTypes.string,
      city: PropTypes.string,
      countryName: PropTypes.string,
      internationalPostalCode: PropTypes.string,
      province: PropTypes.string,
      stateCode: PropTypes.string,
      zipCode: PropTypes.string,
    }),
    email: PropTypes.string,
    phone: PropTypes.shape({
      countryCode: PropTypes.string,
      areaCode: PropTypes.string,
      phoneNumber: PropTypes.string,
      phoneNumberExt: PropTypes.string,
    }),
    homePhone: PropTypes.shape({
      countryCode: PropTypes.string,
      areaCode: PropTypes.string,
      phoneNumber: PropTypes.string,
      phoneNumberExt: PropTypes.string,
    }),
    mobilePhone: PropTypes.shape({
      countryCode: PropTypes.string,
      areaCode: PropTypes.string,
      phoneNumber: PropTypes.string,
      phoneNumberExt: PropTypes.string,
    }),
  }),
};
