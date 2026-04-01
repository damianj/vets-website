import React from 'react';
import PropTypes from 'prop-types';
import { parseISODate } from '~/platform/forms-system/src/js/helpers';

export const DISCLOSURE_KEYS = [
  'statusOfClaim',
  'currentBenefit',
  'paymentHistory',
  'amountOwed',
  'minor',
];

export const DISCLOSURE_OPTIONS = {
  statusOfClaim: 'Status of pending claim or appeal',
  currentBenefit: 'Current benefit and rate',
  paymentHistory: 'Payment history',
  amountOwed: 'Amount of money owed VA',
  minor: {
    title: 'Minor claimants only',
    description: 'This is for change of address or direct deposit',
  },
};

export const getFullName = fullName => {
  if (!fullName) return null;

  const first = (fullName?.first || '').trim();
  const middle = (fullName?.middle || '').trim();
  const last = (fullName?.last || '').trim();

  return [first, middle, last].filter(Boolean).join(' ');
};

export const organizationRepresentativesArrayOptions = {
  arrayPath: 'organizationRepresentatives',
  nounSingular: 'representative',
  nounPlural: 'representatives',
  maxItems: 6,
  required: true,
  isItemIncomplete: item => !item?.fullName?.first || !item?.fullName?.last,
  text: {
    cancelAddButtonText: () => 'Cancel adding this individual’s information',
    cancelEditButtonText: () => 'Cancel editing this individual’s information',
    getItemName: item => getFullName(item?.fullName),
    cardDescription: (item, index, fullData) =>
      fullData?.organizationName || '',
    summaryTitle: 'Review the names of organization’s representatives',
  },
};

export const getThirdPartyName = formData => {
  if (formData?.discloseInformation?.authorize === 'organization') {
    return formData?.organizationName;
  }

  return getFullName(formData?.thirdPartyPersonName?.fullName);
};

/**
 * Require at least one checkbox.
 * Attach to ONE checkbox key so forms-system has a concrete error path
 * (helps scrollToFirstError + consistent errorSchema shape).
 */
export const buildValidateAtLeastOne = disclosureKeys => (
  errors,
  fieldData,
) => {
  const anyChecked = disclosureKeys.some(k => Boolean(fieldData?.[k]));
  if (!anyChecked) {
    const msg = 'You must provide an answer';
    const anchorKey = disclosureKeys[0];
    if (errors?.[anchorKey]?.addError) {
      errors[anchorKey].addError(msg);
    } else {
      errors.addError(msg);
    }
  }
};

export const validateTerminationDate = (errors, dateString) => {
  const { day, month, year } = parseISODate(dateString);

  const entered = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fiveYearsFromToday = new Date(
    today.getFullYear() + 5,
    today.getMonth(),
    today.getDate(),
  );

  if (entered < today || entered > fiveYearsFromToday) {
    errors.addError('You must enter a valid date that’s within 5 years');
  }
};

export const ClaimInformationDescription = ({ formData }) => {
  const claimInformation = formData?.claimInformation;
  claimInformation.other = Boolean(formData?.claimInformationOther);
  const claimInformationKeys = Object.keys(claimInformation);
  const claimInformationLabels = claimInformationKeys.map((key, index) => {
    if (!claimInformation[key]) {
      return null;
    }

    const specialLabels = {
      minor: 'Change of address or direct deposit (minor claimants only)',
      other: `Other: ${formData?.claimInformationOther}`,
    };

    const label = specialLabels[key] || DISCLOSURE_OPTIONS[key];
    return <li key={index}>{label}</li>;
  });
  return (
    <va-card background>
      <div>
        <h3 className="vads-u-margin-top--0">
          Here’s the personal information you selected:
        </h3>
        <ul>{claimInformationLabels}</ul>
      </div>
    </va-card>
  );
};

ClaimInformationDescription.propTypes = {
  formData: PropTypes.shape({
    claimInformation: PropTypes.object,
    claimInformationOther: PropTypes.string,
  }),
};

export const InformationToDiscloseReviewField = ({
  children,
  disclosureKeys,
  options,
  dataKey,
}) => {
  const formDataFromChildren = children?.props?.formData;

  const value =
    formDataFromChildren?.[dataKey] &&
    typeof formDataFromChildren[dataKey] === 'object'
      ? formDataFromChildren[dataKey]
      : formDataFromChildren || {};

  const isSelected = key => Boolean(value?.[key]);

  return (
    <>
      {disclosureKeys.map(key => {
        const opt = options[key];
        const label = typeof opt === 'string' ? opt : opt.title;

        let ddValue = '';

        if (isSelected(key)) {
          ddValue = 'Selected';
        }

        return (
          <div key={key} className="review-row">
            <dt>{label}</dt>
            <dd>
              {ddValue ? (
                <span
                  className="dd-privacy-hidden"
                  data-dd-action-name="data value"
                >
                  {ddValue}
                </span>
              ) : null}
            </dd>
          </div>
        );
      })}
    </>
  );
};

InformationToDiscloseReviewField.propTypes = {
  children: PropTypes.node,
  dataKey: PropTypes.string,
  disclosureKeys: PropTypes.arrayOf(PropTypes.string),
  options: PropTypes.object,
};
