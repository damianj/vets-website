import { expect } from 'chai';
import address from '../../../pages/address';
import { veteranFields } from '../../../definitions/constants';

describe('21-4502 address page', () => {
  const { schema } = address;
  const veteranSchema = schema.properties[veteranFields.parentObject];

  it('requires address', () => {
    expect(veteranSchema.required).to.include(veteranFields.address);
  });

  it('defines address property', () => {
    expect(veteranSchema.properties[veteranFields.address]).to.exist;
  });
});
