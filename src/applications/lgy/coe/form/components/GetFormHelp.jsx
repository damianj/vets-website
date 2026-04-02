import React from 'react';
import { CONTACTS } from '@department-of-veterans-affairs/component-library/contacts';
import { useFeatureToggle } from 'platform/utilities/feature-toggles';
import { TOGGLE_KEY } from '../constants';
import { GetHelpContent } from './GetHelpContent';

export const GetFormHelp = () => {
  const {
    TOGGLE_NAMES,
    useToggleValue,
    useToggleLoadingValue,
  } = useFeatureToggle();
  const coeRebuildEnabled = useToggleValue(TOGGLE_NAMES[TOGGLE_KEY]);
  const isLoadingFeatureFlags = useToggleLoadingValue(TOGGLE_NAMES[TOGGLE_KEY]);

  if (!isLoadingFeatureFlags && coeRebuildEnabled) {
    return <GetHelpContent />;
  }

  return (
    <p className="help-talk">
      If you need help or have questions about your eligibility, call us at{' '}
      <va-telephone contact="8778273702" />.{' '}
      <va-telephone contact={CONTACTS[711]} tty />. We’re here Monday through
      Friday, 8:00 a.m. to 6:00 p.m. ET.
    </p>
  );
};
