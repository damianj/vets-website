import { expect } from 'chai';
import certification from '../../../pages/certification';

describe('21-4502 certification page', () => {
  const { schema } = certification;

  it('requires certifyLicensing and certifyNoPriorGrant', () => {
    expect(schema.required).to.include.members([
      'certifyLicensing',
      'certifyNoPriorGrant',
    ]);
  });

  it('uses checkbox required schema for both certifications', () => {
    expect(schema.properties.certifyLicensing.type).to.equal('boolean');
    expect(schema.properties.certifyNoPriorGrant.type).to.equal('boolean');
  });
});
