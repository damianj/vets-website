import { textareaUI } from 'platform/forms-system/src/js/web-component-patterns';

export const detailsQuestion =
  'What do you want your information request to be limited to?';
export const detailsHint =
  'For example, you want your doctor to release only treatment dates or certain types of disabilities.';
export const detailsError = 'Tell us how to limit our request';

export default {
  uiSchema: {
    limitedConsent: textareaUI({
      title: detailsQuestion,
      hint: detailsHint,
      labelHeaderLevel: 3,
      classNames: 'vads-u-margin-bottom--4',
      required: () => true,
      hideOnReview: true,
      errorMessages: {
        required: detailsError,
      },
    }),
  },
  schema: {
    required: ['limitedConsent'],
    type: 'object',
    properties: {
      limitedConsent: {
        type: 'string',
      },
    },
  },
};
