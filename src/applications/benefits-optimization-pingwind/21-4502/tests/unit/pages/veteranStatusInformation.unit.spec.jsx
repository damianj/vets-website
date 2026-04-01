import { expect } from 'chai';
import veteranStatusInformation from '../../../pages/veteranStatusInformation';
import {
  applicationInfoFields,
  FORM_21_4502,
} from '../../../definitions/constants';

describe('21-4502 veteranStatusInformation page', () => {
  const { schema, uiSchema } = veteranStatusInformation;
  const appSchema = schema.properties[applicationInfoFields.parentObject];
  const appUiSchema = uiSchema[applicationInfoFields.parentObject];
  const { VETERAN_STATUS_INFORMATION: V } = FORM_21_4502;

  it('defines placeOfRelease and dateOfRelease', () => {
    expect(appSchema.properties[applicationInfoFields.placeOfRelease]).to.exist;
    expect(appSchema.properties[applicationInfoFields.dateOfRelease]).to.exist;
  });

  it('uses the custom required message for place of release', () => {
    expect(
      appUiSchema[applicationInfoFields.placeOfRelease]['ui:errorMessages']
        .required,
    ).to.equal(V.ERROR_PLACE_OF_RELEASE);
  });

  it('uses the custom hint and date release messages', () => {
    const dateUi = appUiSchema[applicationInfoFields.dateOfRelease];

    expect(dateUi['ui:options'].hint).to.equal(V.HINT_DATE_OF_RELEASE);
    expect(dateUi['ui:errorMessages'].required).to.equal(
      V.ERROR_DATE_RELEASE_REQUIRED,
    );
    expect(dateUi['ui:errorMessages'].pattern).to.equal(
      V.ERROR_DATE_RELEASE_INVALID,
    );
    expect(dateUi['ui:validations']).to.have.length(1);
  });
});
