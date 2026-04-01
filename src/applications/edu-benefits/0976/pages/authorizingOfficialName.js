// @ts-check
import React from 'react';
import {
  firstNameLastNameNoSuffixSchema,
  firstNameLastNameNoSuffixUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { validateNameSymbols } from 'platform/forms-system/src/js/web-component-patterns/fullNamePattern';

function validatePrefilledFirstName(errors, fieldData, formData) {
  if (!formData.prefilledFirstName) {
    return;
  }

  if (
    fieldData.toLowerCase().trim() !==
    formData.prefilledFirstName.toLowerCase().trim()
  ) {
    errors.addError('Enter your name as it appears on your profile');
  }
}

function validatePrefilledLastName(errors, fieldData, formData) {
  if (!formData.prefilledLastName) {
    return;
  }

  if (
    fieldData.toLowerCase().trim() !==
    formData.prefilledLastName.toLowerCase().trim()
  ) {
    errors.addError('Enter your name as it appears on your profile');
  }
}

/** @type {PageSchema} */
export default {
  uiSchema: {
    authorizingOfficial: {
      ...titleUI(
        'Please provide your institution’s authorizing official information',
        <p>
          <strong>Note:</strong> The person filling out this form must be
          authorized to enter the school or training establishment into a
          binding agreement with the Department of Veterans Affairs as an
          authorizing official.
        </p>,
      ),
      fullName: {
        ...firstNameLastNameNoSuffixUI(),
        first: {
          ...firstNameLastNameNoSuffixUI().first,
          'ui:validations': [validateNameSymbols, validatePrefilledFirstName],
        },
        last: {
          ...firstNameLastNameNoSuffixUI().last,
          'ui:validations': [validateNameSymbols, validatePrefilledLastName],
        },
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      authorizingOfficial: {
        type: 'object',
        properties: {
          fullName: firstNameLastNameNoSuffixSchema,
        },
        required: ['fullName'],
      },
    },
  },
};
