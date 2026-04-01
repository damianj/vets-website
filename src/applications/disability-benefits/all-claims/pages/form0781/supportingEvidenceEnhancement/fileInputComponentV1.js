import { ancillaryFormUploadUi } from '../../../utils/schemas';

export const v1FileInputUiSchema = ({ label, additionLabel, description }) => ({
  ...ancillaryFormUploadUi(label, additionLabel, {
    addAnotherLabel: 'Add another file',
    buttonText: 'Upload file',
  }),
  'ui:description': description,
  'ui:confirmationField': ({ formData }) => ({
    data: formData?.map(item => item.name || item.fileName),
    label: 'Uploaded file(s)',
  }),
});
