import { useEffect, useRef } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { setData } from 'platform/forms-system/src/js/actions';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import { processDocumentWithAutoResolve } from './workflow';

// Purely reactive hook that lives in SurvivorsBenefitsApp.
// Watches formData.files and triggers CAVE processing for any file that has an
// idpDocumentId and isn't already in-flight.
export const useCaveProcessingManager = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const inFlightRef = useRef(new Set());

  const caveEnabled = useSelector(
    state =>
      state.featureToggles?.[FEATURE_FLAG_NAMES.survivorsBenefitsIdp] ?? false,
  );
  const formDataFiles = useSelector(state => state.form?.data?.files);

  useEffect(
    () => {
      if (!caveEnabled) return;

      const updateFile = (trackingKey, updates) => {
        const state = store.getState().form.data ?? {};
        const nextFiles = (state.files ?? []).map(
          f => (f.idpTrackingKey === trackingKey ? { ...f, ...updates } : f),
        );
        dispatch(setData({ ...state, files: nextFiles }));
      };

      const processFile = fileEntry => {
        const { idpDocumentId, idpTrackingKey } = fileEntry;
        inFlightRef.current.add(idpTrackingKey);

        const currentFormData = store.getState().form.data ?? {};
        processDocumentWithAutoResolve(
          { id: idpDocumentId },
          currentFormData,
          currentFormData.files ?? [],
        )
          .then(sections => {
            updateFile(idpTrackingKey, {
              idpUploadStatus: 'success',
              idpArtifacts: sections,
            });
            inFlightRef.current.delete(idpTrackingKey);
          })
          .catch(error => {
            updateFile(idpTrackingKey, {
              idpUploadStatus: 'error',
              idpUploadError: error?.message,
            });
            inFlightRef.current.delete(idpTrackingKey);
          });
      };

      (formDataFiles ?? []).forEach(fileEntry => {
        const { idpUploadStatus, idpDocumentId, idpTrackingKey } =
          fileEntry || {};
        if (
          (idpUploadStatus === 'pending' || idpUploadStatus === 'processing') &&
          idpDocumentId &&
          idpTrackingKey &&
          !inFlightRef.current.has(idpTrackingKey)
        ) {
          processFile(fileEntry);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [caveEnabled, formDataFiles],
  );
};
