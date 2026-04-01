import {
  ssnSchema,
  ssnUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';
import { titleWithNameUI } from '../../utils/titles';
import { validateApplicantSsn } from '../../utils/validations';

const TITLE_TEXT = content['applicants--identification-info-title'];

export default {
  uiSchema: {
    ...titleWithNameUI(TITLE_TEXT, null, {
      roleKey: 'view:certifierRole',
      arrayBuilder: true,
    }),
    applicantSsn: {
      ...ssnUI(),
      'ui:options': { useAllFormData: true },
      'ui:validations': [validateApplicantSsn],
    },
  },
  schema: {
    type: 'object',
    required: ['applicantSsn'],
    properties: {
      applicantSsn: ssnSchema,
    },
  },
};
