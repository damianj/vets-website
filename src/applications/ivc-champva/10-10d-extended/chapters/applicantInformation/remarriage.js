import {
  yesNoSchema,
  yesNoUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';
import { titleWithNameUI } from '../../utils/titles';

const TITLE_TEXT = content['applicants--remarriage-title'];
const INPUT_LABEL = content['applicants--remarriage-label'];

export default {
  uiSchema: {
    ...titleWithNameUI(TITLE_TEXT, null, {
      roleKey: 'view:certifierRole',
      arrayBuilder: true,
    }),
    applicantRemarried: yesNoUI(INPUT_LABEL),
  },
  schema: {
    type: 'object',
    required: ['applicantRemarried'],
    properties: {
      applicantRemarried: yesNoSchema,
    },
  },
};
