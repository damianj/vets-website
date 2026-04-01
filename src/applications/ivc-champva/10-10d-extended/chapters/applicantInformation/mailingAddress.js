import {
  addressSchema,
  addressUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';
import { titleWithNameUI } from '../../utils/titles';

const TITLE_TEXT = content['mailing-address--page-title'];
const DESC_TEXT = content['mailing-address--page-description'];
const CHECKBOX_LABEL = content['mailing-address--checkbox-label'];

export default {
  uiSchema: {
    ...titleWithNameUI(TITLE_TEXT, DESC_TEXT, {
      roleKey: 'view:certifierRole',
      arrayBuilder: true,
    }),
    applicantAddress: addressUI({
      labels: { militaryCheckbox: CHECKBOX_LABEL },
    }),
  },
  schema: {
    type: 'object',
    required: ['applicantAddress'],
    properties: {
      applicantAddress: addressSchema({ omit: ['street3'] }),
    },
  },
};
