/* eslint-disable camelcase */
import { expect } from 'chai';
import sinon from 'sinon';
import transformForSubmit from '../../../config/submit-transformer';
import * as sharedTransformForSubmit from '../../../../shared/config/submit-transformer';
import { minimal, maximal } from '../../fixtures/data';

describe('21-4502 submit transformer', () => {
  const formConfig = { formId: '21-4502', chapters: {} };
  let sharedTransformStub;

  const runTransform = data => {
    sharedTransformStub.callsFake((config, formArg) =>
      JSON.stringify({
        ...formArg.data,
        formNumber: config.formId,
      }),
    );
    const result = transformForSubmit(formConfig, { data });
    const parsed = JSON.parse(result);
    expect(parsed.form_number).to.equal('21-4502');
    return parsed;
  };

  before(() => {
    global.window = global.window || {};
  });

  beforeEach(() => {
    sharedTransformStub = sinon.stub(sharedTransformForSubmit, 'default');
  });

  afterEach(() => {
    sharedTransformStub.restore();
  });

  it('reshapes data into the current flat payload shape', () => {
    const payload = runTransform(minimal);

    expect(payload.full_name).to.eql({ first: 'Jane', last: 'Doe' });
    expect(payload.ssn).to.equal('123456789');
    expect(payload.current_mailing_address.city).to.equal('Springfield');
    expect(payload.branch_of_service).to.equal('Army');
    expect(payload.vehicle_type).to.equal('Automobile');
    expect(payload.veteran_will_operate_vehicle).to.equal(true);
  });

  it('transforms maximal fixture with all conditional and optional fields', () => {
    const payload = runTransform(maximal);

    expect(payload.full_name.middle).to.equal('M');
    expect(payload.planned_mailing_address?.city).to.equal('Austin');
    expect(payload.veteran_will_operate_vehicle).to.equal(false);
    expect(payload.previous_application_location).to.include('Philadelphia');
    expect(payload.previously_applied).to.equal(true);
    expect(payload.applied_for_compensation).to.equal(true);
    expect(payload.date_applied_for_compensation).to.equal('2019-07-22');
    expect(payload.vehicle_type).to.equal('Motorcycle with sidecar');
  });

  it('prunes empty and whitespace-only values', () => {
    const payload = runTransform({
      ...minimal,
      veteran: {
        ...minimal.veteran,
        vaFileNumber: '   ',
        address: {
          ...minimal.veteran.address,
          street2: '',
        },
      },
    });

    expect(payload.va_file_number).to.be.undefined;
    expect(payload.current_mailing_address.street2).to.be.undefined;
  });

  it('formats phone from object or string', () => {
    const fromObj = runTransform(minimal);
    expect(fromObj.phone_number).to.eql({
      area_code: '555',
      number: '1234567',
    });

    const fromStr = runTransform({
      ...minimal,
      veteran: { ...minimal.veteran, homePhone: '5559998888' },
    });
    expect(fromStr.phone_number).to.eql({
      area_code: '555',
      number: '9998888',
    });
  });

  it('normalizes address country US to USA per backend contract', () => {
    const payload = runTransform({
      ...minimal,
      veteran: {
        ...minimal.veteran,
        address: {
          street: '1 St',
          city: 'City',
          state: 'VA',
          postalCode: '00000',
          country: 'US',
        },
      },
    });
    expect(payload.current_mailing_address.country).to.equal('USA');
  });

  it('defaults address country to USA when missing', () => {
    const payload = runTransform({
      ...minimal,
      veteran: {
        ...minimal.veteran,
        address: {
          street: '1 St',
          city: 'City',
          state: 'ST',
          postalCode: '00000',
        },
      },
    });
    expect(payload.current_mailing_address.country).to.equal('USA');
  });

  it('handles empty form data without throwing', () => {
    sharedTransformStub.callsFake((config, formArg) =>
      JSON.stringify({ ...formArg.data, formNumber: config.formId }),
    );
    expect(() => transformForSubmit(formConfig, { data: {} })).to.not.throw();
  });

  it('returns valid JSON when data is empty', () => {
    sharedTransformStub.callsFake((config, formArg) =>
      JSON.stringify({ ...formArg.data, formNumber: config.formId }),
    );
    const result = transformForSubmit(formConfig, { data: {} });
    const payload = JSON.parse(result);
    expect(payload).to.have.property('signature_date');
    expect(payload.signature_date).to.match(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('omits null/undefined phone', () => {
    const payload = runTransform({
      ...minimal,
      veteran: {
        ...minimal.veteran,
        homePhone: null,
        alternatePhone: undefined,
      },
    });
    expect(payload.phone_number).to.be.undefined;
    expect(payload.international_phone_number).to.be.undefined;
  });

  it('omits phone object without contact', () => {
    const payload = runTransform({
      ...minimal,
      veteran: {
        ...minimal.veteran,
        homePhone: {},
      },
    });
    expect(payload.phone_number).to.be.undefined;
  });

  it('defaults country to USA when empty string', () => {
    const payload = runTransform({
      ...minimal,
      veteran: {
        ...minimal.veteran,
        address: {
          ...minimal.veteran.address,
          country: '',
        },
      },
    });
    expect(payload.current_mailing_address.country).to.equal('USA');
  });

  it('omits invalid address (null or non-object)', () => {
    const withNull = runTransform({
      ...minimal,
      veteran: { ...minimal.veteran, address: null },
    });
    expect(withNull.current_mailing_address).to.be.undefined;

    const withInvalid = runTransform({
      ...minimal,
      veteran: { ...minimal.veteran, address: 'not-an-object' },
    });
    expect(withInvalid.current_mailing_address).to.be.undefined;
  });

  it('omits invalid fullName (null or non-object)', () => {
    const withNull = runTransform({
      ...minimal,
      veteran: { ...minimal.veteran, fullName: null },
    });
    expect(withNull.full_name).to.be.undefined;

    const withInvalid = runTransform({
      ...minimal,
      veteran: { ...minimal.veteran, fullName: 'string' },
    });
    expect(withInvalid.full_name).to.be.undefined;
  });

  it('maps middle name to middleinitial (first character)', () => {
    const payload = runTransform(maximal);
    expect(payload.full_name.middle).to.equal('M');
  });

  it('includes statement_of_truth_signature and signature_date when present', () => {
    sharedTransformStub.callsFake((config, formArg) =>
      JSON.stringify({
        ...formArg.data,
        formNumber: config.formId,
      }),
    );
    const result = transformForSubmit(formConfig, {
      data: {
        ...minimal,
        statementOfTruthSignature: 'Jane Doe',
      },
    });
    const payload = JSON.parse(result);

    expect(payload.statement_of_truth_signature).to.equal('Jane Doe');
    expect(payload.signature_date).to.match(/^\d{4}-\d{2}-\d{2}$/);
    expect(payload.full_name.first).to.equal('Jane');
    expect(payload.current_mailing_address.city).to.equal('Springfield');
  });

  it('includes top-level payload fields for current 21-4502 backend compatibility', () => {
    sharedTransformStub.callsFake((config, formArg) =>
      JSON.stringify({
        ...formArg.data,
        formNumber: config.formId,
      }),
    );
    const result = transformForSubmit(formConfig, {
      data: {
        ...minimal,
        statementOfTruthSignature: 'Jane Doe',
      },
    });
    const payload = JSON.parse(result);
    expect(payload.full_name.first).to.equal('Jane');
    expect(payload.statement_of_truth_signature).to.equal('Jane Doe');
    expect(payload.current_mailing_address.postal_code).to.equal('22150');
  });

  it('guarantees statement_of_truth_signature is non-empty in the submitted payload', () => {
    sharedTransformStub.callsFake((config, formArg) =>
      JSON.stringify({
        ...formArg.data,
        formNumber: config.formId,
      }),
    );

    const result = transformForSubmit(formConfig, {
      data: {
        ...minimal,
        statementOfTruthSignature: 'Jane Doe',
      },
    });
    const payload = JSON.parse(result);

    expect(payload.statement_of_truth_signature)
      .to.be.a('string')
      .and.not.equal('');
    expect(payload.statement_of_truth_signature).to.equal('Jane Doe');
  });

  it('normalizes phone_number to exactly 10 digits', () => {
    const withDashes = runTransform({
      ...minimal,
      veteran: { ...minimal.veteran, homePhone: { contact: '555-123-4567' } },
    });
    expect(withDashes.phone_number).to.eql({
      area_code: '555',
      number: '1234567',
    });

    const withSpaces = runTransform({
      ...minimal,
      veteran: { ...minimal.veteran, homePhone: { contact: '555 123 4567' } },
    });
    expect(withSpaces.phone_number).to.eql({
      area_code: '555',
      number: '1234567',
    });

    const withLeadingOne = runTransform({
      ...minimal,
      veteran: { ...minimal.veteran, homePhone: { contact: '15551234567' } },
    });
    expect(withLeadingOne.phone_number).to.eql({
      area_code: '555',
      number: '1234567',
    });
  });

  it('prunes whitespace-only string fields', () => {
    const payload = runTransform({
      ...minimal,
      veteran: {
        ...minimal.veteran,
        vaFileNumber: '   \t  ',
        ssn: '',
      },
    });
    expect(payload.va_file_number).to.be.undefined;
    expect(payload.ssn).to.be.undefined;
  });

  it('formats alternate phone into international_phone_number shape', () => {
    const payload = runTransform({
      ...maximal,
      veteran: {
        ...maximal.veteran,
        alternatePhone: {
          contact: '5552222222',
          callingCode: 44,
        },
      },
    });

    expect(payload.international_phone_number).to.eql({
      country_code: '44',
      area_code: '555',
      number: '2222222',
    });
  });
});
