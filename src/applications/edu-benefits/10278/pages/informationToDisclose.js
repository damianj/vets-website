// @ts-check
import React, { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectProfile } from '~/platform/user/selectors';
import { titleUI } from 'platform/forms-system/src/js/web-component-patterns';
import {
  VaCheckbox,
  VaCheckboxGroup,
} from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import {
  buildValidateAtLeastOne,
  DISCLOSURE_KEYS,
  DISCLOSURE_OPTIONS,
  getFullName,
  getThirdPartyName,
  InformationToDiscloseReviewField as ReviewField,
} from '../helpers';

export const InformationToDiscloseReviewField = props => (
  <ReviewField
    {...props}
    disclosureKeys={DISCLOSURE_KEYS}
    options={DISCLOSURE_OPTIONS}
    dataKey="claimInformation"
  />
);
const DisclosureIntro = ({ claimantName, thirdPartyName }) => (
  <>
    <p>
      I, the claimant {claimantName}, authorize VA to speak with{' '}
      {thirdPartyName} for the purpose of providing the following information
      pertaining to my VA record.
    </p>
  </>
);

const getChecked = e => Boolean(e?.detail?.checked);

const validateAtLeastOne = buildValidateAtLeastOne(DISCLOSURE_KEYS);

const InformationToDiscloseField = props => {
  const {
    formData = {},
    onChange,
    rawErrors,
    errorSchema,
    idSchema,
    showErrors,
    showError,
    formContext,
  } = props;

  const profile = useSelector(selectProfile);
  const fullFormData = useSelector(state => state?.form?.data);

  const keys = useMemo(() => DISCLOSURE_KEYS, []);
  const anchorKey = DISCLOSURE_KEYS[0];

  // Most reliable "Continue clicked" gating in SchemaForm flows
  const hasAttemptedContinue = Boolean(
    showErrors ||
      showError ||
      formContext?.submitted ||
      formContext?.showErrors ||
      formContext?.showValidationErrors,
  );

  const anyChecked = keys.some(k => Boolean(formData?.[k]));

  // The at-least-one error is attached to the anchor checkbox key
  const atLeastOneMsg =
    rawErrors?.[0] ||
    errorSchema?.[anchorKey]?.__errors?.[0] ||
    keys.map(k => errorSchema?.[k]?.__errors?.[0]).find(Boolean);

  // Only show after Continue AND only when none selected.
  const groupError =
    hasAttemptedContinue && !anyChecked ? atLeastOneMsg : undefined;

  // ----- Select all derived state -----
  const selectedCount = keys.filter(k => formData?.[k] === true).length;
  const allSelected = keys.length > 0 && selectedCount === keys.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const setAll = useCallback(
    checked => {
      const next = { ...(formData || {}) };
      keys.forEach(k => {
        next[k] = checked;
      });

      onChange(next);
    },
    [formData, keys, onChange],
  );

  const setOne = useCallback(
    (key, checked) => {
      const next = { ...(formData || {}), [key]: checked };

      onChange(next);
    },
    [formData, onChange],
  );

  // Wrapper id for the whole object field
  const wrapperId = idSchema?.$id || 'claimInformation';

  const claimantName =
    getFullName(fullFormData?.claimantPersonalInformation?.fullName) ||
    getFullName(profile?.userFullName);
  const thirdPartyName = getThirdPartyName(fullFormData);

  return (
    <div id={wrapperId} tabIndex="-1">
      <DisclosureIntro
        claimantName={claimantName}
        thirdPartyName={thirdPartyName}
      />

      <VaCheckboxGroup
        id={`${wrapperId}-checkbox-group`}
        label={`Here is a list of all benefit and claim information you can allow ${thirdPartyName} to see. Select the information that you want to share.`}
        required
        error={groupError}
      >
        <VaCheckbox
          class="vads-u-margin-top--4"
          label="Select all benefit and claim information"
          checked={allSelected}
          indeterminate={someSelected}
          onVaChange={e => setAll(getChecked(e))}
        />
        <hr className="vads-u-margin-y--2" />
        {keys.map(key => {
          const opt = DISCLOSURE_OPTIONS[key];
          const label = typeof opt === 'string' ? opt : opt.title;
          const description =
            typeof opt === 'string' ? undefined : opt.description;

          // Critical fix for scrollToFirstError:
          // Create a LIGHT-DOM, focusable element with the exact schema id for this field.
          const fieldId = idSchema?.[key]?.$id || `${wrapperId}_${key}`;

          return (
            <div key={key}>
              {/* This div is what scrollToFirstError will reliably find */}
              <div id={fieldId} tabIndex="-1">
                <VaCheckbox
                  name={fieldId} // helps if scroll lookup is name-based
                  label={label}
                  checked={Boolean(formData?.[key])}
                  onVaChange={e => setOne(key, getChecked(e))}
                />
              </div>
              {description ? (
                <div className="vads-u-margin-left--3 vads-u-margin-top--0">
                  {description}
                </div>
              ) : null}
            </div>
          );
        })}
      </VaCheckboxGroup>
    </div>
  );
};

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI('Disclose personal information pertaining to your VA record'),
    claimInformation: {
      'ui:field': InformationToDiscloseField,
      'ui:reviewField': InformationToDiscloseReviewField,
      'ui:validations': [validateAtLeastOne],
    },
  },

  schema: {
    type: 'object',
    properties: {
      claimInformation: {
        type: 'object',
        properties: {
          statusOfClaim: { type: 'boolean' },
          currentBenefit: { type: 'boolean' },
          paymentHistory: { type: 'boolean' },
          amountOwed: { type: 'boolean' },
          minor: { type: 'boolean' },
        },
      },
    },
  },
};
