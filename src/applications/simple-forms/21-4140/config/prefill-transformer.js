import { toggleValues } from 'platform/site-wide/feature-toggles/selectors';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';

export default function prefillTransformer(pages, formData, metadata, state) {
  const prefillEnabled =
    toggleValues(state || {})?.[FEATURE_FLAG_NAMES.form214140PrefillEnabled] ===
    true;

  if (!prefillEnabled) {
    return {
      pages,
      formData: {},
      metadata,
    };
  }

  return {
    pages,
    formData,
    metadata,
  };
}
