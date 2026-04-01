import { addressSelectionUI } from '../../definitions';
import content from '../../locales/en/content.json';
import { titleWithRoleUI } from '../../utils/titles';

const TITLE_TEXT = content['address-selection--page-title'];
const DESC_TEXT = content['address--page-description'];
const INPUT_LABEL = content['sponsor--address-label'];

const OPTS = { matchRole: 'sponsor', other: content['noun--veteran'] };
const PAGE_TITLE = titleWithRoleUI(TITLE_TEXT, DESC_TEXT, OPTS);

export default {
  uiSchema: {
    ...PAGE_TITLE,
    'view:sharesAddressWith': addressSelectionUI({
      title: INPUT_LABEL,
      classNames: 'dd-privacy-hidden',
      destinationKey: 'sponsorAddress',
      sourceKeys: ['applicants.applicantAddress', 'certifierAddress'],
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
