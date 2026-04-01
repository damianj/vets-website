import { testNumberOfWebComponentFields } from '../../../../shared/tests/pages/pageTests.spec';
import formConfig from '../../../config/form';
import { sponsorPages } from '../../../chapters/sponsor';
import { signerPages } from '../../../chapters/signer';

testNumberOfWebComponentFields(
  formConfig,
  signerPages.certifierRole.schema,
  signerPages.certifierRole.uiSchema,
  1,
  'Certifier Information - Role',
  {},
);
testNumberOfWebComponentFields(
  formConfig,
  signerPages.certifierRelationship.schema,
  signerPages.certifierRelationship.uiSchema,
  6,
  'Certifier Information - Relationship',
  { certifierRelationship: { relationshipToVeteran: { other: true } } },
);

testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorPersonalInformation.schema,
  sponsorPages.sponsorPersonalInformation.uiSchema,
  5,
  'Sponsor Information - Name and DOB',
  {},
);
testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorIdentityInformation.schema,
  sponsorPages.sponsorIdentityInformation.uiSchema,
  1,
  'Sponsor Information - Identification info',
  {},
);
testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorIdentityInformation.schema,
  sponsorPages.sponsorIdentityInformation.uiSchema,
  1,
  'Sponsor Information - Identification info (role: sponsor)',
  { certifierRole: 'sponsor' },
);
testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorLivingStatus.schema,
  sponsorPages.sponsorLivingStatus.uiSchema,
  1,
  'Sponsor Information - Status',
  {},
);
testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorMailingAddress.schema,
  sponsorPages.sponsorMailingAddress.uiSchema,
  7,
  'Sponsor Information - Mailing Address',
  {},
);
testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorMailingAddress.schema,
  sponsorPages.sponsorMailingAddress.uiSchema,
  7,
  'Sponsor Information - Mailing Address (role: sponsor)',
  { certifierRole: 'sponsor' },
);
testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorContactInformation.schema,
  sponsorPages.sponsorContactInformation.uiSchema,
  2,
  'Sponsor Information - Contact info',
  {},
);
testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorContactInformation.schema,
  sponsorPages.sponsorContactInformation.uiSchema,
  2,
  'Sponsor Information - Contact info (role: sponsor)',
  { certifierRole: 'sponsor' },
);
