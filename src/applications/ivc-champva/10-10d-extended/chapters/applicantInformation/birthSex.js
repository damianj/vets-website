import {
  descriptionUI,
  radioSchema,
  radioUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import BirthSexAddtlInfo from '../../components/FormDescriptions/BirthSexAddtlInfo';
import { blankSchema } from '../../definitions';
import content from '../../locales/en/content.json';
import { capitalizeFirst } from '../../utils/helpers';
import { titleWithNameUI } from '../../utils/titles';

const TITLE_TEXT = content['applicants--birth-sex-title'];
const INPUT_LABEL = content['applicants--birth-sex-label'];

const SCHEMA_ENUM = ['female', 'male'];
const SCHEMA_LABELS = Object.fromEntries(
  SCHEMA_ENUM.map(key => [key, capitalizeFirst(key)]),
);

export default {
  uiSchema: {
    ...titleWithNameUI(TITLE_TEXT, null, {
      roleKey: 'view:certifierRole',
      arrayBuilder: true,
    }),
    applicantGender: {
      gender: radioUI({
        title: INPUT_LABEL,
        labels: SCHEMA_LABELS,
      }),
    },
    'view:addtlInfo': descriptionUI(BirthSexAddtlInfo),
  },
  schema: {
    type: 'object',
    properties: {
      applicantGender: {
        type: 'object',
        required: ['gender'],
        properties: { gender: radioSchema(SCHEMA_ENUM) },
      },
      'view:addtlInfo': blankSchema,
    },
  },
};
