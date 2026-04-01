import { useCallback, useRef, useState } from 'react';
import {
  createFormStateFromQuery,
  validateForm,
} from '../reducers/searchQuery';
import { LocationType } from '../constants';

/** Manages draft form state before Redux commit (dual-state pattern). */
const useSearchFormState = currentQuery => {
  const [selectedServiceType, setSelectedServiceType] = useState(null);

  const [draftFormState, setDraftFormState] = useState(() =>
    createFormStateFromQuery(currentQuery),
  );

  const submitErrorsRef = useRef({});

  const setSubmitErrors = useCallback(errors => {
    submitErrorsRef.current = errors;
  }, []);

  const clearSubmitErrors = useCallback(() => {
    submitErrorsRef.current = {};
  }, []);

  const updateDraftState = useCallback(updater => {
    setDraftFormState(prev => {
      const updates =
        typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      const flags = validateForm(prev, updates);

      const submitErrors = submitErrorsRef.current;
      if (submitErrors.locationChanged && !updates.searchString?.length) {
        flags.locationChanged = true;
      }
      if (submitErrors.facilityTypeChanged && !updates.facilityType?.length) {
        flags.facilityTypeChanged = true;
      }
      if (
        submitErrors.serviceTypeChanged &&
        updates.facilityType === LocationType.CC_PROVIDER &&
        !updates.serviceType?.length
      ) {
        flags.serviceTypeChanged = true;
      }

      // Safe to mutate ref inside updater: deletes are idempotent, so
      // React StrictMode double-invocation in dev causes no issues.
      if (updates.searchString?.length > 0) delete submitErrors.locationChanged;
      if (updates.facilityType?.length > 0)
        delete submitErrors.facilityTypeChanged;
      if (updates.serviceType?.length > 0)
        delete submitErrors.serviceTypeChanged;
      // Clear service type error when facility type changes — the error
      // should only reappear on the next explicit submit.
      if (prev.facilityType !== updates.facilityType) {
        delete submitErrors.serviceTypeChanged;
      }

      return { ...updates, ...flags };
    });
  }, []);

  const handleFacilityTypeChange = useCallback(
    e => {
      updateDraftState(prev => ({
        ...prev,
        facilityType: e.target.value,
        serviceType: null,
        vamcServiceDisplay: null,
      }));
    },
    [updateDraftState],
  );

  const handleServiceTypeChange = useCallback(
    ({ target, selectedItem }) => {
      setSelectedServiceType(selectedItem);
      const option = target.value.trim();
      const serviceType = option === 'All' ? null : option;
      updateDraftState({ serviceType });
    },
    [updateDraftState],
  );

  return {
    draftFormState,
    setDraftFormState,
    updateDraftState,
    handleFacilityTypeChange,
    handleServiceTypeChange,
    selectedServiceType,
    setSelectedServiceType,
    setSubmitErrors,
    clearSubmitErrors,
  };
};

export default useSearchFormState;
