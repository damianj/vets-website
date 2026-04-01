import React from 'react';
import PropTypes from 'prop-types';
import { reviewEntry } from 'platform/forms-system/src/js/components/ConfirmationView/ChapterSectionCollection';
import { formatAddress } from 'platform/forms/address/helpers';

const formatPhone = phone => {
  if (!phone?.areaCode || !phone?.phoneNumber) return null;
  const { areaCode, extension, phoneNumber } = phone;
  const formatted = `(${areaCode}) ${phoneNumber.slice(
    0,
    3,
  )}-${phoneNumber.slice(3)}`;
  return extension ? `${formatted} x${extension}` : formatted;
};

const formatAddressLines = address => {
  if (!address?.addressLine1) return null;
  const { street, cityStateZip, country } = formatAddress(address);
  return [street, cityStateZip, country].filter(Boolean);
};

/**
 * Creates a confirmation-page field component for the contact information
 * prefill page. Uses the same `keys` object the factory builds so field
 * presence is driven by the `included` option passed to
 * `profileContactInfoPages`.
 *
 * Intended to be attached as `ui:confirmationField` on the main page returned
 * by `profileContactInfoPages` so that ChapterSectionCollection can render it
 * on the post-submit confirmation page.
 *
 * @param {Object} options
 * @param {Object} options.keys - keys object from the profileContactInfoPages factory
 * @param {'mobile'|'home'} [options.phonePreference='mobile'] - which phone number
 *   to prefer when both are present. Defaults to mobile. The other is used as
 *   a fallback if the preferred one is unavailable.
 * @returns {React.FC}
 */
export const createContactInfoConfirmationField = ({
  keys = {},
  phonePreference = 'mobile',
} = {}) => {
  const ContactInfoConfirmationField = ({ formData }) => {
    const dataWrap = formData?.[keys.wrapper] || {};

    const address = keys.address
      ? formatAddressLines(dataWrap[keys.address])
      : null;

    const mobilePhone = keys.mobilePhone
      ? formatPhone(dataWrap[keys.mobilePhone])
      : null;
    const homePhone = keys.homePhone
      ? formatPhone(dataWrap[keys.homePhone])
      : null;
    const phone =
      phonePreference === 'home'
        ? homePhone || mobilePhone
        : mobilePhone || homePhone;

    const email = keys.email ? dataWrap[keys.email]?.emailAddress : null;

    return (
      <>
        {address &&
          reviewEntry(null, 'mailing-address', {}, 'Mailing address', address)}
        {phone && reviewEntry(null, 'phone', {}, 'Phone', phone)}
        {email && reviewEntry(null, 'email', {}, 'Email address', email)}
      </>
    );
  };

  ContactInfoConfirmationField.propTypes = {
    formData: PropTypes.object,
  };

  return ContactInfoConfirmationField;
};
