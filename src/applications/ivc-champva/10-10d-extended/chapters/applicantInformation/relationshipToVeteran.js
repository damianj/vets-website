import {
  radioSchema,
  radioUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { validateSpousalRelationship } from '../../utils/validations';
import { titleWithNameUI } from '../../utils/titles';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['applicants--sponsor-relationship-title'];
const INPUT_LABEL = content['applicants--sponsor-relationship-label'];
const HINT_TEXT = content['applicants--sponsor-relationship-hint'];

const SCHEMA_LABELS = {
  spouse: content['applicants--sponsor-relationship-option--spouse'],
  child: content['applicants--sponsor-relationship-option--child'],
};
const SCHEMA_ENUM = Object.keys(SCHEMA_LABELS);

export default {
  uiSchema: {
    ...titleWithNameUI(TITLE_TEXT, null, {
      roleKey: 'view:certifierRole',
      arrayBuilder: true,
    }),
    applicantRelationshipToSponsor: {
      relationshipToVeteran: {
        ...radioUI({
          title: INPUT_LABEL,
          labels: SCHEMA_LABELS,
          hint: HINT_TEXT,
          useAllFormData: true,
        }),
        'ui:validations': [validateSpousalRelationship],
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      applicantRelationshipToSponsor: {
        type: 'object',
        required: ['relationshipToVeteran'],
        properties: {
          relationshipToVeteran: radioSchema(SCHEMA_ENUM),
        },
      },
    },
  },
};
