import { expect } from 'chai';
import plannedAddress from '../../../pages/plannedAddress';
import { veteranFields } from '../../../definitions/constants';

describe('21-4502 plannedAddress page', () => {
  const { schema } = plannedAddress;
  const veteranSchema = schema.properties[veteranFields.parentObject];

  it('defines plannedAddress as optional', () => {
    expect(veteranSchema.properties[veteranFields.plannedAddress]).to.exist;
    const required = veteranSchema.required || [];
    expect(required).to.not.include(veteranFields.plannedAddress);
  });
});
