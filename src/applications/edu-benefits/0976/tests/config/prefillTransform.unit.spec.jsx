import { expect } from 'chai';
import transform from '../../config/prefillTransform';

describe('transform function', () => {
  it('should transform form data correctly', () => {
    const pages = {};
    const metadata = {};
    const formData = {
      applicantName: { first: 'John', last: 'Doe', suffix: 'Sr.' },
    };

    const { formData: transformedData } = transform(pages, formData, metadata);
    expect(transformedData).to.deep.equal({
      authorizingOfficial: { fullName: { first: 'John', last: 'Doe' } },
      prefilledFirstName: 'John',
      prefilledLastName: 'Doe',
    });
  });
});
