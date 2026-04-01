import { expect } from 'chai';
import previousVehicleApplication from '../../../pages/previousVehicleApplication';
import { applicationInfoFields } from '../../../definitions/constants';

describe('21-4502 previousVehicleApplication page', () => {
  const { schema, uiSchema } = previousVehicleApplication;
  const appSchema = schema.properties[applicationInfoFields.parentObject];
  const appUiSchema = uiSchema[applicationInfoFields.parentObject];

  it('requires previouslyAppliedConveyance', () => {
    expect(appSchema.required).to.include(
      applicationInfoFields.previouslyAppliedConveyance,
    );
  });

  it('hides dependent fields until Yes is selected', () => {
    expect(
      appUiSchema[applicationInfoFields.previouslyAppliedDate]['ui:options']
        .hideIf,
    ).to.be.a('function');
    expect(
      appUiSchema[applicationInfoFields.previouslyAppliedDate]['ui:required'],
    ).to.be.a('function');
    expect(
      appUiSchema[applicationInfoFields.previouslyAppliedPlace]['ui:options']
        .hideIf,
    ).to.be.a('function');
    expect(
      appUiSchema[applicationInfoFields.previouslyAppliedPlace]['ui:required'],
    ).to.be.a('function');
  });
});
