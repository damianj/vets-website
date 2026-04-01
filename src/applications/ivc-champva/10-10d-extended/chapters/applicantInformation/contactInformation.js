import {
  emailSchema,
  emailUI,
  phoneSchema,
  phoneUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';
import { titleWithNameUI } from '../../utils/titles';

const TITLE_TEXT = content['applicants--contact-info-title'];
const DESC_TEXT = content['applicants--contact-info-description'];

const setRequired = ({ certifierRole }, index) =>
  index === 0 && certifierRole === 'applicant';

export default {
  uiSchema: {
    ...titleWithNameUI(TITLE_TEXT, DESC_TEXT, {
      roleKey: 'view:certifierRole',
      arrayBuilder: true,
    }),
    applicantPhone: phoneUI(),
    applicantEmailAddress: emailUI({ required: setRequired }),
  },
  schema: {
    type: 'object',
    required: ['applicantPhone'],
    properties: {
      applicantPhone: phoneSchema,
      applicantEmailAddress: emailSchema,
    },
  },
};
