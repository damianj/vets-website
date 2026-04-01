import { descriptionUI } from 'platform/forms-system/src/js/web-component-patterns';
import VeteranInformationDescription from '../../components/FormDescriptions/VeteranInformationDescription';
import { blankSchema } from '../../definitions';
import content from '../../locales/en/content.json';
import { titleWithRoleUI } from '../../utils/titles';

const TITLE_TEXT = content['sponsor--chapter-overview-title'];

const OPTS = { matchRole: 'sponsor', other: content['noun--veteran'] };
const PAGE_TITLE = titleWithRoleUI(TITLE_TEXT, null, OPTS);

export default {
  uiSchema: {
    ...PAGE_TITLE,
    ...descriptionUI(VeteranInformationDescription),
  },
  schema: blankSchema,
};
