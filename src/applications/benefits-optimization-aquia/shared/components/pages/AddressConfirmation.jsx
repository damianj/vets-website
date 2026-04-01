import React from 'react';
import PropTypes from 'prop-types';
import { countries } from 'platform/forms/address';

// Render only populated address lines to avoid empty spacing in the block.
const renderAddressLine = content =>
  content ? (
    <>
      {content}
      <br />
    </>
  ) : null;

const addressPropType = PropTypes.shape({
  street: PropTypes.string,
  street2: PropTypes.string,
  city: PropTypes.string,
  state: PropTypes.string,
  postalCode: PropTypes.string,
  country: PropTypes.string,
});

/**
 * Displays the no-suggestion branch of USPS validation.
 *
 * If confidence is 100, show a success exact-match message.
 * Otherwise show a warning and explain why USPS may not confirm the address.
 * In both cases, the user-entered address is shown and the user manually
 * chooses whether to continue or go back.
 *
 * @param {Object} props
 * @param {string} props.subHeader - Section heading displayed above the alert
 * @param {Object} props.userAddress - The address the user entered
 * @param {boolean} props.isExactMatch - Whether USPS returned an exact match
 */
export default function AddressConfirmation({
  subHeader,
  userAddress,
  isExactMatch,
}) {
  const cityStatePostal = [
    userAddress?.city,
    userAddress?.city && (userAddress?.state || userAddress?.postalCode)
      ? ', '
      : ' ',
    userAddress?.state,
    userAddress?.state && userAddress?.postalCode ? ' ' : '',
    userAddress?.postalCode,
  ]
    .join('')
    .trim();

  const getCountry = countryCode =>
    countries.find(c => c.value === countryCode)?.label || countryCode;

  return (
    <>
      <h3>{subHeader}</h3>
      {isExactMatch ? (
        <va-alert
          close-btn-aria-label="Close notification"
          status="success"
          visible
        >
          <h3 slot="headline">Your address was an exact match</h3>
          <p className="vads-u-margin-y--0">
            We found an exact match to the address you entered with the U.S.
            Postal Service.
          </p>
        </va-alert>
      ) : (
        <va-alert
          close-btn-aria-label="Close notification"
          status="warning"
          visible
        >
          <h3 slot="headline">Check the address you entered</h3>
          <p className="vads-u-margin-y--0">
            We can't confirm the address you entered with the U.S. Postal
            Service. Check the address before continuing.
          </p>
        </va-alert>
      )}
      <p style={{ marginTop: '1em' }}>You entered:</p>
      <div className="blue-bar-block">
        <p>
          {renderAddressLine(userAddress?.street)}
          {renderAddressLine(userAddress?.street2)}
          {cityStatePostal && renderAddressLine(cityStatePostal)}
          {userAddress?.country !== 'USA' &&
            renderAddressLine(getCountry(userAddress?.country))}
        </p>
      </div>
      <p>
        If the address is correct, you can continue. If you need to edit the
        address, you can go back.
      </p>
      {!isExactMatch && (
        <va-additional-info trigger="Why we can't confirm the address you entered">
          <p>
            The address you entered may not be in the U.S. Postal Service's
            system. Or, you may have entered an error or other incorrect
            information.
          </p>
        </va-additional-info>
      )}
    </>
  );
}

AddressConfirmation.propTypes = {
  subHeader: PropTypes.string.isRequired,
  userAddress: addressPropType.isRequired,
  isExactMatch: PropTypes.bool,
};

AddressConfirmation.defaultProps = {
  isExactMatch: false,
};
