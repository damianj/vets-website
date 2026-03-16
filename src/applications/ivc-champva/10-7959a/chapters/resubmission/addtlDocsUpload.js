import {
  descriptionUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  ResubmissionAddtlDocsDescription,
  ResubmissionAddtlDocsUploadDescription,
} from '../../components/FormDescriptions/ResubmissionDescriptions';
import {
  attachmentSchema,
  attachmentUI,
  llmResponseAlertSchema,
  llmResponseAlertUI,
  llmUploadAlertSchema,
  llmUploadAlertUI,
} from '../../definitions';
import content from '../../locales/en/content.json';
import { ATTACHMENT_IDS } from '../../utils/constants';

const TITLE_TEXT = content['resubmission--addtl-docs-title'];
const INPUT_LABEL = content['resubmission--addtl-docs-label'];

export default {
  uiSchema: {
    ...titleUI(TITLE_TEXT, ResubmissionAddtlDocsDescription),
    ...descriptionUI(ResubmissionAddtlDocsUploadDescription),
    ...llmUploadAlertUI,
    claimAddtlDocsUpload: attachmentUI({
      label: INPUT_LABEL,
      attachmentId: ATTACHMENT_IDS.dutyToAssist,
    }),
    ...llmResponseAlertUI,
  },
  schema: {
    type: 'object',
    properties: {
      ...llmUploadAlertSchema,
      claimAddtlDocsUpload: attachmentSchema,
      ...llmResponseAlertSchema,
    },
  },
};
