import { expect } from 'chai';

import { schema, uiSchema } from '../../pages/informationToDiscloseOther';

describe('10278 informationToDiscloseOther page', () => {
  it('exports uiSchema with claimInformationOther text field', () => {
    expect(uiSchema).to.be.an('object');
    expect(uiSchema).to.have.property('claimInformationOther');

    const fieldUI = uiSchema.claimInformationOther;
    expect(fieldUI).to.be.an('object');
  });

  it('exports schema with maxLength', () => {
    expect(schema).to.be.an('object');
    expect(schema).to.have.property('type', 'object');
    expect(schema).to.have.nested.property('properties.claimInformationOther');

    const fieldSchema = schema.properties.claimInformationOther;
    expect(fieldSchema).to.include({
      type: 'string',
      maxLength: 30,
    });
  });
});
