import {
  hasCertifierAddress,
  isNotSponsor,
  sponsorHasNoSharedAddressSelection,
  sponsorIsDeceased,
  sponsorIsNotDeceased,
  whenAll,
} from '../../utils/helpers';
import addressSelection from './addressSelection';
import contactInformation from './contactInformation';
import deathInformation from './deathInformation';
import identityInformation from './identityInformation';
import livingStatus from './livingStatus';
import mailingAddress from './mailingAddress';
import personalInformation from './personalInformation';
import sectionOverview from './sectionOverview';

export const sponsorPages = {
  sponsorInformationOverview: {
    path: 'veteran-information-overview',
    title: 'Veteran information',
    ...sectionOverview,
  },
  sponsorPersonalInformation: {
    path: 'veteran-name-and-date-of-birth',
    title: 'Veteran’s name and date of birth',
    ...personalInformation,
  },
  sponsorIdentityInformation: {
    path: 'veteran-social-security-number',
    title: `Veteran’s identification information`,
    ...identityInformation,
  },
  sponsorLivingStatus: {
    path: 'veteran-life-status',
    title: 'Veteran’s status',
    depends: isNotSponsor,
    ...livingStatus,
  },
  sponsorDeathInformation: {
    path: 'veteran-death-information',
    title: 'Veteran’s death details',
    depends: sponsorIsDeceased,
    ...deathInformation,
  },
  sponsorAddress: {
    path: 'veteran-address',
    title: 'Veteran’s address',
    depends: whenAll(sponsorIsNotDeceased, hasCertifierAddress),
    ...addressSelection,
  },
  sponsorMailingAddress: {
    path: 'veteran-mailing-address',
    title: 'Veteran’s mailing address',
    depends: whenAll(sponsorIsNotDeceased, sponsorHasNoSharedAddressSelection),
    ...mailingAddress,
  },
  sponsorContactInformation: {
    path: 'veteran-contact-information',
    title: 'Veteran’s contact information',
    depends: sponsorIsNotDeceased,
    ...contactInformation,
  },
};
