import { expect } from 'chai';
import transform from '../../config/prefillTransform';

describe('prefillTransform', () => {
  it('should transform form data correctly when all data is available', () => {
    const pages = {};
    const metadata = {};
    const formData = {
      applicantName: {
        first: 'Rita',
        middle: 'Ann',
        last: 'Jackson',
        suffix: 'II',
      },
      ssn: '513096784',
      vaFileNumber: '0987654321',
    };

    const { formData: transformedData } = transform(pages, formData, metadata);
    expect(transformedData).to.deep.equal({
      applicantName: { first: 'Rita', middle: 'Ann', last: 'Jackson' },
      ssn: '513096784',
      ssnLast4: '6784',
      vaFileNumber: '0987654321',
      vaFileNumberLast4: '4321',
    });
  });

  it('should handle form data transform when fields are missing', () => {
    const pages = {};
    const metadata = {};
    const formData = {
      applicantName: {
        first: 'Rita',
        middle: 'Ann',
        last: 'Jackson',
        suffix: 'II',
      },
      ssn: '',
      vaFileNumber: '',
    };

    const { formData: transformedData } = transform(pages, formData, metadata);
    expect(transformedData).to.deep.equal({
      applicantName: { first: 'Rita', middle: 'Ann', last: 'Jackson' },
      ssn: '',
      ssnLast4: null,
      vaFileNumber: '',
      vaFileNumberLast4: null,
    });
  });
});
