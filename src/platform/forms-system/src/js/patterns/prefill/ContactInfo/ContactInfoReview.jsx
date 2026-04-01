import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { focusElement } from '@department-of-veterans-affairs/platform-utilities/ui';
import { Element } from 'platform/utilities/scroll';
// import { ADDRESS_TYPES } from '@department-of-veterans-affairs/platform-forms/exports';
import { ADDRESS_TYPES } from 'platform/forms/address/helpers';
import {
  renderTelephone,
  contactInfoPropTypes,
  validateEmail,
  validatePhone,
  validateZipcode,
  getReturnState,
  setReturnState,
  clearReturnState,
} from 'platform/forms-system/src/js/utilities/data/profile';

/**
 * Contact info fields shown on the review & submit page
 * @param {Object} data - form data
 * @param {function} editPage - edit page callback
 * @param {ContactInfoContent} content
 * @param {Object} keys - form data keys
 * @returns {Element}
 */
const ContactInfoReview = ({
  data,
  editPage,
  content,
  keys,
  contactInfoPageKey,
}) => {
  const editRef = useRef(null);
  useEffect(
    () => {
      if (getReturnState() === 'true,' && editRef?.current) {
        // focus on edit button _after_ editing and returning
        clearReturnState();
        setTimeout(
          () => focusElement('va-button', {}, editRef.current?.shadowRoot),
          0,
        );
      }
    },
    [editRef],
  );

  const dataWrap = data[keys.wrapper] || {};
  const emailObj = dataWrap[keys.email] || {};
  const homePhoneObj = dataWrap[keys.homePhone] || {};
  const mobilePhoneObj = dataWrap[keys.mobilePhone] || {};
  const addressObj = dataWrap[keys.address] || {};

  const isUS = addressObj.addressType !== ADDRESS_TYPES.international;

  /**
   * Renders value (if it isn't all whitespace) or 'Not provided'
   * @param {String} value - Field value to show
   * @returns {String} - value or 'Not provided'
   */
  const showValueOrNotProvided = value =>
    (value || '').trim() || 'Not provided';

  /**
   * Display field label & data (or error message) on the review & submit page
   * Using an array here to maintain display order
   * Entry: [ Label, Value or error message ]
   * - Label = Name of field (customizable in getContent)
   * - Value or error message = `getValue` function that uses `keys` which is
   *   the data object key that contains the value; e.g. keys.homePhone matches
   *   this data path:
   *   { [wrapperKey]: { [homePhone]: { areaCode: '', phoneNumber: '' } } }
   * If the value function returns an empty string, the row isn't rendered
   * */
  const display = [
    [
      content.country,
      () => {
        // keys.address is undefined if not in `included` option within
        // `profileContactInfoPage`
        if (!keys.address) {
          return ''; // Don't render row
        }
        return showValueOrNotProvided(addressObj.countryName);
      },
    ],
    [
      content.address1,
      () => {
        // keys.address is undefined if not in `included` option within
        // `profileContactInfoPage`
        if (!keys.address) {
          return ''; // Don't render row
        }
        return showValueOrNotProvided(addressObj.addressLine1);
      },
    ],
    [
      content.address2,
      () => {
        // keys.address is undefined if not in `included` option within
        // `profileContactInfoPage`
        if (!keys.address) {
          return ''; // Don't render row
        }
        return addressObj.addressLine2; // No error because it's optional
      },
    ],
    [
      content.address3,
      () => {
        // keys.address is undefined if not in `included` option within
        // `profileContactInfoPage`
        if (!keys.address) {
          return ''; // Don't render row
        }
        return addressObj.addressLine3; // No error because it's optional
      },
    ],
    [
      content.city,
      () => {
        // keys.address is undefined if not in `included` option within
        // `profileContactInfoPage`
        if (!keys.address) {
          return ''; // Don't render row
        }
        return showValueOrNotProvided(addressObj.city);
      },
    ],
    [
      content.state,
      () => {
        // keys.address is undefined if not in `included` option within
        // `profileContactInfoPage`, or don't render this row for non-U.S. addresses
        if (!keys.address || !isUS) {
          return ''; // Don't render row
        }
        return showValueOrNotProvided(addressObj.stateCode);
      },
    ],
    [
      content.province,
      () => {
        // keys.address is undefined if not in `included` option within
        // `profileContactInfoPage` & don't render this row for U.S. addresses
        if (!keys.address && isUS) {
          return ''; // Don't render row
        }
        return addressObj.province; // No error because it's optional
      },
    ],
    [
      content.zipCode,
      () => {
        // keys.address is undefined if not in `included` option within
        // `profileContactInfoPage`, or don't render this row for non-U.S. addresses
        if (!keys.address || !isUS) {
          return ''; // Don't render row
        }
        const { zipCode } = addressObj;
        // Profile should only provide a 5-digit zipcode; evaluate for missing
        // or invalid zipcode
        const errorMsg = validateZipcode(content, zipCode);
        return errorMsg ? showValueOrNotProvided('') : zipCode;
      },
    ],
    [
      content.postal,
      () => {
        // keys.address is undefined if not in `included` option within
        // `profileContactInfoPage` & don't render this row for U.S. addresses
        if (!keys.address && isUS) {
          return ''; // Don't render row
        }
        return addressObj.internationalPostalCode; // No error because it's optional
      },
    ],
    [
      content.email,
      () => {
        // keys.email is undefined if not in `included` option within
        // `profileContactInfoPage`
        if (!keys.email) {
          return ''; // Don't render row
        }
        const errorMsg = validateEmail(content, emailObj.emailAddress);
        return errorMsg ? showValueOrNotProvided('') : emailObj.emailAddress;
      },
    ],
    [
      content.homePhone, // label
      () => {
        // keys.homePhone is undefined if not in `included` option within
        // `profileContactInfoPage`
        if (!keys.homePhone) {
          return ''; // Don't render row
        }
        const errorMsg = validatePhone(content, homePhoneObj);
        return errorMsg
          ? showValueOrNotProvided('')
          : renderTelephone(homePhoneObj); // va-telephone web component
      },
    ],
    [
      content.mobilePhone,
      () => {
        // keys.mobilePhone is undefined if not in `included` option within
        // `profileContactInfoPage`
        if (!keys.mobilePhone) {
          return ''; // Don't render row
        }
        const errorMsg = validatePhone(content, mobilePhoneObj);
        return errorMsg
          ? showValueOrNotProvided('')
          : renderTelephone(mobilePhoneObj); // va-telephone web component
      },
    ],
  ];

  const handlers = {
    onEditPage: () => {
      // maintain state using session storage
      setReturnState('true');
      editPage();
    },
  };

  // Process display list of rows to show on the review & submit page
  const list = display
    .map(([label, getValue], index) => {
      const value = getValue() || '';
      // don't render anything if the value is falsy (getValue will always
      // return a string)
      return value ? (
        <div key={label + index} className="review-row">
          <dt>{label}</dt>
          <dd className="dd-privacy-hidden" data-dd-action-name={label}>
            {value}
          </dd>
        </div>
      ) : null;
    })
    .filter(Boolean);

  return (
    <div className="form-review-panel-page">
      <Element name={`${contactInfoPageKey}ScrollElement`} />
      <div className="form-review-panel-page-header-row">
        <h3 className="form-review-panel-page-header vads-u-font-size--h5 vads-u-margin--0">
          {content.title}
        </h3>
        <va-button
          ref={editRef}
          secondary
          id={`${contactInfoPageKey}Edit`}
          class="edit-page vads-u-justify-content--flex-end"
          onClick={handlers.onEditPage}
          label={content.editLabel}
          text={content.edit}
          uswds
        />
      </div>
      {list.length ? <dl className="review">{list}</dl> : null}
    </div>
  );
};

ContactInfoReview.propTypes = {
  contactInfoPageKey: contactInfoPropTypes.contactInfoPageKey,
  content: contactInfoPropTypes.content,
  data: contactInfoPropTypes.data,
  editPage: PropTypes.func,
  keys: contactInfoPropTypes.keys,
};

export default ContactInfoReview;
