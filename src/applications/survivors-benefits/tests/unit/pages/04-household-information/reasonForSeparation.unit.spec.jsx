import { radioSchema } from 'platform/forms-system/src/js/web-component-patterns';
import { expect } from 'chai';
import page from '../../../../config/chapters/04-household-information/reasonForSeparation';
import {
  separationReasonOptions,
  separationReasonOptions2025,
} from '../../../../utils/labels';

describe('Reason for separation page', () => {
  const { uiSchema, schema } = page;

  it('uiSchema contains separationDueToAssignedReasons radio', () => {
    expect(uiSchema).to.be.an('object');
    expect(
      uiSchema.separationDueToAssignedReasons,
      'separationDueToAssignedReasons missing',
    ).to.exist;
  });

  it('shows all separation reasons when the 2025 toggle is off', () => {
    const options = uiSchema.separationDueToAssignedReasons[
      'ui:options'
    ].updateUiSchema({});
    const updatedSchema = uiSchema.separationDueToAssignedReasons[
      'ui:options'
    ].updateSchema({});

    expect(options['ui:options'].labels).to.deep.equal(separationReasonOptions);
    expect(updatedSchema).to.deep.equal(
      radioSchema(Object.keys(separationReasonOptions)),
    );
  });

  it('shows the reduced separation reasons when the 2025 toggle is on', () => {
    const formData = { survivorsBenefitsForm2025VersionEnabled: true };
    const options = uiSchema.separationDueToAssignedReasons[
      'ui:options'
    ].updateUiSchema(formData);
    const updatedSchema = uiSchema.separationDueToAssignedReasons[
      'ui:options'
    ].updateSchema(formData);

    expect(options['ui:options'].labels).to.deep.equal(
      separationReasonOptions2025,
    );
    expect(updatedSchema).to.deep.equal(
      radioSchema(Object.keys(separationReasonOptions2025)),
    );
  });

  it('schema requires separationDueToAssignedReasons', () => {
    expect(schema).to.be.an('object');
    expect(schema.required).to.include('separationDueToAssignedReasons');
  });
});
