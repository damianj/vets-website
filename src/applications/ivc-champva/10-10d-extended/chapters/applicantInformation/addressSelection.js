import { addressSelectionUI } from '../../definitions';
import content from '../../locales/en/content.json';
import { titleWithNameUI } from '../../utils/titles';

const TITLE_TEXT = content['address-selection--page-title'];
const DESC_TEXT = content['address--page-description'];
const INPUT_LABEL = content['applicants--address-label'];

export default {
  uiSchema: {
    ...titleWithNameUI(TITLE_TEXT, DESC_TEXT, {
      roleKey: 'view:certifierRole',
      arrayBuilder: true,
    }),
    'view:sharesAddressWith': addressSelectionUI({
      title: INPUT_LABEL,
      destinationKey: 'applicantAddress',
      sourceKeys: [
        'applicants.applicantAddress',
        'certifierAddress',
        'sponsorAddress',
      ],
    }),
  },
  schema: {
    type: 'object',
    required: ['view:sharesAddressWith'],
    properties: {
      'view:sharesAddressWith': { type: 'string' },
    },
  },
};
