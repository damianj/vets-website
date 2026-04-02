import React from 'react';
import {
  yesNoSchema,
  yesNoUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';

/** @type {PageSchema} */
export default {
  title: 'Marriage status',
  path: 'household/marriage-status',
  uiSchema: {
    ...titleUI('Marriage status'),
    livedContinuouslyWithVeteran: yesNoUI({
      title:
        'Did you live continuously with the Veteran from the date of marriage to the date of their death?',
    }),
    'view:livingContinuouslyInfo': {
      'ui:description': () => (
        <va-additional-info trigger="What we consider living continuously together">
          <p>
            We consider you to be living together unless you’ve separated
            because of relationship differences or problems. Being apart for
            reasons like a job move, nursing home care, or military service
            still counts as living together.
          </p>
        </va-additional-info>
      ),
      'ui:options': {
        displayEmptyObjectOnReview: true,
      },
    },
  },
  schema: {
    type: 'object',
    required: ['livedContinuouslyWithVeteran'],
    properties: {
      livedContinuouslyWithVeteran: yesNoSchema,
      'view:livingContinuouslyInfo': {
        type: 'object',
        properties: {},
      },
    },
  },
};
