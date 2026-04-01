import {
  radioSchema,
  radioUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { titleWithNameUI } from '../../utils/titles';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['applicants--relationship-origin-title'];
const INPUT_LABEL = content['applicants--relationship-origin-label'];
const HINT_TEXT = content['applicants--relationship-origin-hint'];

const SCHEMA_LABELS = {
  blood: content['applicants--relationship-origin-option--blood'],
  step: content['applicants--relationship-origin-option--step'],
  adoption: content['applicants--relationship-origin-option--adoption'],
};
const SCHEMA_ENUM = Object.keys(SCHEMA_LABELS);

export default {
  uiSchema: {
    ...titleWithNameUI(TITLE_TEXT, null, {
      roleKey: 'view:certifierRole',
      arrayBuilder: true,
    }),
    applicantRelationshipOrigin: {
      relationshipToVeteran: radioUI({
        title: INPUT_LABEL,
        labels: SCHEMA_LABELS,
        hint: HINT_TEXT,
      }),
    },
  },
  schema: {
    type: 'object',
    properties: {
      applicantRelationshipOrigin: {
        type: 'object',
        required: ['relationshipToVeteran'],
        properties: {
          relationshipToVeteran: radioSchema(SCHEMA_ENUM),
        },
      },
    },
  },
};
