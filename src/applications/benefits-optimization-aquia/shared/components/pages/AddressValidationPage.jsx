import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from 'platform/forms-system/src/js/actions';
import FormNavButtons from 'platform/forms-system/src/js/components/FormNavButtons';
import set from 'platform/utilities/data/set';
import get from 'platform/utilities/data/get';
import { fetchSuggestedAddress } from '@bio-aquia/shared/utils/validators/address-validation';
import AddressConfirmation from './AddressConfirmation';
import SuggestedAddressRadio from './SuggestedAddressRadio';
import { SUGGESTED_VALUE, USER_ENTERED_VALUE } from './constants';

/**
 * Higher-order function that returns a CustomPage component for address
 * validation. Each form passes a path to the form-data address field and
 * a page title so this USPS confirmation flow can be reused across BO Aquia
 * forms.
 *
 * Runtime behavior:
 * 1. Read the user-entered address from form data and call USPS validation.
 * 2. If USPS returns confidence below 100, show two radio options.
 * 3. Otherwise show a confirmation alert for exact match or fallback warning.
 * 4. Persist the selected address back to form data before Continue.
 *
 * @param {Object} config
 * @param {string} config.addressPath - Dot-notation path to the address
 *   object inside formData (e.g. "employerInformation.employerAddress")
 * @param {string} [config.title="Confirm your address"] - Page heading
 * @returns {React.FC} A CustomPage component
 */
export function createAddressValidationPage({
  addressPath,
  title = 'Confirm your address',
}) {
  function AddressValidationCustomPage({
    goBack,
    goForward,
    contentBeforeButtons,
    contentAfterButtons,
  }) {
    const dispatch = useDispatch();
    const formData = useSelector(state => state.form?.data);
    // Read only the target address so this effect does not rerun on unrelated
    // form changes elsewhere in the state tree.
    const userAddressFromStore = useSelector(state =>
      get(addressPath, state.form?.data),
    );

    const [isLoading, setIsLoading] = useState(true);
    const hasResolvedValidationRef = useRef(false);
    const [userAddress, setUserAddress] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [suggestedAddress, setSuggestedAddress] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [confidenceScore, setConfidenceScore] = useState(null);

    // Validate once per page mount and stop state updates after unmount.
    useEffect(
      () => {
        if (hasResolvedValidationRef.current) {
          return undefined;
        }

        let isActive = true;
        hasResolvedValidationRef.current = true;

        const address = userAddressFromStore || {};
        // Default selection is always the user-entered address so users must
        // explicitly choose the USPS suggestion when shown.
        setUserAddress(address);
        setSelectedAddress(address);

        const validate = async () => {
          const result = await fetchSuggestedAddress(address);

          if (!isActive) {
            return;
          }

          setConfidenceScore(result.confidenceScore ?? null);

          if (result.suggestedAddress && result.showSuggestions) {
            setSuggestedAddress(result.suggestedAddress);
            setShowSuggestions(true);
          } else {
            // For 100 confidence or API fallback, we show confirmation and let
            // users continue manually instead of auto-advancing.
            setShowSuggestions(false);
          }

          setIsLoading(false);
        };

        validate();

        return () => {
          isActive = false;
        };
      },
      [userAddressFromStore],
    );

    // Maintain screen reader focus after loading resolves
    useEffect(
      () => {
        if (!isLoading) {
          const progressBar = document.getElementById('nav-form-header');
          if (progressBar) {
            progressBar.setAttribute('tabindex', '-1');
            progressBar.focus();
          }
        }
      },
      [isLoading],
    );

    const onChangeSelectedAddress = event => {
      const selectedValue = event?.detail?.value;
      const selected =
        selectedValue === SUGGESTED_VALUE ? suggestedAddress : userAddress;

      const isKnownSelection =
        selectedValue === USER_ENTERED_VALUE ||
        selectedValue === SUGGESTED_VALUE;

      if (!selected || !isKnownSelection) {
        return;
      }

      setSelectedAddress(selected);

      // Keep form state in sync with the selection shown on this page.
      const updated = set(addressPath, selected, formData);
      dispatch(setData(updated));
    };

    const handleContinue = () => {
      // Preserve current formData behavior used by FormNavButtons consumers.
      goForward(formData);
    };

    if (isLoading) {
      return (
        <va-loading-indicator
          label="Validating address"
          message="Checking your address with the U.S. Postal Service..."
          set-focus
        />
      );
    }

    return showSuggestions ? (
      <div>
        <SuggestedAddressRadio
          title={title}
          userAddress={userAddress}
          // Radio tiles are driven by stable tokens instead of object equality.
          selectedAddressValue={
            selectedAddress === suggestedAddress
              ? SUGGESTED_VALUE
              : USER_ENTERED_VALUE
          }
          suggestedAddress={suggestedAddress}
          onChangeSelectedAddress={onChangeSelectedAddress}
        />
        {contentBeforeButtons}
        <FormNavButtons goBack={goBack} goForward={handleContinue} />
        {contentAfterButtons}
      </div>
    ) : (
      <div>
        <AddressConfirmation
          subHeader={title}
          userAddress={userAddress}
          isExactMatch={confidenceScore === 100}
        />
        {contentBeforeButtons}
        <FormNavButtons goBack={goBack} goForward={handleContinue} />
        {contentAfterButtons}
      </div>
    );
  }

  AddressValidationCustomPage.displayName = `AddressValidation(${addressPath})`;

  AddressValidationCustomPage.propTypes = {
    goBack: PropTypes.func.isRequired,
    goForward: PropTypes.func.isRequired,
    contentAfterButtons: PropTypes.node,
    contentBeforeButtons: PropTypes.node,
  };

  AddressValidationCustomPage.defaultProps = {
    contentBeforeButtons: null,
    contentAfterButtons: null,
  };

  return AddressValidationCustomPage;
}
