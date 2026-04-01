import {
  arrayBuilderItemSubsequentPageTitleUI,
  descriptionUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import FileUploadDescription from '../../components/FormDescriptions/FileUploadDescription';
import { attachmentSchema, attachmentUI } from '../../definitions';
import content from '../../locales/en/content.json';
import { ATTACHMENT_IDS } from '../../utils/constants';

const TITLE_TEXT = content['applicants--adoption-proof-title'];
const DESC_TEXT = content['applicants--adoption-proof-description'];
const INPUT_LABEL = content['applicants--adoption-proof-label'];

export default {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(TITLE_TEXT, DESC_TEXT),
    ...descriptionUI(FileUploadDescription),
    applicantAdoptionPapers: attachmentUI({
      label: INPUT_LABEL,
      attachmentId: ATTACHMENT_IDS.adoptionPapers,
    }),
  },
  schema: {
    type: 'object',
    required: ['applicantAdoptionPapers'],
    properties: {
      applicantAdoptionPapers: attachmentSchema,
    },
  },
};
