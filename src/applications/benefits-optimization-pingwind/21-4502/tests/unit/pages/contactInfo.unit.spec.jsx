import { expect } from 'chai';
import contactInfo from '../../../pages/contactInfo';
import { veteranFields, FORM_21_4502 } from '../../../definitions/constants';

describe('21-4502 contactInfo page', () => {
  const { schema, uiSchema } = contactInfo;
  const veteranSchema = schema.properties[veteranFields.parentObject];
  const veteranUiSchema = uiSchema[veteranFields.parentObject];
  const { CONTACT_INFO: C } = FORM_21_4502;

  it('requires homePhone and email', () => {
    expect(veteranSchema.required).to.include(veteranFields.homePhone);
    expect(veteranSchema.required).to.include(veteranFields.email);
  });

  it('defines phone, email, and agreeToElectronicCorrespondence', () => {
    expect(veteranSchema.properties[veteranFields.homePhone]).to.exist;
    expect(veteranSchema.properties[veteranFields.alternatePhone]).to.exist;
    expect(veteranSchema.properties[veteranFields.email]).to.exist;
    expect(
      veteranSchema.properties[veteranFields.agreeToElectronicCorrespondence],
    ).to.exist;
  });

  it('uses the custom primary phone and email messages', () => {
    expect(
      veteranUiSchema[veteranFields.homePhone]['ui:errorMessages'].required,
    ).to.equal(C.ERROR_PHONE_REQUIRED);
    expect(veteranUiSchema[veteranFields.email]['ui:options'].hint).to.equal(
      C.EMAIL_HINT,
    );
    expect(
      veteranUiSchema[veteranFields.email]['ui:errorMessages'].required,
    ).to.equal(C.ERROR_EMAIL);
    expect(
      veteranUiSchema[veteranFields.email]['ui:errorMessages'].format,
    ).to.equal(C.ERROR_EMAIL);
  });

  it('keeps the custom primary phone error through field-level validation', () => {
    const phoneValidations =
      veteranUiSchema[veteranFields.homePhone]['ui:validations'];
    const capturedErrors = [];
    const errors = { addError: value => capturedErrors.push(value) };

    expect(phoneValidations).to.have.lengthOf(1);

    phoneValidations[0](errors, {});
    expect(capturedErrors).to.deep.equal([C.ERROR_PHONE_REQUIRED]);
  });

  it('shows the checkbox email dependency message only when checked without an email', () => {
    const checkboxValidations =
      veteranUiSchema[veteranFields.agreeToElectronicCorrespondence][
        'ui:validations'
      ];
    const capturedErrors = [];
    const errors = { addError: value => capturedErrors.push(value) };

    expect(checkboxValidations).to.have.lengthOf(1);
    checkboxValidations[0](errors, false, { veteran: { email: '' } });
    expect(capturedErrors).to.deep.equal([]);

    checkboxValidations[0](errors, true, { veteran: { email: '' } });
    expect(capturedErrors).to.deep.equal([C.ERROR_AGREE_EMAIL]);
  });
});
