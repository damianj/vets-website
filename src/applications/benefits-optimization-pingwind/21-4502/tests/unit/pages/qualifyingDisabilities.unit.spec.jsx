import { expect } from 'chai';
import { qualifyingDisabilitiesPage } from '../../../pages/qualifyingDisabilities';
import {
  FORM_21_4502,
  QUALIFYING_DISABILITIES,
} from '../../../definitions/constants';

describe('21-4502 qualifyingDisabilities page', () => {
  const uiSchema = qualifyingDisabilitiesPage.uiSchema.qualifyingDisabilities;
  const { schema } = qualifyingDisabilitiesPage;
  const { QUALIFYING_DISABILITIES: QD } = FORM_21_4502;

  it('requires at least one qualifying disability', () => {
    expect(schema.required).to.include('qualifyingDisabilities');
    expect(schema.properties.qualifyingDisabilities).to.exist;
  });

  it('uses the custom required message', () => {
    expect(uiSchema['ui:errorMessages'].atLeastOne).to.equal(QD.ERROR);
  });

  it('includes the expected disability options', () => {
    expect(schema.properties.qualifyingDisabilities.properties).to.include.keys(
      Object.keys(QUALIFYING_DISABILITIES),
    );
  });
});
