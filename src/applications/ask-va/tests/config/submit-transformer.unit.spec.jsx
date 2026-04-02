import { expect } from 'chai';
import submitTransformer from '../../config/submit-transformer';

describe('Ask VA submit transformer', () => {
  context('SchoolObj.StateAbbreviation', () => {
    const schools = [
      {
        // Without zip code
        value: '789 - OAKLAND TECHNICAL HIGH SCHOOL CA',
        result: {
          InstitutionName: 'OAKLAND TECHNICAL HIGH SCHOOL',
          SchoolFacilityCode: '789',
          StateAbbreviation: 'CA',
        },
      },
      {
        // With zip code
        value: '123 - SPRINGFIELD ELEMENTARY SCHOOL IL 62704',
        result: {
          InstitutionName: 'SPRINGFIELD ELEMENTARY SCHOOL',
          SchoolFacilityCode: '123',
          StateAbbreviation: 'IL',
        },
      },
      {
        // With extended zip code
        value: '456 - SHELBYVILLE HIGH SCHOOL MO 63469-1234',
        result: {
          InstitutionName: 'SHELBYVILLE HIGH SCHOOL',
          SchoolFacilityCode: '456',
          StateAbbreviation: 'MO',
        },
      },
    ];

    it('should parse school name, code, and state from school field', () => {
      schools.forEach(school => {
        const result = submitTransformer({ school: school.value });

        expect(result.SchoolObj).to.deep.equal(school.result);
      });
    });
  });

  it('should transform data correctly with file(s)', () => {
    const formData = {
      school: '333 - Midvale School for the Gifted',
      stateOfTheSchool: 'AL',
      address: {
        isMilitary: false,
        street: '123 Main st',
        city: 'Mordor',
        state: 'FL',
        country: 'USA',
      },
    };
    const askVAStore = {};
    const uploadFiles = [
      {
        fileName: 'test.pdf',
        base64: 'test-base64',
      },
    ];

    const result = submitTransformer(formData, uploadFiles, askVAStore);
    expect(result).to.deep.equal({
      ...formData,
      ...askVAStore,
      address: {
        city: 'Mordor',
        country: 'USA',
        isMilitary: false,
        militaryAddress: {
          militaryPostOffice: null,
          militaryState: null,
        },
        state: 'FL',
        street: '123 Main st',
      },
      country: 'USA',
      onBaseOutsideUS: false,
      files: [
        {
          FileName: 'test.pdf',
          FileContent: 'test-base64',
        },
      ],
      SchoolObj: {
        InstitutionName: 'Midvale School for the Gifted',
        SchoolFacilityCode: '333',
        StateAbbreviation: 'AL',
      },
      requireSignIn: false,
    });
  });

  it('should transform data correctly with no file', () => {
    const formData = {
      school: '777 - Hogwarts School of Witchcraft and Wizardry',
      stateOfTheFacility: 'MI',
    };
    const askVAStore = {};
    const uploadFiles = null;

    const result = submitTransformer(formData, uploadFiles, askVAStore);
    expect(result).to.deep.equal({
      ...formData,
      ...askVAStore,
      address: null,
      // TODO: This is the default value when no files are uploaded;
      // I would much prefer an empty array. joehall-tw
      files: [
        {
          FileName: null,
          FileContent: null,
        },
      ],
      SchoolObj: {
        InstitutionName: 'Hogwarts School of Witchcraft and Wizardry',
        SchoolFacilityCode: '777',
        StateAbbreviation: 'MI',
      },
      requireSignIn: false,
    });
  });

  it('should transform data correctly with no school', () => {
    const formData = {
      school: null,
      stateOfTheFacility: 'NY',
    };
    const askVAStore = {};
    const uploadFiles = null;

    const result = submitTransformer(formData, uploadFiles, askVAStore);
    expect(result).to.deep.equal({
      ...formData,
      ...askVAStore,
      address: null,
      // TODO: This is the default value when no files are uploaded;
      // I would much prefer an empty array. joehall-tw
      files: [
        {
          FileName: null,
          FileContent: null,
        },
      ],
      SchoolObj: {
        InstitutionName: null,
        SchoolFacilityCode: null,
        StateAbbreviation: 'NY',
      },
      requireSignIn: false,
    });
  });

  it('should use businessEmail and businessPhone when relationship to Veteran is WORK', () => {
    const formData = {
      businessEmail: 'business@test.com',
      businessPhone: '123-456-7890',
      emailAddress: 'personal@test.com',
      phoneNumber: '987-654-3210',
      school: null,
      stateOfTheFacility: 'NY',
      relationshipToVeteran:
        "I'm connected to the Veteran through my work (for example, as a School Certifying Official or fiduciary)",
    };
    const result = submitTransformer(formData);
    expect(result.emailAddress).to.equal('business@test.com');
    expect(result.businessEmail).to.equal('business@test.com');
    expect(result.businessPhone).to.equal('123-456-7890');
    expect(result.phoneNumber).to.equal('123-456-7890');
  });

  it('should use emailAddress and phoneNumber when Veteran is submitting ask-va', () => {
    const formData = {
      businessEmail: 'business@test.com',
      businessPhone: '123-456-7890',
      emailAddress: 'personal@test.com',
      phoneNumber: '987-654-3210',
      school: null,
      stateOfTheFacility: 'NY',
      relationshipToVeteran: "I'm the Veteran",
    };
    const result = submitTransformer(formData);
    expect(result.emailAddress).to.equal('personal@test.com');
    expect(result.businessEmail).to.equal('business@test.com');
    expect(result.businessPhone).to.equal('123-456-7890');
    expect(result.phoneNumber).to.equal('987-654-3210');
  });

  it('should use emailAddress and phoneNumber when the family member of Veteran is submitting ask-va', () => {
    const formData = {
      businessEmail: 'business@test.com',
      businessPhone: '123-456-7890',
      emailAddress: 'personal@test.com',
      phoneNumber: '987-654-3210',
      school: null,
      stateOfTheFacility: 'NY',
      relationshipToVeteran: "I'm a family member of a Veteran",
    };
    const result = submitTransformer(formData);
    expect(result.emailAddress).to.equal('personal@test.com');
    expect(result.businessEmail).to.equal('business@test.com');
    expect(result.businessPhone).to.equal('123-456-7890');
    expect(result.phoneNumber).to.equal('987-654-3210');
  });

  it('should use emailAddress and phoneNumber and businessEmail and businessPhone should be undefined when the family member of Veteran is submitting ask-va', () => {
    const formData = {
      businessEmail: undefined,
      businessPhone: undefined,
      emailAddress: 'personal@test.com',
      phoneNumber: '987-654-3210',
      school: null,
      stateOfTheFacility: 'NY',
      relationshipToVeteran: "I'm a family member of a Veteran",
    };
    const result = submitTransformer(formData);
    expect(result.emailAddress).to.equal('personal@test.com');
    expect(result.businessEmail).to.be.undefined;
    expect(result.businessPhone).to.be.undefined;
    expect(result.phoneNumber).to.equal('987-654-3210');
  });

  it('should handle missing email and phone fields', () => {
    const formData = {
      school: null,
      stateOfTheFacility: 'NY',
    };
    const result = submitTransformer(formData);
    expect(result.emailAddress).to.be.undefined;
    expect(result.businessEmail).to.be.undefined;
    expect(result.phoneNumber).to.be.undefined;
    expect(result.businessPhone).to.be.undefined;
  });

  it('should move branch of service to about_yourself when Veteran is submitting ask-va', () => {
    const aboutYourself = {
      first: 'John',
      last: 'Doe',
    };

    const formData = {
      yourBranchOfService: 'Army',
      school: null,
      stateOfTheFacility: 'NY',
      relationshipToVeteran: "I'm the Veteran",
      aboutYourself,
    };

    const result = submitTransformer(formData);
    expect(result.aboutYourself).to.deep.equal({
      ...aboutYourself,
      branchOfService: 'Army',
    });
    expect(result.yourBranchOfService).to.be.undefined;
  });

  it('should not throw an error or modify aboutYourself when it is missing and yourBranchOfService is undefined for a Veteran', () => {
    // This case is unlikely to occur in production, but it is good to have here to avoid regressions.
    // At some future point it would make sense for the BE to throw an error if this scenario occurs,
    // but it would be better for the transformer to simply pass through the data without modification
    // rather than throwing an unexpected error client-side.
    const formData = {
      school: null,
      stateOfTheFacility: 'NY',
      relationshipToVeteran: "I'm the Veteran",
      // aboutYourself is intentionally omitted
      // yourBranchOfService is intentionally undefined
    };

    const transformCall = () => submitTransformer(formData);
    expect(transformCall).to.not.throw();

    const result = transformCall();
    expect(result.aboutYourself).to.eql({}); // This should always be there
    expect(result.yourBranchOfService).to.be.undefined;
  });

  it('should preserve existing aboutYourself.branchOfService when yourBranchOfService is undefined for a Veteran', () => {
    // This case is unlikely to occur in production, but it is good to have here to avoid regressions.
    // At some future point it would make sense for the BE to throw an error if this scenario occurs,
    // but it would be better for the transformer to simply pass through the data without modification
    // rather than throwing an unexpected error client-side.
    const aboutYourself = {
      first: 'Jane',
      last: 'Doe',
      branchOfService: 'Navy',
    };
    const formData = {
      school: null,
      stateOfTheFacility: 'CA',
      relationshipToVeteran: "I'm the Veteran",
      aboutYourself,
      // yourBranchOfService is intentionally undefined
    };
    const transformCall = () => submitTransformer(formData);
    expect(transformCall).to.not.throw();
    const result = transformCall();
    expect(result.aboutYourself).to.deep.equal(aboutYourself);
    expect(result.yourBranchOfService).to.be.undefined;
  });
});
