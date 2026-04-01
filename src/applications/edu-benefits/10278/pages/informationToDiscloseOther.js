import React from 'react';
import {
  textUI,
  titleUI,
  descriptionUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { validateWhiteSpace } from 'platform/forms/validations';

const uiSchema = {
  ...titleUI('Disclose personal information pertaining to your VA record'),
  ...descriptionUI(
    <>
      <p>Provide any other information that you want us to share.</p>
      <p>
        <strong>Note:</strong> Third parties can’t initiate any changes to your
        record.
      </p>
    </>,
  ),
  claimInformationOther: {
    ...textUI({
      title: 'Specify other information',
      charcount: true,
      validations: [validateWhiteSpace],
    }),
  },
};
const schema = {
  type: 'object',
  properties: {
    claimInformationOther: {
      type: 'string',
      maxLength: 30,
    },
  },
};

export { schema, uiSchema };
