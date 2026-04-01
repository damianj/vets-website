import { expect } from 'chai';
import applicationInformation from '../../../pages/applicationInformation';
import {
  applicationInfoFields,
  BRANCH_OF_SERVICE,
  FORM_21_4502,
} from '../../../definitions/constants';

describe('21-4502 applicationInformation page', () => {
  const { schema, uiSchema } = applicationInformation;
  const appSchema = schema.properties[applicationInfoFields.parentObject];
  const appUiSchema = uiSchema[applicationInfoFields.parentObject];
  const { APPLICATION_INFORMATION: AI } = FORM_21_4502;

  it('requires branchOfService, placeOfEntry, dateOfEntry', () => {
    expect(appSchema.required).to.include.members([
      applicationInfoFields.branchOfService,
      applicationInfoFields.placeOfEntry,
      applicationInfoFields.dateOfEntry,
    ]);
  });

  it('branchOfService allows expected enum values', () => {
    const branchEnum =
      appSchema.properties[applicationInfoFields.branchOfService]?.enum || [];
    expect(branchEnum).to.include.members(Object.keys(BRANCH_OF_SERVICE));
  });

  it('uses custom required messages for branch and place of entry', () => {
    expect(
      appUiSchema[applicationInfoFields.branchOfService]['ui:errorMessages']
        .required,
    ).to.equal(AI.ERROR_BRANCH_OF_SERVICE);
    expect(
      appUiSchema[applicationInfoFields.placeOfEntry]['ui:errorMessages']
        .required,
    ).to.equal(AI.ERROR_PLACE_OF_ENTRY);
  });

  it('uses custom hint and date entry messages', () => {
    const dateUi = appUiSchema[applicationInfoFields.dateOfEntry];

    expect(dateUi['ui:options'].hint).to.equal(AI.HINT_DATE_OF_ENTRY);
    expect(dateUi['ui:errorMessages'].required).to.equal(
      AI.ERROR_DATE_ENTRY_REQUIRED,
    );
    expect(dateUi['ui:errorMessages'].pattern).to.equal(
      AI.ERROR_DATE_ENTRY_INVALID,
    );
    expect(dateUi['ui:validations']).to.have.length(1);
  });
});
