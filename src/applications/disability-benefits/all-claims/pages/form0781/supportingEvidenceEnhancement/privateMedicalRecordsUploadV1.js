/**
 * @file V1 fallback for the private medical records upload page.
 *
 * Uses the legacy FileField upload component instead of `va-file-input-multiple`.
 * Shown when the evidence enhancement toggle is ON but the FileInputV3 toggle
 * is OFF. Once FileInputV3 is fully rolled out, this page can be removed.
 */
import fullSchema from 'vets-json-schema/dist/21-526EZ-ALLCLAIMS-schema.json';
import {
  pmrTitle,
  pmrDescriptionV1,
} from '../../../content/form0781/supportingEvidenceEnhancement/privateMedicalRecordsUpload';
import { standardTitle } from '../../../content/form0781';
import { HINT_TEXT } from '../../../components/fileInputComponent/FileInputComponentV1';
import { v1FileInputUiSchema } from './fileInputComponentV1';

const { privateMedicalRecordAttachments } = fullSchema.properties;

/** @type {import('@rjsf/core').UiSchema} */
export const uiSchema = {
  'ui:title': standardTitle(pmrTitle),
  'ui:description': pmrDescriptionV1,
  privateMedicalRecordAttachments: v1FileInputUiSchema({
    label: '',
    additionLabel: 'Adding private medical records:',
    description: HINT_TEXT,
  }),
};

/** @type {import('@rjsf/core').JSONSchema7} */
export const schema = {
  type: 'object',
  required: ['privateMedicalRecordAttachments'],
  properties: {
    privateMedicalRecordAttachments: {
      ...privateMedicalRecordAttachments,
      minItems: 1,
    },
  },
};
