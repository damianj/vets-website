import {
  arrayBuilderItemSubsequentPageTitleUI,
  fullNameNoSuffixSchema,
  fullNameNoSuffixUI,
} from '~/platform/forms-system/src/js/web-component-patterns';

export default {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      'Name of organization’s representatives',
    ),
    fullName: {
      ...fullNameNoSuffixUI(),
      first: {
        ...fullNameNoSuffixUI().first,
        'ui:title': 'First name',
        'ui:errorMessages': {
          required: 'Enter a first name',
        },
      },
      last: {
        ...fullNameNoSuffixUI().last,
        'ui:title': 'Last name',
        'ui:errorMessages': {
          required: 'Enter a last name',
        },
      },
    },
  },

  schema: {
    type: 'object',
    properties: {
      fullName: fullNameNoSuffixSchema,
    },
    required: ['fullName'],
  },
};
