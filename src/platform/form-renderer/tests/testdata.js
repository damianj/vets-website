export const config = {
  $schema:
    'https://vefs-forms-api.prod.bip.vba.va.gov/api/v1/rest/forms/formTemplateSchema/versions/1.0/schema',
  formId: '21-686c',
  formDescription: 'Add or remove a dependent on VA benefits',
  formVersion: 'OMB Version Aug 2025, Control #: 2900-0043',
  title: '21-686c Form Template',
  description:
    'Form Template for 21-686c Application Request to Add and/or Remove Dependents',
  version: '0.2.0',
  sections: [
    {
      sectionNumber: '1',
      sectionId: 'veteranInformationSection',
      sectionHeader: 'Section 1: Veteran information',
      repeatable: false,
      blocks: [
        {
          blockLabel: 'Personal information',
          fields: [
            {
              fieldLabel: 'Name:',
              fieldType: 'string',
              fieldValue:
                '{{veteranInformation.fullName.first}} {{#veteranInformation.fullName.middle}}{{.}} {{/veteranInformation.fullName.middle}}{{veteranInformation.fullName.last}}',
            },
            {
              fieldLabel: 'Social Security number:',
              fieldFormat: 'ssn',
              fieldType: 'string',
              fieldValue: '{{veteranInformation.ssn}}',
            },
            {
              fieldLabel: 'Date of Birth:',
              fieldFormat: 'biographicalDate',
              fieldType: 'string',
              fieldValue: '{{veteranInformation.birthDate}}',
            },
          ],
        },
        {
          blockLabel: 'Mailing address',
          fields: [
            {
              fieldLabel: 'Country:',
              fieldValue:
                '{{veteranContactInformation.veteranAddress.country}}',
            },
            {
              fieldLabel: 'Street address:',
              fieldValue: '{{veteranContactInformation.veteranAddress.street}}',
            },
            {
              fieldLabel: 'Apartment or unit number:',
              fieldValue:
                '{{veteranContactInformation.veteranAddress.street2}}',
            },
            {
              showIf: 'veteranContactInformation.veteranAddress.isMilitary',
              fieldLabel: 'Military post office:',
              fieldFormat: 'militaryPostOffice',
              fieldValue: '{{veteranContactInformation.veteranAddress.city}}',
            },
            {
              showUnless: 'veteranContactInformation.veteranAddress.isMilitary',
              fieldLabel: 'City:',
              fieldValue: '{{veteranContactInformation.veteranAddress.city}}',
            },
            {
              showIf: 'veteranContactInformation.veteranAddress.isMilitary',
              fieldLabel: "Overseas 'state' abbreviation:",
              fieldValue: '{{veteranContactInformation.veteranAddress.state}}',
            },
            {
              showUnless: 'veteranContactInformation.veteranAddress.isMilitary',
              fieldLabel: 'State:',
              fieldValue: '{{veteranContactInformation.veteranAddress.state}}',
            },
            {
              fieldLabel: 'Postal code:',
              fieldValue:
                '{{veteranContactInformation.veteranAddress.postalCode}}',
            },
          ],
        },
        {
          blockLabel: 'Phone and email address',
          fields: [
            {
              fieldLabel: 'Phone number:',
              fieldFormat: 'phone',
              fieldType: 'string',
              fieldValue: '{{veteranContactInformation.phoneNumber}}',
            },
            {
              fieldLabel: 'International phone number:',
              fieldFormat: 'internationalPhone',
              fieldType: 'string',
              fieldValue:
                '{{veteranContactInformation.internationalPhoneNumber}}',
            },
            {
              fieldLabel: 'Email address:',
              fieldType: 'string',
              fieldValue: '{{veteranContactInformation.emailAddress}}',
            },
            {
              fieldLabel:
                'I agree to receive electronic correspondence from the VA about my claim.',
              fieldValue:
                "{{formatBool veteranContactInformation.electronicCorrespondence '✓ Selected' 'Not selected'}}",
            },
          ],
        },
      ],
    },
  ],
};

export const data = {
  statementOfTruthSignature: 'John Quincy Veteran',
  statementOfTruthCertified: true,
  veteranInformation: {
    fullName: {
      first: 'John',
      middle: 'Quincy',
      last: 'Veteran',
    },
    birthDate: '1980-05-12',
    ssn: '123456789',
    vaFileLastFour: '5678',
  },
  veteranContactInformation: {
    veteranAddress: {
      street: '123 Main St',
      street2: 'Apt 4B',
      city: 'Richmond',
      country: 'USA',
      state: 'VA',
      postalCode: '23220',
    },
    phoneNumber: '8045551212',
    internationalPhoneNumber: '3123456789',
    emailAddress: 'john.veteran@example.com',
    electronicCorrespondence: true,
  },
  householdIncome: true,
};
