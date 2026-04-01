import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getFormData } from 'platform/forms-system/src/js/state/selectors';
import { setData } from 'platform/forms-system/src/js/actions';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import { autoResolveArtifacts } from './conflictDetection';
import { VETERAN_INFO_FIELDS, MILITARY_HISTORY_FIELDS } from '../fieldMapping';

const ALL_FIELDS = [...VETERAN_INFO_FIELDS, ...MILITARY_HISTORY_FIELDS];

// Re-runs autoResolveArtifacts whenever an overlapping form field changes.
// This handles the case where a document is uploaded (and KVP downloaded)
// before the user has filled in the corresponding 534EZ fields — auto-resolve
// at download time would have skipped those null form fields, so we need to
// re-run it as the user fills them in later.
//
// The overlapping fields are derived directly from ALL_FIELDS (fieldMapping.js)
// so this hook stays in sync automatically when the field mapping changes.
export const useAutoResolveArtifacts = () => {
  const dispatch = useDispatch();
  const formData = useSelector(getFormData) || {};
  const caveEnabled = useSelector(
    state =>
      state.featureToggles?.[FEATURE_FLAG_NAMES.survivorsBenefitsIdp] ?? false,
  );

  // Serialize all overlapping form values into a single stable string.
  // This avoids listing every field path manually and handles object fields
  // (e.g. veteranFullName) with value equality rather than reference equality.
  const overlappingValues = JSON.stringify(
    ALL_FIELDS.map(f => f.getFormValue(formData)),
  );

  useEffect(
    () => {
      if (!caveEnabled) return;

      const files = formData.files ?? [];
      if (!files.some(f => f.idpArtifacts)) return;

      const resolved = autoResolveArtifacts(formData, files, ALL_FIELDS);
      if (resolved !== files) {
        dispatch(setData({ ...formData, files: resolved }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overlappingValues, caveEnabled],
  );
};
