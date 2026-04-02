import React from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { VaLink } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { useFeatureToggle } from '~/platform/utilities/feature-toggles';

const INTENT_TO_FILE_PATH = '/your-claims/intent-to-file';

export default function IntentToFileSection() {
  const { TOGGLE_NAMES, useToggleValue } = useFeatureToggle();
  const cstIntentsToFileEnabled = useToggleValue(TOGGLE_NAMES.cstIntentsToFile);
  const navigate = useNavigate();

  if (!cstIntentsToFileEnabled) {
    return null;
  }

  const handleIntentToFileLinkClick = e => {
    e.preventDefault();
    navigate(INTENT_TO_FILE_PATH);
  };

  return (
    <div className="intent-to-file-section vads-u-margin-top--4 vads-u-margin-bottom--4">
      <h2 id="your-intents-to-file">Your intents to file</h2>
      <VaLink
        active
        className="active-va-link vads-u-margin-top--0"
        href={`/track-claims${INTENT_TO_FILE_PATH}`}
        text="Review your intents to file or learn how to start one"
        onClick={handleIntentToFileLinkClick}
      />
      <p className="vads-u-margin-y--0p5">
        An intent to file sets a potential start date for your VA disability,
        pension, or Dependency and Indemnity Compensation (DIC) benefits.
      </p>
    </div>
  );
}
