import { expect } from 'chai';
import personalInfoBasic from '../../../pages/personalInfoBasic';
import { veteranFields } from '../../../definitions/constants';

describe('21-4502 personalInfoBasic page', () => {
  const { schema } = personalInfoBasic;
  const veteranSchema = schema.properties[veteranFields.parentObject];

  it('requires fullName, dateOfBirth, and ssn', () => {
    expect(veteranSchema.required).to.include.members([
      veteranFields.fullName,
      veteranFields.dateOfBirth,
      veteranFields.ssn,
    ]);
  });

  it('includes optional vaFileNumber and veteranServiceNumber', () => {
    expect(veteranSchema.properties[veteranFields.vaFileNumber]).to.exist;
    expect(veteranSchema.properties[veteranFields.veteranServiceNumber]).to
      .exist;
  });

  it('fullName schema includes first, middle, and last (no suffix)', () => {
    const fullNameProps =
      veteranSchema.properties[veteranFields.fullName].properties;
    expect(fullNameProps.first).to.exist;
    expect(fullNameProps.middle).to.exist;
    expect(fullNameProps.last).to.exist;
    expect(fullNameProps.suffix).to.not.exist;
  });
});
