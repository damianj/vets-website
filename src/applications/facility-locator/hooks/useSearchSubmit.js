import { useCallback, useRef } from 'react';
import recordEvent from 'platform/monitoring/record-event';
import { focusElement } from 'platform/utilities/ui';
import { LocationType } from '../constants';

/** Handles form validation and submission. */
const useSearchSubmit = ({
  draftFormState,
  setDraftFormState,
  selectedServiceType,
  currentQuery,
  onChange,
  onSubmit,
  isMobile,
  mobileMapUpdateEnabled,
  selectMobileMapPin,
  setSearchInitiated,
  setSubmitErrors,
  clearSubmitErrors,
}) => {
  // Track last submitted query to prevent duplicate submissions
  const lastQueryRef = useRef(null);

  const handleSubmit = useCallback(
    e => {
      e.preventDefault();

      const isSameQuery =
        lastQueryRef.current &&
        draftFormState.facilityType === lastQueryRef.current.facilityType &&
        draftFormState.serviceType === lastQueryRef.current.serviceType &&
        draftFormState.searchString === lastQueryRef.current.searchString &&
        currentQuery.zoomLevel === lastQueryRef.current.zoomLevel;

      if (isSameQuery) {
        return;
      }

      // Validate all fields simultaneously so every error is visible at once.
      // Focus priority matches visual layout top-to-bottom:
      // location → facilityType → serviceType
      const errors = {};
      let firstErrorFocus = null;

      if (!draftFormState.searchString) {
        errors.locationChanged = true;
        firstErrorFocus = firstErrorFocus || 'location';
      }

      if (!draftFormState.facilityType) {
        errors.facilityTypeChanged = true;
        firstErrorFocus = firstErrorFocus || 'facilityType';
      } else if (
        draftFormState.facilityType === LocationType.CC_PROVIDER &&
        (!draftFormState.serviceType || !selectedServiceType)
      ) {
        errors.serviceTypeChanged = true;
        firstErrorFocus = firstErrorFocus || 'serviceType';
      }

      if (Object.keys(errors).length > 0) {
        setSubmitErrors({ ...errors });
        setDraftFormState(prev => ({
          ...prev,
          ...errors,
          isValid: false,
        }));
        setTimeout(() => {
          if (firstErrorFocus === 'facilityType') {
            const vaSelect = document.querySelector('#facility-type-dropdown');
            if (vaSelect?.shadowRoot) {
              const internalSelect = vaSelect.shadowRoot.querySelector(
                'select',
              );
              if (internalSelect) {
                internalSelect.focus();
              }
            }
          } else if (firstErrorFocus === 'serviceType') {
            focusElement('#service-type-ahead-input');
          } else {
            focusElement('#street-city-state-zip');
          }
        }, 0);
        return;
      }

      clearSubmitErrors();

      lastQueryRef.current = {
        facilityType: draftFormState.facilityType,
        serviceType: draftFormState.serviceType,
        searchString: draftFormState.searchString,
        zoomLevel: currentQuery.zoomLevel,
      };

      onChange({
        facilityType: draftFormState.facilityType,
        serviceType: draftFormState.serviceType,
        searchString: draftFormState.searchString,
        vamcServiceDisplay: draftFormState.vamcServiceDisplay,
      });

      // Record analytics with specialty display name for CC providers
      let analyticsServiceType = draftFormState.serviceType;
      const specialtyDisplayName =
        currentQuery.specialties?.[draftFormState.serviceType];

      if (
        draftFormState.facilityType === LocationType.CC_PROVIDER &&
        currentQuery.specialties &&
        specialtyDisplayName
      ) {
        analyticsServiceType = specialtyDisplayName;
      }

      recordEvent({
        event: 'fl-search',
        'fl-search-fac-type': draftFormState.facilityType,
        'fl-search-svc-type': analyticsServiceType,
        'fl-current-zoom-depth': currentQuery.zoomLevel,
      });

      if (isMobile && mobileMapUpdateEnabled) {
        selectMobileMapPin(null);
      }

      setSearchInitiated(true);
      onSubmit({
        facilityType: draftFormState.facilityType,
        serviceType: draftFormState.serviceType,
        searchString: draftFormState.searchString,
        vamcServiceDisplay: draftFormState.vamcServiceDisplay,
      });
    },
    [
      draftFormState,
      setDraftFormState,
      selectedServiceType,
      currentQuery.zoomLevel,
      currentQuery.specialties,
      onChange,
      onSubmit,
      isMobile,
      mobileMapUpdateEnabled,
      selectMobileMapPin,
      setSearchInitiated,
      setSubmitErrors,
      clearSubmitErrors,
    ],
  );

  return { handleSubmit };
};

export default useSearchSubmit;
