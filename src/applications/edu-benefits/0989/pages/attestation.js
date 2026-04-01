import React from 'react';
import moment from 'moment';
// @ts-check
import {
  currentOrPastDateUI,
  currentOrPastDateSchema,
  titleUI,
  textUI,
  textSchema,
  descriptionUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { parseISODate } from 'platform/forms-system/src/js/helpers';

import { validateNameMatchesUser } from '../helpers';

function validateTodaysDate(errors, fieldData, _formData) {
  const { day, month, year } = parseISODate(fieldData);
  const momentDate = moment({ day, month: parseInt(month, 10) - 1, year });
  if (!momentDate.isSame(moment().endOf('day'), 'day')) {
    errors.addError("You must enter today's date");
  }
}

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI('Attestation of Hours Transferred'),
    ...descriptionUI(
      <div>
        <p>By signing here I acknowledge the following,</p>
        <ul>
          <li>
            I have transferred fewer than 12 credits (or its equivalent in clock
            hours) from my program at the closed/disapproved facility;{' '}
            <strong>and</strong>
          </li>
          <li>
            If I am transferred 12 or more credits from such program at a later
            date, the Secretary will rescind/revoke my restored entitlement
          </li>
        </ul>
      </div>,
    ),
    attestationName: {
      ...textUI({
        title: 'Your full name',
        errorMessages: {
          required: 'You must enter your full name',
        },
        validations: [validateNameMatchesUser],
      }),
    },
    attestationDate: {
      ...currentOrPastDateUI({
        title: 'Date',
        hint: "Enter today's date",
        removeDateHint: true,
        required: () => true,
        monthSelect: false,
        validations: [validateTodaysDate],
      }),
      'ui:errorMessages': {
        required: 'You must enter a date',
        pattern: 'Enter a valid date',
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      attestationName: textSchema,
      attestationDate: currentOrPastDateSchema,
    },
    required: ['attestationName', 'attestationDate'],
  },
};
