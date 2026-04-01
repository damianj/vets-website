import { expect } from 'chai';
import currentServiceStatus from '../../../pages/currentServiceStatus';
import {
  applicationInfoFields,
  FORM_21_4502,
} from '../../../definitions/constants';

describe('21-4502 currentServiceStatus page', () => {
  const { schema, uiSchema } = currentServiceStatus;
  const appSchema = schema.properties[applicationInfoFields.parentObject];
  const appUiSchema = uiSchema[applicationInfoFields.parentObject];
  const { CURRENT_SERVICE_STATUS: C } = FORM_21_4502;

  it('requires currentlyOnActiveDuty', () => {
    expect(appSchema.required).to.include(
      applicationInfoFields.currentlyOnActiveDuty,
    );
  });

  it('uses the custom required message', () => {
    expect(
      appUiSchema[applicationInfoFields.currentlyOnActiveDuty][
        'ui:errorMessages'
      ].required,
    ).to.equal(C.ERROR);
  });
});
